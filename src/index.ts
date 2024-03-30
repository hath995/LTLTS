import isEqual from "lodash.isequal";

export type Predicate<A> = (state: A) => boolean;

export type LTLPredicate<A> = {
  kind: "pred";
  pred: (state: A) => boolean;
};

export type LTLAnd<A> = {
  kind: "and";
  term1: LTLFormula<A>;
  term2: LTLFormula<A>;
};

export type LTLOr<A> = {
  kind: "or";
  term1: LTLFormula<A>;
  term2: LTLFormula<A>;
};

export type LTLNot<A> = {
  kind: "not";
  term: LTLFormula<A>;
};

export type LTLTrue = {
  kind: "true";
};

export type LTLFalse = {
  kind: "false";
};

export type LTLEventually<A> = {
  kind: "eventually";
  steps: number;
  term: LTLFormula<A>;
};

export type LTLHenceforth<A> = {
  kind: "henceforth";
  steps: number;
  term: LTLFormula<A>;
};

export type LTLUntil<A> = {
  kind: "until";
  steps: number;
  condition: LTLFormula<A>;
  term: LTLFormula<A>;
};

export type LTLRelease<A> = {
  kind: "release";
  steps: number;
  condition: LTLFormula<A>;
  term: LTLFormula<A>;
};

export type LTLComparison<A> = {
  kind: "comparison";
  pred: (state: A, nextState: A) => boolean;
};

export type LLTLRequiredNext<A> = {
  kind: "req-next";
  term: LTLFormula<A>;
};

export type LLTLWeakNext<A> = {
  kind: "weak-next";
  term: LTLFormula<A>;
};

export type LLTLStrongNext<A> = {
  kind: "strong-next";
  term: LTLFormula<A>;
};

export type Tagged = {tag?: string, tags?: Set<string>};

export type LTLFormula<A> =
  (| LTLPredicate<A>
  | LTLTrue
  | LTLFalse
  | LTLAnd<A>
  | LTLOr<A>
  | LTLNot<A>
  | LTLComparison<A>
  | LTLEventually<A>
  | LTLHenceforth<A>
  | LTLRelease<A>
  | LTLUntil<A>
  | LLTLRequiredNext<A>
  | LLTLWeakNext<A>
  | LLTLStrongNext<A>) & Tagged;

export const DT: Validity = { kind: "definitely", value: true }; //Definitely True
export const PT: Validity = { kind: "probably", value: true }; //Probably True
export const PF: Validity = { kind: "probably", value: false }; //Probably False
export const DF: Validity = { kind: "definitely", value: false }; //Definitely False

export type Validity = { kind: "definitely"; value: boolean } | { kind: "probably"; value: boolean };
export function Definitely(value: boolean): Validity {
  return { kind: "definitely", value };
}

export function Probably(value: boolean): Validity {
  return { kind: "probably", value };
}

//four valued logic

export function FVOr(fv1: Validity, fv2: Validity): Validity {
  if ((fv1.kind === "definitely" && fv1.value) || (fv2.kind === "definitely" && fv2.value)) {
    return DT;
  } else if ((fv1.kind === "probably" && fv1.value) || (fv2.kind === "probably" && fv2.value)) {
    return PT;
  } else if ((fv1.kind === "probably" && !fv1.value) || (fv2.kind === "probably" && !fv2.value)) {
    return PF;
  } else {
    return DF;
  }
}

export function FVAnd(fv1: Validity, fv2: Validity): Validity {
  if (fv1.kind === "definitely" && fv2.kind === "definitely" && fv1.value && fv2.value) {
    return DT;
  } else if ((fv1.kind === "definitely" && !fv1.value) || (fv2.kind === "definitely" && !fv2.value)) {
    return DF;
  } else if ((fv1.kind === "probably" && !fv1.value) || (fv2.kind === "probably" && !fv2.value)) {
    return PF;
  } else {
    return PT;
  }
}

export function FVNot(fv: Validity): Validity {
  if (fv.kind === "definitely") {
    return Definitely(!fv.value);
  } else {
    return Probably(!fv.value);
  }
}

export function Tag<T>(tag: string, expr: LTLFormula<T>): LTLFormula<T> {
  return {...expr, tag};
}

export function Predicate<A>(pred: Predicate<A>): LTLPredicate<A> {
  return {
    kind: "pred",
    pred
  };
}

