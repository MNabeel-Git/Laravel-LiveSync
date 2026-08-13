<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


// allow subscribed user to use the conversation channel
Broadcast::channel('chat.{id1}.{id2}', function ($user, $id1, $id2) {
    return in_array($user->id, [(int) $id1, (int) $id2]);
});