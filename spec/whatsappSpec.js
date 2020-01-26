const { Whatsapp } = require('../src/whatsapp');

describe("WhatsappSpec", () => {

    let mDriver = jasmine.createSpyObj('Driver', ['get']);
    let whatsapp;

    beforeEach(() => {
        whatsapp = new Whatsapp(mDriver);
    })

    describe("Init", () => {

        it("Init loads the Whatsapp URL and wait for the screen to load", async done => {
            spyOn(whatsapp, "_waitToLoad");

            await whatsapp.init();

            expect(mDriver.get).toHaveBeenCalledWith("https://web.whatsapp.com/")
            expect(whatsapp._waitToLoad).toHaveBeenCalledTimes(1);

            done();
        });
    });
});