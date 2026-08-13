<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index(User $user)
    {
        $me = Auth::user();

        $allMessages = Message::query()
            ->where(function ($query) use ($me, $user) {
                $query->where('sender_id', $me->id)
                      ->where('receiver_id', $user->id);
            })
            ->orWhere(function ($query) use ($me, $user) {
                $query->where('sender_id', $user->id)
                      ->where('receiver_id', $me->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $users = User::where('id', '!=', $me->id)->get(); 

        return view('chat.index', [
            'receiver' => $user,
            'messages' => $allMessages,
            'users'    => $users,            
        ]);
    }

    public function store(Request $request, User $user)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id'   => Auth::id(),
            'receiver_id' => $user->id,
            'body'        => $request->body,
        ]);

        broadcast(new MessageSent($message));

        return response()->json([
            'status'  => 'sent',
            'message' => $message,
        ]);
    }
}