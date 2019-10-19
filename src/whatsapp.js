'use strict'

import { Key } from 'selenium-webdriver';

import xpath from './xpathConstants';
import Driver from './driver';

const WHATSAPP_URL = "https://web.whatsapp.com/";
const DEFAULT_TIMEOUT = 5 * 1000;

export default class Whatsapp {

    constructor(webdriver) {
        this.driver = new Driver(webdriver);
    }

    async init() {
        await this.driver.get(WHATSAPP_URL);
        await this._waitToLoad();
    }

    async openChatWith(name) {
        let chatXPath = xpath.CHAT.replace(xpath.NAME_PLACEHOLDER, name)
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
        let newChatButtonElement = await this.driver.getElement(xpath.NEW_CHAT_BUTTON);
        await newChatButtonElement.click();
        let searchContactInputField = await this.driver.getElement(xpath.CONTACT_SEARCH_INPUT);
        await searchContactInputField.sendKeys(name);
    }

    async typeMessage(message, send = false) {
        let messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        await messageBoxElement.sendKeys(message);
        if (send) await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendTypedMessage() {
        let messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        await messageBoxElement.sendKeys(Key.ENTER);
    }

    async sendMessageTo(name, message) {
        await this.openChatWith(name);
        await this.typeMessage(message, true);
    }

    async paste() {
        let messageBoxElement = await this.driver.getElement(xpath.MESSAGEBOX);
        let keys = Key.chord(Key.CONTROL, "v");
        await messageBoxElement.sendKeys(keys);
    }

    async clickAttachmentMenu() {
        let attachmentMenuButton = await this.driver.getElement(xpath.ATTACHMENT_MENU);
        await attachmentMenuButton.click();
    }

    async sendImage(imagePath, description) {
        // opening Menu
        await this.clickAttachmentMenu();
        let galleryButton = await this.driver.getElement(xpath.GALLERY_BUTTON);
        await galleryButton.sendKeys(imagePath);
        let captionTextBox = await this.driver.getElement(xpath.IMAGE_CAPTION_INPUT);
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
            await this.driver.waitUntilLoaded(xpath.LAST_MESSAGE_DOUBLE_TICK, 10000);
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
            await this.driver.waitUntilLoaded(xpath.LOADER_PROGRESS);
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
                    await this.driver.waitUntilLoaded(xpath.RETRY_DIALOG_BOX)
                } catch (err) {
                    // If that dialog box is not found then page has loaded successfully, so return.
                    try {
                        await this.driver.waitUntilLoaded(xpath.SIDE_PANEL);
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