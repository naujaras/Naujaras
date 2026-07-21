const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3001');
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));
    
    // check if it rendered the offer button correctly
    const btn = await page.$('#hub-offer-btn');
    if (btn) {
        console.log('Offer button found');
    } else {
        console.log('Offer button NOT found');
    }
    
    await browser.close();
})();
