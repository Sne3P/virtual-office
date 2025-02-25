// chatbot.js
document.addEventListener("DOMContentLoaded", function() {
    const chatbotDisplay = document.getElementById("chatbot-display");
    const input = document.createElement("input");
    const sendButton = document.createElement("button");
    sendButton.textContent = "Envoyer";

    chatbotDisplay.appendChild(input);
    chatbotDisplay.appendChild(sendButton);

    sendButton.addEventListener("click", async () => {
        const message = input.value;
        if (message.trim() === "") return;

        const response = await fetch('/chatbot/response/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        if (data.error) {
            chatbotDisplay.innerHTML += `<div>Chatbot: ${data.error}</div>`;
        } else {
            chatbotDisplay.innerHTML += `<div>Chatbot: ${data.message}</div>`;
        }

        input.value = ''; // Clear the input after sending
    });
});
