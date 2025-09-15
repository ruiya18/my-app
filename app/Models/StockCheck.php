<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockCheck extends Model
{
    //
    protected $table = 'stockchecks';
    protected $fillable = ['date', 'outlet', 'items'];

    protected $casts = [
        'items' => 'array', // automatically cast JSON to array
    ];
}
