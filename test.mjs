import { Builder, By, until } from 'selenium-webdriver';
import { assert } from 'chai';
import * as fs from 'fs';

describe('scrape', async function () {
    this.timeout(20000);
    let driver;

    const scrape = async () => {
        await driver.get('https://onlyfans.com/'+process.env.USERNAME);

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('*[data-icon-name="icon-back"]')));
        //await delay(2000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('*[data-icon-name="icon-back"]'))));

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        const PicCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[1]'));
        const PicCountN = await PicCount.getText();
        const VideoCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[2]'));
        const VideoCountN = await VideoCount.getText();
        const LikeCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[3]'));
        const LikeCountN = await LikeCount.getText();
        const FanCount = await driver.findElement(By.xpath('(//span[@class="b-profile__sections__count g-semibold"])[4]'));
        const FanCountN = await FanCount.getText();

        var Discount = await driver.findElements(By.xpath('//div[@class="m-rounded m-flex m-space-between m-lg g-btn"]//*[@class="b-btn-text__small"]'));
        var DiscountN = 0, PriceN = 0;
        if (!Discount.isEmpty()) {
            Discount = Discount[0];
            DiscountN = (await Discount.getText()).match(/\d+.\d+/)[0];
            const Price = await driver.findElement(By.xpath('(//span[@class="b-users__item__subscription-date__label"])[1]'));
            PriceN = (await Price.getText()).match(/\d+.\d+/)[0];
        } else {
            const Price = await driver.findElement(By.xpath('//div[@class="m-fluid-width m-rounded m-flex m-space-between m-lg g-btn"]//*[@class="b-btn-text__small"]'));
            PriceN = (await Price.getText()).match(/\d+.\d+/)[0];
            DiscountN = PriceN;
        }


        // Extract the metrics
        const metrics = {
            "followers_count": FanCountN,
            "following_count": 1,
            "picture_count": PicCountN,
            "video_count": VideoCountN,
            "like_count": LikeCountN,
            "price": PriceN,
            "discount": DiscountN
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
