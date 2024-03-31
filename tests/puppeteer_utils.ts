import type {Browser, Page, Frame, ElementHandle} from 'puppeteer';
import puppeteer from 'puppeteer';

var driverMap : Map<number, Browser | undefined> = new Map();
export async function waitForDriver(id: number = 1) : Promise<Browser> {
    if (driverMap.get(id) !== undefined) {
        return driverMap.get(id)!;
    }
    var headless = (process.env.HEADLESS === '1') ? true : false;
    driverMap.set(id, await createNewDriver(headless));
    return driverMap.get(id)!;
}
export async function createNewDriver(isHeadless=false) {    
    // to open devtools, addd this flag: --auto-open-devtools-for-tabs
    let chromeOptions: string[] = [];

    chromeOptions.push('--use-fake-ui-for-media-stream')
    chromeOptions.push('--use-fake-device-for-media-stream')
    // chromeOptions.push('--auto-open-devtools-for-tabs');

    // if (CHROME_BINARY_PATH != 'DEFAULT') {
        // chromeOptions.setChromeBinaryPath(CHROME_BINARY_PATH);
    // }

    if (isHeadless) {
        chromeOptions.push('--disable-dev-shm-usage');
        chromeOptions.push('--no-sandbox');
        chromeOptions.push('--disable-gpu');
        chromeOptions.push('--headless');
    }

    return await puppeteer.launch({
        headless: isHeadless,
        args: chromeOptions,
        executablePath: "./chrome/mac-123.0.6312.58/chrome-mac-x64/Google\ Chrome\ for\ Testing.app/Contents/MacOS/Google\ Chrome\ for\ Testing"
    })
}
export async function waitForQuitAllDrivers() : Promise<void> {
    driverMap.forEach(async (driver, id) => {
        await waitForQuitDriver(id);
    })
}

export async function waitForQuitDriver(id : number = 1) : Promise<void> {
    if (driverMap.get(id) === undefined) {
        return;
    }
    await driverMap.get(id)!.close();
    driverMap.delete(id);
}

export function wait(ms: number) {
    return new Promise<void>((accept) => {
        setTimeout(() => {
            accept();
        }, ms);
    });
}