import {By, until} from 'selenium-webdriver';

export default class Driver {

    constructor(webdriver) {
        this.driver = webdriver;
    }

    parseXpath(xpath, isLocator = false) {
        return isLocator ? xpath : By.xpath(xpath);
    }

    async get(url) {
        await this.driver.get(url);
    }

    async getElement(xpath) {
        await this.waitUntilLoaded(xpath);
        let locator = this.parseXpath(xpath);
        return await this.driver.findElement(locator);
    }

    async waitUntilLoaded(xpath, timeout = DEFAULT_TIMEOUT) {
        let locator = this.parseXpath(xpath);
        await this.driver.wait(until.elementLocated(locator), timeout);
    }

    async takeScreenshot() {
        return await this.driver.takeScreenshot();
    }

    async close() {
        await this.driver.quit();
    }
}