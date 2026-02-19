import { Builder, By, until } from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('scrape', async function () {
    this.timeout(20000);
    let driver;

    if (!fs.existsSync('./screenshots')) {
        fs.mkdirSync('./screenshots');
    }

    const scrape = async () => {
        await driver.get('https://www.instagram.com/'+process.env.USERNAME+'/');//TODO number of followers are not real when not logged in

        var filename = "test"
            .replace(/['"]+/g, '')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
        var encodedString = await driver.takeScreenshot();
        await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.xpath('//span[contains(., "followers")]')));
        await delay(2000);
        //await driver.wait(until.elementIsVisible(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));
        //await driver.wait(until.elementIsEnabled(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);
         filename = "test"
            .replace(/['"]+/g, '')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
         encodedString = await driver.takeScreenshot();
        await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');

        const FollowerCount = await driver.findElement(By.xpath('//span[contains(., "followers")]'));
        const FollowerCountN = (await FollowerCount.getText()).match(/\d+.\d+/)[0];

        const FollowingCount = await driver.findElement(By.xpath('//span[contains(., "following")]'));
        const FollowingCountN = (await FollowingCount.getText()).match(/\d+.\d+/)[0];

        const PostCount = await driver.findElement(By.xpath('//span[contains(., "posts")]'));
        const PostCountN = (await PostCount.getText()).match(/\d+.\d+/)[0];

        // Extract the metrics
        const metrics = {
            "followers_count": parseInt(FollowerCountN),
            "following_count": parseInt(FollowingCountN),
            "posts_count": parseInt(PostCountN)
        };

        // Write the metrics to the environment file
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);

        return FollowerCountN;
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
            // Close the browser
            await driver.quit();
        }
    });

    // Our test definitions
    it('scrape', async function () {
        const content = await scrape();
        assert.isNotEmpty(content);
    });
});
