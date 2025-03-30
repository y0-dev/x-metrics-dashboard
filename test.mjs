import { Builder, By, Key, until } from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('search', async function () {
    this.timeout(10000);
    let driver;

    /*if (!fs.existsSync('./screenshots')) {
        fs.mkdirSync('./screenshots');
    }*/

    // A helper function to start a web search
    const search = async () => {
        // Automate DuckDuckGo search
        await driver.get('https://onlyfans.com/');

        // Wait until the result page is loaded
        await driver.wait(until.elementIsVisible(driver.findElement(By.id('input-14'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        const emailBox = await driver.findElement(By.id('input-14'));
        const passwordBox = await driver.findElement(By.id('input-17'));
        await emailBox.sendKeys(process.env.EMAIL);
        await passwordBox.sendKeys(process.env.PASSWORD, Key.ENTER);

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('.g-avatar__img-wrapper')));
		
		const Avatar = await driver.findElement(By.css('.g-avatar__img-wrapper'));
		Avatar.click();
		const FanCount = await driver.findElement(By.css('.l-sidebar__user-data__item__count'));
		const FanCountN = FanCount.text();

        // Return page content
        return FanCountN;
    };

    // Make sure the BROWSER env variable is set
    before(async function () {
        if (!process.env.BROWSER) {
            throw new Error('No BROWSER environment variable set')
        }
    });

    // Before each test, initialize Selenium and launch the browser
    beforeEach(async function () {
        // Microsoft uses a longer name for Edge
        let browser = process.env.BROWSER;
        if (browser == 'edge') {
            browser = 'MicrosoftEdge';
        }

        // Connect to service specified in env variable or default to 'selenium'
        const host = process.env.SELENIUM || 'selenium';
        const server = `http://${host}:4444`;
        driver = await new Builder()
            .usingServer(server)
            .forBrowser(browser)
            .build();
    });

    // After each test, take a screenshot and close the browser
    afterEach(async function () {
        if (driver) {
            // Take a screenshot of the result page
            /*const filename = this.currentTest.fullTitle()
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();;
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`,
                encodedString, 'base64');*/

            // Close the browser
            await driver.quit();
        }
    });

    // Our test definitions
    it('should search for "2"', async function () {
        const content = await search();
        assert.isTrue(content.includes('2'));
    });
});