export function And<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>, ...rest: (LTLFormula<A> | Predicate<A>)[]): LTLAnd<A> {
  let t1 = typeof term1 !== "function" ? term1 : Predicate(term1);
  let t2 = typeof term2 !== "function" ? term2 : Predicate(term2);
  if(rest.length > 0) {
    return And(t1, And(t2, rest[0], ...rest.slice(1)));
  }
  return {
    kind: "and",
    term1: t1,
    term2: t2
  };
}

export function Or<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>, ...rest: (LTLFormula<A> | Predicate<A>)[]): LTLOr<A> {
  let t1 = typeof term1 !== "function" ? term1 : Predicate(term1);
  let t2 = typeof term2 !== "function" ? term2 : Predicate(term2);
  if(rest.length > 0) {
    return Or(t1, Or(t2, rest[0], ...rest.slice(1)));
  }
  return {
    kind: "or",
    term1: t1,
    term2: t2
  };
}

export function Not<A>(term1: LTLFormula<A> | Predicate<A>): LTLNot<A> {
  let t1 = typeof term1 !== "function" ? term1 : Predicate(term1);
  return {
    kind: "not",
    term: t1
  };
}

export function Implies<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>): LTLOr<A> {
  let t1 = typeof term1 !== "function" ? term1 : Predicate(term1);
  let t2 = typeof term2 !== "function" ? term2 : Predicate(term2);
  return Or(Not(t1), t2);
}

const LTLTrue: LTLTrue = {
  kind: "true"
};
export function True(): LTLTrue {
  return LTLTrue;
}

const LTLFalse: LTLFalse = {
  kind: "false"
};

export function False(): LTLFalse {
  return LTLFalse;
}

export function isTrue(expr: LTLFormula<any>): expr is LTLTrue {
  return expr === LTLTrue || expr.kind === "true";
}

export function isFalse(expr: LTLFormula<any>): expr is LTLFalse {
  return expr === LTLFalse || expr.kind === "false";
}

/**
 *
 * @param term - formula or predicate to be evaluated in the next state
 * @returns formula that must be true in the next state
 */
export function Next<A>(term: LTLFormula<A> | Predicate<A>): LLTLWeakNext<A> {
  return WeakNext(term);
}
/**
 *
 * @param pred - function to test equality between two states
 * @returns boolean value of the comparison
 */
export function Unchanged<A extends object>(pred: (string | number | symbol)[]): LTLComparison<A>
export function Unchanged<A extends object, B extends keyof A>(pred: B): LTLComparison<A>
export function Unchanged<A>(pred: (state: A, nextState: A) => boolean): LTLComparison<A>
export function Unchanged<A>(pred: ((state: A, nextState: A) => boolean) | keyof A | (string | number | symbol)[]): LTLComparison<A> {
  if(Array.isArray(pred)) {
    return {
      kind: "comparison",
      pred: (state: A, nextState: A) => pred.every(p => {
        if (typeof p === "number" || typeof p === "symbol") {
          // @ts-expect-error
          if (p in state && p in nextState) {
            // @ts-expect-error
            return isEqual(state[p], nextState[p]);
          } else {
            throw new Error(`Property ${String(p)} not found in state or nextState`);
          }
        } else if (typeof p === "string") {
          let propertyParts = p.split(".");
          let stateCurrent = state;
          let nextStateCurrent = nextState;
          for (let i = 0; i < propertyParts.length; i++) {
            // @ts-expect-error
            if (propertyParts[i] in stateCurrent && propertyParts[i] in nextStateCurrent) {
              // @ts-expect-error
              stateCurrent = stateCurrent[propertyParts[i]];
              // @ts-expect-error
              nextStateCurrent = nextStateCurrent[propertyParts[i]];
            } else {
              throw new Error(`Property ${p} not found in state or nextState`);
            }
          }
          return isEqual(stateCurrent, nextStateCurrent);
        }
      })
    };
  }
  if(typeof pred === "string" || typeof pred === "number" || typeof pred === "symbol") {
    return {
      kind: "comparison",
      pred: (state: A, nextState: A) => state[pred] === nextState[pred]
    };
  }
  return {
    kind: "comparison",
    pred
  };
}

/**
 * 
 * @param pred - function to test inequality between two states or properties
 */
