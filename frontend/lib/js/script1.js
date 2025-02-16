// Select DOM elements
const authContainer = document.getElementById('auth-container');
const signupSection = document.getElementById('signup-section');
const loginSection = document.getElementById('login-section');
const chatContainer = document.getElementById('chat-container');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
// Check local storage for user preference
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️'; // Sun icon for light mode
} else {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙'; // Moon icon for dark mode
}

// Toggle dark mode
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark); // Save preference
});

let currentUserId = null;

// Switch to Login Section
document.getElementById('switch-to-login').addEventListener('click', () => {
    signupSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// Switch to Signup Section
document.getElementById('switch-to-signup').addEventListener('click', () => {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
});
// ************************************
document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.querySelector(".dropdown");
    let dropdownMenu = document.querySelector(".dropdown-menu");
    let timeout;

    dropdown.addEventListener("mouseenter", function () {
        clearTimeout(timeout);
        dropdownMenu.style.visibility = "visible";
        dropdownMenu.style.opacity = "1";
        dropdownMenu.style.transform = "translateY(0)";
    });

    dropdown.addEventListener("mouseleave", function () {
        timeout = setTimeout(function () {
            dropdownMenu.style.visibility = "hidden";
            dropdownMenu.style.opacity = "0";
            dropdownMenu.style.transform = "translateY(-10px)";
        }, 300); // Waits 300ms before hiding
    });

    dropdownMenu.addEventListener("mouseenter", function () {
        clearTimeout(timeout);
    });

    dropdownMenu.addEventListener("mouseleave", function () {
        timeout = setTimeout(function () {
            dropdownMenu.style.visibility = "hidden";
            dropdownMenu.style.opacity = "0";
            dropdownMenu.style.transform = "translateY(-10px)";
        }, 300);
    });
});


// Handle Signup
document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    try {
        const response = await fetch('http://127.0.0.1:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.uid) {
            alert(data.message); // Display success message
            currentUserId = data.uid;
            showChatInterface();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert('An error occurred while signing up. Please try again.');
        console.error(error);
    }
});
let lastMessageDate = null; // To track date separators

// Handle Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }
    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred');
        }
        const data = await response.json();
        alert(data.message); // Display success message
        currentUserId = data.uid; // Set the user ID
        console.log("Current User ID:", currentUserId); // Log the user ID
        showChatInterface();
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error(error);
    }
});


// ---------------------------speak func-----------------------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("Your browser does not support speech recognition.");
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

// Get references to the button and its text
const speakBtn = document.getElementById('speak-btn');
const speakBtnText = document.getElementById('speak-btn-text');

// Add event listener for the "Speak" button
speakBtn.addEventListener('click', () => {
    // Update button text to indicate listening
    speakBtnText.textContent = 'Listening...';
    speakBtn.disabled = true; // Disable the button while listening

    recognition.start(); // Start listening
});

// Handle speech recognition results
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim(); // Get the transcribed text
    document.getElementById('user-input').value = transcript; // Populate the input field

    // Revert button text after transcription
    speakBtnText.textContent = '🎤 Speak';
    speakBtn.disabled = false; // Re-enable the button
};

// Handle errors during speech recognition
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("An error occurred while recognizing speech. Please try again.");

    // Revert button text in case of an error
    speakBtnText.textContent = '🎤 Speak';
    speakBtn.disabled = false; // Re-enable the button
};

