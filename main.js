'use strict'

const WhatsappBot = require('./whatsappBot');

let whatsapp = new WhatsappBot();

(async function main() {

    try {
        await whatsapp.init({username:'USERNAME_HERE', headless:true, noSandbox:true});
        await whatsapp.openChatWith('RECEIVER_NAME');
        await whatsapp.typeMessage("TYPE_YOUR_MESSAGE_HERE", true);

    } catch (err) {
        console.log(err);
    } finally {
        await whatsapp.close();
    }

})();