export function Changed<A extends object>(pred: (string | number | symbol)[]): LTLComparison<A>
export function Changed<A extends object, B extends keyof A>(pred: B): LTLComparison<A>
export function Changed<A>(pred: (state: A, nextState: A) => boolean): LTLComparison<A>
export function Changed<A>(pred: ((state: A, nextState: A) => boolean) | keyof A | (string | number | symbol)[]): LTLComparison<A> {
  if(Array.isArray(pred)) {
    return {
      kind: "comparison",
      pred: (state: A, nextState: A) => pred.every(p => {
        if (typeof p === "number" || typeof p === "symbol") {
          // @ts-expect-error
          if (p in state && p in nextState) {
            // @ts-expect-error
            return !isEqual(state[p], nextState[p]);
          } else {
            throw new Error(`Property ${String(p)} not found in state or nextState`);
          }
        } else if (typeof p === "string") {
          let propertyParts = p.split(".");
          let stateCurrent = state;
          let nextStateCurrent = nextState;
          for (let i = 0; i < propertyParts.length; i++) {
            // @ts-expect-error
            if (propertyParts[i] in stateCurrent && propertyParts[i] in nextStateCurrent) {
              // @ts-expect-error
              stateCurrent = stateCurrent[propertyParts[i]];
              // @ts-expect-error
              nextStateCurrent = nextStateCurrent[propertyParts[i]];
            } else {
              throw new Error(`Property ${p} not found in state or nextState`);
            }
          }
          return !isEqual(stateCurrent, nextStateCurrent);
        }
      })
    };
  }
  if(typeof pred === "string" || typeof pred === "number" || typeof pred === "symbol") {
    return {
      kind: "comparison",
      pred: (state: A, nextState: A) => state[pred] !== nextState[pred]
    };
  }
  return {
    kind: "comparison",
    pred
  };
}

/**
 *
 * @param pred function to test comparison between two states
 * @returns boolean value of the comparison
 */
export function Comparison<A>(pred: (state: A, nextState: A) => boolean): LTLComparison<A> {
  return {
    kind: "comparison",
    pred
  };
}

export function Eventually<A>(term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLEventually<A> {
  let t1 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "eventually",
    steps,
    term: t1
  };
}

export function Henceforth<A>(term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLHenceforth<A> {
  let t1 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "henceforth",
    steps,
    term: t1
  };
}

export function Until<A>(condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLUntil<A> {
  let t1 = typeof condition !== "function" ? condition : Predicate(condition);
  let t2 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "until",
    steps,
    condition: t1,
    term: t2
  };
}

export function Release<A>(condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLRelease<A> {
  let t1 = typeof condition !== "function" ? condition : Predicate(condition);
  let t2 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "release",
    steps,
    condition: t1,
    term: t2
  };
}

export function RequiredNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLRequiredNext<A> {
  let t1 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "req-next",
    term: t1
  };
}

export function WeakNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLWeakNext<A> {
  let t1 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "weak-next",
    term: t1
  };
}

export function StrongNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLStrongNext<A> {
  let t1 = typeof term !== "function" ? term : Predicate(term);
  return {
    kind: "strong-next",
    term: t1
  };
}

export function NegatedFormula<A>(expr: LTLEventually<A> | LTLHenceforth<A> | LTLUntil<A> | LTLRelease<A>): LTLFormula<A> {
  switch (expr.kind) {
    case "eventually":
      return Henceforth(Not(expr.term), expr.steps);
    case "henceforth":
      return Eventually(Not(expr.term), expr.steps );
    case "until":
      return Release(Not(expr.condition), Not(expr.term), expr.steps);
    case "release":
      return Until(Not(expr.condition), Not(expr.term), expr.steps);
  }
}

export function stepTrue<A>(expr: LTLTrue): LTLTrue {
  return LTLTrue;
}

export function stepFalse<A>(expr: LTLFalse): LTLFormula<A> {
  let tags = collectTags(expr);
  return applyTags(LTLFalse, tags);
}

export function stepPred<A>(expr: LTLPredicate<A> & Tagged, state: A): LTLFormula<A> {
  if (expr.pred(state)) {
    return True();
  } else {
    let tags = collectTags(expr);
    return tags.size == 0 ? False() : applyTags(False(), tags);
  }
}

