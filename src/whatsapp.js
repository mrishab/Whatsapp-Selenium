'use strict'

const { XPATH, NAME_PLACEHOLDER } = require('./constants');

const WHATSAPP_URL = "https://web.whatsapp.com/";

class Whatsapp {

    constructor(driver) {
        this.driver = driver;
    }

    get newChatButton() {
        return this._findElement(XPATH.NEW_CHAT_BUTTON);
    }

    get searchContactInputField() {
        return this._findElement(XPATH.CONTACT_SEARCH_INPUT);
    }

    get attachmentMenu() {
        return this._findElement(XPATH.ATTACHMENT_MENU);
    }

    get galleryButton() {
        return this._findElement(XPATH.GALLERY_BUTTON);
    }

    get imageCaptionInputField() {
        return this._findElement(XPATH.IMAGE_CAPTION_INPUT);
    }

    get lastMessageDoubleTicks() {
        return this._findElement(XPATH.LAST_MESSAGE_DOUBLE_TICK)
    }

    get loader() {
        return this._findElement(XPATH.LOADER_PROGRESS);
    }

    get retryButton() {
        return this._findElement(XPATH.RETRY_DIALOG_BOX);
    }

    get sidePanel() {
        return this._findElement(XPATH.SIDE_PANEL);
    }

    get messageBox() {
        return this._findElement(XPATH.MESSAGEBOX);
    }

    get lastMessage() {
        return this._findElement(XPATH.LAST_MESSAGE);
    }

    get qrCode() {
        return this._findElement(XPATH.QR_CODE);
    }

    get useHereButton() {
        return this._findElement(XPATH.USE_HERE_BUTTON);
    }

    async openPage() {
        await this.driver.get(WHATSAPP_URL);
    }

    async findChatElementFor(name) {
        const chatXPath = XPATH.CHAT.replace(NAME_PLACEHOLDER, name);

        return await this._findElement(chatXPath);
    }

    async openChatWith(name) {
        await this.performContactSearchFor(name);

        const chat = await this.findChatElementFor(name);
        await chat.click();
    }

    async performContactSearchFor(name) {
        const button = await this.newChatButton;
        await button.click();

        const searchContactInputField = await this.searchContactInputField;
        await searchContactInputField.sendKeys(name);
    }

    async typeMessage(message) {
        const input = await this.messageBox;
        await input.sendKeys(message);
    }

    async uploadImage(path) {
        const menu = await this.attachmentMenu;
        await menu.click();

        const button = await this.galleryButton;
        await button.sendKeys(path);
    }

    async typeImageCaption(caption) {
        const input = await this.imageCaptionInputField;
        await input.sendKeys(caption);
    }

    async isLastMessageSent() {
        let sent = false;
        try {
            await this.lastMessageDoubleTicks;
            sent = true;
        } catch (err) { }

        return sent;
    }

    async isLoading() {
        let loading = false;
        try {
            await this.loader;
            loading = true;
        } catch (err) { }

        return loading;
    }

    async isRequireRetry() {
        let requireRetry = false;
        try {
            await this.retryButton;
            requireRetry = true;
        } catch (err) { }

        return requireRetry;
    }

    async isNeedLogin() {
        let qrPresent = false;
        try {
            await this.qrCode;
            qrPresent = true;
        } catch (err) { }

        return qrPresent
    }

    async isUseHere() {
        let isUseHere = false;
        try {
            await this.useHereButton;
            isUseHere = true;
        } catch (err) { }

        return isUseHere
    }

    async useHere() {
        const useHere = await this.useHereButton;
        await useHere.click();
    }

    _findElement(xpath) {
        return this.driver.getElement(xpath);
    }
}

module.exports.Whatsapp = Whatsapp;