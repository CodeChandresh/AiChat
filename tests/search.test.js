const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

test('searchKnowledgeBase function tests', async (t) => {
    // Load script.js
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf8');

    // Create a mock DOM environment
    const mockElement = {
        addEventListener: () => {},
        style: {},
        classList: { replace: () => {}, add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {},
        removeAttribute: () => {},
        appendChild: () => {},
        querySelectorAll: () => [],
        remove: () => {}
    };

    const context = {
        document: {
            getElementById: () => mockElement,
            documentElement: mockElement,
            addEventListener: () => {},
            createElement: () => mockElement
        },
        window: {
            matchMedia: () => ({ matches: false })
        },
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        },
        marked: { setOptions: () => {}, parse: str => str },
        hljs: { getLanguage: () => false, highlight: () => ({ value: '' }), highlightElement: () => {} },
        console: { log: () => {}, error: () => {} },
        setTimeout: setTimeout,
        Promise: Promise,
        Math: Math
    };

    vm.createContext(context);
    vm.runInContext(scriptCode, context);

    // Helper to evaluate searchKnowledgeBase
    const runSearch = (query) => {
        return vm.runInContext(`searchKnowledgeBase(${JSON.stringify(query)})`, context);
    };

    // Helper to set knowledgeBase by executing code in the VM
    const setKB = (kb) => {
        vm.runInContext(`knowledgeBase = ${JSON.stringify(kb)};`, context);
    };

    await t.test('returns null when knowledgeBase is empty', () => {
        setKB([]);
        assert.strictEqual(runSearch("test query"), null);
    });

    await t.test('returns null when query is empty', () => {
        setKB(["some data"]);
        assert.strictEqual(runSearch(""), null);
    });

    await t.test('returns null when query words are too short (<= 2 chars)', () => {
        setKB(["some data"]);
        assert.strictEqual(runSearch("a is to"), null);
    });

    await t.test('returns null when no matching words found', () => {
        setKB([
            "apples and oranges",
            "bananas and grapes"
        ]);
        assert.strictEqual(runSearch("strawberries"), null);
    });

    await t.test('returns matching chunk on single word match', () => {
        setKB([
            "apples and oranges",
            "bananas and grapes"
        ]);
        assert.strictEqual(runSearch("apples"), "apples and oranges");
    });

    await t.test('returns chunk with highest score on multiple matches', () => {
        setKB([
            "I like artificial intelligence",
            "artificial intelligence is transforming technology, especially artificial intelligence and machine learning",
            "technology is cool"
        ]);
        assert.strictEqual(
            runSearch("artificial intelligence technology"),
            "artificial intelligence is transforming technology, especially artificial intelligence and machine learning"
        );
    });

    await t.test('case insensitive matching', () => {
        setKB([
            "Artificial Intelligence is great."
        ]);
        assert.strictEqual(runSearch("ARTIFICIAL INTELLIGENCE"), "Artificial Intelligence is great.");

        setKB([
            "ARTIFICIAL INTELLIGENCE is great."
        ]);
        assert.strictEqual(runSearch("artificial intelligence"), "ARTIFICIAL INTELLIGENCE is great.");
    });

    await t.test('handles extra whitespaces in query', () => {
        setKB([
            "the quick brown fox"
        ]);
        assert.strictEqual(runSearch("   quick     brown   "), "the quick brown fox");
    });
});
