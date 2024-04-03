import type { Browser, Page } from 'puppeteer';
import * as LTL from "../src/index";
import isEqual from 'lodash.isequal';

export type TodoMVCInstance = {
    driver: Browser;
    page: Page;
};

export type Ctor<T> = { new(...args: any[]): T; };
function findParentOfType(el: HTMLElement, typ: Ctor<HTMLElement>): HTMLElement | null {
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

function isVisibleOption(el: HTMLElement) {
    if (!(el instanceof HTMLOptionElement)) {
        return false;
    }
    const select = findParentOfType(el, HTMLSelectElement);
    return !!select && isElementVisible(select);
}

export function isElementVisible(el: HTMLElement): boolean {
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
function first<T>(x: T[]): T | null {
    return x.length !== 0 ? x[0] : null;
}
function last<T>(x: T[]): T | null {
    return x.length !== 0 ? x[x.length - 1] : null;
}
export const elementSelectors = {
    loaded() {
        return true;
    },
    selectedFilter() {
        let element = first(Array.from(document.querySelectorAll(".todoapp .filters a.selected")));
        return element ? (element as HTMLElement).textContent : null;
    },
    items() {
        let listItems = document.querySelectorAll(".todo-list li");
        return Array.from(listItems).flatMap((x, index) => {
            //check if css display is none
            let isEditing = x.classList.contains("editing");
            if (x instanceof HTMLElement && x.style.display !== "none" && (x.querySelector('label')?.style.display !== "none" || isEditing)) {

                return [{
                    index,
                    text: x.querySelector('label')!.textContent,
                    checked: x.querySelector<HTMLInputElement>('input[type="checkbox"]') === null ? false : x.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked,
                    isEditing
                }];
            }
            return [];
        });
    },
    editInput() {
        let element = first(Array.from(document.querySelectorAll(".todo-list .editing .edit")));
        return element !== null && isElementVisible(element as HTMLElement) ? { text: (element as HTMLElement).textContent, active: document.activeElement === element } : null;
    },
    lastItemText() {
        let item = last(this.items());
        return item ? item.text : null;
    },
    numItems() {
        return this.items().length;
    },
    numUnchecked() {
        return this.items().filter(x => !x.checked).length;
    },
    numChecked() {
        return this.items().filter(x => x.checked).length;
    },
    itemsInEditMode() {
        return this.items().filter(x => x.isEditing);
    },
    itemInEditMode() {
        return first(this.itemsInEditMode());
    },
    numInEditMode() {
        return this.itemsInEditMode().length;
    },
    isInEditMode() {
        return this.numInEditMode() > 0 && this.editInput() !== null;
    },
    newTodoInput() {
        let element = first(Array.from(document.querySelectorAll(".todoapp .new-todo")));
        return element !== null ? { pendingText: (element as HTMLInputElement).value, active: document.activeElement === element } : null;
    },
    todoCount() {
        let strong = first(Array.from(document.querySelectorAll(".todoapp .todo-count strong")).flatMap(x => {
            if (isElementVisible(x as HTMLElement)) {
                return [x.textContent];
            }
            return [];
        }));
        let t = strong !== null ? parseInt((strong as string).trim().split(" ")[0]) : null;
        return t;
    },
    itemsLeft() {
        let item = first(Array.from(document.querySelectorAll(".todoapp .todo-count")));
        return item !== null && isElementVisible(item as HTMLElement) ? (item as HTMLElement).innerText : null;
    },
    availableFilters() {
        let elements = document.querySelectorAll(".todoapp .filters a");
        return Array.from(elements).map(x => (x as HTMLElement).textContent);
    },
    toggleAllLabel() {
        let element = first(Array.from(document.querySelectorAll(".todoapp label[for=toggle-all]")));
        return element !== null ? (element as HTMLElement).textContent : null;
    },
    toggleAllChecked() {
        let elements = document.querySelectorAll(".todoapp #toggle-all");
        return elements !== null && Array.from(elements).some(x => (x as HTMLInputElement).checked);
    }
};
export function convert(obj: any): string {
    let ret = "{";

    for (let k in obj) {
        let v = obj[k];

        if (typeof v === "function") {
            v = v.toString();
            ret += `\n  ${v},`;
            continue;
        } else if (v instanceof Array) {
            v = JSON.stringify(v);
        } else if (typeof v === "object") {
            v = convert(v);
        } else {
            v = `"${v}"`;
        }

        ret += `\n  ${k}: ${v},`;
    }

    ret += "\n}";

    return ret;
}
export type TodoMVCModel = {
    [K in keyof typeof elementSelectors]: ReturnType<(typeof elementSelectors)[K]>;
};
export let initial: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("Initial", LTL.And(
    m => m.selectedFilter === "All",
    m => m.numItems === 0,
    m => m.newTodoInput !== null && m.newTodoInput.pendingText === "" && m.newTodoInput.active
));
export const hasFilters: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("HasFilters", LTL.Or(m => m.numItems === 0, m => isEqual(m.availableFilters, ["All", "Active", "Completed"])));
export const hasToggleAll: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("HasToggleAll", LTL.Implies(LTL.And(m => !m.isInEditMode, m => m.selectedFilter !== null), m => m.toggleAllLabel !== null));
export const correctFilterStates: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("CorrectFilterStates", LTL.And(
    LTL.Implies(m => m.selectedFilter === null, m => m.numItems === 0),
    LTL.Implies(m => m.selectedFilter === "All", m =>  m.todoCount === null || m.todoCount != null && m.todoCount === m.numUnchecked && m.todoCount <= m.numItems),
    LTL.Implies(m => m.selectedFilter === "Active", m =>  m.todoCount === null || m.todoCount != null && m.todoCount === m.numItems),
    LTL.Implies(m => m.selectedFilter === "Completed", LTL.True())
));
export const editModeHasItems: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("EditModeHasItems", LTL.Implies(m => m.isInEditMode, m => m.numItems > 0));
function hasWord(word: string, text: string) {
    return text.trim().split(" ").includes(word);
}
export const itemsLeftPluralized: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("ItemsLeftPluralized", LTL.And(
    LTL.Implies(m => m.todoCount == null, m => m.itemsLeft === null),
    LTL.Implies(m => m.todoCount === 1, m => m.itemsLeft !== null && hasWord("item", m.itemsLeft)),
    LTL.Implies(m => m.todoCount !== null && m.todoCount > 1, m => m.itemsLeft !== null && hasWord("items", m.itemsLeft))
));
export const invariants: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("Invariants", LTL.Always(LTL.And(
    hasFilters,
    hasToggleAll,
    correctFilterStates,
    editModeHasItems,
    itemsLeftPluralized
)));
export const unchangedAvailableFilters: LTL.LTLFormula<TodoMVCModel> = LTL.Unchanged("availableFilters");
export const unchangedPendingText: LTL.LTLFormula<TodoMVCModel> = LTL.Unchanged((m, n) => m.newTodoInput !== null && n.newTodoInput !== null && m.newTodoInput.pendingText === n.newTodoInput.pendingText);
export const unchangedTodoCount: LTL.LTLFormula<TodoMVCModel> = LTL.Unchanged("todoCount");
export const focusNewTodo: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(
        (m) => m.newTodoInput !== null && !m.newTodoInput.active,
        LTL.Next((m) => m.newTodoInput !== null && m.newTodoInput.active),
        LTL.Unchanged(["selectedFilter", "newTodoInput.pendingText", "items", "todoCount", "availableFilters"])
    )
;
export const enterNewTodoText: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(LTL.Comparison((m, n) => m.newTodoInput !== null && n.newTodoInput !== null && m.newTodoInput.pendingText != n.newTodoInput.pendingText), LTL.Unchanged("items"), LTL.Unchanged("selectedFilter"));
export const addNew: LTL.LTLFormula<TodoMVCModel> = LTL.And(
    (m) => m.newTodoInput !== null && m.newTodoInput.pendingText.trim() !== "",
    LTL.Next(m => m.newTodoInput !== null && m.newTodoInput.pendingText === ""),
    LTL.Next(m => m.selectedFilter !== null),
    LTL.And(
        LTL.Implies(m => m.selectedFilter === null, LTL.True()),
        LTL.Implies(m => m.selectedFilter === "All", LTL.And(LTL.Comparison((m, n) => n.lastItemText === m.newTodoInput!.pendingText.trim()), LTL.Unchanged("selectedFilter"))),
        LTL.Implies(m => m.selectedFilter === "Active", LTL.And(LTL.Comparison((m, n) => n.lastItemText === m.newTodoInput!.pendingText.trim()), LTL.Unchanged("selectedFilter"))),
        LTL.Implies(m => m.selectedFilter === "Completed", LTL.Unchanged(["selectedFilter", "items"]))
    )
)
;
export const changeFilter: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(LTL.Comparison((m, n) => m.selectedFilter !== n.selectedFilter), LTL.Unchanged((m, n) => m.newTodoInput !== null && n.newTodoInput !== null && m.newTodoInput.pendingText === n.newTodoInput.pendingText), LTL.And(
    LTL.Implies(m => m.selectedFilter === null, LTL.False()),
    LTL.Implies(m => m.selectedFilter === "All", LTL.Comparison((m, n) => m.numItems >= n.numItems)),
    LTL.Implies(m => m.selectedFilter === "Active", LTL.Next(m => m.selectedFilter === "All" || m.selectedFilter === "Completed")),
    LTL.Implies(m => m.selectedFilter === "Completed", LTL.Next(m => m.selectedFilter === "All" || m.selectedFilter === "Active"))
));
export const setSameFilter: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(LTL.Unchanged(["selectedFilter", "todoCount", "availableFilters"]), unchangedPendingText, LTL.Unchanged((m, n) => isEqual(m.items.map(x => x.text), n.items.map(x => x.text))));
export const checkOne: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(unchangedPendingText, LTL.Unchanged("selectedFilter"), LTL.And(
    LTL.Implies(m => m.selectedFilter === null || !["All", "Active"].includes(m.selectedFilter), LTL.False()),
    LTL.Implies(m => m.selectedFilter === "All", LTL.Tag("x", LTL.And(LTL.Unchanged("numItems"), LTL.Comparison((m, n) => n.numUnchecked < m.numUnchecked)))),
    LTL.Implies(m => m.selectedFilter === "Active", LTL.Tag("y", LTL.And(LTL.Comparison((m, n) => m.numUnchecked >= n.numUnchecked), LTL.Comparison((m, n) => m.todoCount !== null && n.todoCount !== null && m.todoCount >= n.todoCount))))
));
export const startEditing: LTL.LTLFormula<TodoMVCModel> = LTL.And<TodoMVCModel>(LTL.And((m) => m.numInEditMode === 1, LTL.Next((m) => m.numInEditMode === 1 && m.editInput !== null && m.editInput.active)), LTL.Unchanged("selectedFilter"), unchangedAvailableFilters, unchangedPendingText, unchangedTodoCount);
export const uncheckOne: LTL.LTLFormula<TodoMVCModel> = LTL.And(unchangedPendingText, LTL.Unchanged("selectedFilter"), LTL.And(
    LTL.Implies(m => m.selectedFilter === null || !["All", "Completed"].includes(m.selectedFilter), LTL.False()),
    LTL.Implies(m => m.selectedFilter === "All", LTL.Tag("z", LTL.And(LTL.Unchanged("numItems"), LTL.Comparison((m, n) => m.numUnchecked < n.numUnchecked)))),
    LTL.Implies(m => m.selectedFilter === "Completed", LTL.Tag("w", LTL.And(LTL.Comparison((m, n) => n.numItems < m.numItems), LTL.Comparison((m, n) => m.todoCount == null || n.todoCount == null || m.todoCount !== null && n.todoCount !== null && n.todoCount > m.todoCount))))

));
export const deleteOne: LTL.LTLFormula<TodoMVCModel> = LTL.And(
    unchangedPendingText,
    m => m.selectedFilter !== null,
    LTL.And(
        LTL.Implies(m => m.numItems === 0, LTL.False()),
        LTL.Implies(m => m.numItems === 1, LTL.Next(m => m.numItems === 0)),
        LTL.Implies(m => m.numItems > 1, LTL.And(
            LTL.Unchanged("selectedFilter"),
            LTL.Comparison((m, n) => n.numItems === m.numItems - 1),
            LTL.And(
                LTL.Implies(m => m.selectedFilter === "Active", LTL.Comparison((m, n) => m.todoCount != null && n.todoCount === m.todoCount - 1)),
                LTL.Implies(m => m.selectedFilter === "Completed", LTL.Unchanged("todoCount")),
                LTL.Implies(m => m.selectedFilter === "All", LTL.True())
            )
        ))
    )
);
export const toggleAll: LTL.LTLFormula<TodoMVCModel> = LTL.And(
    unchangedPendingText,
    LTL.Unchanged("selectedFilter"),
    LTL.Next(m => {
        if (m.toggleAllChecked) {
            return m.numItems === m.numChecked;
        } else {
            return m.numItems === m.numUnchecked;
        }
    }),
    LTL.And(
        LTL.Implies(m => m.selectedFilter === null, LTL.False()),
        LTL.Implies(m => m.selectedFilter === "All", LTL.And(
            LTL.Unchanged("numItems"),
            LTL.And(
                LTL.Implies(m => m.numUnchecked == 0, LTL.Comparison((m, n) => n.numUnchecked === m.numChecked)),
                LTL.Implies(m => m.numUnchecked > 0, LTL.Comparison((m, n) => n.numItems === m.numChecked))
            )
        )),
        LTL.Implies(m => m.selectedFilter === "Active", LTL.And(
            LTL.Implies(m => m.numUnchecked === 0, LTL.Next(n => n.numItems > 0)),
            LTL.Implies(m => m.numUnchecked > 0, LTL.Next(n => n.numItems === 0))
        )),
        LTL.Implies(m => m.selectedFilter === "Completed", LTL.And(
            LTL.Implies(m => m.todoCount === null, LTL.False()),
            LTL.Implies(m => m.todoCount === 0, LTL.Next(n => n.numItems === 0)),
            LTL.Implies(m => m.todoCount! > 0, LTL.Comparison((m, n) => n.numItems === m.numItems + m.todoCount!))
        ))
    )
);
export const enterEditText: LTL.LTLFormula<TodoMVCModel> = LTL.And(m => m.numInEditMode === 1,
    m => m.editInput !== null,
    LTL.Changed((m, n) => !isEqual(m.editInput, n.editInput)),
    LTL.Unchanged(["selectedFilter", "numInEditMode", "items", "numItems", "todoCount"])
);
var enterEditModeNext: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("EnterEditModeNext", LTL.Next(LTL.Bind(m => {
    let initialItem = m.itemInEditMode;
    return LTL.Until(enterEditText,LTL.Or(
        LTL.Tag("abortEdit", LTL.And(
            m => m.numInEditMode === 1,
            LTL.Next(m => m.numInEditMode === 0),
            LTL.Next(m => m.items[initialItem!.index] !== null && m.items[initialItem!.index].text === initialItem!.text),
        )),
        LTL.Tag("commitEdit", LTL.And(
            m => m.numInEditMode === 1,
            LTL.Next(m => m.numInEditMode === 0),
            LTL.And(
                LTL.Implies(m => m.editInput === null, LTL.False()),
                LTL.Implies(m => m.editInput !== null && m.editInput.text === "", LTL.Comparison((m, n) => n.numItems -1 === m.numItems)),
                LTL.Implies(m => m.editInput !== null && m.editInput.text !== "", LTL.And(
                    LTL.Unchanged("numItems"),
                    LTL.Next(m => m.items[initialItem!.index] !== null && m.items[initialItem!.index].text === initialItem!.text),
                )),
            ),
            LTL.Unchanged(["selectedFilter", "availableFilters", "newTodoInput.pendingText"])
            )
        ))
    )
}))); 
export const enterEditMode: LTL.LTLFormula<TodoMVCModel> = LTL.And(startEditing, enterEditModeNext);
export const editModeTransition: LTL.LTLFormula<TodoMVCModel> = LTL.And((m) => m.numInEditMode === 1, LTL.Next((m) => m.numInEditMode === 1 || m.numInEditMode === 0));
export const stateTransitions: LTL.LTLFormula<TodoMVCModel> = LTL.Tag("StateTransitions", LTL.Always(LTL.Or(
    focusNewTodo,
    enterNewTodoText,
    addNew,
    changeFilter,
    setSameFilter,
    checkOne,
    uncheckOne,
    deleteOne,
    toggleAll,
    enterEditMode,
    editModeTransition
)));
