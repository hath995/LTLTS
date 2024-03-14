type Predicate<A> = (state: A) => boolean;

type LTLPredicate<A> = {
    kind: "pred",
    pred: (state: A) => boolean
}

type LTLAnd<A> = {
    kind: "and",
    term1: LTLFormula<A>
    term2: LTLFormula<A>
}

type LTLOr<A> = {
    kind: "or",
    term1: LTLFormula<A>
    term2: LTLFormula<A>
}

type LTLNot<A> = {
    kind: "not",
    term: LTLFormula<A>
}

type LTLTrue = {
    kind: "true"
}

type LTLFalse = {
    kind: "false"
}

// type LTLNext<A> = {
//     kind: "next",
//     term: LTLFormula<A>
// }

type LTLEventually<A> = {
    kind: "eventually",
    steps: number,
    term: LTLFormula<A>
}

type LTLHenceforth<A> = {
    kind: "henceforth",
    steps: number,
    term: LTLFormula<A>
}

type LTLUntil<A> = {
    kind: "until",
    steps: number,
    condition: LTLFormula<A>,
    term: LTLFormula<A>
}

type LTLRelease<A> = {
    kind: "release",
    steps: number,
    condition: LTLFormula<A>,
    term: LTLFormula<A>
}

type LLTLRequiredNext<A> = {
    kind: "req-next"
    term: LTLFormula<A>
}

type LLTLWeakNext<A> = {
    kind: "weak-next"
    term: LTLFormula<A>
}

type LLTLStrongNext<A> = {
    kind: "strong-next"
    term: LTLFormula<A>
}

type LTLFormula<A> = LTLPredicate<A> 
    | LTLTrue
    | LTLFalse
    | LTLAnd<A>
    | LTLOr<A>
    | LTLNot<A>
    // | LTLNext<A>
    | LTLEventually<A>
    | LTLHenceforth<A>
    | LTLRelease<A>
    | LTLUntil<A>
    | LLTLRequiredNext<A>
    | LLTLWeakNext<A>
    | LLTLStrongNext<A>;

export const DT: Validity = {kind: "definitely", value: true}; //Definitely True
export const PT: Validity = {kind: "probably", value: true}; //Probably True
export const PF: Validity = {kind: "probably", value: false}; //Probably False
export const DF: Validity = {kind: "definitely", value: false}; //Definitely False

export type Validity = {kind: "definitely", value: boolean} | {kind: "probably", value: boolean};
export function Definitely(value: boolean): Validity {
    return {kind: "definitely", value};
}

export function Probably(value: boolean): Validity {
    return {kind: "probably", value};
}


//four valued logic

export function FVOr(fv1: Validity, fv2: Validity): Validity {
    if (fv1.kind === "definitely" && fv1.value || fv2.kind === "definitely" && fv2.value) {
        return DT;
    } else if (fv1.kind === "probably" && fv1.value || fv2.kind === "probably" && fv2.value) {
        return PT;
    } else if (fv1.kind === "probably" && !fv1.value || fv2.kind === "probably" && !fv2.value) {
        return PF;
    } else {
        return DF;
    }
}

export function FVAnd(fv1: Validity, fv2: Validity): Validity {
    if (fv1.kind === "definitely" && fv2.kind === "definitely" && fv1.value && fv2.value) {
        return DT;
    } else if (fv1.kind === "definitely" && !fv1.value || fv2.kind === "definitely" && !fv2.value) {
        return DF;
    } else if (fv1.kind === "probably" && !fv1.value || fv2.kind === "probably" && !fv2.value) {
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


export function Predicate<A>(pred: Predicate<A>): LTLPredicate<A> {
    return {
        kind:"pred",
        pred
    }
}

export function And<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>): LTLAnd<A> {
    let t1 = (typeof term1 !== "function") ? term1 : Predicate(term1);
    let t2 = (typeof term2 !== "function") ? term2 : Predicate(term2);
    return {
        kind: "and",
        term1: t1,
        term2: t2
    }
}

export function Or<A>(term1: LTLFormula<A> | Predicate<A>, term2: LTLFormula<A> | Predicate<A>): LTLOr<A> {
    let t1 = (typeof term1 !== "function") ? term1 : Predicate(term1);
    let t2 = (typeof term2 !== "function") ? term2 : Predicate(term2);
    return {
        kind: "or",
        term1: t1,
        term2: t2
    }
}

export function Not<A>(term1: LTLFormula<A> | Predicate<A>): LTLNot<A> {
    let t1 = (typeof term1 !== "function") ? term1 : Predicate(term1);
    return {
        kind: "not",
        term: t1,
    }
}
const LTLTrue: LTLTrue = {
    kind: "true"
}
export function True(): LTLTrue {
    return LTLTrue
}

const LTLFalse: LTLFalse = {
    kind: "false"
};

export function False(): LTLFalse {
    return LTLFalse
}

export function Next<A>(term: LTLFormula<A> | Predicate<A>): LLTLRequiredNext<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "req-next",
        term: t1
    }
}


