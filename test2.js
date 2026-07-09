const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    // Send a message with standard markdown
    const payload = 'markdown features please';
    await page.type('#userInput', payload);
    await page.click('#sendBtn');

    // Wait for response
    await page.waitForFunction(() => !document.querySelector('#userInput').disabled);

    // Read the rendered HTML
    const html = await page.evaluate(() => {
        const msgs = document.querySelectorAll('.message-bot .prose');
        return msgs[msgs.length - 1].innerHTML;
    });

    if (html.includes('<strong>Bold text</strong>') && html.includes('<em>Italic text</em>')) {
         console.log('SUCCESS: Standard markdown works properly.');
    } else {
         console.error('FAIL: Standard markdown was stripped.');
         console.error('Got:', html);
         process.exit(1);
    }

    await browser.close();
})();
