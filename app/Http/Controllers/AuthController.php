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


// public function login(Request $request)
// {
//     $request->validate([
//         'username' => 'required|string',
//         'password' => 'required|string',
//     ]);

//     // Check Users table first (admins/quartermasters)
//     $user = User::where('username', $request->username)->first();
//     if ($user && \Hash::check($request->password, $user->password)) {
//         return response()->json(['user' => $user], 200);
//     }

//     // Check Members table (teachers/students)
//     $member = Member::where('username', $request->username)->first();
//     if ($member && \Hash::check($request->password, $member->password)) {
//         return response()->json(['member' => $member], 200);
//     }

//     return response()->json(['message' => 'Please contact  adminis'], 401);
// }

// public function login(Request $request)
// {
//     $request->validate([
//         'username' => 'required|string',
//         'password' => 'required|string',
//     ]);

//     // Check Users table first (admins/quartermasters)
//     $user = User::where('username', $request->username)->first();
//     if ($user) {
//         if (\Hash::check($request->password, $user->password)) {
//             return response()->json(['user' => $user], 200);
//         }
        
//         return response()->json(['message' => 'Invalid password'], 401);
//     }

//     // Check Members table (teachers/students)
//     $member = Member::where('username', $request->username)->first();
//     if ($member) {
//         if (\Hash::check($request->password, $member->password)) {
//             return response()->json(['member' => $member], 200);
//         }
//         return response()->json(['message' => 'Invalid password'], 401);
//     }

//     // If username not found in both tables
//     return response()->json([
//         'message' => 'Account not found. Please ask the administrator to create an account for you.'
//     ], 404);
// }

public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // Check Users table first (admins/quartermasters)
    $user = User::where('username', $request->username)->first();

    if ($user) {
        if (!\Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is inactive. Please contact the administrator.'], 403);
        }

        return response()->json(['user' => $user], 200);
    }

    // Check Members table (teachers/students)
    $member = Member::where('username', $request->username)->first();

    if ($member) {
        if (!\Hash::check($request->password, $member->password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        if ($member->status !== 'active') {
            return response()->json(['message' => 'Your account is inactive. Please contact the administrator.'], 403);
        }

        return response()->json(['member' => $member], 200);
    }

    // If username not found in both tables
    return response()->json([
        'message' => 'Account not found. Please ask the administrator to create an account for you.'
    ], 404);
}



public function listUsers()
    {
        $users = User::all();  
        return response()->json($users);  
    }

}
