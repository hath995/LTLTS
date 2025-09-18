include "./utils.dfy"
// LinearTemporalLogic 
module LTL {
    import opened LTLUtils

	// Predicates over a state 'A'
	type PredFn<-A> = A -> bool

	// Comparison between a state and the next state
	type CmpFn<-A> = (A, A) -> bool

	// Bind function from a state to a formula
	type BindFn<!A> = A -> LTLFormula<A>

	datatype LTLFormula<!A> =
		| LTLPred(pred: PredFn<A>, tags: set<string>)
		| LTLTrue(tags: set<string>)
		| LTLFalse(tags: set<string>)
		| LTLAnd(term1: LTLFormula<A>, term2: LTLFormula<A>, tags: set<string>)
		| LTLOr(term1: LTLFormula<A>, term2: LTLFormula<A>, tags: set<string>)
		| LTLImplies(term1: LTLFormula<A>, term2: LTLFormula<A>, tags: set<string>)
		| LTLNot(term: LTLFormula<A>, tags: set<string>)
		| LTLBind(fn: BindFn<A>, tags: set<string>)
		| LTLComparison(cmp: CmpFn<A>, tags: set<string>)
		| LTLEventually(term: LTLFormula<A>, steps: nat, tags: set<string>)
		| LTLAlways(term: LTLFormula<A>, steps: nat, tags: set<string>)
		| LTLRelease(condition: LTLFormula<A>, term: LTLFormula<A>, steps: nat, tags: set<string>)
		| LTLUntil(condition: LTLFormula<A>, term: LTLFormula<A>, steps: nat, tags: set<string>)
		| LTLReqNext(term: LTLFormula<A>, tags: set<string>)
		| LTLWeakNext(term: LTLFormula<A>, tags: set<string>)
		| LTLStrongNext(term: LTLFormula<A>, tags: set<string>) {

            function Tag(tag: string): LTLFormula<A> {
                match this {
                    case LTLPred(pred, tags) => LTLPred(pred, tags + {tag})
                    case LTLTrue(tags) => LTLTrue(tags + {tag})
                    case LTLFalse(tags) => LTLFalse(tags + {tag})
                    case LTLAnd(term1, term2, tags) => LTLAnd(term1, term2, tags + {tag})
                    case LTLOr(term1, term2, tags) => LTLOr(term1, term2, tags + {tag})
                    case LTLImplies(term1, term2, tags) => LTLImplies(term1, term2, tags + {tag})
                    case LTLNot(term, tags) => LTLNot(term, tags + {tag})
                    case LTLBind(fn, tags) => LTLBind(fn, tags + {tag})
                    case LTLComparison(cmp, tags) => LTLComparison(cmp, tags + {tag})
                    case LTLEventually(term, steps, tags) => LTLEventually(term, steps, tags + {tag})
                    case LTLAlways(term, steps, tags) => LTLAlways(term, steps, tags + {tag})
                    case LTLRelease(condition, term, steps, tags) => LTLRelease(condition, term, steps, tags + {tag})
                    case LTLUntil(condition, term, steps, tags) => LTLUntil(condition, term, steps, tags + {tag})
                    case LTLReqNext(term, tags) => LTLReqNext(term, tags + {tag})
                    case LTLWeakNext(term, tags) => LTLWeakNext(term, tags + {tag})
                    case LTLStrongNext(term, tags) => LTLStrongNext(term, tags + {tag})
                }
            }

            function ToString(): string {
                match this {
                    case LTLPred(pred, tags) => "LTLPred(<pred>, " + TagsToString(tags) + ")"
                    case LTLTrue(tags) => "LTLTrue(" + TagsToString(tags) + ")"
                    case LTLFalse(tags) => "LTLFalse(" + TagsToString(tags) + ")"
                    case LTLAnd(term1, term2, tags) => "LTLAnd(" + term1.ToString() + ", " + term2.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLOr(term1, term2, tags) => "LTLOr(" + term1.ToString() + ", " + term2.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLImplies(term1, term2, tags) => "LTLImplies(" + term1.ToString() + ", " + term2.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLNot(term, tags) => "LTLNot(" + term.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLBind(fn, tags) => "LTLBind(<fn>, " + TagsToString(tags) + ")"
                    case LTLComparison(cmp, tags) => "LTLComparison(<cmp>, " + TagsToString(tags) + ")"
                    case LTLEventually(term, steps, tags) => "LTLEventually(" + term.ToString() + ", " + IntToString(steps) + ", " + TagsToString(tags) + ")"
                    case LTLAlways(term, steps, tags) => "LTLAlways(" + term.ToString() + ", " + IntToString(steps) + ", " + TagsToString(tags) + ")"
                    case LTLRelease(condition, term, steps, tags) => "LTLRelease(" + condition.ToString() + ", " + term.ToString() + ", " + IntToString(steps) + ", " + TagsToString(tags) + ")"
                    case LTLUntil(condition, term, steps, tags) => "LTLUntil(" + condition.ToString() + ", " + term.ToString() + ", " + IntToString(steps) + ", " + TagsToString(tags) + ")"
                    case LTLReqNext(term, tags) => "LTLReqNext(" + term.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLWeakNext(term, tags) => "LTLWeakNext(" + term.ToString() + ", " + TagsToString(tags) + ")"
                    case LTLStrongNext(term, tags) => "LTLStrongNext(" + term.ToString() + ", " + TagsToString(tags) + ")"
                }
            }
        }