function collectTags(expr: LTLFormula<any>): Set<string> {
  if(expr.tag && expr.tags) {
    //return [expr.tag].concat(expr.tags);
    return new Set([...expr.tags, expr.tag]);
  }
  if (expr.tag) {
    return new Set([expr.tag]);
  }
  if (expr.tags) {
    return expr.tags;
  }
  return new Set();

}

function applyTags(expr: LTLFormula<any>, tags: Set<string>): LTLFormula<any> {
  if (tags.size === 0) {
    return expr;
  }
  return {...expr, tags: expr.tags ? new Set([...expr.tags,...tags]) : tags};
}

export function stepAnd<A>(expr: LTLAnd<A>, state: A): LTLFormula<A> {
  let term1 = step(expr.term1, state);
  let term2 = step(expr.term2, state);
  if (isFalse(term1) || isFalse(term2)) {
    let ownTags = collectTags(expr);
    let tags = isFalse(term1) && isFalse(term2) ? new Set([...collectTags(term1),...collectTags(term2)]) : isFalse(term1) ? collectTags(term1) : collectTags(term2);
    return applyTags(False(), new Set([...ownTags, ...tags]));
  } else if (isTrue(term1) && isTrue(term2)) {
    return True();
  } else if (isTrue(term1)) {
    let ownTags = collectTags(expr);
    return applyTags(term2, ownTags);
  } else if (isTrue(term2)) {
    let ownTags = collectTags(expr);
    return applyTags(term1, ownTags);
  }
  if (isGuarded(term1) && isGuarded(term2)) {
    let ownTags = collectTags(expr);
    let term1tags = collectTags(term1);
    let term2tags = collectTags(term2);
    return strongestNext(term1, term2)(applyTags(And(applyTags(term1.term, term1tags), applyTags(term2.term, term2tags)), ownTags));
  }
  throw new Error("GOT TO AND BAD SITUATION")
}

export function strongestNext<A>(term1: LTLFormula<A>, term2: LTLFormula<A>) {
  if (term1.kind === "req-next" || term2.kind === "req-next") {
    return RequiredNext;
  }
  if (term1.kind === "strong-next" || term2.kind === "strong-next") {
    return StrongNext;
  }
  return WeakNext;
}

export function stepOr<A>(expr: LTLOr<A>, state: A): LTLFormula<A> {
  let term1 = step(expr.term1, state);
  let term2 = step(expr.term2, state);
  if (isTrue(term1) || isTrue(term2)) {
    return True();
  } else if (isFalse(term1) && isFalse(term2)) {
    let tags = new Set([...collectTags(expr), ...collectTags(term1), ...collectTags(term2)]);
    return applyTags(False(), tags);
  } else if (isFalse(term1)) {
    let tags = new Set([...collectTags(expr),...collectTags(term1)]);
    return applyTags(term2, tags);
  } else if (isFalse(term2)) {
    let tags = new Set([...collectTags(expr),...collectTags(term2)]);
    return applyTags(term1, tags);
  }
  if (isGuarded(term1) && isGuarded(term2)) {
    // let tags = new Set([...collectTags(expr), ...collectTags(term1), ...collectTags(term2)]);
    let ownTags = collectTags(expr);
    let term1tags = collectTags(term1);
    let term2tags = collectTags(term2);
    return strongestNext(term1, term2)(applyTags(Or(applyTags(term1.term, term1tags), applyTags(term2.term, term2tags)), ownTags));
  }
  throw new Error("GOT TO OR BAD SITUATION")
}

export function stepNot<A>(expr: LTLNot<A>, state: A): LTLFormula<A> {
  if (isTemporalOperator(expr.term)) {
    let neg = NegatedFormula(expr.term);
    let ownTags = collectTags(expr);
    return step(applyTags(neg, ownTags), state);
  }
  let termTags = collectTags(expr.term);
  let term = step(expr.term, state);
  let ownTags = collectTags(expr);
  let tags = collectTags(term);
  if (isTrue(term)) {
    return applyTags(False(), new Set([...ownTags, ...tags, ...termTags]));
  } else if (isFalse(term)) {
    return applyTags(True(), new Set([...ownTags, ...tags,...termTags]));
  } else if (isGuarded(term)) {
    return strongestNext(term, term)(applyTags(Not(term.term), new Set([...ownTags, ...tags,...termTags])));
  }
  return Not(step(expr.term, state));
}