export function Eventually<A>(steps: number, term: LTLFormula<A> | Predicate<A>): LTLEventually<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "eventually",
        steps,
        term: t1
    }
}

export function Henceforth<A>(steps: number, term: LTLFormula<A> | Predicate<A>): LTLHenceforth<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "henceforth",
        steps,
        term: t1
    }
}

export function Until<A>(steps: number, condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>): LTLUntil<A> {
    let t1 = (typeof condition !== "function") ? condition : Predicate(condition);
    let t2 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "until",
        steps,
        condition: t1,
        term: t2
    }
}

export function Release<A>(steps: number, condition: LTLFormula<A> | Predicate<A>, term: LTLFormula<A> | Predicate<A>): LTLRelease<A> {
    let t1 = (typeof condition !== "function") ? condition : Predicate(condition);
    let t2 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "release",
        steps,
        condition: t1,
        term: t2
    }
}

export function RequiredNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLRequiredNext<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "req-next",
        term: t1
    }
}

export function WeakNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLWeakNext<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "weak-next",
        term: t1
    }
}

export function StrongNext<A>(term: LTLFormula<A> | Predicate<A>): LLTLStrongNext<A> {
    let t1 = (typeof term !== "function") ? term : Predicate(term);
    return {
        kind: "strong-next",
        term: t1
    }
}

export function NegatedFormula<A>(expr: LTLEventually<A> | LTLHenceforth<A> | LTLUntil<A> | LTLRelease<A>): LTLFormula<A> {
    switch (expr.kind) {
        case "eventually":
            return Henceforth(expr.steps, Not(expr.term));
        case "henceforth":
            return Eventually(expr.steps, Not(expr.term));
        case "until":
            return Release(expr.steps, Not(expr.condition), Not(expr.term));
        case "release":
            return Until(expr.steps, Not(expr.condition), Not(expr.term));
    }

}


export function stepTrue<A>(expr: LTLTrue): LTLTrue {
    return expr;
}

export function stepFalse<A>(expr: LTLFalse): LTLFalse {
    return expr;
}

export function stepPred<A>(expr: LTLPredicate<A>, state: A): LTLFormula<A> {
    if(expr.pred(state)) {
        return True();
    }else {
        return False();
    }
}

export function stepAnd<A>(expr: LTLAnd<A>, state: A): LTLFormula<A> {
    let term1 = step(expr.term1, state);
    let term2 = step(expr.term2, state);
    if (term1 === False()) {
        return False();
    }else if (term1 === True() && term2 === True()) {
        return True();
    } else if(term1 === True()) {
        return term2;
    }
    return And(term1, term2);
}

export function stepOr<A>(expr: LTLOr<A>, state: A): LTLFormula<A> {
    let term1 = step(expr.term1, state);
    let term2 = step(expr.term2, state);
    if (step(expr.term1, state) === True()) {
        return True();
    } else if (term1 === False() && term2 === False()) {
        return False();
    } else if(term1 === False()) {
        return term2;
    }
    return Or(term1, term2);
}

