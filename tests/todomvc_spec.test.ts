import puppeteer from 'puppeteer';
import type {Frame, ElementHandle, KeyInput} from 'puppeteer';
import * as LTL from "../src/index";
import * as fc from "fast-check";
import { temporalAsyncModelRun } from "../src/ltlModelRunner";
import { waitForDriver, waitForQuitAllDrivers, wait } from "./puppeteer_utils";
import { TodoMVCModel, TodoMVCInstance, convert, elementSelectors, initial, invariants, stateTransitions } from './TodoMVCModel';

// let url = ["https://todomvc.com/examples/react/dist/"]
let url = ["https://todomvc.com/examples/jquery/dist"]




const InitialModelState: TodoMVCModel = {
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

class WaitCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return true
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await wait(20);
        await updateState(m, r);
        // console.log(m);
    }
    toString(): string {
        return "Wait";
    }
}

class FocusInputCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return !m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.focus(".todoapp .new-todo");
        await updateState(m, r);
    }
    toString(): string {
        return "FocusInput";
    }
}

class TypePendingText implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public text: KeyInput) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.newTodoInput !== null && m.newTodoInput.active
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
        return m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press(this.text);
        await updateState(m, r);
    }
    toString(): string {
        return `TypeEditText(${this.text})`;
    }
}

class CreateTodoCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.newTodoInput !== null && m.newTodoInput.active && m.newTodoInput.pendingText !== ""
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Enter", {delay: 100});
        await updateState(m, r);
    }
    toString(): string {
        return "CreateTodo";
    }
}

class CheckOneCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.numItems > 0 && m.numUnchecked > 0 && !m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(".todo-list li input[type='checkbox']:not(:checked)");
        await updateState(m, r);
    }
    toString(): string {
        return "CheckOne";
    }
}

class UncheckOneCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.numItems > 0 && m.numChecked > 0 && !m.isInEditMode
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(".todo-list li input[type='checkbox']:checked");
        await updateState(m, r);
    }
    toString(): string {
        return "UncheckOne";
    }
}

class ToggleAllCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return !m.isInEditMode && m.numItems > 0
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(".todoapp label[for=toggle-all]");
        await updateState(m, r);
    }
    toString(): string {
        return "ToggleAll";
    }
}

class DeleteTodoCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return !m.isInEditMode && m.numItems > 0 && this.index < m.numItems
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.hover(`.todo-list li:nth-child(${this.index+1})`);
        await r.page.click(`.todo-list li:nth-child(${this.index+1}) button.destroy`);
        await updateState(m, r);
    }
    toString(): string {
        return `Delete(${this.index})`;
    }
}

class SelectFilterCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public ordinal: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return !m.isInEditMode && m.numItems > 0
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todoapp .filters li:nth-child(${this.ordinal}) a`);
        await updateState(m, r);
    }
    toString(): string {
        return `SelectFilter(${this.ordinal})`;
    }
}

class CommitEditCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.isInEditMode;
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Enter", {delay: 100});
        await updateState(m, r);
    }
    toString(): string {
        return "CommitEdit";
    }
}

class AbortEditCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    async check(m: TodoMVCModel): Promise<boolean> {
        return m.isInEditMode;
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.keyboard.press("Escape", {delay: 100});
        await updateState(m, r);
    }
    toString(): string {
        return "AbortEdit";
    }
}

class EditTodoCommand implements fc.AsyncCommand<TodoMVCModel, TodoMVCInstance, true> {
    constructor(public index: number) {}
    async check(m: TodoMVCModel): Promise<boolean> {
        return !m.isInEditMode && m.numItems > 0 && this.index-1 < m.numItems
    }
    async run(m: TodoMVCModel, r: TodoMVCInstance): Promise<void> {
        await r.page.click(`.todo-list :nth-child(${this.index}) label`, {clickCount: 2});
        await updateState(m, r);
    }
    toString(): string {
        return `Edit(${this.index})`;
    }
}

let commands = [
    fc.constant(new WaitCommand),
    fc.constant(new FocusInputCommand),
    fc.constant(new CreateTodoCommand),
    fc.constant(new CheckOneCommand),
    fc.constant(new UncheckOneCommand),
    fc.constant(new ToggleAllCommand),
    fc.constant(new CommitEditCommand),
    fc.constant(new AbortEditCommand),
    ...(["c","d"," ","Backspace"] as KeyInput[]).map(x => fc.constant(new TypeEditText(x))),
    ...([1,2,3] as number[]).map(x => fc.constant(new SelectFilterCommand(x))),
    ...[1,2,3,4,5,6,7,8,9].map(x => fc.constant(new DeleteTodoCommand(x))),
    ...[1,2,3,4,5,6,7,8,9].map(x => fc.constant(new EditTodoCommand(x))),
    ...(["a","b"," ","Backspace"] as KeyInput[]).map(x => fc.constant(new TypePendingText(x)))
];
describe('TodoMVC', () => {
    afterEach(async () => {
      await waitForQuitAllDrivers();
    });

    it("should follow the specification", async () => {
    // try {
        let i = 1;
        await fc.assert(
            fc.asyncProperty(fc.commands(commands,{size:"+2"}), async (cmds) => {
                console.log("Running test", i++);
                let setup: () => Promise<{
                    model: TodoMVCModel,
                    real: TodoMVCInstance
                }> = async () => {
                    let driver = await waitForDriver();
                    let [page] = await driver.pages();
                    if (page === undefined) {
                        page = await driver.newPage();
                    }
                    await page.goto(url[0]);
                    return {
                        model: InitialModelState,
                        real: { driver: driver, page: page }
                    };
                }
                let spec: LTL.LTLFormula<TodoMVCModel> = LTL.And(initial, invariants, stateTransitions);
                await temporalAsyncModelRun(setup, cmds, spec);
                return true;
            }).afterEach(async () => {
                    let driver = await waitForDriver();
                    const [page] = await driver.pages();
                    await page.close();
            }), {numRuns: 10,
                examples: [
                    [[new WaitCommand(), new FocusInputCommand(), new TypePendingText("a"), new TypePendingText("r"), new WaitCommand(), new CreateTodoCommand(), new WaitCommand()]],
                    [[new FocusInputCommand(), new TypePendingText("a"), new TypePendingText("r"), new CreateTodoCommand(),  new WaitCommand(), new EditTodoCommand(1), new WaitCommand(), new TypeEditText('c'), new TypeEditText('d'), new CommitEditCommand(), new WaitCommand()]],
                    [[new TypePendingText("a"), new CreateTodoCommand(), new EditTodoCommand(1), new WaitCommand(), new WaitCommand(), new CheckOneCommand(), new WaitCommand()]],
                ],
                // timeout: 60*1000,
                interruptAfterTimeLimit: 60*1000
            });
        // } catch (e) {
        //     console.error(e);
        //     await waitForQuitAllDrivers();
        //     throw e;

        // }
    }, 70*1000);

});