const { By, until } = require('selenium-webdriver');

const DEFAULT_TIMEOUT = 5 * 1000; // 5 seconds

class Driver {

    constructor(webdriver) {
        this.driver = webdriver;
    }

    parseXpath(xpath) {
        return By.xpath(xpath);
    }

    async get(url) {
        await this.driver.get(url);
    }

    async getElement(xpath) {
        let locator = this.parseXpath(xpath);
        await this.waitToLocate(locator);
        return await this.driver.findElement(locator);
    }

    async waitToLocate(locator, timeout = DEFAULT_TIMEOUT) {
        const condition = until.elementLocated(locator);
        await this.driver.wait(async driver => condition.fn(driver), timeout);
    }
}

module.exports.Driver = Driver;