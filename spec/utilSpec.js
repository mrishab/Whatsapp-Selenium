const { pause } = require("../src/util");
const { performance } = require("perf_hooks");

describe("Utility Specs", () => {

    it("pause waits for a period and continues executes asynchronously", async done => {
        const start = performance.now();
        await pause(1234);
        const end = performance.now();

        const diff = end - start;
        expect(diff).toBeCloseTo(1234, -2);

        done();
    });

});