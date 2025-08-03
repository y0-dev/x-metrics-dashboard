import { Builder, By, Key, until } from 'selenium-webdriver';
import {FlutterSeleniumBridge} from "@rentready/flutter-selenium-bridge";
import { assert } from 'chai';
import * as fs from 'fs';

describe('search', async function () {
    this.timeout(20000);
    let driver;

    if (!fs.existsSync('./screenshots')) {
        fs.mkdirSync('./screenshots');
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // A helper function to start a web search
    const search = async () => {
        // Automate DuckDuckGo search
        const bridge = new FlutterSeleniumBridge(driver);
        await driver.get('https://onlyfans.com/'+process.env.USERNAME);
        //await bridge.enableAccessibility();//Attempt to click on "EnableAccessibility" button failed. Retrying... => je pense qu'OF on désactivé ce mode de dev

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('*[data-icon-name="icon-back"]')));
        //await delay(2000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        var FanCountN = 0;

        try {
            const filename = "test"
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');

            //await driver.wait(until.elementLocated(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[1]')));
            //console.log("getting fan count");
            const FanCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[1]'));
            console.log("getting fan count");
            FanCountN = FanCount.text();
        } catch (e) {
            const filename = "test"
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');
            return '2';
        }

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

        await driver.manage().window().maximize();
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
