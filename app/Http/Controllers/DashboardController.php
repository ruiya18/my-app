<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Booking;
use App\Models\Reservation;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function stats()
    {
        $total_products     = Product::count();
        $total_bookings     = Booking::count();
        $total_reservations = Reservation::count();
        $total_members      = Member::count();

        return response()->json([
            'total_products'     => $total_products,
            'total_bookings'     => $total_bookings,
            'total_reservations' => $total_reservations,
            'total_members'      => $total_members
        ]);
    }

    public function weeklyBookings(Request $request)
    {
        $range = $request->query('range', '7days');
        $today = Carbon::today();
        
        switch ($range) {
            case 'today':
                $timeSlots = [];
                for ($i = 0; $i < 24; $i++) {
                    $timeSlots[] = $today->copy()->addHours($i)->format('Y-m-d H:00:00');
                }
                $startDate = $today;
                break;
                
            case 'yesterday':
                $yesterday = $today->copy()->subDay();
                $timeSlots = [];
                for ($i = 0; $i < 24; $i++) {
                    $timeSlots[] = $yesterday->copy()->addHours($i)->format('Y-m-d H:00:00');
                }
                $startDate = $yesterday;
                break;
                
            case '30days':
                $timeSlots = [];
                for ($i = 29; $i >= 0; $i--) {
                    $timeSlots[] = $today->copy()->subDays($i)->format('Y-m-d');
                }
                $startDate = $today->copy()->subDays(29);
                break;
                
            case '7days':
            default:
                $timeSlots = [];
                for ($i = 6; $i >= 0; $i--) {
                    $timeSlots[] = $today->copy()->subDays($i)->format('Y-m-d');
                }
                $startDate = $today->copy()->subDays(6);
                break;
        }

        if ($range === 'today' || $range === 'yesterday') {
            $bookingData = Booking::where('created_at', '>=', $startDate)
                ->where('created_at', '<', $startDate->copy()->addDay())
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00") as time_slot'), 
                        DB::raw('count(*) as count'))
                ->groupBy('time_slot')
                ->orderBy('time_slot')
                ->get()
                ->pluck('count', 'time_slot')
                ->toArray();
        } else {
            $bookingData = Booking::where('created_at', '>=', $startDate)
                ->select(DB::raw('DATE(created_at) as date'), 
                        DB::raw('count(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date')
                ->toArray();
        }

        $dataset = [];
        $labels = [];
        
        foreach ($timeSlots as $slot) {
            $count = 0;
            
            if ($range === 'today' || $range === 'yesterday') {
                foreach ($bookingData as $time => $value) {
                    if (strpos($time, substr($slot, 0, 13)) === 0) {
                        $count = $value;
                        break;
                    }
                }
                $labels[] = Carbon::parse($slot)->format('H:i');
            } else {
                $count = $bookingData[$slot] ?? 0;
                
                if ($range === '7days') {
                    $labels[] = Carbon::parse($slot)->format('m/d');
                } else {
                    $labels[] = Carbon::parse($slot)->format('M d');
                }
            }
            
            $dataset[] = $count;
        }

        return response()->json([
            'labels' => $labels,
            'data'   => $dataset
        ]);
    }
}
