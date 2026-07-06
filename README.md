# AI Chatbot

A simple, simulated AI chatbot interface built with vanilla HTML, CSS, and JavaScript. It does not require a build step or bundler.

## Features

1. **Dark/Light Theme Toggle:** Switch between a dark and light theme, taking system preferences into account.
2. **Chat History Persistence:** Conversations are saved locally and persist between page reloads using `localStorage`.
3. **Markdown & Code Highlighting:** Bot messages support markdown parsing and syntax highlighting for code blocks.
4. **Simulated Typing Indicator:** Bot responses simulate a natural typing speed with a typing indicator.
5. **Clear Conversation:** Easily wipe your conversation history and start fresh.

## Setup

1. Open `index.html` in your browser.
2. Or, serve locally with Python:

```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

## Libraries Used

* [TailwindCSS](https://tailwindcss.com/) (via CDN)
* [Marked.js](https://marked.js.org/) (Markdown parsing)
* [Highlight.js](https://highlightjs.org/) (Syntax highlighting)
* [FontAwesome](https://fontawesome.com/) (Icons)
