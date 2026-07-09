const fs = require('fs');
const path = require('path');

// Mock global dependencies
global.marked = {
    setOptions: jest.fn(),
    parse: jest.fn(text => `<p>${text}</p>`)
};
global.hljs = {
    getLanguage: jest.fn(),
    highlight: jest.fn(),
    highlightElement: jest.fn()
};

// Set up DOM
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
document.body.innerHTML = html;

// Load script
const scriptContent = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');

const runScript = new Function(`
    ${scriptContent}
    return {
        processDocument,
        getKnowledgeBase: () => knowledgeBase,
        setKnowledgeBase: (v) => { knowledgeBase = v; },
        getChatHistory: () => chatHistory,
        setChatHistory: (v) => { chatHistory = v; }
    };
`);

const api = runScript();

describe('processDocument', () => {
    beforeEach(() => {
        // Reset state
        api.setKnowledgeBase([]);
        api.setChatHistory([]);
        document.getElementById('chatContainer').innerHTML = '';
        localStorage.clear();
    });

    test('splits text into chunks by double newlines', () => {
        api.processDocument("Chunk 1\n\nChunk 2", "test.txt");
        expect(api.getKnowledgeBase()).toEqual(["Chunk 1", "Chunk 2"]);
    });

    test('handles empty text', () => {
        api.processDocument("", "test.txt");
        expect(api.getKnowledgeBase()).toEqual([]);
    });

    test('handles text with only whitespace', () => {
        api.processDocument("   \n  \n  ", "test.txt");
        expect(api.getKnowledgeBase()).toEqual([]);
    });

    test('filters out empty chunks', () => {
        api.processDocument("Chunk 1\n\n\n\nChunk 2", "test.txt");
        expect(api.getKnowledgeBase()).toEqual(["Chunk 1", "Chunk 2"]);
    });

    test('trims whitespace from chunks', () => {
        api.processDocument("  Chunk 1  \n\n  Chunk 2  ", "test.txt");
        expect(api.getKnowledgeBase()).toEqual(["Chunk 1", "Chunk 2"]);
    });

    test('handles windows style CRLF newlines', () => {
        api.processDocument("Chunk 1\r\n\r\nChunk 2", "test.txt");
        expect(api.getKnowledgeBase()).toEqual(["Chunk 1", "Chunk 2"]);
    });

    test('handles multiple spaces between newlines', () => {
        api.processDocument("Chunk 1\n   \nChunk 2", "test.txt");
        expect(api.getKnowledgeBase()).toEqual(["Chunk 1", "Chunk 2"]);
    });

    test('appends a bot message and saves chat history', () => {
        api.processDocument("Some text", "test.txt");

        const chatHistory = api.getChatHistory();
        // Chat history should contain the system message
        expect(chatHistory.length).toBe(1);
        expect(chatHistory[0].role).toBe('bot');
        expect(chatHistory[0].content).toMatch(/\*System:\* Uploaded \`test\.txt\` successfully/);

        // DOM should be updated
        const chatContainer = document.getElementById('chatContainer');
        expect(chatContainer.innerHTML).toContain('test.txt');

        // check localStorage
        expect(JSON.parse(localStorage.getItem('chatHistory'))[0].content).toMatch(/test\.txt/);
    });
});
