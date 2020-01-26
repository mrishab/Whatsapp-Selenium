const { Driver } = require("../src/driver");
const { By, until } = require('selenium-webdriver');

describe("DriverSpec", () => {

    let driver;
    let mWebDriver;

    beforeEach(() => {
        mWebDriver = jasmine.createSpyObj("WebDriver", ["findElement", "get", "wait"]);

        driver = new Driver(mWebDriver);
    });

    describe("Constructor", () => {

        it("constructor keeps a reference to the selenium driver passed as argument", () => {
            expect(driver.driver).toBe(mWebDriver);
        })
    });

    describe("parseXpath", () => {

        it("parseXpath returns a XPATH locator from the xpath string", () => {
            const testLocator = By.xpath("test_xpath");
            const locator = driver.parseXpath("test_xpath");

            expect(locator).toEqual(testLocator);
        });
    });

    describe("Get", () => {

        it("get calls the WebDriver's get method and awaits for it to resolve", async done => {
            mWebDriver.get.and.returnValue(new Promise(res => setTimeout(res, 2000)));

            await driver.get("www.example.com");

            expect(mWebDriver.get).toHaveBeenCalledWith("www.example.com");

            done();
        });
    });

    describe("GetElement", () => {

        it("getElement waits for the element to be found and returns it", async done => {
            const mElement = jasmine.createSpyObj("WebElement", ["click"]);

            mWebDriver.findElement.and.callFake(loc => {
                const expected = By.xpath("test_xpath");
                expect(loc).toEqual(expected);

                return Promise.resolve(mElement);
            });

            spyOn(driver, 'waitToLocate').and.callFake(loc => {
                const expected = By.xpath("test_xpath");
                expect(loc).toEqual(expected);

                return Promise.resolve();
            });

            const element = await driver.getElement("test_xpath");

            expect(element).toEqual(mElement);
            expect(driver.waitToLocate).toHaveBeenCalledTimes(1);

            done();
        });

    });

    describe("WaitToLocate", () => {

        it("waitToLocate", async done => {
            const mCondition = jasmine.createSpyObj("WebCondition", ["fn"]);
            mCondition.fn.and.callFake(driver => expect(driver).toEqual(mWebDriver));

            spyOn(until, "elementLocated").and.callFake(locator => {
                expect(locator).toEqual(By.xpath("test_xpath"));

                return mCondition;
            });

            mWebDriver.wait.and.callFake((callback, timeout) => {
                expect(timeout).toBe(1000);

                return new Promise(res => {
                    callback(mWebDriver);
                    res();
                });
            });

            await driver.waitToLocate(By.xpath("test_xpath"), 1000);

            expect(mCondition.fn).toHaveBeenCalledWith(mWebDriver);

            done();
        });
    });
});