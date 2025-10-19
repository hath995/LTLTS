package ltl

import scala.collection.immutable.Set as ImmutableSet

// Main LTL evaluation functions
object LTLEvaluation:
  
  // Evaluate LTL formula over a sequence of states
  def ltlEvaluate[A](states: Seq[A], formula: LTLFormula[A]): Validity = 
    if states.isEmpty then Validity.DF
    else
      var expr = LTLEvaluator.step(formula, states.head)
      
      if !LTLFormula.isGuarded(expr) && !LTLFormula.isDetermined(expr) then
        throw new Error("The formula is not guarded.")
      
      var i = 1
      while !LTLFormula.isDetermined(expr) && i < states.length do
        if LTLFormula.isGuarded(expr) then
          expr = LTLEvaluator.stepResidual(expr, states(i))
        else
          throw new Error("The formula is not guarded.")
        i += 1
      
      ValidityEvaluator.evaluateValidity(expr)._1
  
  // Generator-based evaluation for streaming states
  def ltlEvaluateGenerator[A](formula: LTLFormula[A], initialState: A): LazyList[PartialValidity] = 
    val ownTags = TagUtils.collectTags(formula)
    var expr = LTLEvaluator.step(TagUtils.applyTags(formula, ownTags), initialState)
    var currentState = initialState
    
    LazyList.continually {
      if LTLFormula.isDetermined(expr) then
        ValidityEvaluator.partialValidity(expr)
      else if LTLFormula.isGuarded(expr) then
        val ownTags = TagUtils.collectTags(expr)
        expr = LTLEvaluator.stepResidual(TagUtils.applyTags(expr, ownTags), currentState)
        ValidityEvaluator.partialValidity(expr)
      else
        throw new Error("The formula is not guarded.")
    }
  
  // Calculate required steps for a formula
  def requiredSteps[A](formula: LTLFormula[A]): Int = formula match
    case LTLEventually(term, steps, _, _) => steps + 1 + requiredSteps(term)
    case LTLAlways(term, steps, _, _) => steps + 1 + requiredSteps(term)
    case LTLUntil(condition, term, steps, _, _) => Math.max(steps + 1, requiredSteps(term) + requiredSteps(condition))
    case LTLRelease(condition, term, steps, _, _) => Math.max(steps + 1, requiredSteps(term) + requiredSteps(condition))
    case LTLAnd(term1, term2, _, _) => Math.max(requiredSteps(term1), requiredSteps(term2))
    case LTLOr(term1, term2, _, _) => Math.max(requiredSteps(term1), requiredSteps(term2))
    case LTLNot(term, _, _) => requiredSteps(term)
    case LTLRequiredNext(term, _, _) => 1 + requiredSteps(term)
    case LTLWeakNext(term, _, _) => requiredSteps(term)
    case LTLStrongNext(term, _, _) => requiredSteps(term)
    case _ => 0

// Utility functions for state comparison
object StateComparison:
  
  // Check if a property is unchanged between states
  def unchanged[A](property: A => Any): Comparison[A] = 
    (state1, state2) => property(state1) == property(state2)
  
  // Check if a property has changed between states
  def changed[A](property: A => Any): Comparison[A] = 
    (state1, state2) => property(state1) != property(state2)
  
  // Check if multiple properties are unchanged
  def unchanged[A](properties: (A => Any)*): Comparison[A] = 
    (state1, state2) => properties.forall(prop => prop(state1) == prop(state2))
  
  // Check if multiple properties have changed
  def changed[A](properties: (A => Any)*): Comparison[A] = 
    (state1, state2) => properties.forall(prop => prop(state1) != prop(state2))

// Main LTL API
object LTL:
  // Re-export all constructors
  export LTLConstructors.*
  
  // Re-export evaluation functions
  export LTLEvaluation.{ltlEvaluate, ltlEvaluateGenerator, requiredSteps}
  
  // Re-export validity functions
  export ValidityEvaluator.{partialValidity, evaluateValidity}
  
  // Re-export state comparison utilities
  export StateComparison.*
  
  // Re-export type predicates
  export LTLFormula.{isTrue, isFalse, isDetermined, isTemporalOperator, isGuarded, containsTemporalOperator}
