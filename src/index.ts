import isEqual from "lodash.isequal";
import debug from "debug";
var ltldebug = debug("ltl");

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

export type LTLImplies<A> = {
  kind: "implies";
  term1: LTLFormula<A>;
  term2: LTLFormula<A>;
};

export type LTLNot<A> = {
  kind: "not";
  term: LTLFormula<A>;
};

export type LTLTrue = {
  kind: "true";
  toString(): string;
};

export type LTLFalse = {
  kind: "false";
  toString(): string;
};

export type LTLEventually<A> = {
  kind: "eventually";
  steps: number;
  term: LTLFormula<A>;
};

export type LTLAlways<A> = {
  kind: "always";
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

export type LTLBind<A> = {
  kind: "bind";
  fn: (state: A) => LTLFormula<A>;
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
  | LTLImplies<A>
  | LTLNot<A>
  | LTLBind<A>
  | LTLComparison<A>
  | LTLEventually<A>
  | LTLAlways<A>
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
/**
 * 
 * @param tag string identifier for the formula
 * @param expr 
 * @returns expression with a tag
 */
export function Tag<T>(tag: string, expr: LTLFormula<T>): LTLFormula<T> {
  expr.tag = tag;
  return expr;
}
function isLambda(string: string): string {
  return string.includes("=>") ? string.slice(/=>/.exec(string)!.index+2).trim() : string;
}
function tagString(expr: Tagged): string {
    return expr.tag || expr.tags ? `{${(expr.tag ? [expr.tag] : []).concat(Array.from(expr.tags ?? [])).join(",")}}` : "";
}
class PredicateTagged<A> implements LTLPredicate<A>, Tagged {
  kind: "pred"
  tag?: string
  tags?: Set<string>
  constructor(public pred: Predicate<A>, public desc?: string) {
    this.kind = "pred";
  }
  toString() {
    return `Pred${tagString(this)}(${isLambda(this.pred.toString())})`
  }
}
/**
 * 
 * @param pred boolean function to test some property of the state
 * @returns 
 */
export function Predicate<A>(pred: Predicate<A>): LTLPredicate<A> {
  return new PredicateTagged(pred);
}

class BindTagged<A> implements LTLBind<A>, Tagged {
  kind: "bind"
  tag?: string
  tags?: Set<string>
  constructor(public fn: (state: A) => LTLFormula<A>) {
    this.kind = "bind";
  }
  toString() {
    return `Bind${tagString(this)}(${isLambda(this.fn.toString())})`
  }
}

/**
 * 
 * @param fn function to be evaluated in the next state allowing state variables to be accessed and used in another formula
 * @returns 
 */
export function Bind<A>(fn: (state: A) => LTLFormula<A>): LTLFormula<A> {
  return new BindTagged(fn);
}

export function Contramap<A,B>(fn: (state: A) => B, expr: LTLFormula<B>): LTLFormula<A> {
  let tags = collectTags(expr);
  switch(expr.kind) {
    case "pred":
      return applyTags(Predicate((state: A) => expr.pred(fn(state))), tags);
    case "and":
      return applyTags(And(Contramap(fn, expr.term1), Contramap(fn, expr.term2)), tags);
    case "or":
      return applyTags(Or(Contramap(fn, expr.term1), Contramap(fn, expr.term2)), tags);
    case "implies":
      return applyTags(Implies(Contramap(fn, expr.term1), Contramap(fn, expr.term2)), tags);
    case "not":
      return applyTags(Not(Contramap(fn, expr.term)), tags);
    case "eventually":
      return applyTags(Eventually(Contramap(fn, expr.term), expr.steps), tags);
    case "always":
      return applyTags(Always(Contramap(fn, expr.term), expr.steps), tags);
    case "until":
      return applyTags(Until(Contramap(fn, expr.condition), Contramap(fn, expr.term), expr.steps), tags);
    case "release":
      return applyTags(Release(Contramap(fn, expr.condition), Contramap(fn, expr.term), expr.steps), tags);
    case "comparison":
      return applyTags(Comparison((state: A, nextState: A) => expr.pred(fn(state), fn(nextState))), tags);
    case "bind":
      return applyTags(Bind((state: A) => Contramap(fn, expr.fn(fn(state)))), tags);
    case "req-next":
      return applyTags(RequiredNext(Contramap(fn, expr.term)), tags);
    case "weak-next":
      return applyTags(WeakNext(Contramap(fn, expr.term)), tags);
    case "strong-next":
      return applyTags(StrongNext(Contramap(fn, expr.term)), tags);
    case "true":
      return applyTags(True(), tags);
    case "false":
      return applyTags(False(), tags);
  }
}

class AndTagged<A> implements LTLAnd<A>, Tagged {
  kind: "and"
  tag?: string
  tags?: Set<string>
  constructor(public term1: LTLFormula<A>, public term2: LTLFormula<A>) {
    this.kind = "and";
  }
  toString() {
    return `And${tagString(this)}(${this.term1.toString()}, ${this.term2.toString()})`
  }
}

/**
 * 
 * @param term1 First formula to be evaluated
 * @param term2 Second formula to be evaluated
 * @param rest Additional formulas to be evaluated
 * @returns 
 */
export function And<A>(...rest: (LTLFormula<A> | Predicate<A>)[]): LTLAnd<A>
export function And<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>, ...rest: (LTLFormula<A> | Predicate<A>)[]): LTLAnd<A> {
  let t1 = typeof term1 !== "function" ? term1 : new PredicateTagged(term1);
  if(term2 === undefined) {
    return And(t1, True());
  }
  let t2 = typeof term2 !== "function" ? term2 : new PredicateTagged(term2);
  if(rest.length > 0) {
    return And(t1, And(t2, rest[0], ...rest.slice(1)));
  }
  return new AndTagged(t1, t2);
}

class OrTagged<A> implements LTLOr<A>, Tagged {
  kind: "or"
  tag?: string
  tags?: Set<string>
  constructor(public term1: LTLFormula<A>, public term2: LTLFormula<A>) {
    this.kind = "or";
  }
  toString() {
    return `Or${tagString(this)}(${this.term1.toString()}, ${this.term2.toString()})`
  }
}

export function Or<A>(...rest: (LTLFormula<A> | Predicate<A>)[]): LTLOr<A>
export function Or<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>, ...rest: (LTLFormula<A> | Predicate<A>)[]): LTLOr<A> {
  let t1 = typeof term1 !== "function" ? term1 : new PredicateTagged(term1);
  if(term2 === undefined) {
    return Or(False(), t1);
  }
  let t2 = typeof term2 !== "function" ? term2 : new PredicateTagged(term2);
  if(rest.length > 0) {
    return Or(t1, Or(t2, rest[0], ...rest.slice(1)));
  }
  return new OrTagged(t1, t2);
}