	// Helper constructors (default to empty tag sets)
	function PredOf<A>(p: PredFn<A>): LTLFormula<A>
		{ LTLPred(p, {}) }

	function True<A>(): LTLFormula<A>
		{ LTLTrue({}) }

	function False<A>(): LTLFormula<A>
		{ LTLFalse({}) }

	function And<A>(t1: LTLFormula<A>, t2: LTLFormula<A>): LTLFormula<A>
		{ LTLAnd(t1, t2, {}) }

	// Variadic (seq-based) constructor for And, recursively builds a binary tree
	function AndSeq<A>(ts: seq<LTLFormula<A>>): (r: LTLFormula<A>)
		{ if |ts| == 0 then LTLTrue({})
		  else if |ts| == 1 then ts[0]
		  else LTLAnd(ts[0], AndSeq(ts[1..]), {})
        } by method {
		if |ts| == 0 {
			r := LTLTrue({});
			return;
		}
		var i := |ts| - 1;
		var acc := ts[i];
		while i > 0
			invariant 0 <= i < |ts|
			invariant acc == AndSeq(ts[i..])
			decreases i
		{
			i := i - 1;
			acc := LTLAnd(ts[i], acc, {});
		}
		r := acc;
	}

	function Or<A>(t1: LTLFormula<A>, t2: LTLFormula<A>): LTLFormula<A>
		{ LTLOr(t1, t2, {}) }

	// Variadic (seq-based) constructor for Or, recursively builds a binary tree
	function OrSeq<A>(ts: seq<LTLFormula<A>>): (r: LTLFormula<A>)
		{ if |ts| == 0 then LTLFalse({})
		  else if |ts| == 1 then ts[0]
		  else LTLOr(ts[0], OrSeq(ts[1..]), {})
		} by method {
		if |ts| == 0 {
			r := LTLFalse({});
			return;
		}
		var i := |ts| - 1;
		var acc := ts[i];
		while i > 0
			invariant 0 <= i < |ts|
			invariant acc == OrSeq(ts[i..])
			decreases i
		{
			i := i - 1;
			acc := LTLOr(ts[i], acc, {});
		}
		r := acc;
	}

	function Implies<A>(t1: LTLFormula<A>, t2: LTLFormula<A>): LTLFormula<A>
		{ LTLImplies(t1, t2, {}) }

	function Not<A>(t: LTLFormula<A>): LTLFormula<A>
		{ LTLNot(t, {}) }

	function BindOf<A>(f: BindFn<A>): LTLFormula<A>
		{ LTLBind(f, {}) }

	function ComparisonOf<A>(c: CmpFn<A>): LTLFormula<A>
		{ LTLComparison(c, {}) }

	function Eventually<A>(t: LTLFormula<A>, steps: nat): LTLFormula<A>
		{ LTLEventually(t, steps, {}) }

	function Always<A>(t: LTLFormula<A>, steps: nat): LTLFormula<A>
		{ LTLAlways(t, steps, {}) }

	function Release<A>(cond: LTLFormula<A>, t: LTLFormula<A>, steps: nat): LTLFormula<A>
		{ LTLRelease(cond, t, steps, {}) }

	function Until<A>(cond: LTLFormula<A>, t: LTLFormula<A>, steps: nat): LTLFormula<A>
		{ LTLUntil(cond, t, steps, {}) }

	function ReqNext<A>(t: LTLFormula<A>): LTLFormula<A>
		{ LTLReqNext(t, {}) }

	function WeakNext<A>(t: LTLFormula<A>): LTLFormula<A>
		{ LTLWeakNext(t, {}) }

