const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Set a timeout to make sure we wait long enough
    await page.goto(`file://${__dirname}/benchmark.html`, { waitUntil: 'networkidle0' });

    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
}

run().catch(console.error);
