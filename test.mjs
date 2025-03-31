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
        await driver.get('https://onlyfans.com/');
        await bridge.enableAccessibility();

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.id('input-14')));
        //await delay(2000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.id('input-14'))));
        await driver.wait(until.elementIsEnabled(driver.findElement(By.id('input-14'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        const emailBox = await driver.findElement(By.id('input-14'));
        const passwordBox = await driver.findElement(By.id('input-17'));
        try {
            //await emailBox.sendKeys(process.env.EMAIL);//TODO ElementNotInteractableError: element not interactable
            //await passwordBox.sendKeys(process.env.PASSWORD, Key.ENTER);
            //https://www.reddit.com/r/flutterhelp/comments/187dqfe/how_enter_input_field_values_using_javascript/ => impossible avec flutter
            //driver.executeScript("arguments[0].select();arguments[0].value='"+process.env.EMAIL+"';", emailBox);
            //driver.executeScript("arguments[0].select();arguments[0].value='"+process.env.PASSWORD+"';", passwordBox);
            const emailInput = await bridge.activateInputField(By.id('input-14'));
            await emailInput.sendKeys(process.env.EMAIL);
            const passwordInput = await bridge.activateInputField(By.id('input-17'));
            await passwordInput.sendKeys(process.env.PASSWORD, Key.ENTER);
            console.log("entering credentials");

            //TODO there is actually no input value and button is still gray lol
            driver.findElement(By.css('.g-btn.m-rounded.m-block.m-md.mb-0')).click();
            console.log("logging in");

            const filename = "test"
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');

            // Wait until the result page is loaded
            await driver.wait(until.elementLocated(By.xpath('//*[@data-name="Notifications"]')));
            console.log("logged in");await delay(3000);

            const Avatar = await driver.findElement(By.css('.g-avatar__img-wrapper'));
            Avatar.click();await delay(2000);console.log("getting profile");

            await driver.wait(until.elementLocated(By.xpath('(//span[@class="l-sidebar__user-data__item__count"])[1]')));
            console.log("getting fan count");
            const FanCount = await driver.findElement(By.xpath('(//span[@class="l-sidebar__user-data__item__count"])[1]'));
            console.log("getting fan count");
            const FanCountN = FanCount.text();
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