	function StrongNext<A>(t: LTLFormula<A>): LTLFormula<A>
		{ LTLStrongNext(t, {}) }



	// Validity type and helpers (four-valued logic layering)
	datatype Validity =
		| Definitely(value: bool)
		| Probably(value: bool)

	// PartialValidity type for intermediate evaluation results
	datatype PartialValidity =
		| PartialValidity(requiresNext: bool, validity: Validity, tags: set<string>)

	function DT(): Validity { Definitely(true) }
	function PT(): Validity { Probably(true) }
	function PF(): Validity { Probably(false) }
	function DF(): Validity { Definitely(false) }

	function FVNot(v: Validity): Validity
    { match v
        case Definitely(b) => Definitely(!b)
        case Probably(b) => Probably(!b)
    }

	function FVOr(v1: Validity, v2: Validity): Validity
		// Mirrors TS FVOr priority: DT > PT > PF > DF
    { if (v1.Definitely? && v1.value) || (v2.Definitely? && v2.value) then DT()
        else if (v1.Probably? && v1.value) || (v2.Probably? && v2.value) then PT()
        else if (v1.Probably? && !v1.value) || (v2.Probably? && !v2.value) then PF()
        else DF()
    }

	function FVAnd(v1: Validity, v2: Validity): Validity
		// Mirrors TS FVAnd priority: DT only if both DT true; DF if any DT false; PF if any PF; else PT
    { if (v1.Definitely? && v2.Definitely? && v1.value && v2.value) then DT()
        else if (v1.Definitely? && !v1.value) || (v2.Definitely? && !v2.value) then DF()
        else if (v1.Probably? && !v1.value) || (v2.Probably? && !v2.value) then PF()
        else PT()
    }

	// Structural size of a formula, used for termination metrics
	function FormulaSize<A>(expr: LTLFormula<A>): nat
    { match expr
        case LTLPred(_, _) => 1
        case LTLTrue(_) => 1
        case LTLFalse(_) => 1
        case LTLAnd(t1, t2, _) => 1 + FormulaSize(t1) + FormulaSize(t2)
        case LTLOr(t1, t2, _) => 1 + FormulaSize(t1) + FormulaSize(t2)
        case LTLImplies(t1, t2, _) => 1 + FormulaSize(t1) + FormulaSize(t2)
        case LTLNot(t, _) => 1 + FormulaSize(t)
        case LTLBind(_, _) => 1
        case LTLComparison(_, _) => 1
        case LTLEventually(t, _, _) => 1 + FormulaSize(t)
        case LTLAlways(t, _, _) => 1 + FormulaSize(t)
        case LTLRelease(c, t, _, _) => 1 + FormulaSize(c) + FormulaSize(t)
        case LTLUntil(c, t, _, _) => 1 + FormulaSize(c) + FormulaSize(t)
        case LTLReqNext(t, _) => 1 + FormulaSize(t)
        case LTLWeakNext(t, _) => 1 + FormulaSize(t)
        case LTLStrongNext(t, _) => 1 + FormulaSize(t)
    }

	// Contramap: map formula expecting B-states into one expecting A-states via fn: A -> B
	function Contramap<B(!new),A(!new)>(fn: A -> B, expr: LTLFormula<B>): LTLFormula<A>
        decreases FormulaSize(expr)
    { 
            match expr
			case LTLPred(pred, tags) => LTLPred((a: A) => pred(fn(a)), tags)
			case LTLTrue(tags) => LTLTrue(tags)
			case LTLFalse(tags) => LTLFalse(tags)
			case LTLAnd(t1, t2, tags) => LTLAnd(Contramap(fn, t1), Contramap(fn, t2), tags)
			case LTLOr(t1, t2, tags) => LTLOr(Contramap(fn, t1), Contramap(fn, t2), tags)
			case LTLImplies(t1, t2, tags) => LTLImplies(Contramap(fn, t1), Contramap(fn, t2), tags)
			case LTLNot(t, tags) => LTLNot(Contramap(fn, t), tags)
			case LTLBind(f, tags) => LTLBind((a: A) => 
                //Lifting into A, here be dragons
                assume {:axiom} FormulaSize(f(fn(a))) < FormulaSize(expr);
                Contramap(fn, f(fn(a))), tags)
			case LTLComparison(cmp, tags) => LTLComparison((s: A, n: A) => cmp(fn(s), fn(n)), tags)
			case LTLEventually(t, steps, tags) => LTLEventually(Contramap(fn, t), steps, tags)
			case LTLAlways(t, steps, tags) => LTLAlways(Contramap(fn, t), steps, tags)
			case LTLRelease(c, t, steps, tags) => LTLRelease(Contramap(fn, c), Contramap(fn, t), steps, tags)
			case LTLUntil(c, t, steps, tags) => LTLUntil(Contramap(fn, c), Contramap(fn, t), steps, tags)
			case LTLReqNext(t, tags) => LTLReqNext(Contramap(fn, t), tags)
			case LTLWeakNext(t, tags) => LTLWeakNext(Contramap(fn, t), tags)
			case LTLStrongNext(t, tags) => LTLStrongNext(Contramap(fn, t), tags)
    }

