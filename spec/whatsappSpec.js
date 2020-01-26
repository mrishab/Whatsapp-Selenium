const { Whatsapp } = require('../src/whatsapp');
const { Driver } = require('../src/driver');
const XPATH = require('../src/xpathConstants').xpath;

describe("WhatsappSpec", () => {

    const mWebDriver = jasmine.createSpy("WebDriver");

    let mDriver;
    let whatsapp;

    beforeEach(() => {
        mDriver = new Driver(mWebDriver);
        whatsapp = new Whatsapp(mDriver);
    })

    describe("Init", () => {

        it("Init loads the Whatsapp URL and wait for the screen to load", async done => {
            spyOn(whatsapp, "_waitToLoad");
            spyOn(mDriver, 'get');

            await whatsapp.init();

            expect(mDriver.get).toHaveBeenCalledWith("https://web.whatsapp.com/")
            expect(whatsapp._waitToLoad).toHaveBeenCalledTimes(1);

            done();
        });
    });

    describe("openChatWith", () => {

        it("openChat clicks on the chatbox if it's inside the viewport", async done => {
            const mChatElement = jasmine.createSpyObj("WebElement", ["click"]);
            mChatElement.click.and.returnValue(Promise.resolve());

            spyOn(mDriver, 'getElement').and.callFake(async xpath => {
                expect(xpath).toBe("//*[@title='person_name']/../../../../../..");

                return Promise.resolve(mChatElement);
            });

            await whatsapp.openChatWith("person_name");

            expect(mChatElement.click).toHaveBeenCalledTimes(1);

            done();
        });

        it("openChat searches when not found in first attempt and then clicks it", async done => {
            let inputFieldVisible = false;
            const mNewButton = jasmine.createSpyObj("WebElement:NewChatButton", ["click"]);
            mNewButton.click.and.callFake(() => inputFieldVisible = true);

            let inputFieldTyped = false;
            const mInputField = jasmine.createSpyObj("WebElement:InputField", ["sendKeys"]);
            mInputField.sendKeys.and.callFake(() => {
                expect(inputFieldVisible).toBe(true);

                inputFieldTyped = true
            });

            const mChatElement = jasmine.createSpyObj("WebElement:Chat", ["click"]);
            mChatElement.click.and.returnValue(Promise.resolve());

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                let retElement = null;

                switch (xpath) {
                    case XPATH.NEW_CHAT_BUTTON:
                        retElement = mNewButton;
                        break;

                    case XPATH.CONTACT_SEARCH_INPUT:
                        retElement = mInputField;
                        break;

                    case "//*[@title='person_name']/../../../../../..":
                        if (inputFieldVisible && inputFieldTyped) {
                            retElement = mChatElement;

                        } else {
                            throw `Chat Element not found because: visible: ${inputFieldVisible}, typed: ${inputFieldTyped}`;
                        }
                        break;

                    default:
                        throw `Invalid xpath: ${xpath}`;
                }

                return Promise.resolve(retElement);
            });

            await whatsapp.openChatWith("person_name");

            expect(mChatElement.click).toHaveBeenCalledTimes(1);

            done();
        });

    });
});