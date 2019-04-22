'use strict'

const { Builder, By, Key, Capabilities, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const WHATSAPP_URL = "https://web.whatsapp.com/";
const NAME_PLACEHOLDER = 'NAME_OF_PERSON';
const CHAT_XPATH = `//*[@title='${NAME_PLACEHOLDER}']/../../../../../../..`;
const SIDE_PANEL_XPATH = '//div[@id="pane-side"]';
const SIDE_PANEL_LOCATOR = By.xpath(SIDE_PANEL_XPATH);
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

    async init(options={username: null, headless: false, noSandbox: false}) {
        let chromeOptions = new chrome.Options();
        if (options.hasOwnProperty("noSandbox") && options.noSandbox)
            chromeOptions.addArguments('--no-sandbox')
        if (options.hasOwnProperty("headless") && options.headless)
            chromeOptions.addArguments('--headless')
        if (options.hasOwnProperty("username") && options.username !== null)
            chromeOptions.addArguments(`user-data-dir=/home/${options.username}/.config/google-chrome/`);

        this.driver = await new Builder()
                            .withCapabilities(Capabilities.chrome())
                            .setChromeOptions(chromeOptions)
                            .build();

                            await this.driver.get(WHATSAPP_URL);
        await this._handleErrorOnLoad();
    }

    async openChatWith(name) {
        let chatLocator = By.xpath(CHAT_XPATH.replace(NAME_PLACEHOLDER, name));
        let chatElement = await this._getElement(chatLocator);
        await chatElement.click();
    }

    async typeMessage(message, send=false) {
        let messageBoxElement = await this._getElement(MESSAGEBOX_LOCATOR);
        await messageBoxElement.sendKeys(message);
        if (send) await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendTypedMessage() {
        let messageBoxElement = await this._getElement(MESSAGEBOX_LOCATOR);
        await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendMessageTo(name, message) {
        await this.openChatWith(name);
        await this.typeMessage(message, true);
    }

    async close() {
        await this.driver.quit();
    }

    async _getElement(locator) {
        await this._waitUntilLoaded(locator);
        return await this.driver.findElement(locator);
    }

    async _waitUntilLoaded(locator) {
        await this.driver.wait(until.elementLocated(locator), DEFAULT_TIMEOUT);
    }

    async _handleErrorOnLoad(){
        // Check if the Progress Bar is present.
        try {
            await this._waitUntilLoaded(LOADER_PROGRESS_LOCATOR);
        } catch (err) {
            return;
        }

        // If the progress bar is present, wait for it to dissappear.
        do {
            try {
                await this.driver.findElement(LOADER_PROGRESS_LOCATOR);
                console.debug("Whatsapp Web is still loading in the Browser.");
                continue;
            } catch (err) {
                // At this point, the progress disappeared.
                // Now, check if it disappeared because the page was loaded or the "Unreachable phone error happened"
                try {
                    // Search for the Dialog box saying "Trying to reach your phone"
                    await this._waitUntilLoaded(RETRY_DIALOG_BOX_LOCATOR)
                } catch (err) {
                    // If that dialog box is not found then page has loaded successfully, so return.
                    try {
                        await this._waitUntilLoaded(SIDE_PANEL_LOCATOR);
                        return;
                    } catch (err) {
                        throw "The chat window could not be found after loading. There is probably an error message."
                    }
                }
                // At this point, it means that Dialog box was found, hence the phone is offline and error is thrown.
                throw "Your phone is not reachable by whatsapp";
            }
        } while (true);

    }

}

module.exports = WhatsappBot;