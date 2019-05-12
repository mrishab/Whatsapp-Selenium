'use strict'
const path = require('path');
const fs = require('fs');

const WhatsappBot = require('./whatsappBot');
const USERNAME = 'root';
const { getFilenames, getRandomItem, renameFile, readArgs } = require('./helper');

const PICTURE_DIR_PATH = path.resolve(`/home/${USERNAME}/Pictures`);
const QUOTES_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Quotes');
const SENT_PICTURE_PATH = path.join(PICTURE_DIR_PATH, 'Sent');

// Running the main
let whatsapp = new WhatsappBot();

(async function(){
    try {
        await main();
    } catch (err) {
        console.log(err);
    } finally {
        await captureScreen();
        await whatsapp.close();
    }    
})()

async function main(){
    let name = readArgs()[0];
    console.log(`Preparing to send message to '${name}'.`);
    let image = await pickImage();
    await sendWhatsappImage(USERNAME, name, image);
    await moveImageToSent(image);
};

async function sendWhatsappImage(from, to, imagePath, description){
    await whatsapp.init({username:from, headless:true, noSandbox:true});
    await whatsapp.openChatWith(to);
    await whatsapp.sendImage(imagePath, description);
}

async function pickImage(){
    let files = await getFilenames(QUOTES_PICTURE_PATH);
    let imageFilename = getRandomItem(files, 2);
    return path.join(QUOTES_PICTURE_PATH, imageFilename);
}

async function moveImageToSent(imagePath){
    let sentImagePath = imagePath.replace(QUOTES_PICTURE_PATH, SENT_PICTURE_PATH);
    await renameFile(imagePath, sentImagePath);    
}

async function captureScreen(){
    console.log("Capturing Screenshot")
    let image = await whatsapp.captureScreen();
    fs.writeFileSync(path.join(SENT_PICTURE_PATH, "capture.png"));
}