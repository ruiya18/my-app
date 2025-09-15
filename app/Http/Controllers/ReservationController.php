<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Booking;
use App\Models\Inventory;
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

    // Update the reservation status to accepted
    $reservation->status = 'accepted';
    $reservation->save();

    // Combine date and time
    $reserveDateTime = Carbon::parse("{$reservation->reserve_date} {$reservation->reserve_time}");

    // Create the booking in accepted state
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

    // Update reserved inventory count
    $inventory = Inventory::where('product_id', $reservation->product_id)->first();
    if ($inventory) {
        $inventory->reserved += $reservation->quantity;
        $inventory->save();
    }

    return response()->json([
        'message'     => 'Reservation accepted, booking created, and inventory updated.',
        'reservation' => $reservation,
        'booking'     => $booking,
        'inventory'   => $inventory,
        'reserve_datetime' => $reserveDateTime->toDateTimeString(),
    ]);
}
    // Reject reservation
    public function reject($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'rejected';
        $reservation->save();

        return response()->json([
            'message' => 'Reservation rejected',
            'reservation' => $reservation
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



public function weeklyStats()
{
    $now = Carbon::now();
    $last7Days = collect();

    for ($i = 6; $i >= 0; $i--) {
        $day = $now->copy()->subDays($i)->format('Y-m-d');
        $count = Reservation::whereDate('created_at', $day)->count();
        $last7Days->push([
            'date'  => Carbon::parse($day)->format('D'), // Mon, Tue, ...
            'count' => $count,
        ]);
    }

    return response()->json([
        'labels' => $last7Days->pluck('date'),
        'data'   => $last7Days->pluck('count'),
    ]);

}

}

