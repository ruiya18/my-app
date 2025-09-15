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

    public function weeklyBookings()
    {
        // Returns counts of bookings per day for past 7 days
        $today = Carbon::today();
        $dates = [];
        for ($i = 6; $i >= 0; $i--) {
            $dates[] = $today->copy()->subDays($i)->toDateString();
        }

        // Query: group booking created_at by date for past 7 days
        $bookingData = Booking::where('created_at', '>=', $today->copy()->subDays(6))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date')
            ->toArray();

        // Ensure results for all 7 days, filling zeros where missing
        $dataset = [];
        foreach ($dates as $date) {
            $dataset[] = isset($bookingData[$date]) ? intval($bookingData[$date]) : 0;
        }

        return response()->json([
            'labels' => $dates,
            'data'   => $dataset
        ]);
    }
}
