<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Inventory;
use Endroid\QrCode\Builder\Builder;

class ProductController extends Controller
{


    public function index(Request $request)
{
    $query = Product::query();

    if ($request->has('outlet') && $request->outlet !== '') {
        $query->where('outlet', $request->outlet);
    }

    $query->orderBy('outlet', 'desc');

    return $query->get();
}

public function store(Request $request)
{
    $validated = $request->validate([
        'productId' => 'required|string|unique:products,product_id',
        'name'      => ['required','string','max:255', 
        function ($attribute, $value, $fail) use ($request) {
                $existingProduct = Product::where('name', $value)
                    ->where('outlet', $request->outlet)
                    ->first();
                
                if ($existingProduct) {
                    $fail("The product name '{$value}' already exists in the {$request->outlet} outlet.");
                }
            }
        ],
        'quantity'  => 'required|integer|min:0',
        'status'    => 'required|in:active,inactive',
        'outlet'    => 'required|in:QM ROOM,UP STORE,DOWN STORE',
        'qrcode'    => 'nullable|string',
        'image'     => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',

    ]);

     $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }


    $product = Product::create([
        'product_id' => $validated['productId'],  // ✅ map here
        'name'       => $validated['name'],
        'quantity'   => $validated['quantity'],
        'status'     => $validated['status'],
        'outlet'     => $validated['outlet'],
        'qrcode'     => $validated['qrcode'] ?? null,
        'image'      => $imagePath,
    ]);

    \App\Models\Inventory::create([
        'product_id' => $product->product_id,
        'instock'    => $validated['quantity'] ?? 0,
        'damage'     => 0,
        'missing'    => 0,
        'status'     => $validated['status'], // better than hardcoding "active"
    ]);

    return response()->json([
        'message' => 'Product created successfully',
        'product' => $product,
    ], 201);
}


public function show($productId)
{
    return Product::where('product_id', $productId)->firstOrFail();
}

// public function update(Request $request, $productId)
// {
//     $product = Product::where('product_id', $productId)->firstOrFail();

//     $validated = $request->validate([
//         'name' => 'required|string|max:255',
//         'quantity' => 'required|integer|min:0',
//         'status' => 'required|in:active,inactive',
//         'outlet' => 'nullable|string|max:255',
//         'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',   
//     ]);

//       if ($request->hasFile('image')) {
//         // delete old image if exists
//         if ($product->image) {
//             Storage::disk('public')->delete($product->image);
//         }
//         $validated['image'] = $request->file('image')->store('products', 'public');
//     } else {
//         // keep old image
//         $validated['image'] = $product->image;
//     }


//     $product->update($validated);

//     return response()->json([
//         'message' => 'Product updated successfully',
//         'product' => $product
//     ]);

    
// }
public function update(Request $request, $productId)
{
    // find product
    $product = Product::where('product_id', $productId)->firstOrFail();

    // validate incoming fields
    $validated = $request->validate([
        'name'      => ['required','string','max:255', 
            function ($attribute, $value, $fail) use ($request, $product) {
                $existingProduct = Product::where('name', $value)
                    ->where('outlet', $request->outlet)
                    ->where('product_id', '!=', $product->product_id)
                    ->first();
                
                if ($existingProduct) {
                    $fail("The product name '{$value}' already exists in the {$request->outlet} outlet.");
                }
            }
        ],
        'quantity' => 'required|integer|min:0',
        'status'   => 'required|in:active,inactive',
        'outlet'   => 'nullable|string|max:255',
        'image'    => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
    ]);

    // handle image upload (delete old if new provided)
    if ($request->hasFile('image')) {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $validated['image'] = $request->file('image')->store('products', 'public');
    } else {
        // keep existing image if none uploaded
        $validated['image'] = $product->image;
    }

    // Update the product row
    $product->update([
        'name'     => $validated['name'],
        'quantity' => $validated['quantity'],
        'status'   => $validated['status'],
        'outlet'   => $validated['outlet'],
        'image'    => $validated['image'],
    ]);

    // Now update or create inventory row to reflect the new total quantity.
    // We compute instock = new_total_quantity - (reserved + rented + missing + damage)
    $inventory = Inventory::where('product_id', $product->product_id)->first();

    if (! $inventory) {
        // If inventory row missing, create it (sane defaults)
        $inventory = Inventory::create([
            'product_id' => $product->product_id,
            'instock'    => max(0, $validated['quantity']),
            'damage'     => 0,
            'missing'    => 0,
            'status'     => $validated['status'],
            'reserved'   => 0,
            'rented'     => 0,
        ]);
    } else {
        // compute occupied units (already reserved, rented, missing, damaged)
        $occupied = intval($inventory->reserved) + intval($inventory->rented)
                    + intval($inventory->missing) + intval($inventory->damage);

        // new instock should reflect the admin-specified total quantity
        $newTotal = intval($validated['quantity']);
        $newInstock = $newTotal - $occupied;

        // ensure not negative
        $inventory->instock = max(0, $newInstock);

        // optionally update inventory status to match product
        $inventory->status = $validated['status'] ?? $inventory->status;

        $inventory->save();
    }

    return response()->json([
        'message'   => 'Product updated successfully',
        'product'   => $product,
        'inventory' => $inventory,
    ]);
}


public function destroy($productId)
{
    $product = Product::where('product_id', $productId)->firstOrFail();

    if ($product->image) {
        Storage::disk('public')->delete($product->image);
    }

    // Delete related inventory via relationship
    $product->inventory()?->delete();

    $product->delete();

    return response()->json([
        'message' => 'Product and related inventory deleted successfully.',
    ]);
}



}

