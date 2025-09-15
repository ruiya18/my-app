<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Models\Inventory;
use App\Models\Reservation;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
    public function index()
    {
        $bookings = Booking::latest()->get();
        return response()->json($bookings);
    }

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        // ✅ Validation rules
        $validated = $request->validate([
            'member_id'    => 'required|exists:members,id',
            'username'     => 'required|string|max:255',
            'product_id'   => 'required|string|max:255',
            'product_name' => 'required|string|max:255',
            'quantity'     => 'required|integer|min:1',
            'status'       => 'required|in:accepted,checkin,checkout,closed',
            'checkin_at'   => 'nullable|date',
            'checkout_at'  => 'nullable|date|after_or_equal:checkin_at',
            'outlet'       => 'nullable|string|max:255',
        ]);

        // ✅ Create booking
        $booking = Booking::create($validated);

        return response()->json([
            'message' => 'Booking created successfully!',
            'data'    => $booking,
        ], 201);
    }

    /**
     * Display the specified booking.
     */
    public function show($id)
    {
        $booking = Booking::findOrFail($id);
        return response()->json($booking);
    }


public function checkin($id)
{
    $booking = Booking::findOrFail($id);

    if ($booking->status !== 'checkout') {
        return response()->json(['message' => 'This booking is not in checkout state.'], 400);
    }

    // Close booking
    $booking->status = 'closed';
    $booking->checkin_at = Carbon::now();
    $booking->save();

    // Update inventory
    $inventory = Inventory::where('product_id', $booking->product_id)->first();

    if ($inventory) {
        $inventory->instock += $booking->quantity; // instock increases
        $inventory->rented = max(0, $inventory->rented - $booking->quantity);
        $inventory->save();
    }

    return response()->json([
        'message'   => 'Checked in successfully!',
        'booking'   => $booking,
        'inventory' => $inventory,
    ]);
}

public function checkout(Request $request)
{
    $validated = $request->validate([
        'member_id'      => 'required|exists:members,id',
        'username'       => 'required|string|max:255',
        'product_id'     => 'required|string|max:255',
        'product_name'   => 'required|string|max:255',
        'quantity'       => 'required|integer|min:1',
        'reservation_id' => 'nullable|exists:reservations,id',
    ]);

    // 🔎 If this checkout is linked to a reservation
    if (!empty($validated['reservation_id'])) {
        $booking = Booking::where('reservation_id', $validated['reservation_id'])
            ->where('status', 'accepted')
            ->first();

        if ($booking) {
            $reservation = Reservation::find($validated['reservation_id']);
            if ($reservation) {
                $reserveDateTime = Carbon::parse("{$reservation->reserve_date} {$reservation->reserve_time}");
                $now = Carbon::now();

                // ✅ Allowed window: ±15 minutes
                if ($now->lt($reserveDateTime->subMinutes(15)) || $now->gt($reserveDateTime->addMinutes(30))) {
                    return response()->json([
                        'message' => 'You can only check out within 15 minutes before or after the reserved time.'
                    ], 400);
                }
            }

            // Update existing booking
            $booking->status = 'checkout';
            $booking->checkout_at = Carbon::now();
            $booking->save();

            // Update inventory
            $inventory = Inventory::where('product_id', $booking->product_id)->first();
            if ($inventory) {
                $inventory->instock = max(0, $inventory->instock - $booking->quantity);
                $inventory->reserved = max(0, $inventory->reserved - $booking->quantity);
                $inventory->rented += $booking->quantity;
                $inventory->save();
            }

            return response()->json([
                'message'   => 'Checked out successfully from reservation booking!',
                'booking'   => $booking,
                'inventory' => $inventory,
            ]);
        }
    }

    // 🔎 Normal checkout (no reservation)
    $activeBooking = Booking::where('member_id', $validated['member_id'])
        ->where('product_id', $validated['product_id'])
        ->where('status', 'checkout')
        ->first();

    if ($activeBooking) {
        return response()->json([
            'message' => 'You already have this product checked out. Please check it in before checking out again.',
            'booking' => $activeBooking
        ], 400);
    }

    $booking = Booking::create([
        ...$validated,
        'status'      => 'checkout',
        'checkout_at' => Carbon::now(),
    ]);

    $inventory = Inventory::where('product_id', $validated['product_id'])->first();
    if ($inventory) {
        $inventory->instock = max(0, $inventory->instock - $validated['quantity']);
        $inventory->rented += $validated['quantity'];
        $inventory->save();
    }

    return response()->json([
        'message'   => 'Checked out successfully!',
        'booking'   => $booking,
        'inventory' => $inventory,
    ]);
}


// public function checkout(Request $request)
// {
//     $validated = $request->validate([
//         'member_id'      => 'required|exists:members,id',
//         'username'       => 'required|string|max:255',
//         'product_id'     => 'required|string|max:255',
//         'product_name'   => 'required|string|max:255',
//         'quantity'       => 'required|integer|min:1',
//         'reservation_id' => 'nullable|exists:reservations,id',
//     ]);

