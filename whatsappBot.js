'use strict'

const { Builder, By, Key, Capabilities, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const WHATSAPP_URL = "https://web.whatsapp.com/";
const NAME_PLACEHOLDER = 'NAME_OF_PERSON';
const CHAT_XPATH = `//*[@title='${NAME_PLACEHOLDER}']/../../../../../../..`;
const MESSAGEBOX_XPATH = "//*[contains(@class,'selectable-text') and contains(@class,'copyable-text') and contains(@class,'_2S1VP')]"
const MESSAGEBOX_LOCATOR = By.xpath(MESSAGEBOX_XPATH);
const DEFAULT_TIMEOUT = 2 * 1000;

// Error Handling Constants
const LOADER_PROGRESS_XPATH = "//progress[@dir='ltr']";
const LOADER_PROGRESS_LOCATOR = By.xpath(LOADER_PROGRESS_XPATH);
const RETRY_DIALOG_BOX_XPATH = "//div[contains(text(), 'Trying to reach phone')]";
const RETRY_DIALOG_BOX_LOCATOR = By.xpath(RETRY_DIALOG_BOX_XPATH);

class WhatsappBot {

    constructor() {
    }

    async init(username = null) {
        let chromeOptions = new chrome.Options();
        if (username !== null) chromeOptions.addArguments(`user-data-dir=/home/${username}/.config/google-chrome/`);
        this.driver = await new Builder().withCapabilities(Capabilities.chrome()).setChromeOptions(chromeOptions).build();
        await this.driver.get(WHATSAPP_URL);
        await this._handleErrorOnLoad();
    }

    async openChatWith(name) {
        let chatLocator = By.xpath(CHAT_XPATH.replace(NAME_PLACEHOLDER, name));
        let chatElement = await this._getElement(chatLocator);
        await chatElement.click();
    }

    async typeMessage(message, send = false) {
        let messageBoxElement = await this._getElement(MESSAGEBOX_LOCATOR);
        await messageBoxElement.sendKeys(message);
        if (send) await message.sendKeys(Key.ENTER);
    }

    async sendTypedMessage() {
        let messageBoxElement = await this._getElement(MESSAGEBOX_LOCATOR);
        await messageBoxElement.sendKeys(Key.ENTER);
    }

    async close() {
        await this.driver.quit();
    }

    async _getElement(locator) {
        await this.driver.wait(until.elementLocated(locator), DEFAULT_TIMEOUT);
        return await this.driver.findElement(locator);
    }

    async _handleErrorOnLoad(){
        try {
            await this.driver.wait(until.elementLocated(LOADER_PROGRESS_LOCATOR), DEFAULT_TIMEOUT);
        } catch (err) {
            return;
        }

        do {
            try {
                await this.driver.findElement(LOADER_PROGRESS_LOCATOR);
                console.log("Whatsapp Web is still loading in the Browser.");
                continue;
            } catch (err) {
                try {
                    await this.driver.wait(until.elementLocated(RETRY_DIALOG_BOX_LOCATOR), DEFAULT_TIMEOUT);
                } catch (err) {
                    return;    
                }
                throw "Your phone is not reachable by whatsapp";
            }
        } while (true);

    }

}

module.exports = WhatsappBot;