'use strict'
const path = require('path');
const fs = require('fs');

const WhatsappBot = require('./whatsappBot');
const USERNAME = 'root';
const { getFilenames, getRandomItem, renameFile, readArgs } = require('./helper');

const PICTURE_DIR_PATH = path.resolve(`/home/${USERNAME}/Pictures`);
const QUOTES_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Quotes');
const SENT_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Sent');

const LIST_DELIMITER = "^"

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
    let { individuals, groups, description } = readArgs();
    await whatsapp.init({ username: USERNAME, headless: true, noSandbox: true, isChromium: true });
    let imagePath = await pickImage();
    await sendWhatsappImageToAll(individuals, groups, imagePath, description);
    await moveImageToSent(imagePath);
};

async function sendWhatsappImageToAll(individuals, groups, imagePath, description) {
    if (individuals) {
        individuals = individuals.split(LIST_DELIMITER);
        await sendImageToList(individuals, false, imagePath, description);
    }
    if (groups) {
        groups = groups.split(LIST_DELIMITER);
        await sendImageToList(groups, true, imagePath, description);
    }
}

async function sendImageToList(toList, isGroup, imagePath, description) {
    for (let name of toList) {
        name = name.trim()
        console.log(`Preparing to send message to '${name}'.`);
        await whatsapp.sendImageTo(name, isGroup, imagePath, description);
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