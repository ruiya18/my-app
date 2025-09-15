<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;

class InventoryController extends Controller
{
    //
public function index()
    {
        // join with products to get product name
        $inventories = Inventory::join('products', 'inventories.product_id', '=', 'products.product_id')
            ->select(
                'inventories.id',
                'inventories.product_id',
                'products.name',
                'products.image',
                'products.outlet',
                'inventories.instock',
                'inventories.damage',
                'inventories.missing',
                'inventories.status',
                'inventories.reserved',
                'inventories.rented',
            )
            ->get();

        return response()->json($inventories);
    }

    public function show($productId)
{
    $inventory = Inventory::join('products', 'inventories.product_id', '=', 'products.product_id')
        ->select(
            'inventories.id',
            'inventories.product_id',
            'products.name',
            'products.image',
            'products.outlet',
            'inventories.instock',
            'inventories.damage',
            'inventories.missing',
            'inventories.status',
            'inventories.reserved',
            'inventories.rented',
        )
        ->where('inventories.product_id', $productId)
        ->firstOrFail();

    return response()->json($inventory);
}

public function summary()
{
    $totals = Inventory::selectRaw('
        SUM(instock) as total_instock,
        SUM(damage) as total_damage,
        SUM(missing) as total_missing
    ')->first();

    return response()->json([
        'instock' => (int) $totals->total_instock,
        'damage'  => (int) $totals->total_damage,
        'missing' => (int) $totals->total_missing,
    ]);
}

}