class NotTagged<A> implements LTLNot<A>, Tagged {
  kind: "not"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>) {
    this.kind = "not";
  }
  toString() {
    return `Not${tagString(this)}(${this.term.toString()})`
  }
}

export function Not<A>(term1: LTLFormula<A> | Predicate<A>): LTLNot<A> {
  let t1 = typeof term1 !== "function" ? term1 : new PredicateTagged(term1);
  return new NotTagged(t1);
}

class ImpliesTagged<A> implements LTLImplies<A>, Tagged {
  kind: "implies"
  tag?: string
  tags?: Set<string>
  constructor(public term1: LTLFormula<A>, public term2: LTLFormula<A>) {
    this.kind = "implies";
  }
  toString() {
    return `Implies${tagString(this)}(${this.term1.toString()}, ${this.term2.toString()})`
  }
}

export function Implies<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>): LTLImplies<A> {
  let t1 = typeof term1 !== "function" ? term1 : new PredicateTagged(term1);
  let t2 = typeof term2 !== "function" ? term2 : new PredicateTagged(term2);
  // return Or(Not(t1), t2);
  return new ImpliesTagged(t1, t2);
}

const LTLTrue: LTLTrue = {
  kind: "true",
  toString() {
    return "True";
  }
};
class TrueTagged implements LTLTrue, Tagged {
  kind: "true"
  tag?: string
  tags?: Set<string>
  constructor() {
    this.kind = "true";
  }
  toString() {
    return `True${tagString(this)}`
  }
}
export function True(): LTLTrue {
  return new TrueTagged();
  // return LTLTrue;
}

