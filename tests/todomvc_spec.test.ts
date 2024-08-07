import puppeteer from 'puppeteer';
import type {Frame, ElementHandle, KeyInput} from 'puppeteer';
import * as LTL from "../src/index";
import * as fc from "fast-check";
import { temporalAsyncModelRun } from "../src/ltlModelRunner";
import { waitForDriver, waitForQuitAllDrivers, wait } from "./puppeteer_utils";
import { TodoMVCModel, TodoMVCInstance, convert, elementSelectors, initial, invariants, stateTransitions } from './TodoMVCModel';

// let urls = ["https://todomvc.com/examples/react/dist/"]
let urls = ["https://todomvc.com/examples/jquery/dist"]
// let urls = [
//   "https://todomvc.com/examples/jquery/dist",
//   "https://todomvc.com/examples/react/dist/",
//   "https://todomvc.com/examples/angular-dart/web/",
//   "https://todomvc.com/examples/elm/",
//   "https://todomvc.com/examples/dijon/",
//   "https://todomvc.com/examples/ractive/",
//   "https://todomvc.com/examples/javascript-es6/dist/",
//   "https://todomvc.com/examples/canjs_require/",
//   "https://todomvc.com/examples/closure/",
//   "https://todomvc.com/examples/typescript-backbone/",
//   "https://todomvc.com/examples/typescript-angular/",
//   "https://todomvc.com/examples/react-redux/dist/",
//   "https://todomvc.com/examples/vue/dist/",
//   "https://todomvc.com/examples/knockoutjs/",
//   "https://todomvc.com/examples/mithril/",
//   "https://todomvc.com/examples/duel/www/"
// ];




const InitialModelState: TodoMVCModel = {
    loaded: false,
    selectedFilter: "All",
    items: [],
    editInput: null,
    lastItemText: null,
    numItems: 0,
    numUnchecked: 0,
    numChecked: 0,
    itemsInEditMode: [],
    itemInEditMode: null,
    numInEditMode: 0,
    isInEditMode: false,
    newTodoInput: {pendingText: "", active: true},
    todoCount: null,
    itemsLeft: null,
    availableFilters: [],
    toggleAllLabel: "",
    toggleAllChecked: false
};

async function updateState(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
    let toEval = `
        (() => {
        function findParentOfType(el, typ) {
            if (!!el.parentElement) {
                if (el.parentElement instanceof typ) {
                    return el.parentElement;
                } else {
                    return findParentOfType(el.parentElement, typ);
                }
            } else {
                return null;
            }
        }
        function isVisibleOption(el) {
            if (!(el instanceof HTMLOptionElement)) {
                return false;
            }
            const select = findParentOfType(el, HTMLSelectElement);
            return !!select && isElementVisible(select);
        }

        function isElementVisible(el) {
            const cs = window.getComputedStyle(el);

            return (
                cs.getPropertyValue("display") !== "none" &&
                cs.getPropertyValue("visibility") !== "hidden" &&
                cs.getPropertyValue("opacity") !== "0" &&
                // Fixed elements and HTMLOptionElements (in Chrome, at least) have no offsetParent
                (cs.position === "fixed"
                    || isVisibleOption(el)
                    || el.offsetParent !== null)
            );
        }

        function first(x) {
            return x.length !== 0 ? x[0] : null
        }

        function last(x) {
            return x.length !== 0 ? x[x.length-1] : null
        }

        let elementSelectors = ${convert(elementSelectors)};
        let result = {};
        for (let k in elementSelectors) {
          result[k] = elementSelectors[k]();
        }
        return result;
    })()`;
    let newData = await r.page.evaluate(toEval) as TodoMVCModel;
    for(let key in newData) {
        //@ts-expect-error
        m[key] = newData[key];
    }
}

class WaitC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return true
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await wait(10);
        await updateState(m, r);
        // console.log(m);
    }
    toString(): string {
        return "WaitC()";
    }
}

class FocusInputC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && !m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.focus(".todoapp .new-todo");
        await updateState(m, r);
    }
    toString(): string {
        return "FocusInputC()";
    }
}

class TypePendingText implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public text: KeyInput) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.newTodoInput !== null && m.newTodoInput.active
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press(this.text);
        await updateState(m, r);
    }
    toString(): string {
        return `TypePendingText(${this.text})`;
    }
}

class TypeEditText implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public text: KeyInput) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press(this.text);
        await updateState(m, r);
    }
    toString(): string {
        return `TypeEditText(${this.text})`;
    }
}

class CreateTodoC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.newTodoInput !== null && m.newTodoInput.active && m.newTodoInput.pendingText !== ""
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Enter");
        await updateState(m, r);
    }
    toString(): string {
        return "CreateTodoC()";
    }
}

class CheckOneC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.numItems > 0 && m.numUnchecked > 0 && this.index-1 < m.numItems && !m.items[this.index-1].isEditing && !m.items[this.index-1].checked
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todo-list li:nth-child(${this.index}) input[type='checkbox']`);
        await updateState(m, r);
    }
    toString(): string {
        return `CheckOneC(${this.index})`;
    }
}

class UncheckOneC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.numItems > 0 && m.numChecked > 0 && this.index-1 < m.numItems && !m.items[this.index-1].isEditing && m.items[this.index-1].checked

    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todo-list li:nth-child(${this.index}) input[type='checkbox']`);
        await updateState(m, r);
    }
    toString(): string {
        return `UncheckOneC(${this.index})`;
    }
}

class ToggleAllC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && !m.isInEditMode && m.numItems > 0
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(".todoapp label[for=toggle-all]");
        await updateState(m, r);
    }
    toString(): string {
        return "ToggleAllC()";
    }
}

