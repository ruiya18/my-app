<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Booking;
use App\Models\Inventory;
use App\Models\Member;
use App\Mail\ReservationAcceptedMail;
use App\Mail\ReservationRejectedMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    // Get all reservations
    // public function index()
    // {
    //     // Fetch all reservations with newest first
    //     $reservations = Reservation::orderBy('created_at', 'desc')->get();
    //     return response()->json($reservations);
    // }


    public function index()
{
    $reservations = Reservation::leftJoin('bookings', 'reservations.id', '=', 'bookings.reservation_id')
        ->select(
            'reservations.*',
            'bookings.status as booking_status'
        )
        ->orderBy('reservations.created_at', 'desc')
        ->get();

    return response()->json($reservations);
}

    public function availableQuantities(Request $request)
    {
        $date = $request->query('date');
        $outlet = $request->query('outlet');
        $excludeReservationId = $request->query('excludeReservationId');

        if (!$date || !$outlet) {
            return response()->json(['message' => 'Date and outlet are required'], 400);
        }

        $acceptedReservations = Reservation::where('reserve_date', $date)
            ->where('outlet', $outlet)
            ->where('status', 'accepted');

        if ($excludeReservationId) {
            $acceptedReservations->where('id', '!=', $excludeReservationId);
        }

        $reservedQuantities = $acceptedReservations
            ->select('product_id', DB::raw('SUM(quantity) as total_reserved'))
            ->groupBy('product_id')
            ->pluck('total_reserved', 'product_id');

        $inventories = Inventory::where('status', 'active')->get();

        $availableQuantities = [];

        foreach ($inventories as $inventory) {
            $reserved = $reservedQuantities[$inventory->product_id] ?? 0;
            $availableQuantities[$inventory->product_id] = max(0, $inventory->instock - $reserved);
        }

        // print_r($availableQuantities);exit;

        return response()->json($availableQuantities);
    }

    // Store new reservation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id'     => 'required|integer',
            'username'      => 'required|string',
            'product_id'    => 'required|integer',
            'product_name'  => 'required|string',
            'outlet'        => 'nullable|string',
            'quantity'      => 'required|integer|min:1',
            'reserve_date'  => 'required|date',
            'reserve_time'  => 'required',
            'status'        => 'in:pending,accepted,rejected'
        ]);

        $reservation = Reservation::create($validated);

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation
        ], 201);
    }

// Update reservation
// public function update(Request $request, $id)
// {
//     $reservation = Reservation::findOrFail($id);

//     $validated = $request->validate([
//         'quantity'      => 'required|integer|min:1',
//         'reserve_date'  => 'required|date',
//         'reserve_time'  => 'required',
//         'status'        => 'in:pending,accepted,rejected'
//     ]);

//     $reservation->update($validated);

//     return response()->json([
//         'message' => 'Reservation updated successfully',
//         'reservation' => $reservation
//     ]);
// }

