'use strict'

const WhatsappBot = require('./whatsappBot');

let whatsapp = new WhatsappBot();

(async function main() {

    try {
        await whatsapp.init('USERNAME_HERE');
        await whatsapp.openChatWith('RECEIVER_NAME');
        await whatsapp.typeMessage("TYPE_YOUR_MESSAGE_HERE");

    } catch (err) {
        console.log(err);
    } finally {
        whatsapp.close();
    }

})();