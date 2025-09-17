include "./LTL.dfy"
module LTL_tests {
    import opened LTL

    // Test data types for basic tests
    datatype TestState = TestState(value: int)

    // Four-valued logic tests
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

    // FVOr tests
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

    // FVNot tests
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

    // Helper function tests
    method {:test} TestIsTrue_True()
        ensures isTrue(True<TestState>())
    {}

    method {:test} TestIsTrue_False()
        ensures !isTrue(False<TestState>())
    {}

    method {:test} TestIsTrue_Pred()
        ensures !isTrue(PredOf<TestState>((s: TestState) => s.value == 1))
    {}

    method {:test} TestIsFalse_True()
        ensures !isFalse(True<TestState>())
    {}

    method {:test} TestIsFalse_False()
        ensures isFalse(False<TestState>())
    {}

    method {:test} TestIsFalse_Pred()
        ensures !isFalse(PredOf<TestState>((s: TestState) => s.value == 1))
    {}

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

    // Step function tests
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

    method {:test} TestStep_AndTruealse()
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

    method {:test} TestStep_AndFalsealse()
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

    method {:test} TestStep_OrTruealse()
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

    method {:test} TestStep_OrFalsealse()
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

    // AndSeq and OrSeq tests
    method {:test} TestAndSeq_Empty()
    {
        var result := AndSeq<TestState>([]);
        expect isTrue(result);
    }

    method {:test} TestAndSeq_Single()
    {
        var result := AndSeq<TestState>([True<TestState>()]);
        expect isTrue(result);
    }

    method {:test} TestAndSeq_Multiple()
    {
        var result := AndSeq<TestState>([True<TestState>(), True<TestState>(), True<TestState>()]);
        expect isTrue(result);
    }

    method {:test} TestAndSeq_WithFalse()
    {
        var result := AndSeq<TestState>([True<TestState>(), False<TestState>(), True<TestState>()]);
        expect isFalse(result);
    }

    method {:test} TestOrSeq_Empty()
    {
        var result := OrSeq<TestState>([]);
        expect isFalse(result);
    }

    method {:test} TestOrSeq_Single()
    {
        var result := OrSeq<TestState>([False<TestState>()]);
        expect isFalse(result);
    }

    method {:test} TestOrSeq_Multiple()
    {
        var result := OrSeq<TestState>([False<TestState>(), False<TestState>(), False<TestState>()]);
        expect isFalse(result);
    }

    method {:test} TestOrSeq_WithTrue()
    {
        var result := OrSeq<TestState>([False<TestState>(), True<TestState>(), False<TestState>()]);
        expect isTrue(result);
    }

    // Contramap tests
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

    // Tag tests
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