class DeleteTodoC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && !m.isInEditMode && m.numItems > 0 && this.index-1 < m.numItems
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.hover(`.todo-list li:nth-child(${this.index})`);
        await r.page.click(`.todo-list li:nth-child(${this.index}) button.destroy`);
        await updateState(m, r);
    }
    toString(): string {
        return `DeleteTodoC(${this.index})`;
    }
}

class SelectFilterC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public ordinal: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && !m.isInEditMode && m.numItems > 0
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todoapp .filters li:nth-child(${this.ordinal}) a`);
        await updateState(m, r);
    }
    toString(): string {
        return `SelectFilterC(${this.ordinal})`;
    }
}

class CommitEditC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.isInEditMode;
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Enter");
        await updateState(m, r);
    }
    toString(): string {
        return "CommitEditC()";
    }
}

class AbortEditC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && m.isInEditMode;
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Escape");
        await updateState(m, r);
    }
    toString(): string {
        return "AbortEditC()";
    }
}

class EditTodoC implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.loaded && !m.isInEditMode && m.numItems > 0 && this.index-1 < m.numItems
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todo-list :nth-child(${this.index}) label`, {clickCount: 2});
        await updateState(m, r);
    }
    toString(): string {
        return `EditTodo(${this.index})`;
    }
}

let commands = [
    fc.constant(new WaitC),
    fc.constant(new FocusInputC),
    fc.constant(new CreateTodoC),
    ...([1,2,3,4,5,6,7,8,9]).map(x=> fc.constant(new CheckOneC(x))),
    ...([1,2,3,4,5,6,7,8,9]).map(x=> fc.constant(new UncheckOneC(x))),
    fc.constant(new ToggleAllC),
    fc.constant(new CommitEditC),
    fc.constant(new AbortEditC),
    ...(["c","d"," ","Backspace"] as KeyInput[]).map(x => fc.constant(new TypeEditText(x))),
    ...([1,2,3] as number[]).map(x => fc.constant(new SelectFilterC(x))),
    ...[1,2,3,4,5,6,7,8,9].map(x => fc.constant(new DeleteTodoC(x))),
    ...[1,2,3,4,5,6,7,8,9].map(x => fc.constant(new EditTodoC(x))),
    ...(["a","b"," ","Backspace"] as KeyInput[]).map(x => fc.constant(new TypePendingText(x)))
];
describe('TodoMVC', () => {
    afterEach(async () => {
      await waitForQuitAllDrivers();
      await wait(1000);
    });

    // it("%s should follow the specification", async () => {
    test.each(urls)(
      "%s should follow the specification",
      async (url) => {
        let i = 1;
        await fc.assert(
          fc.asyncProperty(fc.commands(commands, { size: "+2" }), async (cmds) => {
              console.log(`Running test, ${url}`, i++);
              let setup: () => Promise<{
                model: TodoMVCModel;
                real: TodoMVCInstance;
              }> = async () => {
                let driver = await waitForDriver();
                let [page] = await driver.pages();
                if (page === undefined) {
                  page = await driver.newPage();
                }
                await page.setRequestInterception(true);
                page.on("request", (request) => {
                    console.log(request.url());
                    request.continue();
                });
                await page.goto(url);
                return {
                  model: InitialModelState,
                  real: { driver: driver, page: page }
                };
              };
              let spec: LTL.LTLFormula<TodoMVCModel> = LTL.And(initial, invariants, stateTransitions);
              try {
                await temporalAsyncModelRun(setup, cmds, spec);
              } catch (e) {
                let driver = await waitForDriver();
                const [page] = await driver.pages();
                if (page !== undefined && page.url().startsWith(url)) {
                  await page.evaluate(() => {
                    localStorage.clear();
                  });
                  await page.close();
                }
                throw e;
              }
              return true;
            })
            .afterEach(async () => {
              let driver = await waitForDriver();
              const [page] = await driver.pages();
              if (page !== undefined) {
                await page.evaluate(() => {
                  localStorage.clear();
                });
                await page.close();
              }
            }),
          {
            numRuns: 10,
            examples: [
              [
                [ new WaitC(), new FocusInputC(), new TypePendingText("a"), new TypePendingText("r"), new WaitC(), new CreateTodoC(), new CheckOneC(1), new WaitC(), new UncheckOneC(1), new WaitC() ]
              ],
              [
                [ new WaitC(), new FocusInputC(), new TypePendingText("a"), new TypePendingText("r"), new CreateTodoC(), new WaitC(), new EditTodoC(1), new WaitC(), new TypeEditText("c"), new TypeEditText("d"), new CommitEditC(), new WaitC() ]
              ],
              [
                [ new WaitC(), new TypePendingText("a"), new CreateTodoC(), new EditTodoC(1), new WaitC(), new WaitC(), new CheckOneC(1), new WaitC()]
              ],
              [[new WaitC(), new TypePendingText("b"), new CreateTodoC(), new TypePendingText("a"), new CreateTodoC(), new SelectFilterC(3)]],
              [[new WaitC(), new TypePendingText("a"), new CreateTodoC(), new CheckOneC(1), new TypePendingText("a"), new CreateTodoC(), new SelectFilterC(3), new TypePendingText("a"), new CreateTodoC(), new ToggleAllC(), new UncheckOneC(3)]],
              [[new WaitC(), new WaitC(), new WaitC(), new TypePendingText("b"), new CreateTodoC(), new TypePendingText("a"), new CreateTodoC(), new SelectFilterC(3), new WaitC(), new WaitC(), new WaitC()]],
            ],
            timeout: 60 * 1000,
            interruptAfterTimeLimit: 600 * 1000
          }
        );
      },
      700 * 1000
    );

});