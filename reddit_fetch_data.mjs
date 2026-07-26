import {Builder, By, Key, until} from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('scrape', async function () {
    this.timeout(20000);
    let driver;

    if (!fs.existsSync('./screenshots')) {
        fs.mkdirSync('./screenshots');
    }

    const scrape = async () => {
        await driver.get('https://www.reddit.com/user/'+process.env.USERNAME+'/');

        // Wait until the result page is loaded
        try {
            const Blockeds = await driver.findElements(By.xpath('//*[contains(., "blocked by network security")]'));
            if (Blockeds.length>0) {
                console.log('blocked by network security');
                const LogIn = await driver.findElement(By.xpath('//a[contains(., "Log in")]'));
                LogIn.click();
                console.log('login in');
                await driver.wait(until.elementLocated(By.id('login-username')), 2000);

                const Username = await driver.findElement(By.id('login-username'));
                await Username.sendKeys(process.env.USERNAME+'_bot');
                const Password = await driver.findElement(By.id('login-password'));
                await Password.sendKeys(process.env.PASSWORD);
                await Password.sendKeys(Key.ENTER);
                console.log('logged in');
            }

        const loaded = await driver.wait(until.elementLocated(By.xpath('//div[@data-testid="profile-followers-widget"]')), 2000);

        const FollowerCount = await driver.findElement(By.xpath('//div[@data-testid="profile-followers-widget"]'));
        const FollowerCountN = (await FollowerCount.getText()).match(/\d+.\d+/)[0];

        const PostCount = await driver.findElement(By.xpath('//activate-feature[contains(@name, "ProfileContributionsModal_")]/p[1]'));
        const PostCountN = (await PostCount.getText()).match(/\d+.\d+/)[0];

        // Extract the metrics
        const metrics = {
            "subscribers": parseInt(FollowerCountN),
            "posts_count": parseInt(PostCountN)
        };

        // Write the metrics to the environment file
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);

        return FollowerCountN;
        } catch (e) {
            console.log(e);
            const filename = "test"
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');
            return 2;
        }
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
