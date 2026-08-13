<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


// allow subscribed user to use the conversation channel
Broadcast::channel('chat.{id1}.{id2}', function (User $user, $id1, $id2) {
    
    if (in_array((int) $user->id, [(int) $id1, (int) $id2], true)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }
    return false;
});
