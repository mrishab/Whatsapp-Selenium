'use strict'
const path = require('path');
const fs = require('fs');

const WhatsappBot = require('./whatsappBot');
const USERNAME = 'root';
const { getFilenames, getRandomItem, renameFile, readArgs } = require('./helper');

const PICTURE_DIR_PATH = path.resolve(`/home/${USERNAME}/Pictures`);
const QUOTES_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Quotes');
const SENT_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Sent');

const DEFAULT_LIST_DELIMITER = "^"

// Running the main
let whatsapp = new WhatsappBot();

(async function () {
    try {
        await main();
    } catch (err) {
        console.log(err);
    } finally {
        await captureScreen();
        await whatsapp.close();
    }
})()

async function main() {
    let { individuals, groups, description, delimiter } = readArgs();
    await whatsapp.init({ username: USERNAME, headless: true, noSandbox: true, isChromium: true });
    let imagePath = await pickImage();
    await sendWhatsappImageToAll(imagePath, description, delimiter, individuals, groups);
    await moveImageToSent(imagePath);
};

async function sendWhatsappImageToAll(imagePath, description, delimiter = DEFAULT_LIST_DELIMITER, ...listStrings) {
    for (let listStr of listStrings) {
        if (!listStr) return;
        let individualEntities = listStr.split(delimiter);
        await sendImageToList(individualEntities, true, imagePath, description);
    }
}

async function sendImageToList(toList, imagePath, description) {
    for (let name of toList) {
        name = name.trim()
        if (name === "") continue;
        console.log(`Preparing to send message to '${name}'.`);
        await whatsapp.sendImageTo(name, imagePath, description);
    }
}

async function pickImage() {
    let files = await getFilenames(QUOTES_PICTURE_PATH);
    let imageFilename = getRandomItem(files, 2);
    return path.join(QUOTES_PICTURE_PATH, imageFilename);
}

async function moveImageToSent(imagePath) {
    let sentImagePath = imagePath.replace(QUOTES_PICTURE_PATH, SENT_PICTURE_PATH);
    await renameFile(imagePath, sentImagePath);
}

async function captureScreen() {
    if (!whatsapp.isActive()) {
        return;
    }
    let error, image = whatsapp.captureScreen();
    if (error) {
        throw error;
    }
    image = await image;
    fs.writeFileSync(path.join(SENT_PICTURE_PATH, "Last Run Status.png"), image, 'base64');
    console.log("[SUCCESS] Screeshot captured")
}