// Mock localStorage
const mockStorage = new Map();
global.localStorage = {
    setItem: (key, val) => mockStorage.set(key, val),
    getItem: (key) => mockStorage.get(key)
};

// Create a large knowledge base
let knowledgeBase = [];
for (let i = 0; i < 20000; i++) {
    knowledgeBase.push("This is a fairly long sentence that represents a chunk of text from a document in the knowledge base. " + i);
}

let chatHistory = [];
for (let i = 0; i < 10; i++) {
    chatHistory.push({ role: 'user', content: 'hello ' + i });
}

// Current implementation
function saveChatHistoryUnoptimized() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
}

// Optimized implementation
function saveChatHistoryOptimized() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}
function saveKnowledgeBase() {
    localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
}

function runBenchmark(name, fn, iterations = 100) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = process.hrtime.bigint();
    const timeMs = Number(end - start) / 1e6;
    console.log(`${name}: ${timeMs.toFixed(2)} ms`);
    return timeMs;
}

console.log("Measuring 100 saves (e.g. standard chat session interaction)");
const unopt = runBenchmark('Unoptimized', saveChatHistoryUnoptimized);
const opt = runBenchmark('Optimized', saveChatHistoryOptimized);

console.log(`\nImprovement: ${((unopt - opt) / unopt * 100).toFixed(2)}% faster`);
