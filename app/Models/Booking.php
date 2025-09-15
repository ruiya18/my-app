<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    //
     protected $fillable = [
        'member_id', 'username', 'product_id', 'product_name', 'quantity',
        'checkin_at', 'checkout_at', 'status','reservation_id',
    ];
}