const LTLFalse: LTLFalse = {
  kind: "false",
  toString() {
    return "False";
  }
};

class FalseTagged implements LTLFalse, Tagged {
  kind: "false"
  tag?: string
  tags?: Set<string>
  constructor() {
    this.kind = "false";
  }
  toString() {
    return `False${tagString(this)}`
  }
}

export function False(): LTLFalse {
  return new FalseTagged();
  // return LTLFalse;
  // return {kind: "false", toString() {return "False"}};
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

class UnchangedTagged<A> implements LTLComparison<A>, Tagged {
  kind: "comparison"
  tag?: string
  tags?: Set<string>
  constructor(public pred: (state: A, nextState: A) => boolean, public desc?: string) {
    this.kind = "comparison";
  }
  toString() {
    return `Unchanged${tagString(this)}(${this.desc === undefined ? isLambda(this.pred.toString()) : this.desc})`
  }
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
    return new UnchangedTagged((state: A, nextState: A) => pred.every(p => {
        if (typeof p === "number" || typeof p === "symbol") {
          // @ts-expect-error
          if (p in state && p in nextState) {
            // @ts-expect-error
            return isEqual(state[p], nextState[p]);
          } else {
            throw new Error(`Property '${String(p)}' not found in state or nextState`);
          }
        } else if (typeof p === "string") {
          let propertyParts = p.split(".");
          let stateCurrent = state;
          let nextStateCurrent = nextState;
          for (let i = 0; i < propertyParts.length; i++) {
            if(stateCurrent === undefined || nextStateCurrent === undefined || stateCurrent === null || nextStateCurrent === null) {
              throw new Error(`Property '${p}' not found in state or nextState`);
            }

            // @ts-expect-error
            if (propertyParts[i] in stateCurrent && propertyParts[i] in nextStateCurrent) {
              // @ts-expect-error
              stateCurrent = stateCurrent[propertyParts[i]];
              // @ts-expect-error
              nextStateCurrent = nextStateCurrent[propertyParts[i]];
            } else {
              throw new Error(`Property '${p}' not found in state or nextState`);
            }
          }
          return isEqual(stateCurrent, nextStateCurrent);
        }
      }), `[${pred.toString()}]`);
  }
  if(typeof pred === "string" || typeof pred === "number" || typeof pred === "symbol") {
    return new UnchangedTagged((state: A, nextState: A) => isEqual(state[pred], nextState[pred]), pred.toString());
  }
  return new UnchangedTagged(pred);
}

class ChangedTagged<A> implements LTLComparison<A>, Tagged {
  kind: "comparison"
  tag?: string
  tags?: Set<string>
  constructor(public pred: (state: A, nextState: A) => boolean, public desc?: string) {
    this.kind = "comparison";
  }
  toString() {
    return `Changed${tagString(this)}(${this.desc === undefined ? isLambda(this.pred.toString()) : this.desc})`
  }
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
    return new ChangedTagged((state: A, nextState: A) => pred.every(p => {
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
            if(stateCurrent === undefined || nextStateCurrent === undefined || stateCurrent === null || nextStateCurrent === null) {
              throw new Error(`Property '${p}' not found in state or nextState`);
            }
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
      }), `[${pred.toString()}]`);
  }
  if(typeof pred === "string" || typeof pred === "number" || typeof pred === "symbol") {
    return new ChangedTagged((state: A, nextState: A) => !isEqual(state[pred], nextState[pred]), pred.toString());
  }
  return new ChangedTagged(pred);
}