export function stepNext<A>(expr: LLTLRequiredNext<A>, state: A): LTLFormula<A> {
  return expr;
}

export function stepWeakNext<A>(expr: LLTLWeakNext<A>, state: A): LTLFormula<A> {
  return expr;
}

export function stepStrongNext<A>(expr: LLTLStrongNext<A>, state: A): LTLFormula<A> {
  return expr;
}

/**
 * Decremented steps for the temporal operators that have evaluated not to false in the previous state
 * @param expr - LTL formula
 * @returns LTL formula with decremented steps
 */
function decrementSteps<A>(expr: LTLFormula<A>): LTLFormula<A> {
  if (isTemporalOperator(expr) && expr.steps === 0) {
    return expr;
  }
  switch (expr.kind) {
    case "eventually":
      return Eventually(expr.term, expr.steps - 1);
    case "henceforth":
      return Henceforth(expr.term, expr.steps - 1);
    case "until":
      return Until(expr.condition, expr.term, expr.steps - 1);
    case "release":
      return Release(expr.condition, expr.term, expr.steps - 1);
    case "and":
      return And(decrementSteps(expr.term1), decrementSteps(expr.term2));
    case "or":
      return Or(decrementSteps(expr.term1), decrementSteps(expr.term2));
    case "not":
      return Not(decrementSteps(expr.term));
    case "req-next":
      return RequiredNext(decrementSteps(expr.term));
    case "weak-next":
      return WeakNext(decrementSteps(expr.term));
    case "strong-next":
      return StrongNext(decrementSteps(expr.term));
    default:
      return expr;
  }
}

export function stepEventually<A>(expr: LTLEventually<A>, state: A): LTLFormula<A> {
  let ownTags = collectTags(expr);
  if (expr.term.kind === "eventually") {
    expr = Eventually(expr.term.term, Math.max(expr.steps, expr.term.steps));
  }
  if (expr.steps === 0) {
    let term = step(expr.term, state);
    if (isTrue(term)) {
      return True();
    } else if (isFalse(term)) {
      return applyTags(StrongNext(expr), ownTags);
    } else if (isGuarded(term)) {
      return applyTags(StrongNext(Eventually(expr.term, expr.steps)), ownTags);
    }
    return Or(term, StrongNext(expr));
  } else {
    let term = step(expr.term, state);
    if (isTrue(term)) {
      return term;
    } else if (isFalse(term)) {
      return applyTags(RequiredNext(Eventually(expr.term, expr.steps - 1)), ownTags);
    } else if (isGuarded(term)) {
      return applyTags(RequiredNext(Eventually(expr.term, expr.steps - 1)), ownTags);
    }
    return Or(term, applyTags(RequiredNext(Eventually(expr.term, expr.steps - 1)), ownTags));
  }
}

export function stepHenceforth<A>(expr: LTLHenceforth<A>, state: A): LTLFormula<A> {
  if (expr.term.kind === "henceforth") {
    expr = Henceforth(expr.term.term, Math.max(expr.steps, expr.term.steps));
  }
  let term = step(expr.term, state);
  let ownTags = collectTags(expr);
  let tags = new Set([...ownTags, ...collectTags(term)]);
  if (isFalse(term)) {
    return applyTags(False(), tags);
  }
  if (expr.steps === 0) {
    if (containsTemporalOperator(expr.term)) {
      return step(applyTags(And(expr.term, WeakNext(Henceforth(decrementSteps(expr.term), expr.steps))), tags), state);
    }
    return step(applyTags(And(expr.term, WeakNext(expr)), tags), state);
  } else {
    if (containsTemporalOperator(expr.term)) {
      return step(applyTags(And(expr.term, WeakNext(Henceforth(decrementSteps(expr.term), expr.steps - 1))), tags), state);
    }
    return step(applyTags(And(expr.term, RequiredNext(Henceforth(expr.term, expr.steps - 1))), tags), state);
  }
}

