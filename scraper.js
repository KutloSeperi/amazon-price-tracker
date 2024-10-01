const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://www.amazon.com');
    console.log("Navigated to Amazon");

    // Wait for the search bar to load and interact
    await page.waitForSelector('#twotabsearchtextbox');
    console.log("Search box loaded");

    // Type a search term (e.g., "laptop") and submit
    await page.type('#twotabsearchtextbox', 'laptop');
    console.log("Typed 'laptop' into the search box");
    await page.click('input[type="submit"]');
    console.log("Search submitted");
    await page.waitForNavigation();
    console.log("Navigated to search results");

    // Only scrape items from the first page
    await page.waitForSelector('.s-main-slot');
    console.log("Scraping page 1");

    const items = await page.evaluate(() => {
        const itemData = [];
        const itemElements = document.querySelectorAll('.s-main-slot .s-result-item');

        console.log(`Found ${itemElements.length} items on this page`); // Debugging: Check the number of items found

        itemElements.forEach(item => {
            const nameElement = item.querySelector('h2 .a-link-normal');
            const priceElement = item.querySelector('.a-price .a-offscreen') || 
                                 item.querySelector('.a-price-whole') || 
                                 item.querySelector('.a-price');

            const name = nameElement ? nameElement.innerText : 'No name';
            const price = priceElement ? priceElement.innerText : 'No price';

            // Debugging: Log each item's name and price
            console.log(`Item found - Name: ${name}, Price: ${price}`);

            itemData.push({ name, price });
        });

        return itemData;
    });

    console.log(`Total items scraped from page 1: ${items.length}`);
    
    // Collect all items found
    const allItems = items;

    console.log("Scraping complete. Collected items:");
    console.log(allItems); // Output the collected item data

    await browser.close();
})();
