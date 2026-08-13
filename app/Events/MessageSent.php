<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Use ShouldBroadcastNow for instant delivery testing
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        $ids = [$this->message->sender_id, $this->message->receiver_id];
        sort($ids);

        return [
            new PresenceChannel("chat.{$ids[0]}.{$ids[1]}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'body' => $this->message->body,
            'sender_id' => $this->message->sender_id,
            'created_at' => $this->message->created_at->format('H:i'),
        ];
    }
}