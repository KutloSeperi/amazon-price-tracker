const schedule = require('node-schedule');
const puppeteer = require('puppeteer');

const scrapeAmazon = async () => {
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

    const allItems = [];

    for (let i = 0; i < 1; i++) {  // Change this to control how many pages to scrape
        await page.waitForSelector('.s-main-slot');
        console.log(`Scraping page ${i + 1}`);

        const items = await page.evaluate(() => {
            const itemData = [];
            const itemElements = document.querySelectorAll('.s-main-slot .s-result-item');

            itemElements.forEach(item => {
                const nameElement = item.querySelector('h2 .a-link-normal');
                const priceElement = item.querySelector('.a-price .a-offscreen') || 
                                     item.querySelector('.a-price-whole') || 
                                     item.querySelector('.a-price');

                const name = nameElement ? nameElement.innerText : 'No name';
                const price = priceElement ? priceElement.innerText : 'No price';

                itemData.push({ name, price });
            });

            return itemData;
        });

        console.log(`Total items scraped from page ${i + 1}: ${items.length}`);
        allItems.push(...items);
    }

    console.log("Scraping complete. Collected items:");
    console.log(allItems); // Output the collected item data

    await browser.close();
};

// Schedule a job to run every minute for testing purposes
const job = schedule.scheduleJob('* * * * *', async () => {
    console.log('Scheduled job is running at:', new Date().toLocaleString());
    await scrapeAmazon(); // Call the scraping function
});

console.log('Scheduled job created. It will run every minute.');