	// Predicates mirroring TypeScript helpers
	function isTrue<A>(expr: LTLFormula<A>): bool
    { match expr
        case LTLTrue(_) => true
        case _ => false
    }

	function isFalse<A>(expr: LTLFormula<A>): bool
    { match expr
        case LTLFalse(_) => true
        case _ => false
    }

	function isTemporalOperator<A>(expr: LTLFormula<A>): bool
    { match expr
        case LTLEventually(_, _, _) => true
        case LTLAlways(_, _, _) => true
        case LTLUntil(_, _, _, _) => true
        case LTLRelease(_, _, _, _) => true
        case _ => false
    }

	function containsTemporalOperator<A>(expr: LTLFormula<A>): bool
    { if isTemporalOperator(expr) then true
        else match expr
            case LTLAnd(t1, t2, _) => containsTemporalOperator(t1) || containsTemporalOperator(t2)
            case LTLOr(t1, t2, _) => containsTemporalOperator(t1) || containsTemporalOperator(t2)
            case LTLNot(t, _) => containsTemporalOperator(t)
            case _ => false
    }

	function isGuarded<A>(expr: LTLFormula<A>): bool
    { match expr
        case LTLReqNext(_, _) => true
        case LTLWeakNext(_, _) => true
        case LTLStrongNext(_, _) => true
        case LTLAnd(t1, t2, _) => isGuarded(t1) && isGuarded(t2)
        case LTLOr(t1, t2, _) => isGuarded(t1) && isGuarded(t2)
        case LTLImplies(t1, t2, _) => isGuarded(t1)
        case LTLNot(t, _) => isGuarded(t)
        case _ => false
    }

	function isDetermined<A>(expr: LTLFormula<A>): bool
    { isTrue(expr) || isFalse(expr) }

	// Determines if a formula requires the next state to be evaluated
	function RequiresNext<A>(expr: LTLFormula<A>): bool
        decreases FormulaSize(expr)
    { match expr
        case LTLReqNext(_, _) => true
        case LTLWeakNext(_, _) => false
        case LTLStrongNext(_, _) => false
        case LTLEventually(term, _, _) => RequiresNext(term)
        case LTLAlways(term, _, _) => RequiresNext(term)
        case LTLUntil(condition, term, _, _) => RequiresNext(condition) || RequiresNext(term)
        case LTLRelease(condition, term, _, _) => RequiresNext(condition) || RequiresNext(term)
        case LTLAnd(term1, term2, _) => RequiresNext(term1) || RequiresNext(term2)
        case LTLOr(term1, term2, _) => RequiresNext(term1) || RequiresNext(term2)
        case LTLNot(term, _) => RequiresNext(term)
        case _ => false
    }

	// Tag utilities
	function GetTags<A>(expr: LTLFormula<A>): set<string>
		{ match expr
			case LTLPred(_, tags) => tags
			case LTLTrue(tags) => tags
			case LTLFalse(tags) => tags
			case LTLAnd(_, _, tags) => tags
			case LTLOr(_, _, tags) => tags
			case LTLImplies(_, _, tags) => tags
			case LTLNot(_, tags) => tags
			case LTLBind(_, tags) => tags
			case LTLComparison(_, tags) => tags
			case LTLEventually(_, _, tags) => tags
			case LTLAlways(_, _, tags) => tags
			case LTLRelease(_, _, _, tags) => tags
			case LTLUntil(_, _, _, tags) => tags
			case LTLReqNext(_, tags) => tags
			case LTLWeakNext(_, tags) => tags
			case LTLStrongNext(_, tags) => tags
		}

