const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Set up a flag to catch XSS
    let xssTriggered = false;
    page.on('dialog', async dialog => {
        if (dialog.message() === 'XSS') {
            xssTriggered = true;
        }
        await dialog.dismiss();
    });

    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    // Send a message with an XSS payload
    const payload = 'Hello <img src="x" onerror="alert(\'XSS\')">';
    await page.type('#userInput', payload);
    await page.click('#sendBtn');

    // Wait for response
    await page.waitForFunction(() => !document.querySelector('#userInput').disabled);

    if (xssTriggered) {
        console.error('FAIL: XSS vulnerability is still present.');
        process.exit(1);
    } else {
        console.log('SUCCESS: XSS vulnerability mitigated.');
    }

    await browser.close();
})();
