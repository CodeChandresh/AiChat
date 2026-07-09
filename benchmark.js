const fs = require('fs');

// Mocking localStorage
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
}

global.localStorage = new LocalStorageMock();

let chatHistory = [];
let knowledgeBase = [];

for (let i = 0; i < 10000; i++) {
    knowledgeBase.push("This is a chunk of text from the knowledge base. It contains some words to simulate real content. ".repeat(10));
}

function saveChatHistoryOriginal() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
}

function saveChatHistoryOptimized() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function runBenchmark() {
    console.log("Warming up...");
    for (let i = 0; i < 10; i++) saveChatHistoryOriginal();

    console.log("Benchmarking original...");
    let startOriginal = performance.now();
    for (let i = 0; i < 100; i++) {
        saveChatHistoryOriginal();
    }
    let endOriginal = performance.now();
    let timeOriginal = endOriginal - startOriginal;
    console.log(`Original time for 100 iterations: ${timeOriginal.toFixed(2)} ms`);

    console.log("Warming up optimized...");
    for (let i = 0; i < 10; i++) saveChatHistoryOptimized();

    console.log("Benchmarking optimized...");
    let startOptimized = performance.now();
    for (let i = 0; i < 100; i++) {
        saveChatHistoryOptimized();
    }
    let endOptimized = performance.now();
    let timeOptimized = endOptimized - startOptimized;
    console.log(`Optimized time for 100 iterations: ${timeOptimized.toFixed(2)} ms`);

    let improvement = ((timeOriginal - timeOptimized) / timeOriginal) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

runBenchmark();
