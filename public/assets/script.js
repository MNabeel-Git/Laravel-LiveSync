document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    
    const authUserId = parseInt(chatContainer.dataset.authUserId);
    const authUserName = chatContainer.dataset.authUserName; 
    const receiverId = parseInt(chatContainer.dataset.receiverId);
    const receiverName = chatContainer.dataset.receiverName; 
    const csrfToken = chatContainer.dataset.csrfToken;

    const ids = [authUserId, receiverId].sort((a, b) => a - b);
    const channelName = `chat.${ids[0]}.${ids[1]}`;

    const messagesEl = document.getElementById('messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('message-input');
    const typingIndicator = document.getElementById('typing-indicator');

    let typingTimeout = null;

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

    const channel = window.Echo.private(channelName);

    channel.listen('.message.sent', (e) => {
        appendMessage(e.body, e.created_at, e.sender_id === authUserId);
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