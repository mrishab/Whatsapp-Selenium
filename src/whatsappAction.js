'use strict'

const { Key } = require('selenium-webdriver');

const { pause } = require("./util");

class WhatsappAction {

    constructor(whatsapp) {
        this.whatsapp = whatsapp;
    }

    async init() {
        await this.whatsapp.openPage();
        await this.waitToLoad();
    }

    async waitToLoad() {
        const timeout = 60 * 1000; // 1 minute
        let now = new Date().getMilliseconds();
        const end = now + timeout;

        let isLoading;
        do {
            isLoading = await this.whatsapp.isLoading();
            await pause(2000);
            now = new Date().getMilliseconds();
        } while (now < end && isLoading);

        if (isLoading && now >= end) {
            throw new Error("Timed out while loading");
        }

        const isRetry = await this.whatsapp.isRequireRetry();
        if (isRetry) {
            throw new Error("Cannot reach the phone");
        }
       
        const isUseHere = await this.whatsapp.isUseHere();
        if (isUseHere) {
            await this.whatsapp.useHere();
            await pause(2000);
        }

        const isLoginNeeded = await this.whatsapp.isNeedLogin();
        if (isLoginNeeded) {
            throw new Error("Requires Login");
        }

        try {
            await this.whatsapp.sidePanel;
        } catch (err) {
            throw new Error("Could not locate side panel");
        }
    }

    async sendMessageTo(name, message) {
        await this.whatsapp.openChatWith(name);
        await this.whatsapp.typeMessage(message);
        await this.whatsapp.typeMessage(Key.ENTER);
        const success = await this.whatsapp.isLastMessageSent();

        if (!success) {
            throw new Error(`Failed to load image for name: ${name}; message: ${message}`);
        }
    }

    async sendImageTo(name, path, caption) {
        await this.whatsapp.openChatWith(name);
        await this.whatsapp.uploadImage(path);
        await this.whatsapp.typeImageCaption(caption);
        await this.whatsapp.typeImageCaption(Key.ENTER);

        let success = false;
        for (let attempt = 0; attempt < 5 && !success; attempt++) {
            success = await this.whatsapp.isLastMessageSent();
        }

        if (!success) {
            throw new Error(`Failed to load image for name: ${name}; path: ${path}; caption: ${caption}`);
        }
    }

    async paste() {
        const keys = Key.chord(Key.CONTROL, "v");
        await this.page.typeMessage(keys);
    }
}

module.exports.WhatsappAction = WhatsappAction;