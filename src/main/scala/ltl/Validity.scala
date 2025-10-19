package ltl

import scala.collection.immutable.Set as ImmutableSet

// Four-valued logic operations
object ValidityLogic:
  
  def fvOr(v1: Validity, v2: Validity): Validity = (v1, v2) match
    case (Definitely(true), _) | (_, Definitely(true)) => Validity.DT
    case (Probably(true), _) | (_, Probably(true)) => Validity.PT
    case (Probably(false), _) | (_, Probably(false)) => Validity.PF
    case _ => Validity.DF
  
  def fvAnd(v1: Validity, v2: Validity): Validity = (v1, v2) match
    case (Definitely(true), Definitely(true)) => Validity.DT
    case (Definitely(false), _) | (_, Definitely(false)) => Validity.DF
    case (Probably(false), _) | (_, Probably(false)) => Validity.PF
    case _ => Validity.PT
  
  def fvNot(v: Validity): Validity = v match
    case Definitely(value) => Definitely(!value)
    case Probably(value) => Probably(!value)

// Validity evaluation for LTL formulas
object ValidityEvaluator:
  
  def evaluateValidity[A](expr: LTLFormula[A]): (Validity, ImmutableSet[String]) = 
    expr match
      case LTLTrue(_, tags) => (Validity.DT, ImmutableSet.empty)
      case LTLFalse(_, tags) => (Validity.DF, TagUtils.collectTags(expr))
      case LTLAnd(term1, term2, _, _) =>
        val (v1, tags1) = evaluateValidity(term1)
        val (v2, tags2) = evaluateValidity(term2)
        val result = ValidityLogic.fvAnd(v1, v2)
        val allTags = TagUtils.collectTags(expr)
        val resultTags = if result.value then ImmutableSet.empty 
                        else allTags ++ (if !v1.value then tags1 else ImmutableSet.empty) ++ 
                             (if !v2.value then tags2 else ImmutableSet.empty)
        (result, resultTags)
      case LTLOr(term1, term2, _, _) =>
        val (v1, tags1) = evaluateValidity(term1)
        val (v2, tags2) = evaluateValidity(term2)
        val result = ValidityLogic.fvOr(v1, v2)
        val allTags = TagUtils.collectTags(expr)
        val resultTags = if result.value then ImmutableSet.empty 
                        else allTags ++ (if !v1.value then tags1 else ImmutableSet.empty) ++ 
                             (if !v2.value then tags2 else ImmutableSet.empty)
        (result, resultTags)
      case LTLImplies(term1, term2, _, _) =>
        val (v1, tags1) = evaluateValidity(term1)
        val (v2, tags2) = evaluateValidity(term2)
        val result = ValidityLogic.fvOr(ValidityLogic.fvNot(v1), v2)
        val allTags = TagUtils.collectTags(expr)
        val resultTags = if result.value then ImmutableSet.empty 
                        else allTags ++ (if v1.value then tags1 else ImmutableSet.empty) ++ 
                             (if !v2.value then tags2 else ImmutableSet.empty)
        (result, resultTags)
      case LTLNot(term, _, _) =>
        val (v, tags) = evaluateValidity(term)
        (ValidityLogic.fvNot(v), tags)
      case LTLRequiredNext(_, _, _) => (Validity.PT, TagUtils.collectTags(expr))
      case LTLWeakNext(_, _, _) => (Validity.PT, TagUtils.collectTags(expr))
      case LTLStrongNext(_, _, _) => (Validity.PF, TagUtils.collectTags(expr))
      case _ => (Validity.DF, TagUtils.collectTags(expr))
  
  def partialValidity[A](formula: LTLFormula[A]): PartialValidity = 
    if LTLFormula.isDetermined(formula) then
      val (validity, tags) = evaluateValidity(formula)
      val resultTags = if LTLFormula.isFalse(formula) || !validity.value then 
        TagUtils.collectTags(formula) ++ tags 
      else ImmutableSet.empty
      PartialValidity(requiresNext = false, validity, resultTags)
    else
      val (validity, tags) = evaluateValidity(formula)
      PartialValidity(
        requiresNext = requiresNext(formula),
        validity,
        TagUtils.collectTags(formula) ++ tags
      )
  
  def requiresNext[A](formula: LTLFormula[A]): Boolean = formula match
    case LTLRequiredNext(_, _, _) => true
    case LTLWeakNext(_, _, _) => false
    case LTLStrongNext(_, _, _) => false
    case LTLEventually(term, _, _, _) => requiresNext(term)
    case LTLAlways(term, _, _, _) => requiresNext(term)
    case LTLUntil(term, condition, _, _, _) => requiresNext(term) || requiresNext(condition)
    case LTLRelease(term, condition, _, _, _) => requiresNext(term) || requiresNext(condition)
    case LTLAnd(term1, term2, _, _) => requiresNext(term1) || requiresNext(term2)
    case LTLOr(term1, term2, _, _) => requiresNext(term1) || requiresNext(term2)
    case LTLNot(term, _, _) => requiresNext(term)
    case _ => false
