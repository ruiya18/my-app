<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\StockCheckController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DashboardController;

Route::get('/config/app-url', function () {
    return response()->json([
        'APP_URL' => config('app.url'),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Route::get('/users', [AuthController::class, 'ListUsers']);

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::put('/users/{id}/change-password', [UserController::class, 'changePassword']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/members', [MemberController::class, 'index']);
Route::post('/members', [MemberController::class, 'store']);
Route::get('/members/{id}', [MemberController::class, 'show']);
Route::put('/members/{id}', [MemberController::class, 'update']);
Route::put('/members/{id}/change-password', [MemberController::class, 'changePassword']);
Route::delete('/members/{id}', [MemberController::class, 'destroy']);

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{productId}', [ProductController::class, 'show']);
Route::put('/products/{productId}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);


Route::post('/stockchecks', [StockCheckController::class, 'store']);
Route::get('/stockchecks', [StockCheckController::class, 'index']);
Route::get('/stockchecks/{id}', [StockCheckController::class, 'show']);

Route::get('/inventories', [InventoryController::class, 'index']);
Route::get('/inventories/{productId}', [InventoryController::class, 'show']);

Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{id}', [BookingController::class, 'show']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);

Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

// Route::post('/bookings/${currentBooking.id}/checkout', [BookingController::class, 'checkout']); // checkout

Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::put('/reservations/{id}', [ReservationController::class, 'update']);
Route::post('/reservations/{id}/accept', [ReservationController::class, 'accept']);
Route::post('/reservations/{id}/reject', [ReservationController::class, 'reject']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);


// Route::put('/reservations/{id}/accept', [ReservationController::class, 'accept']);
// Route::put('/reservations/{id}/reject', [ReservationController::class, 'reject']);
// member mobile page
Route::post('/bookings/checkout', [BookingController::class, 'checkout']);
Route::put('/bookings/{id}/checkin', [BookingController::class, 'checkin']);

Route::get('/my-bookings', [BookingController::class, 'myBookings']);
Route::get('/my-reservations', [ReservationController::class, 'myReservations']);


Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
Route::get('/weekly-bookings', [DashboardController::class, 'weeklyBookings']);
Route::get('/inventory-summary', [InventoryController::class, 'summary']);
Route::get('/weekly-reservations', [ReservationController::class, 'weeklyStats']);

