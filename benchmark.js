const fs = require('fs');

const knowledgeBaseStrings = Array.from({ length: 10000 }, (_, i) => `This is some knowledge base chunk number ${i}. It has some random words like apple, banana, cherry, and artificial intelligence.`);

function searchBaseline(knowledgeBase, query) {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const scoredChunks = knowledgeBase.map(chunk => {
            const lowerChunk = chunk.toLowerCase();
            let score = 0;
            queryWords.forEach(word => {
                if (lowerChunk.includes(word)) score++;
            });
            return { chunk, score };
        });
    }
    const end = performance.now();
    return end - start;
}

const knowledgeBaseObjects = knowledgeBaseStrings.map(chunk => ({ chunk, lowerChunk: chunk.toLowerCase() }));

function searchOptimized(knowledgeBase, query) {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const scoredChunks = knowledgeBase.map(item => {
            const lowerChunk = item.lowerChunk;
            let score = 0;
            queryWords.forEach(word => {
                if (lowerChunk.includes(word)) score++;
            });
            return { chunk: item.chunk, score };
        });
    }
    const end = performance.now();
    return end - start;
}

const query = "apple artificial intelligence something else";

// Warmup
searchBaseline(knowledgeBaseStrings, query);
searchOptimized(knowledgeBaseObjects, query);

const baselineTime = searchBaseline(knowledgeBaseStrings, query);
const optimizedTime = searchOptimized(knowledgeBaseObjects, query);

console.log(`Baseline time: ${baselineTime.toFixed(2)} ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
