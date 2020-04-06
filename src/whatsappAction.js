'use strict'

const { Key } = require('selenium-webdriver');
const { pause } = require("./util");

const { performance } = require("perf_hooks");

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

        let now = performance.now();
        const end = now + timeout;

        let isLoading;
        for (isLoading = true; now < end && isLoading; now = performance.now()) {
            isLoading = await this.whatsapp.isLoading();
            await pause(2000);
        }

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

        // Waiting for the preview dialogue to animate onto the screen
        await pause(1000);

        let success = false;
        // Maximum waiting time is 5 * 2 = 10 seconds.
        for (let attempt = 0; attempt < 5 && !success; attempt++) {
            success = await this.whatsapp.isLastMessageSent();
            await pause(2000);
        }

        if (!success) {
            throw new Error(`Failed to load image for name: ${name}; path: ${path}; caption: ${caption}`);
        }
    }
}

module.exports.WhatsappAction = WhatsappAction;