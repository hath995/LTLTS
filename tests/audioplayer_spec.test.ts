import puppeteer from 'puppeteer';
import type {Browser, Page, Frame, ElementHandle} from 'puppeteer';
import * as LTL from "../src/index";
import * as fc from "fast-check";
import { temporalAsyncModelRun } from "../src/ltlModelRunner";

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
type AudioPlayerModel = {
    loaded: boolean;
    buttonText: string;
    timeInSeconds: number;
}

type AudioPlayerInstance = {
    driver: Browser;
    page: Page;
}



class PlayCommand implements fc.AsyncCommand<AudioPlayerModel, AudioPlayerInstance>{
    check(m: AudioPlayerModel): boolean {
        return m.loaded && m.buttonText === "Play";    
    }
    async run(m: AudioPlayerModel, r: AudioPlayerInstance): Promise<void> {
        await r.page.evaluate(() => {
          var audio = document.getElementsByClassName("play-pause")[0] as HTMLButtonElement;
          audio.click();
        });
        m.buttonText = await r.page.evaluate(() => {
          var audio = document.getElementsByClassName("play-pause")[0] as HTMLButtonElement;
          return audio.innerText;
        });
        // console.warn(`PlayCommand: ${m.buttonText}`)
    }
    toString(): string {
       return "Play"; 
    }
}   

class PauseCommand implements fc.AsyncCommand<AudioPlayerModel, AudioPlayerInstance>{
    check(m: AudioPlayerModel): boolean {
        return m.loaded && m.buttonText === "Pause";    
    }
    async run(m: AudioPlayerModel, r: AudioPlayerInstance): Promise<void> {

        await r.page.evaluate(() => {
          var audio = document.getElementsByClassName("play-pause")[0] as HTMLButtonElement;
          audio.click();
        });
        m.buttonText = await r.page.evaluate(() => {
          var audio = document.getElementsByClassName("play-pause")[0] as HTMLButtonElement;
          return audio.innerText;
        });
        // console.warn(`PauseCommand: ${m.buttonText}`)
    }
    toString(): string {
        return "Pause";
    }
}   

export function wait(ms: number) {
    return new Promise<void>((accept) => {
        setTimeout(() => {
            accept();
        }, ms);
    });
}



class WaitCommand implements fc.AsyncCommand<AudioPlayerModel, AudioPlayerInstance>{
    check(m: AudioPlayerModel): boolean {
        return true
    }
    async run(m: AudioPlayerModel, r: AudioPlayerInstance): Promise<void> {
        m.loaded = await r.page.evaluate(() => {
          if (document.readyState === "complete") {
            return true;
          }
          return false;
        //   return new Promise<boolean>((accept) => {
        //     document.addEventListener("readystatechange", () => {
        //       if (document.readyState === "complete") {
        //         accept(true);
        //       }
        //     });
        //   });
        });
        await wait(2000);
        m.timeInSeconds = await r.page.evaluate(() => {
          function timeInSeconds(s: string): number {
            let [minutes, seconds] = s.split(":");
            return parseInt(minutes) * 60 + parseInt(seconds);
          }
          var time = document.getElementsByClassName("time-display")[0] as HTMLSpanElement;
          return timeInSeconds(time.innerText);
        });
        m.buttonText = await r.page.evaluate(() => {
          var audio = document.getElementsByClassName("play-pause")[0] as HTMLButtonElement;
          return audio.innerText;
        });
        // console.warn(`WaitCommand: ${m.buttonText}, ${m.timeInSeconds}`)
    }
    toString(): string {
        return "Wait";
    }
}


describe('AudioPlayer', () => {
    afterEach(async () => {
      await waitForQuitAllDrivers();
    });
    it("should follow the LTL Specification", async () => {
        let playing = (m: AudioPlayerModel) => m.buttonText === "Pause";
        let paused = (m: AudioPlayerModel) => m.buttonText === "Play";

        var spec: LTL.LTLFormula<AudioPlayerModel> = LTL.Henceforth(LTL.And(
                LTL.Tag("buttonText", LTL.Implies(m => m.loaded, m => m.buttonText === "Play" || m.buttonText === "Pause")), 
                LTL.Implies(m => m.loaded, LTL.Or(
                LTL.Tag("play", LTL.And(paused, LTL.Next(playing), LTL.Unchanged("timeInSeconds"))),
                LTL.Tag("paused", LTL.And(playing, LTL.Next(paused), LTL.Unchanged("timeInSeconds"))),
                LTL.Tag("StillPaused", LTL.And(paused, LTL.Unchanged("timeInSeconds"))),
                LTL.Tag("tick", LTL.And(playing, LTL.Next(playing), LTL.Unchanged((m, n) => m.timeInSeconds <= n.timeInSeconds)))
                ))
            )
        , 1);
        // var spec: LTL.LTLFormula<AudioPlayerModel> = LTL.And(
        //     LTL.Tag("paused", paused),
        //     LTL.Henceforth(LTL.Or(
        //         LTL.Tag("play", LTL.And(paused, LTL.Next(playing))),
        //         LTL.Or( LTL.Tag("pause", LTL.And(playing, LTL.Next(paused))),
        //         LTL.Or(LTL.Tag("StillPaused", LTL.And(paused, LTL.Unchanged((m: AudioPlayerModel, n: AudioPlayerModel) => m.timeInSeconds == n.timeInSeconds))),
        //         LTL.Tag("tick", LTL.And(playing, LTL.And(LTL.Next(playing), LTL.Comparison((m: AudioPlayerModel, n: AudioPlayerModel) => m.timeInSeconds < n.timeInSeconds)))))
        //     ))
        // , 1));
        // const spec = LTL.True();
        try {
        await fc.assert(
            fc.asyncProperty(fc.commands([fc.constant(new PlayCommand()), fc.constant(new PauseCommand()), fc.constant(new WaitCommand())]), async (cmds) => {
                // let commandArray = Array.from(cmds);
                // fc.pre(commandArray.length > LTL.requiredSteps(spec));
                let i = 0;
                let setup: () => Promise<{
                    model: AudioPlayerModel,
                    real: AudioPlayerInstance
                }> = async () => {
                    // console.warn(`Setting up, called ${i++}`)
                    let driver = await waitForDriver();
                    let [page] = await driver.pages();
                    if (page === undefined) {
                        page = await driver.newPage();
                    }
                    await page.goto("http://localhost:8000/audioplayer.html");
                    return {
                        model: {loaded: false, buttonText: "", timeInSeconds: 0}, 
                        real: {driver, page}
                    }
                }
                await temporalAsyncModelRun(setup, cmds, spec);
               
            }).afterEach(async () => {
                    let driver = await waitForDriver();
                    const [page] = await driver.pages();
                    await page.close();
            }),{numRuns: 10});
        } finally {
        }
    }, 60*1000);
});