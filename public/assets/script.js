document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    const authUserId = parseInt(chatContainer.dataset.authUserId);
    const authUserName = chatContainer.dataset.authUserName;
    const receiverId = parseInt(chatContainer.dataset.receiverId);
    const csrfToken = chatContainer.dataset.csrfToken;

    const ids = [authUserId, receiverId].sort((a, b) => a - b);
    const channelName = `chat.${ids[0]}.${ids[1]}`;

    const messagesEl = document.getElementById('messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('message-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // UI Status Elements
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    let typingTimeout = null;

    function setOnlineStatus(isOnline) {
        if (isOnline) {
            statusDot.className = 'w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse';
            statusText.textContent = 'Online';
            statusText.className = 'text-xs text-green-400 font-normal';
        } else {
            statusDot.className = 'w-2.5 h-2.5 rounded-full bg-gray-500';
            statusText.textContent = 'Offline';
            statusText.className = 'text-xs text-gray-400 font-normal';
        }
    }

    function appendMessage(body, time, isMine) {
        const wrapper = document.createElement('div');
        wrapper.className = `flex ${isMine ? 'justify-end' : 'justify-start'}`;
        wrapper.innerHTML = `
            <div class="px-3 py-2 rounded-lg max-w-xs ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}">
                <p class="text-sm"></p>
                <span class="text-[10px] opacity-60 block text-right">${time}</span>
            </div>`;
        wrapper.querySelector('p').textContent = body;
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    const channel = window.Echo.join(channelName);

    // 2. Presence Events
    channel
        .here((users) => {
            const isReceiverHere = users.some(u => u.id === receiverId);
            setOnlineStatus(isReceiverHere);
        })
        .joining((user) => {
            if (user.id === receiverId) {
                setOnlineStatus(true);
            }
        })
        .leaving((user) => {
            if (user.id === receiverId) {
                setOnlineStatus(false);
            }
        });


    channel.listen('.message.sent', (e) => {
        // If the message is from the other user, append it to the chat
        if (e.sender_id !== authUserId) {
            appendMessage(e.body, e.created_at, false);
        }
        typingIndicator.classList.add('opacity-0');
    });

    channel.listenForWhisper('typing', (e) => {
        typingIndicator.textContent = `${e.name} is typing...`;
        typingIndicator.classList.remove('opacity-0');

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingIndicator.classList.add('opacity-0');
        }, 2000);
    });

    input.addEventListener('input', () => {
        channel.whisper('typing', {
            name: authUserName
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = input.value.trim();
        if (!body) return;

        appendMessage(body, 'Now', true);
        input.value = '';
        typingIndicator.classList.add('opacity-0');

        await fetch(`/chat/${receiverId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Socket-ID': window.Echo.socketId()
            },
            body: JSON.stringify({ body }),
        });
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
});