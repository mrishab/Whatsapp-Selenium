'use strict'

const { Key } = require('selenium-webdriver');

const { NAME_PLACEHOLDER } = require('./xpathConstants');
const { xpath } = require('./xpathConstants');

const WHATSAPP_URL = "https://web.whatsapp.com/";
const DEFAULT_TIMEOUT = 5 * 1000; // 5 seconds

class Whatsapp {

    constructor(driver) {
        this.driver = driver;
    }

    async init() {
        await this.driver.get(WHATSAPP_URL);
        await this._waitToLoad();
    }

    async openChatWith(name) {
        const chatXPath = xpath.CHAT.replace(NAME_PLACEHOLDER, name)

        let chatElement;
        try {
            chatElement = await this.driver.getElement(chatXPath);

        } catch (e) {
            console.log(`${name} was not found. Attempting a search`);

            await this.searchContact(name);
            chatElement = await this.driver.getElement(chatXPath);
        }

        await chatElement.click();
    }

    async searchContact(name) {
        const newChatButtonElement = await this.driver.getElement(xpath.NEW_CHAT_BUTTON);
        await newChatButtonElement.click();

        const searchContactInputField = await this.driver.getElement(xpath.CONTACT_SEARCH_INPUT);
        await searchContactInputField.sendKeys(name);
    }

    async typeMessage(message, send = false) {
        const messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        await messageBoxElement.sendKeys(message);

        if (send) await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendTypedMessage() {
        const messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendMessageTo(name, message) {
        await this.openChatWith(name);
        await this.typeMessage(message, true);
    }

    async paste() {
        const keys = Key.chord(Key.CONTROL, "v");

        const messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        await messageBoxElement.sendKeys(keys);
    }

    async clickAttachmentMenu() {
        const attachmentMenuButton = await this.driver.getElement(xpath.ATTACHMENT_MENU);
        await attachmentMenuButton.click();
    }

    async sendImage(imagePath, description) {
        // opening Menu
        await this.clickAttachmentMenu();

        const galleryButton = await this.driver.getElement(xpath.GALLERY_BUTTON);
        await galleryButton.sendKeys(imagePath);

        const captionTextBox = await this.driver.getElement(xpath.IMAGE_CAPTION_INPUT);

        if (description) {
            await captionTextBox.sendKeys(description);
        }

        await captionTextBox.sendKeys(Key.ENTER);
        await this.lastMessageSent();

        console.log("Image sent succesfully");
    }

    async sendImageTo(name, imagePath, description) {
        await this.openChatWith(name);
        await this.sendImage(imagePath, description);
    }

    async lastMessageSent() {
        try {
            await this.pause(2000);
            await this.driver.waitToLocate(xpath.LAST_MESSAGE_DOUBLE_TICK, DEFAULT_TIMEOUT * 2);

        } catch (err) {
            throw `Message could not be sent because: ${err}`;
        }
    }

    async pause(timeout = DEFAULT_TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, timeout));
    }

    async _waitToLoad() {
        // Check if the Progress Bar is present.
        try {
            await this.driver.waitToLocate(xpath.LOADER_PROGRESS);
        } catch (err) {
            return new Promise((res) => { res() });
        }

        // If the progress bar is present, wait for it to dissappear.
        do {
            try {
                await this.driver.getElement(xpath.LOADER_PROGRESS);
                console.debug("Whatsapp Web is still loading in the Browser.");

                continue;
            } catch (err) {
                // At this point, the progress disappeared.
                // Now, check if it disappeared because the page was loaded or the "Unreachable phone error happened"
                try {
                    // Search for the Dialog box saying "Trying to reach your phone"
                    const retryLocator = this.driver.parseXpath(xpath.RETRY_DIALOG_BOX);
                    await this.driver.waitToLocate(retryLocator)

                } catch (err) {
                    // If that dialog box is not found then page has loaded successfully, so return.
                    try {
                        const panelLocator = this.driver.parseXpath(xpath.SIDE_PANEL);
                        await this.driver.waitToLocate(panelLocator);

                        return new Promise((res) => { res() });

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

module.exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
module.exports.WHATSAPP_URL = WHATSAPP_URL;
module.exports.Whatsapp = Whatsapp