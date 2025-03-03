document.addEventListener("DOMContentLoaded", function() {
    const chatbotDisplay = document.getElementById("chatbot-display");
    const input = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    if (!chatbotDisplay || !input || !sendButton) {
        console.error("Erreur : Un ou plusieurs éléments HTML manquent.");
        return;
    }

    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") sendMessage();
    });

    async function sendMessage() {
        const message = input.value.trim();
        if (message === "") return;

        displayMessage(message, "user-message");

        try {
            const response = await fetch('/chatbot/response/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            displayMessage(data.error || data.message, "bot-message");
        } catch (error) {
            console.error("Erreur lors de la requête:", error);
            displayMessage("❌ Erreur de connexion", "bot-message");
        }

        input.value = ''; 
    }

    function displayMessage(text, className) {
        const messageElement = document.createElement("div");
        messageElement.className = className;
        messageElement.textContent = text;
        chatbotDisplay.appendChild(messageElement);

      
        chatbotDisplay.scrollTop = chatbotDisplay.scrollHeight;
    }
});
