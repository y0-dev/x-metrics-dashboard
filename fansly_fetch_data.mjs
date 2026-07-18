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
        await driver.get('https://fansly.com/'+process.env.USERNAME+'/posts');

        // Wait until the result page is loaded
        await driver.wait(until.elementLocated(By.css('.profile-stats')));
        //await delay(2000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('.profile-stats'))));
        await driver.wait(until.elementIsEnabled(driver.findElement(By.css('.profile-stats'))));

        //Click Enter 18+
        var Enters = await driver.findElements(By.xpath('//div[@class="btn large solid-green flex-1"]'));
        if (Enters.length>0) Enters[0].click();

        //Click Cookie choice
        var Cookies = await driver.findElements(By.xpath('//div[@class="btn outline-dark-blue medium"]'));
        if (Cookies.length>0) Cookies[0].click();

        //const source = await driver.getPageSource();
        //if (source.includes('you are human'))
        //    throw new Error('Cloudflare: You are not human');
        //else throw new Error(source);

        try {
        const LikeCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[1]'));
        const LikeCountN = await LikeCount.getText();
        const FanCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[2]'));
        const FanCountN = await FanCount.getText();
        const PicCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[3]'));
        const PicCountN = await PicCount.getText();
        const VideoCount = await driver.findElement(By.xpath('(//div[@class="profile-stat"])[4]'));
        const VideoCountN = await VideoCount.getText();

        const Prices = await driver.findElements(By.xpath('//app-balance-display'));
        const PricesN = [];
        const TierNames = [];
        for (const Price of Prices) {
            const index = Prices.indexOf(Price);
            PricesN[index] = (await Price.getText()).match(/\d+.*\d*/)[0];
            const TierNameE = await driver.findElement(By.xpath('(//span[@class="eclipse margin-right-text"])['+(index+1)+']'));//TODO StaleElementReferenceError: stale element reference: stale element not found in the current frame
            TierNames[index] = await TierNameE.getText();
            console.log('subscription '+TierNames[index]+' at $'+PricesN[index]);
        }

        const DiscountN = PricesN[1];

        // Extract the metrics
        var metrics = {
            "followers_count": parseInt(FanCountN),
            "following_count": 0,
            "picture_count": parseInt(PicCountN),
            "video_count": parseInt(VideoCountN),
            "like_count": parseInt(LikeCountN),
            "price": parseFloat(PricesN[1]),
            "discount": parseFloat(DiscountN)
        };

        for (const PriceN of PricesN) {
            const index = PricesN.indexOf(PriceN);
            metrics['price_'+TierNames[index].replaceAll(' ', '-')] = parseFloat(PriceN);
        }

        // Write the metrics to the environment file
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);

        return FanCountN;
        } catch (e) {
            console.log(e);
            const filename = "test"
                .replace(/['"]+/g, '')
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            const encodedString = await driver.takeScreenshot();
            await fs.writeFileSync(`./screenshots/${filename}.png`, encodedString, 'base64');
            return '2';//throw new Error(e); doesn't save artifact
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