export function stepNot<A>(expr: LTLNot<A>, state: A): LTLFormula<A> {
    if(isTemporalOperator(expr.term)) {
        let neg = NegatedFormula(expr.term);
        return step(neg, state);
    }
    if (step(expr.term, state) === True()) {
        return False();
    }else if (step(expr.term, state) === False()) {
        return True();
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

export function stepEventually<A>(expr: LTLEventually<A>, state: A): LTLFormula<A> {
    if (expr.steps === 0) {
        let term = step(expr.term, state);
        if (term === True()) {
            return True();
        } else if (term === False()) {
            return StrongNext(expr);
        }

        return Or(term, StrongNext(expr));
    } else {
        let term = step(expr.term, state);
        if (term === True()) {
            return term;
        } else if (term === False()) {
            return RequiredNext(Eventually(expr.steps - 1, expr.term));
        }
        return Or(term, RequiredNext(Eventually(expr.steps - 1, expr.term)));
    }
}

export function stepHenceforth<A>(expr: LTLHenceforth<A>, state: A): LTLFormula<A> {
    let term = step(expr.term, state);
    if (term === False()) {
        return False();
    }
    if (expr.steps === 0) {
        return step(And(expr.term, WeakNext(expr)), state);
    } else {
        return step(And(expr.term, RequiredNext(Henceforth(expr.steps - 1, expr.term))), state);
    }
}

export function stepUntil<A>(expr: LTLUntil<A>, state: A): LTLFormula<A> {
    if (expr.steps === 0) {
        return step(Or(expr.term, And(expr.condition, StrongNext(expr))), state);
    } else {
        return step(Or(expr.term, And(expr.condition, RequiredNext(Until(expr.steps - 1, expr.condition, expr.term)))), state);
    }
}

export function stepRelease<A>(expr: LTLRelease<A>, state: A): LTLFormula<A> {
    if (expr.steps === 0) {
        return step(And(expr.term, Or(expr.condition, WeakNext(expr))), state);
    } else {
        return step(And(expr.term, Or(expr.condition, RequiredNext(Release(expr.steps - 1, expr.condition, expr.term)))), state);
    }
}



export function step<A>(expr: LTLFormula<A>, state: A): LTLFormula<A> {
    switch (expr.kind) {
        case "pred":
            return stepPred(expr, state);
        case "true":
            return expr;
        case "false":
            return expr;
        case "and":
            return stepAnd(expr, state);
        case "or":
            return stepOr(expr, state);
        case "not":
            return stepNot(expr, state);
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

export function isTemporalOperator<A>(expr: LTLFormula<A>): expr is LTLEventually<A> | LTLHenceforth<A> | LTLUntil<A> | LTLRelease<A> {
    return expr.kind === "eventually" || expr.kind === "henceforth" || expr.kind === "until" || expr.kind === "release";
}

export function isGuarded<A>(expr: LTLFormula<A>): expr is LLTLRequiredNext<A> | LLTLWeakNext<A> | LLTLStrongNext<A>  {
    return expr.kind === "req-next" || expr.kind === "weak-next" || expr.kind === "strong-next";
}

export function isDetermined<A>(expr: LTLFormula<A>): boolean {
    return expr.kind === "true" || expr.kind === "false";
}

export function ltlEvaluate<A>(states: A[], formula: LTLFormula<A>): Validity {
    if(states.length === 0) {
        return Definitely(false);
    }
    let expr = step(formula, states[0]);
    if(!isGuarded(expr) && !isDetermined(expr)) {
        console.warn(expr);
        throw new Error("The formula is not guarded.");
    }
    let i =1;
    while(!isDetermined(expr) && i < states.length) {
        if(isGuarded(expr)) {
            expr = step(expr.term, states[i]);
        }else{
            console.warn(expr);
            throw new Error("The formula is not guarded.");
        }
        i++;
    }
    if (expr === True()) {
        return Definitely(true);
    } else if (expr === False()) {
        return Definitely(false);
    }

    if (expr.kind === "req-next") {
        return Probably(false);
    }
    if (expr.kind === "weak-next") {
        return Probably(true);
    }
    if (expr.kind === "strong-next") {
        return Probably(false);
    }

    return Probably(false);

}

type PartialValidity = {
    requiresNext: boolean,
    validity: Validity
}

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
    if(isDetermined(formula)) {
        return {
            requiresNext: false,
            validity: evaluateValidity(formula)
        }
    } else {
        return {
            requiresNext: requiresNext(formula),
            validity: evaluateValidity(formula)
        }
    }
}

export function evaluateValidity(expr: LTLFormula<any>): Validity {
    if(isDetermined(expr)) {
        if(expr.kind === "true") {
            return DT;
        }
        if(expr.kind === "false") {
            return DF;
        }
    } else if(expr.kind == "and") {
        let term1 = evaluateValidity(expr.term1);
        let term2 = evaluateValidity(expr.term2);
        return FVAnd(term1, term2);
    } else if(expr.kind == "or") {
        let term1 = evaluateValidity(expr.term1);
        let term2 = evaluateValidity(expr.term2);
        return FVOr(term1, term2);
    } else if (expr.kind === "not") {
        let term = evaluateValidity(expr.term);
        return FVNot(term);
    } else if(isGuarded(expr)) {
        switch(expr.kind) {
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

export function * ltlEvaluateGenerator<A>(formula: LTLFormula<A>, state: A): Generator<PartialValidity, void, A> {
    let expr = step(formula, state);
    console.log(expr);
    let validity = PartialValidity(expr);
    state = yield validity;
    while(true) {
        if(isDetermined(expr)) {
            yield PartialValidity(expr);
        } else if(isGuarded(expr)) {
        expr = step(expr.term, state);
        console.log(expr);
        validity = PartialValidity(expr);
        state = yield validity;
        } else {
            console.warn(expr);
            throw new Error("The formula is not guarded.");
        }
    }
}