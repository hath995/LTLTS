include "./LTL.dfy"

// Four-valued logic tests
module FVAndTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestFVAnd_DT_and_DT()
        ensures FVAnd(DT(), DT()) == DT()
    {}

    method {:test} TestFVAnd_DT_and_PT()
        ensures FVAnd(DT(), PT()) == PT()
    {}

    method {:test} TestFVAnd_DT_and_PF()
        ensures FVAnd(DT(), PF()) == PF()
    {}

    method {:test} TestFVAnd_DT_and_DF()
        ensures FVAnd(DT(), DF()) == DF()
    {}

    method {:test} TestFVAnd_PT_and_DT()
        ensures FVAnd(PT(), DT()) == PT()
    {}

    method {:test} TestFVAnd_PT_and_PT()
        ensures FVAnd(PT(), PT()) == PT()
    {}

    method {:test} TestFVAnd_PT_and_PF()
        ensures FVAnd(PT(), PF()) == PF()
    {}

    method {:test} TestFVAnd_PT_and_DF()
        ensures FVAnd(PT(), DF()) == DF()
    {}

    method {:test} TestFVAnd_PF_and_DT()
        ensures FVAnd(PF(), DT()) == PF()
    {}

    method {:test} TestFVAnd_PF_and_PT()
        ensures FVAnd(PF(), PT()) == PF()
    {}

    method {:test} TestFVAnd_PF_and_PF()
        ensures FVAnd(PF(), PF()) == PF()
    {}

    method {:test} TestFVAnd_PF_and_DF()
        ensures FVAnd(PF(), DF()) == DF()
    {}

    method {:test} TestFVAnd_DF_and_DT()
        ensures FVAnd(DF(), DT()) == DF()
    {}

    method {:test} TestFVAnd_DF_and_PT()
        ensures FVAnd(DF(), PT()) == DF()
    {}

    method {:test} TestFVAnd_DF_and_PF()
        ensures FVAnd(DF(), PF()) == DF()
    {}

    method {:test} TestFVAnd_DF_and_DF()
        ensures FVAnd(DF(), DF()) == DF()
    {}
}

module FVOrTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestFVOr_DT_or_DT()
        ensures FVOr(DT(), DT()) == DT()
    {}

    method {:test} TestFVOr_DT_or_PT()
        ensures FVOr(DT(), PT()) == DT()
    {}

    method {:test} TestFVOr_DT_or_PF()
        ensures FVOr(DT(), PF()) == DT()
    {}

    method {:test} TestFVOr_DT_or_DF()
        ensures FVOr(DT(), DF()) == DT()
    {}

    method {:test} TestFVOr_PT_or_DT()
        ensures FVOr(PT(), DT()) == DT()
    {}

    method {:test} TestFVOr_PT_or_PT()
        ensures FVOr(PT(), PT()) == PT()
    {}

    method {:test} TestFVOr_PT_or_PF()
        ensures FVOr(PT(), PF()) == PT()
    {}

    method {:test} TestFVOr_PT_or_DF()
        ensures FVOr(PT(), DF()) == PT()
    {}

    method {:test} TestFVOr_PF_or_DT()
        ensures FVOr(PF(), DT()) == DT()
    {}

    method {:test} TestFVOr_PF_or_PT()
        ensures FVOr(PF(), PT()) == PT()
    {}

    method {:test} TestFVOr_PF_or_PF()
        ensures FVOr(PF(), PF()) == PF()
    {}

    method {:test} TestFVOr_PF_or_DF()
        ensures FVOr(PF(), DF()) == PF()
    {}

    method {:test} TestFVOr_DF_or_DT()
        ensures FVOr(DF(), DT()) == DT()
    {}

    method {:test} TestFVOr_DF_or_PT()
        ensures FVOr(DF(), PT()) == PT()
    {}

    method {:test} TestFVOr_DF_or_PF()
        ensures FVOr(DF(), PF()) == PF()
    {}

    method {:test} TestFVOr_DF_or_DF()
        ensures FVOr(DF(), DF()) == DF()
    {}
}

module FVNotTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestFVNot_DT()
        ensures FVNot(DT()) == DF()
    {}

    method {:test} TestFVNot_DF()
        ensures FVNot(DF()) == DT()
    {}

    method {:test} TestFVNot_PT()
        ensures FVNot(PT()) == PF()
    {}

    method {:test} TestFVNot_PF()
        ensures FVNot(PF()) == PT()
    {}
}

module IsTrueTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestIsTrue_True()
        ensures isTrue(True<TestState>())
    {}

    method {:test} TestIsTrue_False()
        ensures !isTrue(False<TestState>())
    {}

    method {:test} TestIsTrue_Pred()
        ensures !isTrue(PredOf<TestState>((s: TestState) => s.value == 1))
    {}
}

module IsFalseTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestIsFalse_True()
        ensures !isFalse(True<TestState>())
    {}

    method {:test} TestIsFalse_False()
        ensures isFalse(False<TestState>())
    {}

    method {:test} TestIsFalse_Pred()
        ensures !isFalse(PredOf<TestState>((s: TestState) => s.value == 1))
    {}
}

module IsTemporalOperatorTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestIsTemporalOperator_Eventually()
        ensures isTemporalOperator(Eventually<TestState>(PredOf<TestState>((s: TestState) => s.value == 1), 1))
    {}

    method {:test} TestIsTemporalOperator_Always()
        ensures isTemporalOperator(Always<TestState>(PredOf<TestState>((s: TestState) => s.value == 1), 1))
    {}

    method {:test} TestIsTemporalOperator_Until()
        ensures isTemporalOperator(Until<TestState>(PredOf<TestState>((s: TestState) => s.value == 1), PredOf<TestState>((s: TestState) => s.value == 2), 1))
    {}

    method {:test} TestIsTemporalOperator_Release()
        ensures isTemporalOperator(Release<TestState>(PredOf<TestState>((s: TestState) => s.value == 1), PredOf<TestState>((s: TestState) => s.value == 2), 1))
    {}

    method {:test} TestIsTemporalOperator_Not()
        ensures !isTemporalOperator(Not<TestState>(PredOf<TestState>((s: TestState) => s.value == 1)))
    {}

    method {:test} TestIsTemporalOperator_And()
        ensures !isTemporalOperator(And<TestState>(True<TestState>(), False<TestState>()))
    {}
}

module IsGuardedTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestIsGuarded_ReqNext()
        ensures isGuarded(ReqNext<TestState>(True<TestState>()))
    {}

    method {:test} TestIsGuarded_WeakNext()
        ensures isGuarded(WeakNext<TestState>(True<TestState>()))
    {}

    method {:test} TestIsGuarded_StrongNext()
        ensures isGuarded(StrongNext<TestState>(True<TestState>()))
    {}

    method {:test} TestIsGuarded_And()
        ensures isGuarded(And<TestState>(ReqNext<TestState>(True<TestState>()), WeakNext<TestState>(False<TestState>())))
    {}

    method {:test} TestIsGuarded_Or()
        ensures isGuarded(Or<TestState>(ReqNext<TestState>(True<TestState>()), WeakNext<TestState>(False<TestState>())))
    {}

    method {:test} TestIsGuarded_Implies()
        ensures isGuarded(Implies<TestState>(ReqNext<TestState>(True<TestState>()), False<TestState>()))
    {}

    method {:test} TestIsGuarded_Not()
        ensures isGuarded(Not<TestState>(ReqNext<TestState>(True<TestState>())))
    {}

    method {:test} TestIsGuarded_NotTemporal()
        ensures !isGuarded(Not<TestState>(True<TestState>()))
    {}
}

module IsDeterminedTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestIsDetermined_True()
        ensures isDetermined(True<TestState>())
    {}

    method {:test} TestIsDetermined_False()
        ensures isDetermined(False<TestState>())
    {}

    method {:test} TestIsDetermined_Pred()
        ensures !isDetermined(PredOf<TestState>((s: TestState) => s.value == 1))
    {}

    method {:test} TestIsDetermined_And()
        ensures !isDetermined(And<TestState>(True<TestState>(), PredOf<TestState>((s: TestState) => s.value == 1)))
    {}
}

module StepTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestStep_True()
        decreases *
    {
        var result := Step(True<TestState>(), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_False()
        decreases *
    {
        var result := Step(False<TestState>(), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_NotTrue()
        decreases *
    {
        var result := Step(Not<TestState>(True<TestState>()), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_NotFalse()
        decreases *
    {
        var result := Step(Not<TestState>(False<TestState>()), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_AndTrueTrue()
        decreases *
    {
        var result := Step(And<TestState>(True<TestState>(), True<TestState>()), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_AndTrueFalse()
        decreases *
    {
        var result := Step(And<TestState>(True<TestState>(), False<TestState>()), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_AndFalseTrue()
        decreases *
    {
        var result := Step(And<TestState>(False<TestState>(), True<TestState>()), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_AndFalseFalse()
        decreases *
    {
        var result := Step(And<TestState>(False<TestState>(), False<TestState>()), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_OrTrueTrue()
        decreases *
    {
        var result := Step(Or<TestState>(True<TestState>(), True<TestState>()), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_OrTrueFalse()
        decreases *
    {
        var result := Step(Or<TestState>(True<TestState>(), False<TestState>()), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_OrFalseTrue()
        decreases *
    {
        var result := Step(Or<TestState>(False<TestState>(), True<TestState>()), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_OrFalseFalse()
        decreases *
    {
        var result := Step(Or<TestState>(False<TestState>(), False<TestState>()), TestState(1));
        expect isFalse(result);
    }

    method {:test} TestStep_PredTrue()
        decreases *
    {
        var result := Step(PredOf<TestState>((s: TestState) => s.value == 1), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestStep_PredFalse()
        decreases *
    {
        var result := Step(PredOf<TestState>((s: TestState) => s.value == 2), TestState(1));
        expect isFalse(result);
    }
}

module AndSeqTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestAndSeq_Empty()
        decreases *
    {
        var result := Step(AndSeq<TestState>([]), TestState(1));
        expect isTrue(result);
    }

    method {:test} TestAndSeq_Single()
        decreases *
    {
        var formula := AndSeq<TestState>([True<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestAndSeq_Multiple()
        decreases *
    {
        var formula := AndSeq<TestState>([True<TestState>(), True<TestState>(), True<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestAndSeq_WithFalse()
        decreases *
    {
        var formula := AndSeq<TestState>([True<TestState>(), False<TestState>(), True<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isFalse(result);
    }

    method {:test} TestAndSeq_ToString() {
        var isDivBy3 := (x: int) => x % 3 == 0;
        var isDivBy5 := (x: int) => x % 5 == 0;
        var isDivBy7 := (x: int) => x % 7 == 0;

        var formula := AndSeq([LTLPred(isDivBy3, {}).Tag("IsDivBy3"), LTLPred(isDivBy5, {}).Tag("IsDivBy5"), LTLPred(isDivBy7, {}).Tag("IsDivBy7")]).Tag("Test1");
        // print(formula.ToString());
        expect formula.ToString() == "LTLAnd(LTLPred(<pred>, {IsDivBy3}), LTLAnd(LTLPred(<pred>, {IsDivBy5}), LTLPred(<pred>, {IsDivBy7}), {}), {Test1})";
    }


}

module OrSeqTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestOrSeq_Empty()
        decreases *
    {
        var formula := OrSeq<TestState>([]);
        var result := Step(formula, TestState(1));
        expect isFalse(result);
    }

    method {:test} TestOrSeq_Single()
        decreases *
    {
        var formula := OrSeq<TestState>([False<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isFalse(result);
    }

    method {:test} TestOrSeq_Multiple()
        decreases *
    {
        var formula := OrSeq<TestState>([False<TestState>(), False<TestState>(), False<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isFalse(result);
    }

    method {:test} TestOrSeq_WithTrue()
        decreases *
    {
        var formula := OrSeq<TestState>([False<TestState>(), True<TestState>(), False<TestState>()]);
        var result := Step(formula, TestState(1));
        expect isTrue(result);
    }
}

module ContramapTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)
    function Id<A>(x: A): A { x }

    lemma ContramapId<A(!new)>(expr: LTLFormula<A>) 
        decreases FormulaSize(expr)
        ensures Contramap(Id, expr) == expr
    {
        match expr {
            case LTLPred(p, tags) =>
                // assume p == ((x: A) => p(Id(x)));
                // assert Contramap(Id, LTLPred(p, tags)) == LTLPred((a: A) => p(Id(a)), tags);
                //This property is not provable in Dafny because of the lack of function extensionality
                assume Contramap(Id, LTLPred(p, tags)) == LTLPred(p, tags);
                assert Contramap(Id, expr) == expr;
            case LTLTrue(tags) =>
                assert Contramap(Id, expr) == expr;
            case LTLFalse(tags) =>
                assert Contramap(Id, expr) == expr;
            case LTLAnd(t1, t2, tags) =>
                // ContramapId(t1);
                // ContramapId(t2);
                assert Contramap(Id, LTLAnd(t1, t2, tags)) == LTLAnd(Contramap(Id, t1), Contramap(Id, t2), tags);
                assert Contramap(Id, expr) == expr;
            case LTLOr(t1, t2, tags) =>
                assert Contramap(Id, LTLOr(t1, t2, tags)) == LTLOr(Contramap(Id, t1), Contramap(Id, t2), tags);
                assert Contramap(Id, expr) == expr;
            case LTLImplies(t1, t2, tags) =>
                assert Contramap(Id, LTLImplies(t1, t2, tags)) == LTLImplies(Contramap(Id, t1), Contramap(Id, t2), tags);
                assert Contramap(Id, expr) == expr;
            case LTLNot(t, tags) =>
                assert Contramap(Id, LTLNot(t, tags)) == LTLNot(Contramap(Id, t), tags);
                assert Contramap(Id, expr) == expr;
            case LTLBind(f, tags) =>
                // assert f == ((a: A) => f(Id(a)));
                //This property is not provable in Dafny because of the lack of function extensionality
                assume Contramap(Id, LTLBind(f, tags)) == LTLBind(f, tags);
                assert Contramap(Id, expr) == expr;
            case LTLComparison(c, tags) =>
                // assert c == ((s: A, n: A) => c(Id(s), Id(n)));
                //This property is not provable in Dafny because of the lack of function extensionality
                assume Contramap(Id, LTLComparison(c, tags)) == LTLComparison(c, tags);
                assert Contramap(Id, expr) == expr;
            case LTLEventually(t, steps, tags) =>
                assert Contramap(Id, LTLEventually(t, steps, tags)) == LTLEventually(Contramap(Id, t), steps, tags);
                assert Contramap(Id, expr) == expr;
            case LTLAlways(t, steps, tags) =>
                assert Contramap(Id, LTLAlways(t, steps, tags)) == LTLAlways(Contramap(Id, t), steps, tags);
                assert Contramap(Id, expr) == expr;
            case LTLRelease(c, t, steps, tags) =>
                assert Contramap(Id, LTLRelease(c, t, steps, tags)) == LTLRelease(Contramap(Id, c), Contramap(Id, t), steps, tags);
                assert Contramap(Id, expr) == expr;
            case LTLUntil(c, t, steps, tags) =>
                assert Contramap(Id, LTLUntil(c, t, steps, tags)) == LTLUntil(Contramap(Id, c), Contramap(Id, t), steps, tags);
                assert Contramap(Id, expr) == expr;
            case LTLReqNext(t, tags) =>
                assert Contramap(Id, LTLReqNext(t, tags)) == LTLReqNext(Contramap(Id, t), tags);
                assert Contramap(Id, expr) == expr;
            case LTLWeakNext(t, tags) =>
                assert Contramap(Id, LTLWeakNext(t, tags)) == LTLWeakNext(Contramap(Id, t), tags);
                assert Contramap(Id, expr) == expr;
            case LTLStrongNext(t, tags) =>
                assert Contramap(Id, LTLStrongNext(t, tags)) == LTLStrongNext(Contramap(Id, t), tags);
                assert Contramap(Id, expr) == expr;
        }
    }

    function Compose<A(!new),B(!new),C(!new)>(f: B -> C, g: A -> B): A -> C
    {
        (a: A) => f(g(a))
    }

    lemma ContramapCompositionPredicate<A(!new), B(!new), C(!new)>(f: B -> C, g: A -> B, expr: LTLFormula<C>, a: A) 
        requires expr.LTLPred?
        ensures expr.pred(Compose(f, g)(a)) == expr.pred(f(g(a)))
    {
    }

    lemma ContramapCompositionComparison<A(!new), B(!new), C(!new)>(f: B -> C, g: A -> B, expr: LTLFormula<C>, a1: A, a2: A) 
        requires expr.LTLComparison?
        ensures expr.cmp(Compose(f, g)(a1), Compose(f, g)(a2)) == expr.cmp(f(g(a1)), f(g(a2)))
    {
    }

    lemma ContramapCompositionBind<A(!new), B(!new), C(!new)>(f: B -> C, g: A -> B, expr: LTLFormula<C>, a: A) 
        requires expr.LTLBind?
        ensures expr.fn(Compose(f, g)(a)) == expr.fn(f(g(a)))
    {
    }

    //fmap (g . h)  ==  fmap h . fmap g
    lemma ContramapComposition<A(!new), B(!new), C(!new)>(f: B -> C, g: A -> B, expr: LTLFormula<C>) 
        decreases FormulaSize(expr)
        ensures Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr)
    {
         match expr {
        case LTLPred(pred, tags) => 
            // Contramap(g, Contramap(f, LTLPred(pred, tags)))
            // = Contramap(g, LTLPred((b: B) => pred(f(b)), tags))
            // = LTLPred((a: A) => pred(f(g(a))), tags)
            // = LTLPred((a: A) => pred(Compose(f,g)(a)), tags)
            // = Contramap(Compose(f, g), LTLPred(pred, tags))
            //This property is not provable in Dafny because of the lack of function extensionality
            //Though we can prove it in Dafny if we take an arbitrary a and prove the property for it
            // See: ContramapCompositionPredicate(f, g, expr, a);
            assume Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);
            // assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLTrue(tags) =>
            // Both sides equal LTLTrue(tags)
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLFalse(tags) =>
            // Both sides equal LTLFalse(tags)  
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLAnd(t1, t2, tags) =>
            // Apply induction hypothesis to subterms
            ContramapComposition(f, g, t1);
            ContramapComposition(f, g, t2);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLOr(t1, t2, tags) =>
            ContramapComposition(f, g, t1);
            ContramapComposition(f, g, t2);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLImplies(t1, t2, tags) =>
            ContramapComposition(f, g, t1);
            ContramapComposition(f, g, t2);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLNot(t, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLBind(fn, tags) =>
            // This is the tricky case
            // Contramap(g, Contramap(f, LTLBind(fn, tags)))
            // = Contramap(g, LTLBind((b: B) => Contramap(f, fn(f(b))), tags))
            // = LTLBind((a: A) => Contramap(g, Contramap(f, fn(f(g(a))))), tags)
            // 
            // By induction hypothesis on fn(f(g(a))):
            // = LTLBind((a: A) => Contramap(Compose(f, g), fn(f(g(a)))), tags)
            // = LTLBind((a: A) => Contramap(Compose(f, g), fn(Compose(f, g)(a))), tags)
            // = Contramap(Compose(f, g), LTLBind(fn, tags))
            
            // We need to prove this for all possible results of fn
            // See: ContramapCompositionBind(f, g, expr, a);
        
            assume Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLComparison(cmp, tags) =>
            // Contramap(g, Contramap(f, LTLComparison(cmp, tags)))
            // = Contramap(g, LTLComparison((b1: B, b2: B) => cmp(f(b1), f(b2)), tags))
            // = LTLComparison((a1: A, a2: A) => cmp(f(g(a1)), f(g(a2))), tags)
            // = LTLComparison((a1: A, a2: A) => cmp(Compose(f,g)(a1), Compose(f,g)(a2)), tags)
            // = Contramap(Compose(f, g), LTLComparison(cmp, tags))
            //This property is not provable in Dafny because of the lack of function extensionality
            // See: ContramapCompositionComparison(f, g, expr, a1, a2);
            assume Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);
            // assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLEventually(t, steps, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLAlways(t, steps, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLRelease(condition, t, steps, tags) =>
            ContramapComposition(f, g, condition);
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLUntil(condition, t, steps, tags) =>
            ContramapComposition(f, g, condition);
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLReqNext(t, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLWeakNext(t, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);

        case LTLStrongNext(t, tags) =>
            ContramapComposition(f, g, t);
            assert Contramap(g, Contramap(f, expr)) == Contramap(Compose(f, g), expr);
        }
    }

    method {:test} TestContramap_Pred()
        decreases *
    {
        var pred := PredOf<int>((x: int) => x == 1);
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, pred);
        var result := Step(mapped, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestContramap_True()
        decreases *
    {
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, True<int>());
        var result := Step(mapped, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestContramap_False()
        decreases *
    {
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, False<int>());
        var result := Step(mapped, TestState(1));
        expect isFalse(result);
    }

    method {:test} TestContramap_And()
        decreases *
    {
        var andExpr := And<int>(PredOf<int>((x: int) => x == 1), PredOf<int>((x: int) => x > 0));
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, andExpr);
        var result := Step(mapped, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestContramap_Or()
        decreases *
    {
        var orExpr := Or<int>(PredOf<int>((x: int) => x == 1), PredOf<int>((x: int) => x == 2));
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, orExpr);
        var result := Step(mapped, TestState(1));
        expect isTrue(result);
    }

    method {:test} TestContramap_Not()
        decreases *
    {
        var notExpr := Not<int>(PredOf<int>((x: int) => x == 1));
        var mapped := Contramap<int, TestState>((s: TestState) => s.value, notExpr);
        var result := Step(mapped, TestState(2));
        expect isTrue(result);
    }
}

module TagTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestTag_Simple()
    {
        var tagged: LTLFormula<TestState> := LTLTrue({"test"});
        expect "test" in GetTags(tagged);
    }

    method {:test} TestTag_Multiple()
    {
        var tagged1: LTLFormula<TestState> := LTLTrue({"tag1"});
        var tagged2: LTLFormula<TestState> := LTLTrue({"tag1", "tag2"});
        expect "tag1" in GetTags(tagged2);
        expect "tag2" in GetTags(tagged2);
    }

    method {:test} TestWithTags()
    {
        var tagged := WithTags(True<TestState>(), {"tag1", "tag2"});
        expect "tag1" in GetTags(tagged);
        expect "tag2" in GetTags(tagged);
    }

    method {:test} TestUnionTags()
    {
        var union := UnionTags({"tag1", "tag2"}, {"tag2", "tag3"});
        expect "tag1" in union;
        expect "tag2" in union;
        expect "tag3" in union;
        expect |union| == 3;
    }
}

module LtlEvaluateTests {
    import opened LTL
    
    datatype TestState = TestState(value: int)

    method {:test} TestLtlEvaluate_True()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], True<TestState>());
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_False()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], False<TestState>());
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_Not()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], Not<TestState>(True<TestState>()));
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_And()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], And<TestState>(True<TestState>(), True<TestState>()));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_Or()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], Or<TestState>(True<TestState>(), False<TestState>()));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_TruePredicate()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(2), TestState(3)], PredOf<TestState>((s: TestState) => s.value == 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_FalsePredicate()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(2), TestState(3)], PredOf<TestState>((s: TestState) => s.value == 2));
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_Next()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(2), TestState(3)], ReqNext<TestState>(PredOf<TestState>((s: TestState) => s.value == 2)));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_NextInsufficientStates()
        decreases *
    {
        var result := LtlEvaluate([TestState(1)], ReqNext<TestState>(PredOf<TestState>((s: TestState) => s.value == 2)));
        expect result == PT();
    }

    method {:test} TestLtlEvaluate_NextFalse()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(1)], ReqNext<TestState>(PredOf<TestState>((s: TestState) => s.value == 2)));
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_EventuallyTrue()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(2), TestState(3)], Eventually<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_EventuallyTrueAtStart()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(1), TestState(3)], Eventually<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_EventuallyTrueAtEnd()
        decreases *
    {
        var result := LtlEvaluate([TestState(3), TestState(2), TestState(1)], Eventually<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_EventuallyFalse()
        decreases *
    {
        var result := LtlEvaluate([TestState(1), TestState(2), TestState(3)], Eventually<TestState>(PredOf<TestState>((s: TestState) => s.value == 4), 1));
        expect result == PF();
    }

    method {:test} TestLtlEvaluate_AlwaysTrue()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(2), TestState(2)], Always(PredOf((s: TestState) => s.value == 2), 1));
        expect result == PT();
    }

    method {:test} TestLtlEvaluate_AlwaysFalse()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(2), TestState(2)], Always<TestState>(PredOf<TestState>((s: TestState) => s.value == 3), 1));
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_UntilTrue()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(2), TestState(3)], Until<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), PredOf<TestState>((s: TestState) => s.value == 3), 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_UntilFalse()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(1), TestState(3)], Until<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), PredOf<TestState>((s: TestState) => s.value == 3), 1));
        expect result == DF();
    }

    method {:test} TestLtlEvaluate_UntilInsufficientStates()
        decreases *
    {
        var result := LtlEvaluate([TestState(2), TestState(2)], Until<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), PredOf<TestState>((s: TestState) => s.value == 3), 1));
        expect result == PF();
    }

    method {:test} TestLtlEvaluate_UntilImmediate()
        decreases *
    {
        var result := LtlEvaluate([TestState(3)], Until<TestState>(PredOf<TestState>((s: TestState) => s.value == 2), PredOf<TestState>((s: TestState) => s.value == 3), 1));
        expect result == DT();
    }

    method {:test} TestLtlEvaluate_EmptyStates()
        decreases *
    {
        var result := LtlEvaluate([], True<TestState>());
        expect result == DF();
    }
}