<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockCheck;
use App\Models\Product;
use App\Models\Inventory;


class StockCheckController extends Controller
{
     // Store stock check
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'outlet' => 'required|string',
            'items' => 'required|array',
        ]);

        $stockCheck = StockCheck::create([
            'date' => $request->date,
            'outlet' => $request->outlet,
            'items' => $request->items,
        ]);

    foreach ($request->items as $productId => $data) {
        $inventory = Inventory::where('product_id', $productId)->first();
        if ($inventory) {
            $inventory->update([
                'instock' => $data['instock'],
                'damage' => $data['damage'],
                'missing' => $data['missing'],
            ]);
        }
    }

        return response()->json($stockCheck, 201);
    }

    // List all stock checks
    public function index(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'outlet' => 'nullable|string',
        ]);

        $query = StockCheck::query();

        // Required date filter
        $query->whereDate('date', $request->date);

        // Optional outlet filter
        if ($request->filled('outlet')) {
            $query->where('outlet', $request->outlet);
        }

        $stockChecks = $query->get()->map(function ($check) {
            $items = [];
            foreach ($check->items as $productId => $data) {
                $product = Product::where('product_id', $productId)->first();
                $items[] = [
                    'product_id' => $productId,
                    'name' => $product ? $product->name : 'Unknown',
                    'instock' => $data['instock'] ?? 0,
                    'damage' => $data['damage'] ?? 0,
                    'missing' => $data['missing'] ?? 0,
                ];
            }
            return [
                'id' => $check->id,
                'date' => $check->date,
                'outlet' => $check->outlet,
                'items' => $items,
            ];
        });

        return response()->json($stockChecks);
    }



    // Show single stock check
    public function show($id)
    {
        return StockCheck::findOrFail($id);
    }
}
