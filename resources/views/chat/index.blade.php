<x-app-layout>
    {{-- Chat Container with Data Attributes --}}
    <div id="chat-container" data-auth-user-id="{{ auth()->id() }}" data-auth-user-name="{{ auth()->user()->name }}"
        data-receiver-id="{{ $receiver->id }}" data-receiver-name="{{ $receiver->name }}"
        data-csrf-token="{{ csrf_token() }}"
        class="flex h-[80vh] max-w-5xl mx-auto mt-6 border border-gray-700 rounded-lg overflow-hidden shadow-lg bg-gray-900">

        {{-- Sidebar --}}
        <div class="w-1/4 bg-gray-950 border-r border-gray-800 overflow-y-auto">
            <div class="p-4 font-semibold border-b border-gray-800 text-gray-200">Chats</div>
            @foreach ($users as $u)
                <a href="{{ route('chat.index', $u) }}"
                    class="block p-3 text-gray-300 hover:bg-gray-800 transition {{ $u->id === $receiver->id ? 'bg-gray-800 border-l-2 border-blue-500' : '' }}">
                    {{ $u->name }}
                </a>
            @endforeach
        </div>

        {{-- Chat window --}}
        <div class="flex-1 flex flex-col">
            <div
                class="p-4 border-b border-gray-800 font-semibold bg-gray-900 text-gray-100 flex justify-between items-center">
                <span>{{ $receiver->name }}</span>
            </div>

            <div id="messages" class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-950">
                @foreach ($messages as $msg)
                    <div class="flex {{ $msg->sender_id === auth()->id() ? 'justify-end' : 'justify-start' }}">
                        <div
                            class="px-3 py-2 rounded-lg max-w-xs {{ $msg->sender_id === auth()->id() ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100' }}">
                            <p class="text-sm">{{ $msg->body }}</p>
                            <span class="text-[10px] opacity-60 block text-right">
                                {{ $msg->created_at->format('H:i') }}
                            </span>
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Typing Indicator Banner --}}
            <div id="typing-indicator"
                class="px-4 py-1 text-xs text-gray-400 italic bg-gray-950 h-6 transition-opacity duration-200 opacity-0">
            </div>

            <form id="chat-form" class="p-3 border-t border-gray-800 bg-gray-900 flex gap-2">
                @csrf
                <input id="message-input" type="text" autocomplete="off"
                    class="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Type a message...">
                <button type="submit"
                    class="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition">
                    Send
                </button>
            </form>
        </div>
    </div>

    <script src="{{ asset('assets/script.js') }}"></script>
</x-app-layout>