class ComparisonTagged<A> implements LTLComparison<A>, Tagged {
  kind: "comparison"
  tag?: string
  tags?: Set<string>
  constructor(public pred: (state: A, nextState: A) => boolean) {
    this.kind = "comparison";
  }
  toString() {
    return `Comparison${tagString(this)}(${isLambda(this.pred.toString())})`
  }
}
/**
 *
 * @param pred function to test comparison between two states
 * @returns boolean value of the comparison
 */
export function Comparison<A>(pred: (state: A, nextState: A) => boolean): LTLComparison<A> {
  return new ComparisonTagged(pred);
}

class EventuallyTagged<A> implements LTLEventually<A>, Tagged {
  kind: "eventually"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>, public steps: number) {
    this.kind = "eventually";
  }
  toString() {
    return `Eventually${tagString(this)}(${this.term.toString()}, ${this.steps})`
  }
}

export function Eventually<A>(term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLEventually<A> {
  let t1 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new EventuallyTagged(t1, steps);
}

class AlwaysTagged<A> implements LTLAlways<A>, Tagged {
  kind: "always"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>, public steps: number) {
    this.kind = "always";
  }
  toString() {
    return `Always${tagString(this)}(${this.term.toString()}, ${this.steps})`
  }
}

export function Always<A>(term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLAlways<A> {
  let t1 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new AlwaysTagged(t1, steps);
}

class UntilTagged<A> implements LTLUntil<A>, Tagged {
  kind: "until"
  tag?: string
  tags?: Set<string>
  constructor(public condition: LTLFormula<A>, public term: LTLFormula<A>, public steps: number = 0) {
    this.kind = "until";
  }
  toString() {
    return `Until${tagString(this)}(${this.condition.toString()}, ${this.term.toString()}, ${this.steps})`
  }
}

export function Until<A>(condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLUntil<A> {
  let t1 = typeof condition !== "function" ? condition : new PredicateTagged(condition);
  let t2 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new UntilTagged(t1, t2, steps);
}

class ReleaseTagged<A> implements LTLRelease<A>, Tagged {
  kind: "release"
  tag?: string
  tags?: Set<string>
  constructor(public condition: LTLFormula<A>, public term: LTLFormula<A>, public steps: number = 0) {
    this.kind = "release";
  }
  toString() {
    return `Release${tagString(this)}(${this.condition.toString()}, ${this.term.toString()}, ${this.steps})`
  }
}

export function Release<A>(condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>, steps: number = 0): LTLRelease<A> {
  let t1 = typeof condition !== "function" ? condition : new PredicateTagged(condition);
  let t2 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new ReleaseTagged(t1, t2, steps);
}

class RequiredNextTagged<A> implements LLTLRequiredNext<A>, Tagged {
  kind: "req-next"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>) {
    this.kind = "req-next";
  }
  toString() {
    return `RequiredNext${tagString(this)}(${this.term.toString()})`
  }
}

export function RequiredNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLRequiredNext<A> {
  let t1 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new RequiredNextTagged(t1);
}

class WeakNextTagged<A> implements LLTLWeakNext<A>, Tagged {
  kind: "weak-next"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>) {
    this.kind = "weak-next";
  }
  toString() {
    return `WeakNext${tagString(this)}(${this.term.toString()})`
  }
}

export function WeakNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLWeakNext<A> {
  let t1 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new WeakNextTagged(t1);
}

class StrongNextTagged<A> implements LLTLStrongNext<A>, Tagged {
  kind: "strong-next"
  tag?: string
  tags?: Set<string>
  constructor(public term: LTLFormula<A>) {
    this.kind = "strong-next";
  }
  toString() {
    return `StrongNext${tagString(this)}(${this.term.toString()})`
  }
}

export function StrongNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLStrongNext<A> {
  let t1 = typeof term !== "function" ? term : new PredicateTagged(term);
  return new StrongNextTagged(t1);
}

function NegatedFormula<A>(expr: LTLEventually<A> | LTLAlways<A> | LTLUntil<A> | LTLRelease<A>): LTLFormula<A> {
  switch (expr.kind) {
    case "eventually":
      return Always(Not(expr.term), expr.steps);
    case "always":
      return Eventually(Not(expr.term), expr.steps );
    case "until":
      return Release(Not(expr.condition), Not(expr.term), expr.steps);
    case "release":
      return Until(Not(expr.condition), Not(expr.term), expr.steps);
  }
}

