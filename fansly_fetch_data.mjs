import { Builder, By, until } from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('scrape', async function () {
    this.timeout(20000);
    let driver;

    const scrape = async () => {
        await driver.get('https://fansly.com/'+process.env.USERNAME);

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('.profile-stats')));
        //await delay(2000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('.profile-stats'))));
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('.profile-stats'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        //const PicCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[1]'));
        //const PicCountN = await PicCount.getText();
        const VideoCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[3]'));
        const VideoCountN = await VideoCount.getText();
        const LikeCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[1]'));
        const LikeCountN = await LikeCount.getText();
        const FanCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[2]'));
        const FanCountN = await FanCount.getText();

        const Price = await driver.findElement(By.xpath('(//app-balance-display)'));
        const PriceN = (await Price.getText()).match(/\d+.\d+/)[0];
        const DiscountN = PriceN;

        // Extract the metrics
        const metrics = {
            "followers_count": parseInt(FanCountN),
            "following_count": 0,
            "picture_count": parseInt(PicCountN),
            "video_count": parseInt(VideoCountN),
            "like_count": parseInt(LikeCountN),
            "price": parseFloat(PriceN),
            "discount": parseFloat(DiscountN)
        };

        // Write the metrics to the environment file
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);

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
