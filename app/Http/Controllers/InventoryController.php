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
    // 获取每个产品的最新库存记录
    $subQuery = Inventory::where('status', 'active')
        ->select('product_id')
        ->selectRaw('MAX(updated_at) as latest_updated_at')
        ->groupBy('product_id');

    $totals = Inventory::where('status', 'active')
        ->joinSub($subQuery, 'latest_inventories', function ($join) {
            $join->on('inventories.product_id', '=', 'latest_inventories.product_id')
                 ->on('inventories.updated_at', '=', 'latest_inventories.latest_updated_at');
        })
        ->selectRaw('
            COALESCE(SUM(instock), 0) as total_instock,
            COALESCE(SUM(damage), 0) as total_damage,
            COALESCE(SUM(missing), 0) as total_missing,
            COALESCE(SUM(reserved), 0) as total_reserved,
            COALESCE(SUM(rented), 0) as total_rented
        ')
        ->first();

    return response()->json([
        'instock' => (int) $totals->total_instock,
        'damage'  => (int) $totals->total_damage,
        'missing' => (int) $totals->total_missing,
        'reserved' => (int) $totals->total_reserved,
        'rented' => (int) $totals->total_rented,
    ]);
}

}
