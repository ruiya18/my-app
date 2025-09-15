<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
        protected $primaryKey = 'product_id';
    public $incrementing = false;
    protected $keyType = 'string';
    
 protected $fillable = [
    'product_id',
    'name',
    'quantity',
    'status',
    'outlet',
    'qrcode',
    'image',
];

// Product.php
public function inventory()
{
    return $this->hasOne(Inventory::class, 'product_id', 'product_id');
}


}
