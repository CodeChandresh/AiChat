const puppeteer = require('puppeteer');

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // We will inject the HTML directly
    await page.goto(`file://${__dirname}/benchmark.html`);

    // The benchmark runs on load, wait for console.log
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await new Promise(r => setTimeout(r, 5000));

    await browser.close();
}

run();
