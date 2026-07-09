// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const clearChatBtn = document.getElementById('clearChatBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const fileUpload = document.getElementById('fileUpload');
const uploadBtn = document.getElementById('uploadBtn');

// State
let isGenerating = false;
let chatHistory = [];
let knowledgeBase = [];

// Configuration for Marked.js and Highlight.js
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    breaks: true
});

// --- Feature 1: Theme Toggle ---
function updateThemeIcon(isDark) {
    if (isDark) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

function initTheme() {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }
}

themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    updateThemeIcon(isDark);

    if (isDark) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// --- Feature 2: Chat History Persistence ---
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
}

function loadChatHistory() {
    const savedKB = localStorage.getItem('knowledgeBase');
    if (savedKB) {
        try {
            knowledgeBase = JSON.parse(savedKB);
        } catch(e) {
            console.error("Error loading knowledge base", e);
            knowledgeBase = [];
        }
    }

    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        try {
            chatHistory = JSON.parse(saved);

            // If history exists, hide welcome message and render history
            if (chatHistory.length > 0) {
                welcomeMessage.style.display = 'none';

                chatHistory.forEach(msg => {
                    if (msg.role === 'user') {
                        appendUserMessage(msg.content, false);
                    } else {
                        appendBotMessage(msg.content, false);
                    }
                });

                scrollToBottom();
            }
        } catch (e) {
            console.error("Error loading chat history", e);
            chatHistory = [];
        }
    }

    // Fade in welcome message if no history
    if (chatHistory.length === 0) {
        setTimeout(() => {
            welcomeMessage.classList.remove('opacity-0');
        }, 300);
    }
}

// --- Feature 5: Clear Chat ---
clearChatBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the conversation and knowledge base?')) {
        chatHistory = [];
        knowledgeBase = [];
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('knowledgeBase');

        // Remove all messages except welcome message
        const messages = chatContainer.querySelectorAll('.message-container');
        messages.forEach(msg => msg.remove());

        // Show welcome message
        welcomeMessage.style.display = 'flex';
        setTimeout(() => {
            welcomeMessage.classList.remove('opacity-0');
        }, 50);
    }
});

// --- Feature 6: RAG Document Upload ---
uploadBtn.addEventListener('click', () => {
    fileUpload.click();
});

fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        processDocument(text, file.name);
    };
    reader.readAsText(file);

    // Reset input
    fileUpload.value = '';
});

function processDocument(text, filename) {
    // Basic chunking: split by paragraphs (double newline)
    const chunks = text.split(/\n\s*\n/).map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);

    // Add to knowledge base
    knowledgeBase = chunks;

    // Notify user
    const sysMsg = `*System:* Uploaded \`${filename}\` successfully. Extracted ${chunks.length} chunks into the knowledge base. Try asking questions about it!`;
    appendBotMessage(sysMsg, true);

    // Save to history so the system message persists
    chatHistory.push({ role: 'bot', content: sysMsg });
    saveChatHistory();
}

// --- Auto-resize textarea ---
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';

    // Enable/disable send button
    if (this.value.trim().length > 0 && !isGenerating) {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute('disabled', 'true');
    }
});

// Handle enter key to send
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendBtn.addEventListener('click', handleSend);

// --- Core Chat Logic ---

function handleSend() {
    const text = userInput.value.trim();
    if (!text || isGenerating) return;

    // Hide welcome message
    welcomeMessage.style.display = 'none';

    // Reset input
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.setAttribute('disabled', 'true');

    // 1. Add user message
    appendUserMessage(text, true);

    // Add to history
    chatHistory.push({ role: 'user', content: text });
    saveChatHistory();

    // 2. Generate response
    generateResponse(text);
}

function appendUserMessage(text, animate) {
    const div = document.createElement('div');
    div.className = `flex gap-4 justify-end message-container ${animate ? 'animate-slide-up' : ''}`;

    div.innerHTML = `
        <div class="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] break-words">
            ${escapeHTML(text)}
        </div>
    `;

    chatContainer.appendChild(div);
    scrollToBottom();
}

function appendBotMessage(markdownText, animate) {
    const div = document.createElement('div');
    div.className = `flex gap-4 message-container message-bot ${animate ? 'animate-slide-up' : ''}`;

    // Parse markdown (Feature 3)
    const htmlContent = marked.parse(markdownText);

    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
            <i class="fa-solid fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] prose dark:prose-invert break-words overflow-x-auto">
            ${htmlContent}
        </div>
    `;

    chatContainer.appendChild(div);

    // Apply syntax highlighting to any code blocks
    div.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    scrollToBottom();
}

// --- Feature 4: Typing Indicator & Simulated Streaming ---

function showTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'flex gap-4 message-container message-bot animate-slide-up';

    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
            <i class="fa-solid fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
            <div class="typing-dot bg-gray-400 w-2 h-2 rounded-full"></div>
            <div class="typing-dot bg-gray-400 w-2 h-2 rounded-full" style="animation-delay: 0.2s"></div>
            <div class="typing-dot bg-gray-400 w-2 h-2 rounded-full" style="animation-delay: 0.4s"></div>
        </div>
    `;

    chatContainer.appendChild(div);
    scrollToBottom();
    return div;
}

