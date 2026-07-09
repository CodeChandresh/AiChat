const fs = require('fs');

// Read script.js content
const scriptContent = fs.readFileSync('script.js', 'utf8');

// Set up minimal global environment
global.document = {
    getElementById: () => ({ addEventListener: () => {} }),
    addEventListener: () => {}
};
global.window = {
    matchMedia: () => ({ matches: false })
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
global.marked = {
    setOptions: () => {},
    parse: (text) => text
};
global.hljs = {
    highlightElement: () => {},
    getLanguage: () => false,
    highlight: () => ({ value: '' })
};

// Execute script.js within this context
eval(scriptContent);

// Test inputs
const testInputs = ['hello', 'python', 'javascript', 'markdown', 'features', 'unknown'];

console.log('Testing getSimulatedResponse:');
let allPassed = true;

testInputs.forEach(input => {
    const response = getSimulatedResponse(input);
    if (response) {
         console.log(`[PASS] Input: "${input}" returned a response.`);
    } else {
         console.log(`[FAIL] Input: "${input}" returned nothing.`);
         allPassed = false;
    }
});

if (allPassed) {
    console.log('All tests passed successfully!');
} else {
    console.log('Some tests failed.');
    process.exit(1);
}
