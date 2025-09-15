<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        return response()->json(User::all());
    }

    public function show($id)
{
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    return response()->json($user);
}

public function update(Request $request, $id)
{
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $request->validate([
        'username' => 'required|string|max:255|unique:users,username,' . $id,
        'role' => 'required|in:administrator,quarter master',
        'status' => 'required|in:active,inactive',
    ], [
        'username.unique' => 'This username is already taken. Please choose another one.',
    ]);

    $user->update($request->only('username', 'role', 'status'));

    return response()->json(['message' => 'User updated successfully', 'user' => $user]);
}

public function changePassword(Request $request, $id)
{
    $request->validate([
        'password' => 'required|string|min:6',
    ]);

    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $user->password = bcrypt($request->password);
    $user->save();

    return response()->json(['message' => 'Password updated successfully.']);
}

public function destroy($id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    $user->delete();
    return response()->json(['message' => 'User deleted successfully.']);
}

}