export function stepUntil<A>(expr: LTLUntil<A>, state: A): LTLFormula<A> {
  let tags = collectTags(expr);
  if (expr.steps === 0) {
    if (containsTemporalOperator(expr.condition)) {
      return step(applyTags(Or(expr.term, And(expr.condition, StrongNext(Until(decrementSteps(expr.condition), expr.term, expr.steps)))), tags), state);
    }
    return step(applyTags(Or(expr.term, And(expr.condition, StrongNext(expr))), tags), state);
  } else {
    if (containsTemporalOperator(expr.condition)) {
      return step(
        applyTags(Or(expr.term, And(expr.condition, RequiredNext(Until(decrementSteps(expr.condition), expr.term, expr.steps - 1)))), tags),
        state
      );
    }
    return step(applyTags(Or(expr.term, And(expr.condition, RequiredNext(Until(expr.condition, expr.term, expr.steps - 1)))), tags), state);
  }
}

export function stepRelease<A>(expr: LTLRelease<A>, state: A): LTLFormula<A> {
  let tags = collectTags(expr);
  if (expr.steps === 0) {
    if (containsTemporalOperator(expr.term)) {
      //prevent infinite step recursion by reducing the number of steps
      return step(applyTags(And(expr.term, Or(expr.condition, WeakNext(Release(expr.condition, decrementSteps(expr.term), expr.steps)))), tags), state);
    }
    return step(applyTags(And(expr.term, Or(expr.condition, WeakNext(expr))), tags), state);
  } else {
    if (containsTemporalOperator(expr.term)) {
      return step(
        applyTags(And(expr.term, Or(expr.condition, RequiredNext(Release(expr.condition, decrementSteps(expr.term), expr.steps - 1)))), tags),
        state
      );
    }
    return step(applyTags(And(expr.term, Or(expr.condition, RequiredNext(Release(expr.condition, expr.term, expr.steps - 1)))), tags), state);
  }
}

export function stepComparison<A>(expr: LTLComparison<A>, state: A): LTLFormula<A> {
  let tags = collectTags(expr);
  return WeakNext(applyTags(Predicate((nextState: A) => expr.pred(state, nextState)), tags));
}

export function step<A>(expr: LTLFormula<A>, state: A): LTLFormula<A> {
  switch (expr.kind) {
    case "pred":
      return stepPred(expr, state);
    case "true":
      return LTLTrue;
    case "false":
      return stepFalse(expr);
    case "and":
      return stepAnd(expr, state);
    case "or":
      return stepOr(expr, state);
    case "not":
      return stepNot(expr, state);
    case "comparison":
      return stepComparison(expr, state);
    case "req-next":
      return stepNext(expr, state);
    case "weak-next":
      return stepWeakNext(expr, state);
    case "strong-next":
      return stepStrongNext(expr, state);
    case "eventually":
      return stepEventually(expr, state);
    case "henceforth":
      return stepHenceforth(expr, state);
    case "until":
      return stepUntil(expr, state);
    case "release":
      return stepRelease(expr, state);
  }
}

export function containsTemporalOperator<A>(expr: LTLFormula<A>): boolean {
  if (isTemporalOperator(expr)) {
    return true;
  }
  if (expr.kind === "and" || expr.kind === "or") {
    return containsTemporalOperator(expr.term1) || containsTemporalOperator(expr.term2);
  }
  if (expr.kind === "not") {
    return containsTemporalOperator(expr.term);
  }
  return false;
}

export function isTemporalOperator<A>(expr: LTLFormula<A>): expr is LTLEventually<A> | LTLHenceforth<A> | LTLUntil<A> | LTLRelease<A> {
  return expr.kind === "eventually" || expr.kind === "henceforth" || expr.kind === "until" || expr.kind === "release";
}

export function isGuarded<A>(expr: LTLFormula<A>): expr is LLTLRequiredNext<A> | LLTLWeakNext<A> | LLTLStrongNext<A> {
  return expr.kind === "req-next" || expr.kind === "weak-next" || expr.kind === "strong-next";
}

export function isDetermined<A>(expr: LTLFormula<A>): boolean {
  return expr.kind === "true" || expr.kind === "false";
}

export function ltlEvaluate<A>(states: A[], formula: LTLFormula<A>): Validity {
  if (states.length === 0) {
    return Definitely(false);
  }
  let expr = step(formula, states[0]);
  if (!isGuarded(expr) && !isDetermined(expr)) {
    console.warn(expr);
    throw new Error("The formula is not guarded.");
  }
  let i = 1;
  while (!isDetermined(expr) && i < states.length) {
    if (isGuarded(expr)) {
      expr = step(expr.term, states[i]);
    } else {
      console.warn(expr);
      throw new Error("The formula is not guarded.");
    }
    i++;
  }

  return evaluateValidity(expr);
}