export function LeadsTo<A>(condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>): LTLFormula<A> {
  let t1 = typeof condition !== "function" ? condition : new PredicateTagged(condition);
  let t2 = typeof term !== "function" ? term : new PredicateTagged(term);
  return Always(Implies(t1, Eventually(t2)));
}

export function stepTrue<A>(expr: LTLTrue): LTLTrue {
  return new TrueTagged();
}

export function stepFalse<A>(expr: LTLFalse): LTLFormula<A> {
  let tags = collectTags(expr);
  return applyTags(new FalseTagged(), tags);
}

export function stepPred<A>(expr: LTLPredicate<A> & Tagged, state: A): LTLFormula<A> {
  if (expr.pred(state)) {
    return True();
  } else {
    let tags = collectTags(expr);
    return tags.size == 0 ? False() : applyTags(False(), tags);
  }
}

export function stepBind<A>(expr: LTLBind<A>, state: A): LTLFormula<A> {
  let ownTags = collectTags(expr);
  return applyTags(step(expr.fn(state), state), ownTags);
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
  expr.tags = expr.tags ? new Set([...expr.tags,...tags]) : tags
  return expr;
  // return {...expr, tags: expr.tags ? new Set([...expr.tags,...tags]) : tags};
}

export function stepImplies<A>(expr: LTLImplies<A>, state: A): LTLFormula<A> {
  let term1 = step(expr.term1, state);
  let term2 = step(expr.term2, state);
  if(isDetermined(term1)) {
    if(isTrue(term1)) {
      return applyTags(term2, collectTags(expr));
    }
    if(isFalse(term1)) {
      return True();
    }
  }
  if(isGuarded(term1) && !isGuarded(term2)) {
    return applyTags(Implies(term1, WeakNext(expr.term2)), collectTags(expr));
  }
  if(isGuarded(term2) && isGuarded(term1)) {
    return applyTags(Implies(term1, term2), collectTags(expr));
  }
  throw new Error("GOT TO IMPLIES BAD SITUATION")
}

export function stepAnd<A>(expr: LTLAnd<A>, state: A): LTLFormula<A> {
  let term1 = step(expr.term1, state);
  let term2 = step(expr.term2, state);

  if(!isGuarded(term1) && !isDetermined(term1)) {
    term1 = step(term1, state);
  }
  if(!isGuarded(term2) && !isDetermined(term2)) {
    term2 = step(term2, state);
  }
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
    return applyTags(And(applyTags(term1, term1tags), applyTags(term2, term2tags)), ownTags);
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

export function weakestNext<A>(term1: LTLFormula<A>, term2: LTLFormula<A>) {
  if (term1.kind === "req-next" || term2.kind === "req-next") {
    return RequiredNext;
  }
  if (term1.kind === "weak-next" || term2.kind === "weak-next") {
    return WeakNext;
  }
  return StrongNext;
}

export function stepOr<A>(expr: LTLOr<A>, state: A): LTLFormula<A> {
  let term1 = step(expr.term1, state);
  let term2 = step(expr.term2, state);

  if(!isGuarded(term1) && !isDetermined(term1)) {
    term1 = step(term1, state);
  }
  if(!isGuarded(term2) && !isDetermined(term2)) {
    term2 = step(term2, state);
  }
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
    return applyTags(Or(applyTags(term1, term1tags), applyTags(term2, term2tags)), ownTags);
  }
  throw new Error("GOT TO OR BAD SITUATION")
}

