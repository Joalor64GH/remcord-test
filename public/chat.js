const socket = io();
const messagesDiv = document.getElementById('messages');

// Store the current profile picture URL globally
let currentPfp = '';

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const username = document.getElementById('username').value || 'Anonymous';

    // Get the current time in 24-hour format
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get the profile picture
    const imageInput = document.getElementById('imageInput');
    const pfp = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : ''; // Create a URL for the uploaded image

    // Prepare the message data
    const messageData = {
        username,
        message: messageInput.value.trim(),
        time,
        pfp
    };

    // Check if there is a message to send
    if (messageData.message || imageInput.files.length > 0) {
        // If an image is selected, read it and convert to Base64
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();

            reader.onloadend = function () {
                messageData.image = reader.result; // Base64 image string
                socket.emit('sendMessage', messageData); // Send message with image
                resetInputs(messageInput, imageInput); // Reset inputs after sending
            };

            reader.readAsDataURL(file); // Read the image as a data URL
        } else {
            socket.emit('sendMessage', messageData); // Send message without image
            resetInputs(messageInput, imageInput); // Reset inputs after sending
        }
    }
}

// Helper function to reset inputs
function resetInputs(messageInput) {
    messageInput.value = ''; // Clear message input field after sending
    // Do not reset the image input field
}

socket.on('receiveMessage', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    // Create the profile picture element
    const pfpElement = document.createElement('img');
    pfpElement.src = msg.pfp; // Use the pfp from the message object
    pfpElement.className = 'pfp';

    // Create the message group div
    const messageGroupElement = document.createElement('div');
    messageGroupElement.className = 'messagegroup';

    // Create the username element
    const usernameElement = document.createElement('span');
    usernameElement.className = 'username';
    usernameElement.innerText = msg.username;

    // Create the time element
    const timeElement = document.createElement('span');
    timeElement.className = 'time';
    timeElement.innerText = `(${msg.time})`;

    // Create the message content element
    const contentElement = document.createElement('span');
    contentElement.className = 'message-content';
    contentElement.innerHTML = parseMessage(msg.message); // Use your existing parseMessage function

    // Append elements to the message group
    messageGroupElement.appendChild(usernameElement);
    messageGroupElement.appendChild(timeElement); // Append time after the username
    messageGroupElement.appendChild(contentElement); // Append content last

    // Append the profile picture and message group to the message element
    messageElement.appendChild(pfpElement);
    messageElement.appendChild(messageGroupElement);

    // Append the message element to the messages div
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the bottom

    // Apply the shake effect if the message contained the shake command
    if (msg.message.includes('{!shake}')) {
        shakeEffect(contentElement); // Call shakeEffect on the contentElement
    }
});

// Parse messages for special effects
function parseMessage(message) {
    // Handle color effect
    const colorRegex = /\{\!color:(#[0-9A-Fa-f]{6})\}\s*(.+)/g;
    message = message.replace(colorRegex, (match, color, text) => {
        return `<span style="color: ${color};">${text}</span>`;
    });

    // Handle shake effect
    const shakeRegex = /\{\!shake\}\s*(.+)/g;
    message = message.replace(shakeRegex, (match, text) => {
        return `<span class="shake">${text}</span>`;
    });

    // Handle small and transparent text
    const smallTextRegex = /\^(.+?)\^/g;
    message = message.replace(smallTextRegex, (match, text) => {
        return `<span class="small-text">${text}</span>`;
    });

    return message
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
        .replace(/_(.*?)_/g, "<i>$1</i>") // Italics
        .replace(/~~(.*?)~~/g, "<s>$1</s>"); // Strikethrough
}

// Updated shake effect function
function shakeEffect(element) {
    const letters = element.innerText.split('').map((letter) => {
        const span = document.createElement('span');
        span.innerText = letter;
        span.classList.add('shake');
        return span; // Return the span to collect them in the array
    });

    element.innerHTML = ''; // Clear the original content before appending spans
    letters.forEach(span => element.appendChild(span)); // Append all spans back to the element

    const shakeDistance = 1.5; // Adjust the shake distance as needed
    const shakeInterval = 1; // Adjust the shake interval for speed

    setInterval(() => {
        letters.forEach(letter => {
            const shakeX = (Math.random() * shakeDistance * 1) - shakeDistance; // Random X shake
            const shakeY = (Math.random() * shakeDistance * 1) - shakeDistance; // Random Y shake
            letter.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        });
    }, shakeInterval); // Adjust interval duration as needed
}

// CSS styles (you can include this in your CSS file)
const style = document.createElement('style');
style.innerHTML = `
    .shake {
        display: inline-block; /* Ensures the shake animation applies correctly */
        transition: transform 0.05s; /* Adjust duration as needed */
    }
    .small-text {
        font-size: 0.75em; /* Smaller text size */
        opacity: 0.6; /* Slight transparency */
    }
`;
document.head.appendChild(style);
