<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Member;

class MemberController extends Controller
{
    public function index()
    {
        return response()->json(Member::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:members,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:student,teacher',
            'status' => 'required|in:active,inactive',
        ], [
            'username.unique' => 'This username is already taken. Please choose another one.',
        ]);

         $member = Member::create([
        'username' => $request->username,
        'role' => $request->role,
        'status' => $request->status,
        'password' => Hash::make($request->password), // Hashing the password
    ]);

        return response()->json($member, 201);
    }
    
public function show($id)
{
    $member = Member::find($id);
    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }
    return response()->json($member);
}


public function update(Request $request, $id)
{
    $member = Member::find($id);
    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }

    $request->validate([
        'username' => 'required|string|max:255|unique:members,username,' . $id,
        'role' => 'required|string',
        'status' => 'required|string',
    ], [
        'username.unique' => 'This username is already taken. Please choose another one.',
    ]);

    $member->update($request->all());

    return response()->json(['message' => 'Member updated successfully.']);
}

public function changePassword(Request $request, $id)
{
    $request->validate([
        'password' => 'required|string|min:6',
    ]);

    $member = Member::find($id);

    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }

    $member->password = bcrypt($request->password);
    $member->save();

    return response()->json(['message' => 'Password updated successfully.']);
}

public function destroy($id)
{
    $member = Member::find($id);
    if (!$member) {
        return response()->json(['message' => 'Member not found'], 404);
    }

    $member->delete();
    return response()->json(['message' => 'Member deleted successfully.']); 

}

}