// RAG Search Function
function searchKnowledgeBase(query) {
    if (knowledgeBase.length === 0) return null;

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) return null;

    // Score chunks based on keyword overlap
    const scoredChunks = knowledgeBase.map(chunk => {
        const lowerChunk = chunk.toLowerCase();
        let score = 0;
        queryWords.forEach(word => {
            if (lowerChunk.includes(word)) score++;
        });
        return { chunk, score };
    });

    // Sort by highest score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Return best chunk if it has a match
    if (scoredChunks[0] && scoredChunks[0].score > 0) {
        return scoredChunks[0].chunk;
    }

    return null;
}

// Simulate an AI response based on keywords
function getSimulatedResponse(input) {
    // 1. Check Knowledge Base for RAG
    const retrievedContext = searchKnowledgeBase(input);
    if (retrievedContext) {
        return `Based on the uploaded document, I found the following relevant information:\n\n<div class="retrieved-context border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300">${retrievedContext}</div>\n\nI hope this answers your question!`;
    }

    // 2. Default Keyword Responses
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello there! How can I assist you today? I'm a simulated AI with features like **Markdown**, *syntax highlighting*, and theme toggling.";
    }

    if (lowerInput.includes('code') || lowerInput.includes('python')) {
        return "Sure! Here is a simple Python function to calculate the Fibonacci sequence:\n\n```python\ndef fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    \n    sequence = [0, 1]\n    while len(sequence) < n:\n        next_val = sequence[-1] + sequence[-2]\n        sequence.append(next_val)\n        \n    return sequence\n\nprint(fibonacci(10))\n```\n\nNotice how the syntax highlighting works!";
    }

    if (lowerInput.includes('javascript') || lowerInput.includes('js')) {
        return "Here's a quick JavaScript example of an arrow function:\n\n```javascript\nconst greet = (name) => {\n  console.log(`Hello, ${name}!`);\n};\n\ngreet('World');\n```";
    }

    if (lowerInput.includes('markdown')) {
        return "I support various Markdown features:\n\n1. **Bold text**\n2. *Italic text*\n3. [Links](https://example.com)\n4. `Inline code`\n\n> Blockquotes are also supported nicely.\n\n### Headings work too!";
    }

    if (lowerInput.includes('features')) {
        return "Here are the 5 features built into this chat interface:\n\n1. 🌙 **Dark/Light Theme Toggle**\n2. 💾 **Persistent Chat History** (via localStorage)\n3. 📝 **Markdown & Code Highlighting**\n4. ⏳ **Simulated Typing Indicator**\n5. 🗑️ **Clear Conversation** functionality";
    }

    // Default response
    return `I received your message: "${escapeHTML(input)}". As a simulated AI, I'm providing a default response. Try asking me for "code", "python", "javascript", or "markdown"!`;
}

async function generateResponse(userText) {
    isGenerating = true;
    userInput.setAttribute('disabled', 'true');
    sendBtn.setAttribute('disabled', 'true');

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

    // Remove typing indicator
    typingIndicator.remove();

    // Get response text
    const fullResponseText = getSimulatedResponse(userText);

    // Simulate streaming text word by word
    const div = document.createElement('div');
    div.className = `flex gap-4 message-container message-bot`;

    div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-1">
            <i class="fa-solid fa-robot text-white text-sm"></i>
        </div>
        <div class="response-content bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] prose dark:prose-invert break-words overflow-x-auto min-h-[50px]">
            <span class="streaming-cursor"></span>
        </div>
    `;

    chatContainer.appendChild(div);
    const contentBox = div.querySelector('.response-content');

    // Stream simulation
    let currentText = "";
    // Break by chunks (characters or words to make it look like streaming)
    const chunkSize = 3;

    for (let i = 0; i < fullResponseText.length; i += chunkSize) {
        currentText += fullResponseText.substring(i, i + chunkSize);

        // Parse markdown progressively
        // Note: marked might break tags if parsed mid-way, for a robust solution you'd buffer complete blocks,
        // but for a simple simulation this works well enough.
        contentBox.innerHTML = marked.parse(currentText) + '<span class="streaming-cursor ml-1 inline-block w-2 h-4 bg-gray-500 animate-pulse"></span>';

        scrollToBottom();

        // Delay between chunks
        await new Promise(r => setTimeout(r, 10 + Math.random() * 30));
    }

    // Final render with syntax highlighting
    contentBox.innerHTML = marked.parse(fullResponseText);

    // Apply syntax highlighting
    contentBox.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Enable inputs
    isGenerating = false;
    userInput.removeAttribute('disabled');
    userInput.focus();

    // Save to history
    chatHistory.push({ role: 'bot', content: fullResponseText });
    saveChatHistory();
    scrollToBottom();
}

// Utility
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadChatHistory();
});
