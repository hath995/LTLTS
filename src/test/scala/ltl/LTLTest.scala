package ltl

import munit.FunSuite

class LTLTest extends FunSuite:
  
  // Test state type
  case class TestState(value: Int, flag: Boolean)
  
  test("Basic predicate evaluation") {
    val formula = LTL.predicate((state: TestState) => state.value > 5)
    val result = LTL.ltlEvaluate(Seq(TestState(6, true)), formula)
    assert(result == Validity.DT)
    
    val result2 = LTL.ltlEvaluate(Seq(TestState(3, true)), formula)
    assert(result2 == Validity.DF)
  }
  
  test("Logical operators") {
    val formula = LTL.and(
      LTL.predicate((s: TestState) => s.value > 5),
      LTL.predicate((s: TestState) => s.flag)
    )
    
    val result1 = LTL.ltlEvaluate(Seq(TestState(6, true)), formula)
    assert(result1 == Validity.DT)
    
    val result2 = LTL.ltlEvaluate(Seq(TestState(6, false)), formula)
    assert(result2 == Validity.DF)
    
    val result3 = LTL.ltlEvaluate(Seq(TestState(3, true)), formula)
    assert(result3 == Validity.DF)
  }
  
  test("Or operator") {
    val formula = LTL.or(
      LTL.predicate((s: TestState) => s.value > 5),
      LTL.predicate((s: TestState) => s.flag)
    )
    
    val result1 = LTL.ltlEvaluate(Seq(TestState(6, false)), formula)
    assert(result1 == Validity.DT)
    
    val result2 = LTL.ltlEvaluate(Seq(TestState(3, true)), formula)
    assert(result2 == Validity.DT)
    
    val result3 = LTL.ltlEvaluate(Seq(TestState(3, false)), formula)
    assert(result3 == Validity.DF)
  }
  
  test("Not operator") {
    val formula = LTL.not(LTL.predicate((s: TestState) => s.value > 5))
    
    val result1 = LTL.ltlEvaluate(Seq(TestState(3, true)), formula)
    assert(result1 == Validity.DT)
    
    val result2 = LTL.ltlEvaluate(Seq(TestState(6, true)), formula)
    assert(result2 == Validity.DF)
  }
  
  test("Implication") {
    val formula = LTL.implies(
      LTL.predicate((s: TestState) => s.value > 5),
      LTL.predicate((s: TestState) => s.flag)
    )
    
    val result1 = LTL.ltlEvaluate(Seq(TestState(6, true)), formula)
    assert(result1 == Validity.DT)
    
    val result2 = LTL.ltlEvaluate(Seq(TestState(6, false)), formula)
    assert(result2 == Validity.DF)
    
    val result3 = LTL.ltlEvaluate(Seq(TestState(3, true)), formula)
    assert(result3 == Validity.DT)
  }
  
  test("Eventually operator") {
    val formula = LTL.eventually(LTL.predicate((s: TestState) => s.value > 5))
    
    val states = Seq(
      TestState(3, true),
      TestState(4, true),
      TestState(6, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
  
  test("Always operator") {
    val formula = LTL.always(LTL.predicate((s: TestState) => s.value > 0))
    
    val states = Seq(
      TestState(1, true),
      TestState(2, true),
      TestState(3, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
  
  test("Until operator") {
    val formula = LTL.until(
      LTL.predicate((s: TestState) => s.value < 5),
      LTL.predicate((s: TestState) => s.value > 10)
    )
    
    val states = Seq(
      TestState(3, true),
      TestState(4, true),
      TestState(11, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
  
  test("Next operators") {
    val formula = LTL.next(LTL.predicate((s: TestState) => s.value > 5))
    
    val states = Seq(
      TestState(3, true),
      TestState(6, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
  
  test("State comparison") {
    val formula = LTL.comparison(LTL.unchanged((s: TestState) => s.flag))
    
    val states = Seq(
      TestState(3, true),
      TestState(4, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
  
  test("Tagging") {
    val formula = LTL.tag("test", LTL.predicate((s: TestState) => s.value > 5))
    
    val result = LTL.ltlEvaluate(Seq(TestState(6, true)), formula)
    assert(result == Validity.DT)
  }
  
  test("Complex formula") {
    val formula = LTL.and(
      LTL.always(LTL.predicate((s: TestState) => s.value > 0)),
      LTL.eventually(LTL.predicate((s: TestState) => s.value > 10))
    )
    
    val states = Seq(
      TestState(1, true),
      TestState(2, true),
      TestState(11, true)
    )
    
    val result = LTL.ltlEvaluate(states, formula)
    assert(result == Validity.DT)
  }