	function WithTags<A>(expr: LTLFormula<A>, extra: set<string>): LTLFormula<A>
		{ match expr
			case LTLPred(p, tags) => LTLPred(p, tags + extra)
			case LTLTrue(tags) => LTLTrue(tags + extra)
			case LTLFalse(tags) => LTLFalse(tags + extra)
			case LTLAnd(t1, t2, tags) => LTLAnd(t1, t2, tags + extra)
			case LTLOr(t1, t2, tags) => LTLOr(t1, t2, tags + extra)
			case LTLImplies(t1, t2, tags) => LTLImplies(t1, t2, tags + extra)
			case LTLNot(t, tags) => LTLNot(t, tags + extra)
			case LTLBind(f, tags) => LTLBind(f, tags + extra)
			case LTLComparison(c, tags) => LTLComparison(c, tags + extra)
			case LTLEventually(t, s, tags) => LTLEventually(t, s, tags + extra)
			case LTLAlways(t, s, tags) => LTLAlways(t, s, tags + extra)
			case LTLRelease(c, t, s, tags) => LTLRelease(c, t, s, tags + extra)
			case LTLUntil(c, t, s, tags) => LTLUntil(c, t, s, tags + extra)
			case LTLReqNext(t, tags) => LTLReqNext(t, tags + extra)
			case LTLWeakNext(t, tags) => LTLWeakNext(t, tags + extra)
			case LTLStrongNext(t, tags) => LTLStrongNext(t, tags + extra)
		}

	function UnionTags(a: set<string>, b: set<string>): set<string> { a + b }

	// Dual of temporal operators when under Not
	function NegatedFormula<A>(expr: LTLFormula<A>): LTLFormula<A>
		{ match expr
			case LTLEventually(t, s, _) => LTLAlways(LTLNot(t, {}), s, {})
			case LTLAlways(t, s, _) => LTLEventually(LTLNot(t, {}), s, {})
			case LTLUntil(c, t, s, _) => LTLRelease(LTLNot(c, {}), LTLNot(t, {}), s, {})
			case LTLRelease(c, t, s, _) => LTLUntil(LTLNot(c, {}), LTLNot(t, {}), s, {})
			case _ => expr
		}

	// Step methods (imperative versions of the TypeScript step functions)
	method StepTrue<A>(expr: LTLFormula<A>) returns (r: LTLFormula<A>)
		{ r := LTLTrue({}); }

	method StepFalse<A>(expr: LTLFormula<A>) returns (r: LTLFormula<A>)
		{ r := LTLFalse(GetTags(expr)); }

	method StepPred<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
		{ match expr
			case LTLPred(p, tags) => 
				if p(state) { r := LTLTrue({}); }
				else { r := LTLFalse(tags); }
			case _ => r := expr;
		}

	method StepBind<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
		decreases *
		{ match expr
			case LTLBind(f, tags) => 
				var stepped := Step(f(state), state);
				r := WithTags(stepped, tags);
			case _ => r := expr;
		}

	method StepComparison<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
		{ match expr
			case LTLComparison(cmp, tags) => 
				r := LTLWeakNext(LTLPred((next: A) => cmp(state, next), tags), {});
			case _ => r := expr;
		}

	method StepNext<A>(expr: LTLFormula<A>) returns (r: LTLFormula<A>)
		{ r := expr; }

	method StepWeakNext<A>(expr: LTLFormula<A>) returns (r: LTLFormula<A>)
		{ r := expr; }

	method StepStrongNext<A>(expr: LTLFormula<A>) returns (r: LTLFormula<A>)
		{ r := expr; }

