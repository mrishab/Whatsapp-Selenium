const { Whatsapp, WHATSAPP_URL } = require("../src/whatsapp");
const { Driver } = require("../src/driver");
const { XPATH } = require("../src/constants");

describe("Whatsapp Spec", () => {

    let whatsapp;
    let mDriver;

    beforeEach(() => {
        mDriver = new Driver({});
        // spyOnAllFunctions(mDriver);

        whatsapp = new Whatsapp(mDriver);
    });

    it("Properties", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(WebElement(xpath)));

        let el;

        el = await whatsapp.newChatButton;
        expect(el.xpath).toBe(XPATH.NEW_CHAT_BUTTON);

        el = await whatsapp.searchContactInputField;
        expect(el.xpath).toBe(XPATH.CONTACT_SEARCH_INPUT);

        el = await whatsapp.attachmentMenu;
        expect(el.xpath).toBe(XPATH.ATTACHMENT_MENU);

        el = await whatsapp.galleryButton;
        expect(el.xpath).toBe(XPATH.GALLERY_BUTTON);

        el = await whatsapp.imageCaptionInputField;
        expect(el.xpath).toBe(XPATH.IMAGE_CAPTION_INPUT);

        el = await whatsapp.lastMessageDoubleTicks;
        expect(el.xpath).toBe(XPATH.LAST_MESSAGE_DOUBLE_TICK);

        el = await whatsapp.loader;
        expect(el.xpath).toBe(XPATH.LOADER_PROGRESS);

        el = await whatsapp.retryButton;
        expect(el.xpath).toBe(XPATH.RETRY_DIALOG_BOX);

        el = await whatsapp.sidePanel;
        expect(el.xpath).toBe(XPATH.SIDE_PANEL);

        el = await whatsapp.messageBox;
        expect(el.xpath).toBe(XPATH.MESSAGEBOX);

        el = await whatsapp.lastMessage;
        expect(el.xpath).toBe(XPATH.LAST_MESSAGE);

        el = await whatsapp.qrCode;
        expect(el.xpath).toBe(XPATH.QR_CODE);

        el = await whatsapp.useHereButton;
        expect(el.xpath).toBe(XPATH.USE_HERE_BUTTON);

        done();
    });

    it("openPage calls the driver.get method with the URL", async done => {
        let isOpen = false;
        spyOn(mDriver, 'get').and.callFake(url => {
            expect(url).toBe(WHATSAPP_URL);
            isOpen = true;

            return Promise.resolve();
        });

        await whatsapp.openPage();

        expect(isOpen).toBeTrue();

        done();
    });

    it("openPage calls the driver.get method with the URL", async done => {
        spyOn(mDriver, 'get').and.callFake(url => {
            expect(url).toBe(WHATSAPP_URL);
            return new Promise((res, rej) => rej());
        });

        await whatsapp.openPage();
        done();
    });

    it("findChatElementFor performs a contact search and returns first element with matching name", async done => {
        const el = WebElement();
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath.includes("person_1") ? el : {}));

        const ret = await whatsapp.findChatElementFor("person_1");

        expect(ret).toBe(el);
        done();
    });

    it("openChatWith finds chat with person and opens it by clicking on it", async done => {
        const el = WebElement("//*[@title='person_1']/../../../../../..");

        spyOn(whatsapp, 'performContactSearchFor').and.callFake(name => {
            expect(name).toBe("person_1");
            return Promise.resolve();
        });
        spyOn(whatsapp, 'findChatElementFor').and.callFake(name => Promise.resolve(name == "person_1" ? el : null));

        await whatsapp.openChatWith("person_1");

        expect(el.getClicks()).toBe(1);
        expect(whatsapp.findChatElementFor).toHaveBeenCalledWith("person_1");
        expect(whatsapp.performContactSearchFor).toHaveBeenCalledWith("person_1");

        done();
    });

    it("typeMessage finds a message box and send keys", async done => {
        const el = WebElement(XPATH.MESSAGEBOX);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.MESSAGEBOX ? el : {}));

        await whatsapp.typeMessage("MESSAGE_TEST-");
        await whatsapp.typeMessage("MESSAGE_TEST");

        expect(el.getText()).toBe("MESSAGE_TEST-MESSAGE_TEST");

        done();
    });

    it("uploadImage sends path of the image to the gallerybutton", async done => {
        const gallery = WebElement(XPATH.GALLERY_BUTTON);
        const attachmentMenu = WebElement(XPATH.ATTACHMENT_MENU);

        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            let el = {};
            switch (xpath) {
                case XPATH.GALLERY_BUTTON:
                    // Even number of clicks means menu is closed.
                    if (attachmentMenu.getClicks() % 2 !== 1) {
                        throw "Attachment Menu is not open";
                    }
                    el = gallery;
                    break;

                case XPATH.ATTACHMENT_MENU:
                    el = attachmentMenu;
                    break;

                default:
                    throw `Unexpected xpath: ${xpath}`;
            }

            return Promise.resolve(el);
        });

        await whatsapp.uploadImage("/path/to/image");

        expect(gallery.getText()).toBe("/path/to/image");

        done();
    });

    it("typeImageCaption sendkeys to the image caption input", async done => {
        const el = WebElement(XPATH.IMAGE_CAPTION_INPUT);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.IMAGE_CAPTION_INPUT ? el : {}));

        await whatsapp.typeImageCaption("SOME_CAPTION");

        expect(el.getText()).toBe("SOME_CAPTION");
        done();
    });

    it("isLastMessageSent returns true when double ticks element is located on the last message", async done => {
        const el = WebElement(XPATH.LAST_MESSAGE_DOUBLE_TICK);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.LAST_MESSAGE_DOUBLE_TICK ? el : {}));

        const b = await whatsapp.isLastMessageSent();

        expect(b).toBe(true);
        done();
    });

    it("isLastMessageSent returns false when double ticks on last message element is not located", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            if (xpath === XPATH.LAST_MESSAGE_DOUBLE_TICK) {
                throw "NOT_FOUND";
            }

            return Promise.resolve({});
        });

        const b = await whatsapp.isLastMessageSent();

        expect(b).toBe(false);
        done();
    });

    it("isLoading returns true when the loader progress bar is present", async done => {
        const el = WebElement(XPATH.LOADER_PROGRESS);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.LOADER_PROGRESS ? el : {}));

        const b = await whatsapp.isLoading();

        expect(b).toBe(true);
        done();
    });

    it("isLoading returns false when the loader progress bar is not present", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            if (xpath === XPATH.LOADER_PROGRESS) {
                throw "NOT_FOUND";
            }

            return Promise.resolve({});
        });

        const b = await whatsapp.isLoading();

        expect(b).toBe(false);
        done();
    });

    it("isRequireRetry returns true when the retry window is present", async done => {
        const el = WebElement(XPATH.RETRY_DIALOG_BOX);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.RETRY_DIALOG_BOX ? el : {}));

        const b = await whatsapp.isRequireRetry();

        expect(b).toBe(true);
        done();
    });

    it("isRequireRetry returns false when the retry window is not present", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            if (xpath === XPATH.RETRY_DIALOG_BOX) {
                throw "NOT_FOUND";
            }

            return Promise.resolve({});
        });

        const b = await whatsapp.isRequireRetry();

        expect(b).toBe(false);
        done();
    });

    it("isNeedLogin returns true when QR Code is present", async done => {
        const el = WebElement(XPATH.QR_CODE);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.QR_CODE ? el : {}));

        const b = await whatsapp.isNeedLogin();

        expect(b).toBe(true);
        done();
    });

    it("isNeedLogin returns false when QR Code is not present", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            if (xpath === XPATH.QR_CODE) {
                throw "NOT_FOUND";
            }

            return Promise.resolve({});
        });

        const b = await whatsapp.isNeedLogin();

        expect(b).toBe(false);
        done();
    });

    it("isUseHere returns true when QR Code is present", async done => {
        const el = WebElement(XPATH.QR_CODE);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.USE_HERE_BUTTON ? el : {}));

        const b = await whatsapp.isUseHere();

        expect(b).toBe(true);
        done();
    });

    it("isUseHere returns false when QR Code is not present", async done => {
        spyOn(mDriver, 'getElement').and.callFake(xpath => {
            if (xpath === XPATH.USE_HERE_BUTTON) {
                throw "NOT_FOUND";
            }

            return Promise.resolve({});
        });

        const b = await whatsapp.isUseHere();

        expect(b).toBe(false);
        done();
    });

    it("useHere clicks on the 'Use Here' button", async done => {
        const el = WebElement(XPATH.USE_HERE_BUTTON);
        spyOn(mDriver, 'getElement').and.callFake(xpath => Promise.resolve(xpath === XPATH.USE_HERE_BUTTON ? el : {}));

        await whatsapp.useHere();

        expect(el.getClicks()).toBe(1);

        done();
    });

});

function WebElement(xpath) {
    return {
        xpath,
        text: "",
        nClicks: 0,

        sendKeys: async function (keys) { this.text += keys },
        getText: function () { return this.text; },

        click: async function () { this.nClicks++ },
        getClicks: function () { return this.nClicks }
    }
}