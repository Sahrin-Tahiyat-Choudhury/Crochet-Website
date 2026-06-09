let contactMessages = [];

async function loadMessages() {
    try {
        const data = await API.contact.getMessages();

        contactMessages = data.messages;

        const tbody = document.getElementById('contact-messages-body');

        tbody.innerHTML = data.messages.map((msg, index) => `
            <tr>
                <td>${msg.name}</td>
                <td>${msg.email}</td>
                <td>${msg.subject}</td>
                <td>
                    <button onclick="viewMessage(${index})">
                        View
                    </button>
                </td>
                <td>${new Date(msg.createdAt).toLocaleString()}</td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
    }
}

function viewMessage(index) {
    const msg = contactMessages[index];

    document.getElementById('modal-name').textContent = msg.name;
    document.getElementById('modal-email').textContent = msg.email;
    document.getElementById('modal-subject').textContent = msg.subject;
    document.getElementById('modal-message').textContent = msg.message;

    document.getElementById('messageModal').classList.add('open');
}

function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('open');
}