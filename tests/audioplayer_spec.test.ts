import type {Browser, Page} from 'puppeteer';
import * as LTL from "../src/index";
import * as fc from "fast-check";
import { temporalAsyncModelRun } from "../src/ltlModelRunner";
import { waitForDriver, waitForQuitAllDrivers, wait } from "./puppeteer_utils";

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