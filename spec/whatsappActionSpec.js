const { WhatsappAction } = require("../src/whatsappAction");
const { Whatsapp } = require("../src/whatsapp");

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
    

});