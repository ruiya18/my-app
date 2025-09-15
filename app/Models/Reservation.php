<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'username',
        'product_id',
        'product_name',
        'outlet',
        'quantity',
        'reserve_date',
        'reserve_time',
        'status',
    ];
}
