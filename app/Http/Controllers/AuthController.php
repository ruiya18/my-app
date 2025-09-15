<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Member;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
     public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|min:6',
            'role' => 'required|in:administrator,quarter master',
            'status' => 'required|in:active,inactive',
        ], [
            'username.unique' => 'This username is already taken. Please choose another one.',
        ]);

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user]);
    }


public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // Check Users table first (admins/quartermasters)
    $user = User::where('username', $request->username)->first();
    if ($user && \Hash::check($request->password, $user->password)) {
        return response()->json(['user' => $user], 200);
    }

    // Check Members table (teachers/students)
    $member = Member::where('username', $request->username)->first();
    if ($member && \Hash::check($request->password, $member->password)) {
        return response()->json(['member' => $member], 200);
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
}


public function listUsers()
    {
        $users = User::all();  
        return response()->json($users);  
    }

}
