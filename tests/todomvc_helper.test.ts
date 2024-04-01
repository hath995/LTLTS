import exp from "constants";
import * as LTL from "../src/index";
import * as fc from "fast-check";
import {
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
} from "./TodoMVCModel";

describe("enterNewTodoText", () => {

    let enterNewTodoText: LTL.LTLFormula<any> = LTL.Tag(
      "EnterNewTodoText",
      LTL.And(
        LTL.Tag(
          "newText",
          LTL.Comparison(
            (m, n) => m.newTodoInput !== null && n.newTodoInput !== null && m.newTodoInput.pendingText != n.newTodoInput.pendingText
          )
        ),
        LTL.Tag("UnchangedItems", LTL.Unchanged("items")),
        LTL.Tag("UnchangedSelectedFilter", LTL.Unchanged("selectedFilter"))
      )
    );
    let prev = {
        "loaded": true,
        "availableFilters": [
            "All",
            "Active",
            "Completed"
        ],
        "editInput": null,
        "isInEditMode": false,
        "itemInEditMode": null,
        "items": [
        ],
        "itemsInEditMode": [
        ],
        "itemsLeft": null,
        "lastItemText": null,
        "newTodoInput": {
            "active": true,
            "pendingText": ""
        },
        "numChecked": 0,
        "numInEditMode": 0,
        "numItems": 0,
        "numUnchecked": 0,
        "selectedFilter": "All",
        "todoCount": null,
        "toggleAllChecked": true,
        "toggleAllLabel": "Mark all as complete"
    };
    let next = {
        "loaded": true,
        "selectedFilter": "All",
        "items": [],
        "editInput": null,
        "lastItemText": null,
        "numItems": 0,
        "numUnchecked": 0,
        "numChecked": 0,
        "itemsInEditMode": [],
        "itemInEditMode": null,
        "numInEditMode": 0,
        "isInEditMode": false,
        "newTodoInput": {
          "pendingText": " ",
          "active": true
        },
        "todoCount": null,
        "itemsLeft": null,
        "availableFilters": [
          "All",
          "Active",
          "Completed"
        ],
        "toggleAllLabel": "Mark all as complete",
        "toggleAllChecked": true
      }
      it("should be true for this state transition", () => {
        // let result = LTL.ltlEvaluate([prev, next], enterNewTodoText); 
        // expect(result).toBe(LTL.DT);
        let gen = LTL.ltlEvaluateGenerator(enterNewTodoText, prev);
        gen.next();
        let result = gen.next(next);
        console.log(result);
        expect(result.value.validity).toBe(LTL.DT);
      });

      it("should satisfy one of these", () => {
        let properies = [
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
        ];
        for(let p of properies) {
          let gen = LTL.ltlEvaluateGenerator(p, prev);
          gen.next();
          let result = gen.next(next);
          console.log(result);
        //   expect(result.value.validity).toBe(LTL.DT);
        }
        // @ts-ignore
        let result = LTL.ltlEvaluate([prev, next], LTL.Or(...properies));
        console.log(result);
        expect(result).toBe(LTL.DT);
      });
});