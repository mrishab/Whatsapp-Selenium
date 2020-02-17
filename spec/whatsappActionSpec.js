const { WhatsappAction } = require("../src/whatsappAction");
const { Whatsapp } = require("../src/whatsapp");
const { Key } = require("selenium-webdriver");

describe("WhatsappSpec", () => {

    let action;
    let mWhatsapp;

    beforeEach(() => {
        mWhatsapp = new Whatsapp({});
        action = new WhatsappAction(mWhatsapp);
    });

    it("init opens the page and waits for the loading to complete", async done => {
        spyOn(mWhatsapp, 'openPage').and.callFake(() => Promise.resolve());
        spyOn(action, 'waitToLoad').and.callFake(() => Promise.resolve());

        await action.init();

        expect(mWhatsapp.openPage).toHaveBeenCalledTimes(1);
        expect(action.waitToLoad).toHaveBeenCalledTimes(1);

        done();
    });

    it("waitToLoad waits for less than 1 minute and finds the sidePanel completes", async done => {
        spyOnProperty(mWhatsapp, 'sidePanel', 'get').and.returnValue(Promise.resolve({}));

        let isLoading = true;
        spyOn(mWhatsapp, 'isLoading').and.callFake(() => Promise.resolve(isLoading));
        setTimeout(() => isLoading = false, 59 * 1000);

        await action.waitToLoad();

        done();
    }, 65000);

    it("waitToLoad waits for more than 1 minute and fails", async done => {
        spyOn(mWhatsapp, 'isLoading').and.returnValue(Promise.resolve(true));

        await expectAsync(action.waitToLoad()).toBeRejectedWithError(Error, "Timed out while loading");

        done();
    }, 65000);

    it("waitToLoad gets 'cannot reach phone' and throws error", async done => {
        spyOn(mWhatsapp, 'isLoading').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isRequireRetry').and.returnValue(Promise.resolve(true));

        await expectAsync(action.waitToLoad()).toBeRejectedWithError(Error, "Cannot reach the phone");

        done();
    });

    it("waitToLoad sees 'use here' button and clicks it", async done => {
        spyOn(mWhatsapp, 'isLoading').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isRequireRetry').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isUseHere').and.returnValue(Promise.resolve(true));

        let useHereClicked = false;
        spyOn(mWhatsapp, 'useHere').and.returnValue(new Promise(res => {
            useHereClicked = true;
            res();
        }));

        const el = jasmine.createSpyObj("WebElement", ["click"]);
        spyOnProperty(mWhatsapp, 'sidePanel', 'get').and.returnValue(Promise.resolve(useHereClicked ? el : {}));

        await action.waitToLoad();

        done();
    });

    it("waitToLoad sees 'log-in' qr code", async done => {
        spyOn(mWhatsapp, 'isLoading').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isRequireRetry').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isNeedLogin').and.returnValue(Promise.resolve(true));

        await expectAsync(action.waitToLoad()).toBeRejectedWithError(Error, "Requires Login");

        done();
    });

    it("waitToLoad waits for less than 1 minute but could not finds the sidePanel after completion", async done => {
        spyOn(mWhatsapp, 'isLoading').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isRequireRetry').and.returnValue(Promise.resolve(false));
        spyOn(mWhatsapp, 'isNeedLogin').and.returnValue(Promise.resolve(false));

        spyOnProperty(mWhatsapp, 'sidePanel', 'get').and.throwError("Could not locate side panel");

        await expectAsync(action.waitToLoad()).toBeRejectedWithError(Error, "Could not locate side panel");

        done();
    });

    it("sendImageTo opensChat, uploads an image, types caption and make 5 attempts for doubleticks on the last message", async done => {
        let chatOpen = false;
        spyOn(mWhatsapp, 'openChatWith').and.callFake(name => new Promise(res => {
            expect(name).toBe("person_1");
            chatOpen = true;
            res();
        }));

        let uploaded = false;
        spyOn(mWhatsapp, 'uploadImage').and.callFake(file => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(file).toBe("/path/to/image");
            uploaded = true;
            res();
        }));

        let typed = false;
        spyOn(mWhatsapp, 'typeImageCaption').and.callFake(caption => new Promise(res => {
            expect(uploaded).toBe(true);
            expect(caption).toBe("IMAGE_CAPTION");
            typed = true;
            res();
        }));

        let sent = false;
        spyOn(mWhatsapp, 'typeMessage').and.callFake(message => new Promise(res => {
            expect(typed).toBeTrue();
            expect(message).toEqual(Key.ENTER);
            sent = true;

            res();
        }));

        let attempt = 0;
        spyOn(mWhatsapp, 'isLastMessageSent').and.callFake(() => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(uploaded).toBeTrue();
            expect(typed).toBeTrue();
            expect(sent).toBeTrue();

            res(attempt++ === 4); // true on fifth attempt
        }));

        await action.sendImageTo("person_1", "/path/to/image", "IMAGE_CAPTION");

        expect(mWhatsapp.openChatWith).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.uploadImage).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.typeImageCaption).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.isLastMessageSent).toHaveBeenCalledTimes(5);

        done();
    });

    it("sendImageTo opensChat, uploads an image, types caption and throws error when double ticks don't appear", async done => {
        let chatOpen = false;
        spyOn(mWhatsapp, 'openChatWith').and.callFake(name => new Promise(res => {
            expect(name).toBe("person_1");
            chatOpen = true;
            res();
        }));

        let uploaded = false;
        spyOn(mWhatsapp, 'uploadImage').and.callFake(file => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(file).toBe("/path/to/image");
            uploaded = true;
            res();
        }));

        let typed = false;
        spyOn(mWhatsapp, 'typeImageCaption').and.callFake(caption => new Promise(res => {
            expect(uploaded).toBe(true);
            expect(caption).toBe("IMAGE_CAPTION");
            typed = true;
            res();
        }));

        let sent = false;
        spyOn(mWhatsapp, 'typeMessage').and.callFake(message => new Promise(res => {
            expect(typed).toBeTrue();
            expect(message).toEqual(Key.ENTER);
            sent = true;

            res();
        }));

        spyOn(mWhatsapp, 'isLastMessageSent').and.callFake(() => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(uploaded).toBeTrue();
            expect(typed).toBeTrue();
            expect(sent).toBeTrue();

            res(false);
        }));

        await expectAsync(action.sendImageTo("person_1", "/path/to/image", "IMAGE_CAPTION"))
            .toBeRejectedWithError("Failed to load image for name: person_1; path: /path/to/image; caption: IMAGE_CAPTION");

        expect(mWhatsapp.openChatWith).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.uploadImage).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.typeImageCaption).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.isLastMessageSent).toHaveBeenCalledTimes(5);

        done();
    });

    it("sendMessageTo opensChat, types message and makes 1 attempt for doubleticks on the last message", async done => {
        let chatOpen = false;
        spyOn(mWhatsapp, 'openChatWith').and.callFake(name => new Promise(res => {
            expect(name).toBe("person_1");
            chatOpen = true;
            res();
        }));

        let typed = "";
        spyOn(mWhatsapp, 'typeMessage').and.callFake(message => new Promise(res => {
            expect(chatOpen).toBe(true);
            typed += message;
            res();
        }));

        spyOn(mWhatsapp, 'isLastMessageSent').and.callFake(() => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(typed).toBe("MESSAGE" + Key.ENTER);

            res(true);
        }));

        await action.sendMessageTo("person_1", "MESSAGE");

        expect(mWhatsapp.openChatWith).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.typeMessage).toHaveBeenCalledTimes(2);
        expect(mWhatsapp.isLastMessageSent).toHaveBeenCalledTimes(1);

        done();
    });

    it("sendMessageTo opensChat, types message and throws error when doubleticks not found on the last message", async done => {
        let chatOpen = false;
        spyOn(mWhatsapp, 'openChatWith').and.callFake(name => new Promise(res => {
            expect(name).toBe("person_1");
            chatOpen = true;
            res();
        }));

        let typed = "";
        spyOn(mWhatsapp, 'typeMessage').and.callFake(message => new Promise(res => {
            expect(chatOpen).toBe(true);
            typed += message;
            res();
        }));

        spyOn(mWhatsapp, 'isLastMessageSent').and.callFake(() => new Promise(res => {
            expect(chatOpen).toBeTrue();
            expect(typed).toBe("MESSAGE" + Key.ENTER);

            res(false);
        }));

        await expectAsync(action.sendMessageTo("person_1", "MESSAGE")).toBeRejectedWithError("Failed to load image for name: person_1; message: MESSAGE");

        expect(mWhatsapp.openChatWith).toHaveBeenCalledTimes(1);
        expect(mWhatsapp.typeMessage).toHaveBeenCalledTimes(2);
        expect(mWhatsapp.isLastMessageSent).toHaveBeenCalledTimes(1);

        done();
    });
});