type PartialValidity = {
  requiresNext: boolean;
  validity: Validity;
  tags: Set<string>;
};

/**
 *
 * @param formula - LTL formula
 * @returns //number of states required to evaluate the formula
 */
export function requiredSteps<A>(formula: LTLFormula<A>): number {
  switch (formula.kind) {
    case "eventually":
      return formula.steps + 1 + requiredSteps(formula.term);
    case "henceforth":
      return formula.steps + 1 + requiredSteps(formula.term);
    case "until":
      return Math.max(formula.steps + 1, requiredSteps(formula.term) + requiredSteps(formula.condition));
    case "release":
      return Math.max(formula.steps + 1, requiredSteps(formula.term) + requiredSteps(formula.condition));
    case "and":
      return Math.max(requiredSteps(formula.term1), requiredSteps(formula.term2));
    case "or":
      return Math.max(requiredSteps(formula.term1), requiredSteps(formula.term2));
    case "not":
      return requiredSteps(formula.term);
    case "req-next":
      return 1 + requiredSteps(formula.term);
    case "weak-next":
      return requiredSteps(formula.term);
    case "strong-next":
      return requiredSteps(formula.term);
    default:
      return 0;
  }
}
/**
 *
 * @param formula - LTL formula
 * @returns determines if the formula has evaluated enough states
 */
export function requiresNext(formula: LTLFormula<any>): boolean {
  switch (formula.kind) {
    case "req-next":
      return true;
    case "weak-next":
      return false;
    case "strong-next":
      return false;
    case "eventually":
      return requiresNext(formula.term);
    case "henceforth":
      return requiresNext(formula.term);
    case "until":
      return requiresNext(formula.term) || requiresNext(formula.condition);
    case "release":
      return requiresNext(formula.term) || requiresNext(formula.condition);
    case "and":
      return requiresNext(formula.term1) || requiresNext(formula.term2);
    case "or":
      return requiresNext(formula.term1) || requiresNext(formula.term2);
    case "not":
      return requiresNext(formula.term);
    default:
      return false;
  }
}

export function PartialValidity(formula: LTLFormula<any>): PartialValidity {
  if (isDetermined(formula)) {
    return {
      requiresNext: false,
      validity: evaluateValidity(formula),
      tags: isFalse(formula) ? collectTags(formula) : new Set()
    };
  } else {
    return {
      requiresNext: requiresNext(formula),
      validity: evaluateValidity(formula),
      tags: collectTags(formula)
    };
  }
}

export function evaluateValidity(expr: LTLFormula<any>): Validity {
  if (isDetermined(expr)) {
    if (expr.kind === "true") {
      return DT;
    }
    if (expr.kind === "false") {
      return DF;
    }
  } else if (expr.kind == "and") {
    let term1 = evaluateValidity(expr.term1);
    let term2 = evaluateValidity(expr.term2);
    return FVAnd(term1, term2);
  } else if (expr.kind == "or") {
    let term1 = evaluateValidity(expr.term1);
    let term2 = evaluateValidity(expr.term2);
    return FVOr(term1, term2);
  } else if (expr.kind === "not") {
    let term = evaluateValidity(expr.term);
    return FVNot(term);
  } else if (isGuarded(expr)) {
    switch (expr.kind) {
      case "req-next":
        return PT;
      case "weak-next":
        return PT;
      case "strong-next":
        return PF;
    }
  }
  console.warn(expr);
  throw new Error("The formula is not guarded or determined.");
}

export function* ltlEvaluateGenerator<A>(formula: LTLFormula<A>, state: A): Generator<PartialValidity, PartialValidity, A> {
  let ownTags = collectTags(formula);
  let expr = step(applyTags(formula, ownTags), state);
  // console.log("START", JSON.stringify(expr, null, 2));
  let validity = PartialValidity(expr);
  state = yield validity;
  while (true) {
    if (isDetermined(expr)) {
      yield PartialValidity(expr);
    } else if (isGuarded(expr)) {
      ownTags = collectTags(expr);
      expr = step(applyTags(expr.term, ownTags), state);
      // console.log("NEXT", expr);
      validity = PartialValidity(expr);
      state = yield validity;
    } else {
      console.warn(expr);
      throw new Error("The formula is not guarded.");
    }
  }
}