//     // 🔎 If this checkout is linked to a reservation
//     if (!empty($validated['reservation_id'])) {
//         $booking = Booking::where('reservation_id', $validated['reservation_id'])
//             ->where('status', 'accepted')
//             ->first();

//         if ($booking) {
//             // Update existing booking
//             $booking->status = 'checkout';
//             $booking->checkout_at = Carbon::now();
//             $booking->save();

//             // Update inventory
//             $inventory = Inventory::where('product_id', $booking->product_id)->first();
//             if ($inventory) {
//                 $inventory->instock = max(0, $inventory->instock - $booking->quantity);
//                 $inventory->reserved = max(0, $inventory->reserved - $booking->quantity); // decrease reserved
//                 $inventory->rented += $booking->quantity;
//                 $inventory->save();
//             }

//             return response()->json([
//                 'message'   => 'Checked out successfully from reservation booking!',
//                 'booking'   => $booking,
//                 'inventory' => $inventory,
//             ]);
//         }
//     }

//     // 🔎 Normal checkout (no reservation)
//     $activeBooking = Booking::where('member_id', $validated['member_id'])
//         ->where('product_id', $validated['product_id'])
//         ->where('status', 'checkout')
//         ->first();

//     if ($activeBooking) {
//         return response()->json([
//             'message' => 'You already have this product checked out. Please check it in before checking out again.',
//             'booking' => $activeBooking
//         ], 400);
//     }

//     $booking = Booking::create([
//         ...$validated,
//         'status'      => 'checkout',
//         'checkout_at' => Carbon::now(),
//     ]);

//     $inventory = Inventory::where('product_id', $validated['product_id'])->first();
//     if ($inventory) {
//         $inventory->instock = max(0, $inventory->instock - $validated['quantity']);
//         $inventory->rented += $validated['quantity'];
//         $inventory->save();
//     }

//     return response()->json([
//         'message' => 'Checked out successfully!',
//         'booking' => $booking,
//         'inventory' => $inventory,
//     ]);
// }

public function closeExpiredReservations()
{
    $now = Carbon::now();
    $expiredBookings = Booking::where('reservation_id', '!=', null)
        ->where('status', 'accepted')
        ->get()
        ->filter(function($booking) use ($now) {
            $reservation = Reservation::find($booking->reservation_id);
            if (!$reservation) return false;
            $reserveDateTime = Carbon::parse("{$reservation->reserve_date} {$reservation->reserve_time}");
            return $now->gt($reserveDateTime->addMinutes(15));  // more than 15 mins after
        });

    foreach ($expiredBookings as $b) {
        $b->status = 'closed';
        $b->checkin_at = $b->checkout_at ?? null;  
        $b->save();

        // Optionally update inventory: remove reserved, etc
        $inventory = Inventory::where('product_id', $b->product_id)->first();
        if ($inventory) {
            $inventory->reserved = max(0, $inventory->reserved - $b->quantity);
            $inventory->save();
        }
    }
}

public function update(Request $request, $id)
{
    $booking = Booking::findOrFail($id);

    $booking->update($request->all());

    return response()->json($booking);
}


// public function myBookings(Request $request)
// {
//     $memberId = $request->query('member_id');

//     if (!$memberId) {
//         return response()->json(['message' => 'Member ID is required'], 400);
//     }

//     $bookings = Booking::join('products', 'bookings.product_id', '=', 'products.product_id')
//         ->select(
//             'bookings.*',
//             'products.image as product_image'
//         )
//         ->where('bookings.member_id', $memberId)
//         ->orderBy('bookings.created_at', 'desc')
//         ->get();

//     return response()->json($bookings);
// }

public function myBookings(Request $request)
{
    $memberId = $request->query('member_id');

    if (!$memberId) {
        return response()->json(['message' => 'Member ID is required'], 400);
    }

    $bookings = Booking::leftJoin('products', 'bookings.product_id', '=', 'products.product_id')
        ->leftJoin('reservations', 'bookings.reservation_id', '=', 'reservations.id')
        ->select(
            'bookings.*',
            'products.image as product_image',
            'reservations.reserve_date',
            'reservations.reserve_time'
        )
        ->where('bookings.member_id', $memberId)
        ->orderBy('bookings.created_at', 'desc')
        ->get();

    return response()->json($bookings);
}


public function destroy($id)
{
    $booking = Booking::findOrFail($id);

    // Fetch inventory
    $inventory = Inventory::where('product_id', $booking->product_id)->first();

    if ($inventory) {
        switch ($booking->status) {
            case 'checkout':
                // Return items to stock and reduce rented
                $inventory->instock += $booking->quantity;
                $inventory->rented = max(0, $inventory->rented - $booking->quantity);
                break;

            case 'accepted':
                // Remove from reserved
                $inventory->reserved = max(0, $inventory->reserved - $booking->quantity);
                break;

            // Optionally handle checkin state (if you use it)
            case 'checkin':
                $inventory->instock += $booking->quantity;
                $inventory->rented = max(0, $inventory->rented - $booking->quantity);
                break;

            // 'closed' - no changes needed
        }

        $inventory->save();
    }

    $booking->delete();

    return response()->json([
        'message' => 'Booking deleted successfully and inventory updated!',
    ]);
}

}
