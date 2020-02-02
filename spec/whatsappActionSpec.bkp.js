const { Whatsapp } = require('../src/whatsapp');
const { Driver } = require('../src/driver');
const XPATH = require('../src/xpathConstants').xpath;

const { Key } = require('selenium-webdriver');

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
            spyOn(whatsapp, "_waitToLoad").and.callFake(async () => Promise.resolve());
            spyOn(mDriver, 'get').and.callFake(async () => Promise.resolve());

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
            mNewButton.click.and.returnValue(new Promise(res => {
                inputFieldVisible = true;
                res();
            }));

            let typedText;
            const mInputField = jasmine.createSpyObj("WebElement:InputField", ["sendKeys"]);
            mInputField.sendKeys.and.callFake(keys => {
                expect(inputFieldVisible).toBeTrue();

                return new Promise(res => {
                    typedText = keys;
                    res();
                });
            });

            const mChatElement = jasmine.createSpyObj("WebElement:Chat", ["click"]);
            mChatElement.click.and.returnValue(Promise.resolve());

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                let elem = null;

                switch (xpath) {
                    case XPATH.NEW_CHAT_BUTTON:
                        elem = mNewButton;
                        break;

                    case XPATH.CONTACT_SEARCH_INPUT:
                        elem = mInputField;
                        break;

                    case "//*[@title='person_name']/../../../../../..":
                        if (inputFieldVisible && typedText) {
                            elem = mChatElement;

                        } else {
                            throw `Chat Element not found because: visible: ${inputFieldVisible}, typed: ${inputFieldTyped}`;
                        }
                        break;

                    default:
                        throw `Invalid xpath: ${xpath}`;
                }

                return Promise.resolve(elem);
            });

            await whatsapp.openChatWith("person_name");

            expect(typedText).toBe("person_name");
            expect(mChatElement.click).toHaveBeenCalledTimes(1);

            done();
        });
    });

    describe("SearchContact", () => {

        it("searchContact clicks on the newChatButton and types the name of the person", async done => {
            let inputFieldVisible = false;
            const mNewButton = jasmine.createSpyObj("WebElement:NewChatButton", ["click"]);
            mNewButton.click.and.returnValue(new Promise(res => {
                inputFieldVisible = true;
                res();
            }));

            let typedText;
            const mInputField = jasmine.createSpyObj("WebElement:InputField", ["sendKeys"]);
            mInputField.sendKeys.and.callFake(keys => new Promise(res => {
                expect(inputFieldVisible).toBeTrue();
                typedText = keys;

                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                let elem = null;

                switch (xpath) {
                    case XPATH.NEW_CHAT_BUTTON:
                        elem = mNewButton;
                        break;

                    case XPATH.CONTACT_SEARCH_INPUT:
                        elem = mInputField;
                        break;

                    default:
                        throw `Invalid xpath: ${xpath}`;
                }

                return Promise.resolve(elem);
            });

            await whatsapp.searchContact("person_name");

            expect(typedText).toBe("person_name");

            done();
        });
    });

    describe("TypeMessage", () => {

        it("typeMessage types the text in the messageBox but does not hit 'ENTER' when send flag is set to false", async done => {
            let typedText;
            const mMessageBox = jasmine.createSpyObj("WebElement:MessageBox", ["sendKeys"]);
            mMessageBox.sendKeys.and.callFake(keys => new Promise(res => {
                typedText = keys;
                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                expect(xpath).toBe(XPATH.MESSAGEBOX);

                return Promise.resolve(mMessageBox);
            });

            await whatsapp.typeMessage("TEST MESSAGE", false);

            expect(typedText).toBe("TEST MESSAGE");
            expect(mMessageBox.sendKeys).not.toHaveBeenCalledWith(Key.ENTER);

            done();
        });

        it("typeMessage types the text in the messageBox and hits 'ENTER' when send flag is set to true", async done => {
            let typedText = "";
            const mMessageBox = jasmine.createSpyObj("WebElement:MessageBox", ["sendKeys"]);
            mMessageBox.sendKeys.and.callFake(keys => new Promise(res => {
                typedText += keys;
                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                expect(xpath).toBe(XPATH.MESSAGEBOX);

                return Promise.resolve(mMessageBox);
            });

            await whatsapp.typeMessage("TEST MESSAGE", true);

            expect(typedText).toBe("TEST MESSAGE" + Key.ENTER);

            done();
        });
    });

    describe("SendTypedMessage", () => {

        it("sendTypedMessage hits an enter on the messagebox", async done => {
            let typedText = "";
            const mMessageBox = jasmine.createSpyObj("WebElement:MessageBox", ["sendKeys"]);
            mMessageBox.sendKeys.and.callFake(keys => new Promise(res => {
                typedText += keys;
                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                expect(xpath).toBe(XPATH.MESSAGEBOX);

                return Promise.resolve(mMessageBox);
            });

            await whatsapp.sendTypedMessage();

            expect(typedText).toBe(Key.ENTER);

            done();
        });
    });

    describe("SendMessageTo", () => {

        it("sendMessageTo method opens a chat, types a message and hit enter", async done => {

            let isChatOpen = false;
            const mChatElement = jasmine.createSpyObj("WebElement", ["click"]);
            mChatElement.click.and.returnValue(new Promise(res => {
                isChatOpen = true;
                res();
            }));

            let typedText = "";
            const mMessageBox = jasmine.createSpyObj("WebElement:MessageBox", ["sendKeys"]);
            mMessageBox.sendKeys.and.callFake(keys => new Promise(res => {
                if (!isChatOpen) {
                    throw "Illegal State: Chat box is not opened yet by clicking on it.";
                }

                typedText += keys;
                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                let elem = null;

                switch (xpath) {
                    case XPATH.MESSAGEBOX:
                        elem = mMessageBox;
                        break;

                    case "//*[@title='person_name']/../../../../../..":
                        elem = mChatElement;
                        break;

                    default:
                        throw `Invalid xpath: ${xpath}`;
                }

                return Promise.resolve(elem);
            });

            await whatsapp.sendMessageTo("person_name", "test_message");

            expect(typedText).toBe("test_message" + Key.ENTER);
            expect(mChatElement.click).toHaveBeenCalledTimes(1);
            expect(mMessageBox.sendKeys).toHaveBeenCalledTimes(2);

            done();
        });
    });

    describe("Paste", () => {

        it("paste sends CTRL+V keychord to the messageBox", async done => {
            let typedText = "";
            const mMessageBox = jasmine.createSpyObj("WebElement:MessageBox", ["sendKeys"]);
            mMessageBox.sendKeys.and.callFake(keys => new Promise(res => {
                typedText += keys;
                res();
            }));

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                expect(xpath).toBe(XPATH.MESSAGEBOX);

                return Promise.resolve(mMessageBox);
            });

            await whatsapp.paste();

            expect(typedText).toBe(Key.chord(Key.CONTROL, "v"));
            expect(mMessageBox.sendKeys).toHaveBeenCalledTimes(1);

            done();
        });
    });

    describe("ClickAttachmentMenu", () => {

        it("clickAttachmentMenu clicks on the attachment menu button", async done => {
            const mAttachMenuButton = jasmine.createSpyObj("WebElement:AttachmentMenuButton", ["click"]);
            mAttachMenuButton.click.and.returnValue(Promise.resolve());

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                expect(xpath).toBe(XPATH.ATTACHMENT_MENU);

                return Promise.resolve(mAttachMenuButton);
            });

            await whatsapp.clickAttachmentMenu();

            expect(mAttachMenuButton.click).toHaveBeenCalledTimes(1);

            done();
        });
    });

    describe("SendImage", () => {

        it("sendImage clicks on Photo button from attachment menu and pastes the path of the image file", async done => {
            let isMenuOpen = false;
            const mAttachMenuButton = jasmine.createSpyObj("WebElement:AttachmentMenuButton", ["click"]);
            mAttachMenuButton.click.and.returnValue(new Promise(res => {
                isMenuOpen = true;
                res();
            }));

            let typedPath;
            const mGalleryButton = jasmine.createSpyObj("WebElement:PhotoButton", ["sendKeys"]);
            mGalleryButton.sendKeys.and.callFake(keys => new Promise(res => {
                expect(isMenuOpen).toBeTrue();
                typedPath = keys;

                res();
            }));

            let typedCaption;
            const mCaptionField = jasmine.createSpyObj("WebElement:CaptionInputField", ["sendKeys"]);
            mCaptionField.sendKeys.and.callFake(keys => new Promise(res => {
                expect(typedPath).toBeTruthy();
                typedCaption = keys;

                res();
            }))
            

            spyOn(mDriver, 'getElement').and.callFake(xpath => {
                switch(xpath) {
                    case XPATH.ATTACHMENT_MENU:
                        elem = mAttachMenuButton;
                        break;

                    case XPATH.GALLERY_BUTTON:
                        elem = mGalleryButton;
                        break;

                    case XPATH.IMAGE_CAPTION_INPUT:
                        elem = mCaptionField;
                        break;

                    default:
                        throw `Invalid xpath: ${xpath}`;
                }
    
                return Promise.resolve(elem);
            });

            await whatsapp.sendImage("/path/to/image", "description of image");

            expect(typedPath).toBe("/path/to/image");
            expect(typedCaption).toBe("description of image");

            done();
        });

    });
});