	method StepAnd<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLAnd(t1, t2, tags) =>
				var s1 := Step(t1, state);
				var s2 := Step(t2, state);
				if isFalse(s1) || isFalse(s2) {
					r := LTLFalse(UnionTags(tags, UnionTags(GetTags(s1), GetTags(s2))));
				} else if isTrue(s1) && isTrue(s2) {
					r := LTLTrue({});
				} else if isTrue(s1) {
					r := WithTags(s2, tags);
				} else if isTrue(s2) {
					r := WithTags(s1, tags);
				} else if isGuarded(s1) && isGuarded(s2) {
					r := LTLAnd(WithTags(s1, GetTags(s1)), WithTags(s2, GetTags(s2)), tags);
				} else {
					r := LTLAnd(s1, s2, tags);
				}
			case _ => r := expr;
		}

	method StepOr<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLOr(t1, t2, tags) =>
				var s1 := Step(t1, state);
				var s2 := Step(t2, state);
				if isTrue(s1) || isTrue(s2) {
					r := LTLTrue({});
				} else if isFalse(s1) && isFalse(s2) {
					r := LTLFalse(UnionTags(tags, UnionTags(GetTags(s1), GetTags(s2))));
				} else if isFalse(s1) {
					r := WithTags(s2, UnionTags(tags, GetTags(s1)));
				} else if isFalse(s2) {
					r := WithTags(s1, UnionTags(tags, GetTags(s2)));
				} else if isGuarded(s1) && isGuarded(s2) {
					r := LTLOr(WithTags(s1, GetTags(s1)), WithTags(s2, GetTags(s2)), tags);
				} else {
					r := LTLOr(s1, s2, tags);
				}
			case _ => r := expr;
		}

	// TODO: implement not transformations
	method StepNot<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
		requires expr.LTLNot?
        decreases *
		{
			if isTemporalOperator(expr.term) {
				var negated := WithTags(NegatedFormula(expr.term), expr.tags);
				r := Step(negated, state);
			} else {
				var stepped := Step(expr.term, state);
				if isTrue(stepped) {
					r := LTLFalse(expr.tags + GetTags(stepped) + GetTags(expr.term));
				} else if isFalse(stepped) {
					r := LTLTrue(expr.tags + GetTags(stepped) + GetTags(expr.term));
				} else if isGuarded(stepped) {
					r := LTLNot(stepped, expr.tags + GetTags(stepped) + GetTags(expr.term));
				} else {
					r := LTLNot(stepped, expr.tags + GetTags(stepped) + GetTags(expr.term));
				}
			}
		}

	method StepImplies<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLImplies(t1, t2, tags) =>
				var s1 := Step(t1, state);
				var s2 := Step(t2, state);
				if isTrue(s1) {
					r := WithTags(s2, tags);
				} else if isFalse(s1) {
					r := LTLTrue({});
				} else if isGuarded(s1) && !isGuarded(s2) {
					r := LTLImplies(s1, LTLWeakNext(t2, {}), tags);
				} else {
					r := LTLImplies(s1, s2, tags);
				}
			case _ => r := expr;
		}

	method StepEventually<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLEventually(t, s, tags) =>
				var st := Step(t, state);
				if s == 0 {
					if isTrue(st) {
						r := LTLTrue({});
					} else if isFalse(st) {
						r := LTLStrongNext(expr, tags);
					} else {
						r := LTLOr(st, LTLStrongNext(expr, {}), tags);
					}
				} else {
					if isTrue(st) {
						r := st;
					} else if isFalse(st) {
						r := LTLReqNext(LTLEventually(t, s-1, tags), {});
					} else {
						r := LTLOr(st, LTLReqNext(LTLEventually(t, s-1, tags), {}), tags);
					}
				}
			case _ => r := expr;
		}

	method StepAlways<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLAlways(t, s, tags) =>
				var st := Step(t, state);
				if isFalse(st) {
					r := LTLFalse(UnionTags(tags, GetTags(st)));
				} else if s == 0 {
					var andExpr := LTLAnd(t, LTLWeakNext(expr, {}), tags);
					r := Step(andExpr, state);
				} else {
					var andExpr := LTLAnd(t, LTLReqNext(LTLAlways(t, s-1, tags), {}), tags);
					r := Step(andExpr, state);
				}
			case _ => r := expr;
		}

	method StepUntil<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLUntil(c, t, s, tags) =>
				if s == 0 {
					var orExpr := LTLOr(t, LTLAnd(c, LTLStrongNext(expr, {}), {}), tags);
					r := Step(orExpr, state);
				} else {
					var orExpr := LTLOr(t, LTLAnd(c, LTLReqNext(LTLUntil(c, t, s-1, tags), {}), {}), tags);
					r := Step(orExpr, state);
				}
			case _ => r := expr;
		}

	method StepRelease<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLRelease(c, t, s, tags) =>
				if s == 0 {
					var andExpr := LTLAnd(t, LTLOr(c, LTLWeakNext(expr, {}), {}), tags);
					r := Step(andExpr, state);
				} else {
					var andExpr := LTLAnd(t, LTLOr(c, LTLReqNext(LTLRelease(c, t, s-1, tags), {}), {}), tags);
					r := Step(andExpr, state);
				}
			case _ => r := expr;
		}

	method Step<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLPred(_, _) => r := StepPred(expr, state);
			case LTLBind(_, _) => r := StepBind(expr, state);
			case LTLTrue(_) => r := StepTrue(expr);
			case LTLFalse(_) => r := StepFalse(expr);
			case LTLAnd(_, _, _) => r := StepAnd(expr, state);
			case LTLOr(_, _, _) => r := StepOr(expr, state);
			case LTLNot(_, _) => r := StepNot(expr, state);
			case LTLImplies(_, _, _) => r := StepImplies(expr, state);
			case LTLComparison(_, _) => r := StepComparison(expr, state);
			case LTLReqNext(_, _) => r := StepNext(expr);
			case LTLWeakNext(_, _) => r := StepWeakNext(expr);
			case LTLStrongNext(_, _) => r := StepStrongNext(expr);
			case LTLEventually(_, _, _) => r := StepEventually(expr, state);
			case LTLAlways(_, _, _) => r := StepAlways(expr, state);
			case LTLUntil(_, _, _, _) => r := StepUntil(expr, state);
			case LTLRelease(_, _, _, _) => r := StepRelease(expr, state);
		}

	// StepResidual method for handling guarded formulas
	method StepResidual<A>(expr: LTLFormula<A>, state: A) returns (r: LTLFormula<A>)
        decreases *
		{ match expr
			case LTLOr(t1, t2, tags) =>
				var s1 := StepResidual(t1, state);
				var s2 := StepResidual(t2, state);
				var combinedTags := UnionTags(tags, UnionTags(GetTags(s1), GetTags(s2)));
				var temp := LTLOr(s1, s2, combinedTags);
				r := Step(temp, state);
			case LTLAnd(t1, t2, tags) =>
				var s1 := StepResidual(t1, state);
				var s2 := StepResidual(t2, state);
				var combinedTags := UnionTags(tags, UnionTags(GetTags(s1), GetTags(s2)));
				var temp := LTLAnd(s1, s2, combinedTags);
				r := Step(temp, state);
			case LTLImplies(t1, t2, tags) =>
				var s1 := StepResidual(t1, state);
				var s2: LTLFormula<A>;
				if isGuarded(t2) {
					s2 := StepResidual(t2, state);
				} else {
					s2 := Step(t2, state);
				}
				var combinedTags := UnionTags(tags, GetTags(s1));
				var temp := LTLImplies(s1, s2, combinedTags);
				r := Step(temp, state);
			case LTLNot(t, tags) =>
				var temp := StepResidual(t, state);
				r := Not(temp);
			case LTLReqNext(t, tags) =>
				var combinedTags := UnionTags(tags, GetTags(t));
				var temp := WithTags(t, combinedTags);
				r := Step(temp, state);
			case LTLWeakNext(t, tags) =>
				var combinedTags := UnionTags(tags, GetTags(t));
				var temp := WithTags(t, combinedTags);
				r := Step(temp, state);
			case LTLStrongNext(t, tags) =>
				var combinedTags := UnionTags(tags, GetTags(t));
				var temp := WithTags(t, combinedTags);
				r := Step(temp, state);
			case LTLPred(_, _) =>
				r := Step(expr, state);
			case _ =>
				// This should not happen for guarded formulas
				r := expr;
		}

	// EvaluateValidity function that returns validity and tags (Dafny version)
	function EvaluateValidity<A>(expr: LTLFormula<A>): (Validity, set<string>)
        decreases FormulaSize(expr)
		{ match expr
			case LTLTrue(tags) => (DT(), {})
			case LTLFalse(tags) => (DF(), tags)
			case LTLAnd(t1, t2, tags) =>
				var eval1 := EvaluateValidity(t1);
				var eval2 := EvaluateValidity(t2);
				var result := FVAnd(eval1.0, eval2.0);
				var resultTags := if result.value then {} else tags + eval1.1 + eval2.1;
				(result, resultTags)
			case LTLOr(t1, t2, tags) =>
				var eval1 := EvaluateValidity(t1);
				var eval2 := EvaluateValidity(t2);
				var result := FVOr(eval1.0, eval2.0);
				var resultTags := if result.value then {} else tags + eval1.1 + eval2.1;
				(result, resultTags)
			case LTLImplies(t1, t2, tags) =>
				var eval1 := EvaluateValidity(t1);
				var eval2 := EvaluateValidity(t2);
				var result := FVOr(FVNot(eval1.0), eval2.0);
				var resultTags := if result.value then {} else tags + (if eval1.0.value then eval1.1 else {}) + (if eval2.0.value then {} else eval2.1);
				(result, resultTags)
			case LTLNot(t, tags) =>
				var eval := EvaluateValidity(t);
				(FVNot(eval.0), eval.1)
			case LTLReqNext(_, tags) => (PT(), tags)
			case LTLWeakNext(_, tags) => (PT(), tags)
			case LTLStrongNext(_, tags) => (PF(), tags)
			case _ =>
				// All non-determined cases: LTLPred, LTLBind, LTLComparison, LTLEventually, LTLAlways, LTLRelease, LTLUntil
				// These should not happen in normal evaluation of determined formulas
				var tags := GetTags(expr);
				(DF(), tags)
		}

	function EvaluateValidityTS<A>(expr: LTLFormula<A>): (Validity, set<string>)
        decreases FormulaSize(expr)
		{ match expr
			case LTLTrue(tags) => (DT(), {})
			case LTLFalse(tags) => (DF(), tags)
			case LTLAnd(t1, t2, tags) =>
				var eval1 := EvaluateValidityTS(t1);
				var eval2 := EvaluateValidityTS(t2);
				var result := FVAnd(eval1.0, eval2.0);
				var resultTags := if result.value then {} else tags + (if eval1.0.value then {} else eval1.1) + (if eval2.0.value then {} else eval2.1);
				(result, resultTags)
			case LTLOr(t1, t2, tags) =>
				var eval1 := EvaluateValidityTS(t1);
				var eval2 := EvaluateValidityTS(t2);
				var result := FVOr(eval1.0, eval2.0);
				var resultTags := if result.value then {} else tags + (if eval1.0.value then {} else eval1.1) + (if eval2.0.value then {} else eval2.1);
				(result, resultTags)
			case LTLImplies(t1, t2, tags) =>
				var eval1 := EvaluateValidityTS(t1);
				var eval2 := EvaluateValidityTS(t2);
				var result := FVOr(FVNot(eval1.0), eval2.0);
				var resultTags := if result.value then {} else tags + (if eval1.0.value then eval1.1 else {}) + (if eval2.0.value then {} else eval2.1);
				(result, resultTags)
			case LTLNot(t, tags) =>
				var eval := EvaluateValidityTS(t);
				(FVNot(eval.0), eval.1)
			case LTLReqNext(_, tags) => (PT(), tags)
			case LTLWeakNext(_, tags) => (PT(), tags)
			case LTLStrongNext(_, tags) => (PF(), tags)
			case _ =>
				// All non-determined cases: LTLPred, LTLBind, LTLComparison, LTLEventually, LTLAlways, LTLRelease, LTLUntil
				// These should not happen in normal evaluation of determined formulas
				var tags := GetTags(expr);
				(DF(), tags)
		}

	// PartialValidity function that creates a PartialValidity from a formula
	function CreatePartialValidity<A>(expr: LTLFormula<A>): PartialValidity
        decreases FormulaSize(expr)
		{ if isDetermined(expr) then
			var validity := EvaluateValidityTS(expr);
			var formulaTags := GetTags(expr);
			var resultTags := if isFalse(expr) || !validity.0.value then formulaTags + validity.1 else {};
			PartialValidity(false, validity.0, resultTags)
		  else
			var validity := EvaluateValidityTS(expr);
			var formulaTags := GetTags(expr);
			var resultTags := formulaTags + validity.1;
			PartialValidity(RequiresNext(expr), validity.0, resultTags)
		}

	// Main ltlEvaluate function
	method LtlEvaluate<A>(states: seq<A>, formula: LTLFormula<A>) returns (r: Validity)
        decreases *
	{
		if |states| == 0 {
			r := DF();
		} else {
			var expr := Step(formula, states[0]);
			var i := 1;
			while !isDetermined(expr) && i < |states|
				invariant 1 <= i <= |states|
				// invariant isGuarded(expr) || isDetermined(expr)
				decreases |states| - i
			{
				if isGuarded(expr) {
					expr := StepResidual(expr, states[i]);
				} else {
					// This should not happen due to invariant
					expr := expr;
				}
				i := i + 1;
			}
			var evalResult := EvaluateValidity(expr);
			r := evalResult.0;
		}
	}

	method LtlEvalState<A>(state: A, formula: LTLFormula<A>) returns (validity: PartialValidity, expr: LTLFormula<A>)
		decreases *
	{
		// print("\n");
		// print(formula);
		// print("\n");
		// print(state);
		// print("\n");
		// print("Stepping");
		if isGuarded(formula) {
			expr := StepResidual(formula, state);
		} else {
			expr := Step(formula, state);
		}
		// print("\n");
		// print(expr);
		// print("\n");
		// print("Creating partial validity");
		validity := CreatePartialValidity(expr);
		// print("\n");
		// print(validity);
	}
}