export function stepNot<A>(expr: LTLNot<A>, state: A): LTLFormula<A> {
  if (isTemporalOperator(expr.term)) {
    let neg = NegatedFormula(expr.term);
    let ownTags = collectTags(expr);
    return step(applyTags(neg, ownTags), state);
  }
  if(expr.term.kind === "or") {
    let ownTags = collectTags(expr);
    return step(applyTags(And(Not(expr.term.term1), Not(expr.term.term2)), ownTags), state);
  }
  if(expr.term.kind === "and") {
    let ownTags = collectTags(expr);
    return step(applyTags(Or(Not(expr.term.term1), Not(expr.term.term2)), ownTags), state);
  }

  if(expr.term.kind === "not") {
    let ownTags = collectTags(expr);
    return step(applyTags(expr.term.term, ownTags), state);
  }

  if(expr.term.kind === "req-next") {
    let ownTags = collectTags(expr);
    return applyTags(RequiredNext(Not(expr.term.term)), ownTags);
  }
  if(expr.term.kind === "weak-next") {
    let ownTags = collectTags(expr);
    return applyTags(WeakNext(Not(expr.term.term)), ownTags);
  }
  if(expr.term.kind === "strong-next") {
    let ownTags = collectTags(expr);
    return applyTags(StrongNext(Not(expr.term.term)), ownTags);
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
    if(term.kind === "req-next") {
      return applyTags(RequiredNext(Not(term.term)), new Set([...ownTags, ...tags,...termTags]));
    }
    if(term.kind === "weak-next") {
      return applyTags(WeakNext(Not(term.term)), new Set([...ownTags, ...tags,...termTags]));
    }
    if(term.kind === "strong-next") {
      return applyTags(StrongNext(Not(term.term)), new Set([...ownTags, ...tags,...termTags]));
    }
    return applyTags(Not(term), new Set([...ownTags, ...tags,...termTags]));
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
    case "always":
      return Always(expr.term, expr.steps - 1);
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
      return step(applyTags(Or(term, StrongNext(Eventually(expr.term, expr.steps))), ownTags),state);
    }
    return Or(term, StrongNext(expr));
  } else {
    let term = step(expr.term, state);
    if (isTrue(term)) {
      return term;
    } else if (isFalse(term)) {
      return applyTags(RequiredNext(Eventually(expr.term, expr.steps - 1)), ownTags);
    } else if (isGuarded(term)) {
      return step(applyTags(Or(term, RequiredNext(Eventually(expr.term, expr.steps - 1))), ownTags), state);
    }
    return Or(term, applyTags(RequiredNext(Eventually(expr.term, expr.steps - 1)), ownTags));
  }
}