// Handle recognition end
recognition.onend = () => {
    // Revert button text when recognition ends
    speakBtnText.textContent = '🎤 Speak';
    speakBtn.disabled = false; // Re-enable the button

    const userInput = document.getElementById('user-input');
    if (userInput.value.trim()) {
        sendMessage(); // Trigger the send message function
    }
};
// ------------additional edits for speak func-------------------
speakBtn.addEventListener('click', () => {
    speakBtnText.textContent = 'Listening...';
    speakBtn.classList.add('listening'); // Add CSS class for visual feedback
    speakBtn.disabled = true;

    recognition.start();
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    document.getElementById('user-input').value = transcript;

    speakBtnText.textContent = '🎤 Speak';
    speakBtn.classList.remove('listening'); // Remove CSS class
    speakBtn.disabled = false;
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("An error occurred while recognizing speech. Please try again.");

    speakBtnText.textContent = '🎤 Speak';
    speakBtn.classList.remove('listening');
    speakBtn.disabled = false;
};

recognition.onend = () => {
    speakBtnText.textContent = '🎤 Speak';
    speakBtn.classList.remove('listening');
    speakBtn.disabled = false;

    const userInput = document.getElementById('user-input');
    if (userInput.value.trim()) {
        sendMessage();
    }
};
// -------------------------------------------------------------

const mentalHealthTest = [
    {
        question: "How often do you feel sad or hopeless?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "Do you feel nervous or anxious most of the time?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "How well do you sleep at night?",
        options: ["Very well", "Fairly well", "Poorly", "Very poorly"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "Do you feel isolated or disconnected from others?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "How often do you feel overwhelmed by daily tasks?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "Do you have trouble concentrating or making decisions?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "How often do you experience physical symptoms like headaches or stomachaches due to stress?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "Have you lost interest in activities you used to enjoy?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    },
    {
        question: "Do you feel irritable or easily angered without a clear reason?",
        options: ["Never", "Rarely", "Sometimes", "Often"],
        scores: [0, 1, 2, 3]
    }
];
let currentQuestionIndex = 0;
let totalScore = 0;

// Function to display the next question
function displayNextQuestion() {
    const chatBox = document.getElementById('chat-box');

    console.log("Displaying question:", currentQuestionIndex); // Debugging log

    if (currentQuestionIndex < mentalHealthTest.length) {
        const question = mentalHealthTest[currentQuestionIndex];
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'ai');
        messageElement.textContent = question.question;
        chatBox.appendChild(messageElement);

        // Display options as buttons
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.classList.add('test-option');
            optionButton.onclick = () => handleAnswer(index);
            chatBox.appendChild(optionButton);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        // End of the test, calculate results
        evaluateResults();
    }
}

// Handle user's answer
function handleAnswer(selectedOptionIndex) {
    const currentQuestion = mentalHealthTest[currentQuestionIndex];
    totalScore += currentQuestion.scores[selectedOptionIndex];
    currentQuestionIndex++;
    console.log("Answer selected. Moving to next question."); // Debugging log
    displayNextQuestion();
}

// Evaluate the test results
function evaluateResults() {
    const chatBox = document.getElementById('chat-box');
    let resultMessage = '';
    let recommendation = '';

    if (totalScore <= 5) {
        resultMessage = "Your mental health seems to be in a good state. Keep taking care of yourself!";
        recommendation = "Consider practicing mindfulness, exercising regularly, or talking to a friend.";
    } else if (totalScore <= 12) {
        resultMessage = "You might be experiencing some mild stress or anxiety.";
        recommendation = "We recommend speaking to a counselor or therapist. You can find one near you using online directories.";
    } else {
        resultMessage = "Your responses indicate severe mental health concerns.";
        recommendation = "Please consult a psychologist or psychiatrist immediately. You can also call a crisis hotline for immediate support.";
    }

    const resultElement = document.createElement('div');
    resultElement.classList.add('message', 'ai');
    resultElement.innerHTML = `${resultMessage}<br><strong>Recommendation:</strong> ${recommendation}`;
    chatBox.appendChild(resultElement);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Start the test when the chatbot opens
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chatbot initialized. Starting test..."); // Debugging log
    displayNextQuestion();
});

// -------------------------------------------------------------
// Show Chat Interface and Fetch Chat History
async function showChatInterface() {
    authContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    try {
        console.log("Fetching chat history for user ID:", currentUserId); // Debug log
        // Fetch past chat history
        const response = await fetch(`http://127.0.0.1:5000/chat/${currentUserId}/history`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.chats && data.chats.length > 0) {
            data.chats.forEach(chat => appendMessage(chat.sender, chat.message));
        } else {
            console.log("No chat history found."); // Log for debugging
        }
    } catch (error) {
        alert('An error occurred while fetching chat history.');
        console.error(error);
    }
}
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        sendMessage();
    }
});
// Send Message
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Append user message to chat box
    appendMessage('user', message);
    userInput.value = '';
    try {
        const response = await fetch(`http://127.0.0.1:5000/chat/${currentUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred');
        }
        const data = await response.json();
        appendMessage('ai', data.response);
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error(error);
    }
}
fetch(`/chat/${user_id}/history`)
    .then(response => response.json())
    .then(data => {
        if (!data.chats || data.chats.length === 0) {
            console.log("No chat history found.");
            return;
        }
        console.log("Chat history:", data.chats);
    })
    .catch(error => console.error("Error fetching chat history:", error));


// Append Messages to Chat Box
function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = timestamp.toLocaleDateString();

    if (lastMessageDate !== dateString) {
        // Insert date separator when a new day starts
        const dateSeparator = document.createElement('div');
        dateSeparator.classList.add('date-separator');
        dateSeparator.textContent = dateString;
        chatBox.appendChild(dateSeparator);
        lastMessageDate = dateString;
    }

    const messageText = document.createElement('span');
    messageText.textContent = message;
    
    const timeStampElement = document.createElement('span');
    timeStampElement.classList.add('timestamp');
    timeStampElement.textContent = timeString;
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(timeStampElement);
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}
    

// ************************************