public function update(Request $request, $id)
{
    $reservation = Reservation::findOrFail($id);

    // 🔒 If already accepted and linked booking is active → forbid editing
    if ($reservation->status === 'accepted') {
        $linkedBooking = Booking::where('reservation_id', $reservation->id)->first();

        if ($linkedBooking && in_array($linkedBooking->status, ['checkout', 'closed'])) {
            return response()->json([
                'message' => 'This reservation is locked because it has been used in a booking.'
            ], 403);
        }
    }

    $validated = $request->validate([
        'quantity'      => 'required|integer|min:1',
        'reserve_date'  => 'required|date',
        'reserve_time'  => 'required',
        'status'        => 'in:pending,accepted,rejected'
    ]);

    $reservation->update($validated);

    return response()->json([
        'message' => 'Reservation updated successfully',
        'reservation' => $reservation
    ]);
}


    public function accept($id)
    {
        $reservation = Reservation::findOrFail($id);

        $inventory = Inventory::where('product_id', $reservation->product_id)->first();
        
        if (!$inventory) {
            return response()->json(['message' => 'Inventory not found'], 404);
        }

        $reservedOnDate = Reservation::where('product_id', $reservation->product_id)
            ->where('reserve_date', $reservation->reserve_date)
            ->where('status', 'accepted')
            ->where('id', '!=', $reservation->id)
            ->sum('quantity');

        $available = $inventory->instock - $reservedOnDate;

        if ($reservation->quantity > $available) {
            return response()->json([
                'message' => 'Not enough inventory available. Only ' . $available . ' items left.'
            ], 400);
        }

        $reservation->status = 'accepted';
        $reservation->save();

        $inventory->reserved += $reservation->quantity;
        $inventory->save();

        $booking = Booking::create([
            'member_id'      => $reservation->member_id,
            'reservation_id' => $reservation->id,
            'username'       => $reservation->username,
            'product_id'     => $reservation->product_id,
            'product_name'   => $reservation->product_name,
            'quantity'       => $reservation->quantity,
            'status'         => 'accepted',
            'checkout_at'    => null,
        ]);

        try {
            $member = Member::find($reservation->member_id);
            
            if ($member && $member->username) {
                Mail::to($member->username)
                    ->send(new ReservationAcceptedMail($reservation, $booking));
                
                $emailStatus = 'Email sent successfully';
            } else {
                $emailStatus = 'Member email not found';
            }
        } catch (\Exception $e) {
            $emailStatus = 'Email sending failed: ' . $e->getMessage();
        }

        return response()->json([
            'message'     => 'Reservation accepted, booking created, and inventory updated.',
            'email_status' => $emailStatus,
            'reservation' => $reservation,
            'booking'     => $booking,
            'inventory'   => $inventory,
        ]);
    }

    // Reject reservation
    // public function reject($id)
    // {
    //     $reservation = Reservation::findOrFail($id);
    //     $reservation->status = 'rejected';
    //     $reservation->save();

    //     return response()->json([
    //         'message' => 'Reservation rejected',
    //         'reservation' => $reservation
    //     ]);
    // }
    public function reject($id)
{
    $reservation = Reservation::findOrFail($id);
    $reservation->status = 'rejected';
    $reservation->save();

    $emailStatus = 'Not sent';
    try {
        $member = Member::find($reservation->member_id);

        if ($member && $member->username) {
            Mail::to($member->username)
                ->send(new ReservationRejectedMail($reservation));

            $emailStatus = 'Email sent successfully';
        } else {
            $emailStatus = 'Member email not found';
        }
    } catch (\Exception $e) {
        $emailStatus = 'Email sending failed: ' . $e->getMessage();
    }

    return response()->json([
        'message' => 'Reservation rejected',
        'reservation' => $reservation,
        'email_status' => $emailStatus
    ]);
}

    public function destroy($id)
{
    $reservation = Reservation::find($id);

    if (!$reservation) {
        return response()->json(['message' => 'Reservation not found'], 404);
    }

    $reservation->delete();

    return response()->json(['message' => 'Reservation deleted successfully']);
}

public function myReservations(Request $request)
{
    $memberId = $request->query('member_id');

    if (!$memberId) {
        return response()->json(['message' => 'Member ID is required'], 400);
    }

    // Join with products to fetch image
    $reservations = Reservation::join('products', 'reservations.product_id', '=', 'products.product_id')
        ->select(
            'reservations.*',
            'products.image as product_image'
        )
        ->where('reservations.member_id', $memberId)
        ->whereIn('reservations.status', ['pending', 'rejected'])
        ->orderBy('reservations.created_at', 'desc')
        ->get();

    return response()->json($reservations);
}



    public function weeklyStats(Request $request)
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
            $reservationData = Reservation::where('created_at', '>=', $startDate)
                ->where('created_at', '<', $startDate->copy()->addDay())
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00") as time_slot'), 
                        DB::raw('count(*) as count'))
                ->groupBy('time_slot')
                ->orderBy('time_slot')
                ->get()
                ->pluck('count', 'time_slot')
                ->toArray();
        } else {
            $reservationData = Reservation::where('created_at', '>=', $startDate)
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
                foreach ($reservationData as $time => $value) {
                    if (strpos($time, substr($slot, 0, 13)) === 0) {
                        $count = $value;
                        break;
                    }
                }
                $labels[] = Carbon::parse($slot)->format('H:i');
            } else {
                $count = $reservationData[$slot] ?? 0;
                
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