export function stepAlways<A>(expr: LTLAlways<A>, state: A): LTLFormula<A> {
  if (expr.term.kind === "always") {
    expr = Always(expr.term.term, Math.max(expr.steps, expr.term.steps));
  }
  let term = step(expr.term, state);
  let ownTags = collectTags(expr);
  let tags = new Set([...ownTags, ...collectTags(term)]);
  if (isFalse(term)) {
    return applyTags(False(), tags);
  }
  if (expr.steps === 0) {
    if (containsTemporalOperator(expr.term)) {
      return step(applyTags(And(expr.term, WeakNext(Always(decrementSteps(expr.term), expr.steps))), tags), state);
    }
    return step(applyTags(And(expr.term, WeakNext(expr)), tags), state);
  } else {
    if (containsTemporalOperator(expr.term)) {
      return step(applyTags(And(expr.term, WeakNext(Always(decrementSteps(expr.term), expr.steps - 1))), tags), state);
    }
    return step(applyTags(And(expr.term, RequiredNext(Always(expr.term, expr.steps - 1))), tags), state);
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
    case "bind":
      return stepBind(expr, state);
    case "true":
      return stepTrue(expr);
    case "false":
      return stepFalse(expr);
    case "and":
      return stepAnd(expr, state);
    case "or":
      return stepOr(expr, state);
    case "not":
      return stepNot(expr, state);
    case "implies":
      return stepImplies(expr, state);
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
    case "always":
      return stepAlways(expr, state);
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

export function isTemporalOperator<A>(expr: LTLFormula<A>): expr is LTLEventually<A> | LTLAlways<A> | LTLUntil<A> | LTLRelease<A> {
  return expr.kind === "eventually" || expr.kind === "always" || expr.kind === "until" || expr.kind === "release";
}

export function isGuarded<A>(expr: LTLFormula<A>): expr is LLTLRequiredNext<A> | LLTLWeakNext<A> | LLTLStrongNext<A> {
  return expr.kind === "req-next" || expr.kind === "weak-next" || expr.kind === "strong-next" ||
    expr.kind === "and" && isGuarded(expr.term1) && isGuarded(expr.term2) ||
    expr.kind === "or" && isGuarded(expr.term1) && isGuarded(expr.term2) ||
    expr.kind === "implies" && isGuarded(expr.term1) ||
    expr.kind === "not" && isGuarded(expr.term);
}

export function stepResidual<A>(expr: LTLFormula<A>, state: A): LTLFormula<A> {
  switch (expr.kind) {
    case "or":
      {
      let term1 = stepResidual(expr.term1, state);
      let term1tags = isFalse(term1) ? collectTags(term1) : new Set<string>();
      let term2 = stepResidual(expr.term2, state);
      let term2tags = isFalse(term2) ? collectTags(term2) : new Set<string>();
      let ownTags = isFalse(term1) && isFalse(term2) ? collectTags(expr) : new Set<string>();
      let tags = new Set([...ownTags, ...term1tags, ...term2tags]);
      try {
        return step(applyTags(Or(term1, term2), tags), state);
      } catch (e) {
        console.warn(e);
        console.warn(expr);
        console.warn(term1);
        console.warn(term2);
        console.warn(tags);
        throw e;
      }
      }
    case "and":
      {
      let term1 = stepResidual(expr.term1, state);
      let term1tags = isFalse(term1) ? collectTags(term1) : new Set<string>();
      let term2 = stepResidual(expr.term2, state);
      let term2tags = isFalse(term2) ? collectTags(term2) : new Set<string>();
      let ownTags = collectTags(expr);
      let tags = new Set([...ownTags, ...term1tags, ...term2tags]);
      try {
        return step(applyTags(And(term1, term2), tags), state);
      } catch (e) {
        console.warn(e);
        console.warn(expr);
        console.warn(term1);
        console.warn(term2);
        console.warn(tags);
        throw e;
      }
      }
    case "implies":
      {
      let term1 = stepResidual(expr.term1, state);
      let term1tags = isFalse(term1) ? collectTags(term1) : new Set<string>();
      let term2 = isGuarded(expr.term2) ? stepResidual(expr.term2, state) : step(expr.term2, state);
      // let term2tags = isFalse(term2) ? collectTags(term2) : new Set<string>();
      let ownTags = collectTags(expr);
      let tags = new Set([...ownTags, ...term1tags ]);
      try {
        return step(applyTags(Implies(term1, term2), tags), state);
      } catch (e) {
        console.warn(e);
        console.warn(expr);
        console.warn(term1);
        console.warn(term2);
        console.warn(tags);
        throw e;
      }
      }
    case "not":
      //Should not be hit, should refactor to avoid this
      try {
      return Not(stepResidual(expr.term, state));
      } catch (e) {
        console.warn(e);
        console.warn(expr);
        throw e;
      }
    case "req-next":
      {
      let ownTags = collectTags(expr);
      return step(applyTags(expr.term, ownTags), state);
      }
    case "weak-next":
      {
      let ownTags = collectTags(expr);
      return step(applyTags(expr.term, ownTags), state);
      }
    case "strong-next":
      {
      let ownTags = collectTags(expr);
      return step(applyTags(expr.term, ownTags), state);
      }
    case "pred":
      return step(expr, state);
    default:
      throw new Error(`Unexpected formula in residual computation: ${expr.toString()}`);
    }
}

export function isDetermined<A>(expr: LTLFormula<A>): boolean {
  return expr.kind === "true" || expr.kind === "false";
}

export function ltlEvaluate<A>(states: A[], formula: LTLFormula<A>): Validity {
  if (states.length === 0) {
    return Definitely(false);
  }
  let expr = step(formula, states[0]);
  ltldebug("ltlEvaluate start: ", expr.toString());
  if (!isGuarded(expr) && !isDetermined(expr)) {
    console.warn(expr);
    throw new Error("The formula is not guarded.");
  }
  let i = 1;
  while (!isDetermined(expr) && i < states.length) {
    if (isGuarded(expr)) {
      expr = stepResidual(expr, states[i]);
      ltldebug("ltlEvaluate step: ", expr.toString());
    } else {
      console.warn(expr);
      throw new Error("The formula is not guarded.");
    }
    i++;
  }
  // console.log("EVALUATE", expr, i, states.length);
  // console.log("EVALUATE2", expr.toString());
  return evaluateValidity(expr)[0];
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
    case "always":
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
    case "always":
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
    let validity = evaluateValidity(formula);
    return {
      requiresNext: false,
      validity: validity[0],
      tags: isFalse(formula) || !validity[0].value ? new Set([...collectTags(formula), ...validity[1]]) : new Set()
    };
  } else {
    let validity = evaluateValidity(formula);
    return {
      requiresNext: requiresNext(formula),
      validity: validity[0],
      tags: new Set([...collectTags(formula), ...validity[1]])
    };
  }
}

export function evaluateValidity(expr: LTLFormula<any>): [Validity, Set<string>] {
  if (isDetermined(expr)) {
    if (expr.kind === "true") {
      return [DT, new Set()];
    }
    if (expr.kind === "false") {
      return [DF, collectTags(expr)];
    }
  } else if (expr.kind == "and") {
    let term1 = evaluateValidity(expr.term1);
    let term2 = evaluateValidity(expr.term2);
    let tags = collectTags(expr);
    let result = FVAnd(term1[0], term2[0]);
    return [result, new Set([...(!result.value ? tags : new Set<string>()), ...(!term1[0].value ? term1[1]: new Set<string>()), ...(!term2[0].value ? term2[1]: new Set<string>())])];
  } else if (expr.kind == "or") {
    let term1 = evaluateValidity(expr.term1);
    let term2 = evaluateValidity(expr.term2);
    let tags = collectTags(expr);
    let result = FVOr(term1[0], term2[0]);
    return [result, new Set([...(!result.value ? tags : new Set<string>()), ...(!term1[0].value ? term1[1]: new Set<string>()), ...(!term2[0].value ? term2[1]: new Set<string>())])];
  } else if (expr.kind == "implies") {
    let term1 = evaluateValidity(expr.term1);
    let term2 = evaluateValidity(expr.term2);
    let tags = collectTags(expr);
    let result = FVOr(FVNot(term1[0]), term2[0]);
    return [result, new Set([...(!result.value ? tags : new Set<string>()), ...(term1[0].value ? term1[1]: new Set<string>()), ...(!term2[0].value ? term2[1]: new Set<string>())])];
  } else if (expr.kind === "not") {
    let term = evaluateValidity(expr.term);
    return [FVNot(term[0]), term[1]];
  } else if (isGuarded(expr)) {
    switch (expr.kind) {
      case "req-next":
        //throw error?
        return [PT, collectTags(expr)];
      case "weak-next":
        return [PT, collectTags(expr)];
      case "strong-next":
        return [PF, collectTags(expr)];
    }
  }
  console.warn(expr.toString());
  throw new Error("The formula is not guarded or determined.");
}

export function* ltlEvaluateGenerator<A>(formula: LTLFormula<A>, state: A): Generator<PartialValidity, PartialValidity, A> {
  let ownTags = collectTags(formula);
  let expr = step(applyTags(formula, ownTags), state);
  ltldebug("ltlEvaluateGenerator start: ", expr.toString());
  let validity = PartialValidity(expr);
  state = yield validity;
  while (true) {
    if (isDetermined(expr)) {
      yield PartialValidity(expr);
    } else if (isGuarded(expr)) {
      ownTags = collectTags(expr);
      expr = stepResidual(applyTags(expr, ownTags), state);
      ltldebug("ltlEvaluateGenerator step", expr.toString());
      validity = PartialValidity(expr);
      state = yield validity;
    } else {
      console.warn(expr.toString());
      throw new Error("The formula is not guarded.");
    }
  }
}
