package ltl

import scala.collection.immutable.Set as ImmutableSet

// Temporal operator evaluation
object TemporalEvaluator:
  
  def stepEventually[A](expr: LTLEventually[A], state: A): LTLFormula[A] = 
    val ownTags = TagUtils.collectTags(expr)
    
    // Handle nested eventually
    val processedExpr = expr.term match
      case LTLEventually(term, termSteps, _, _) => 
        LTLConstructors.eventually(term, Math.max(expr.steps, termSteps))
      case _ => expr
    
    if processedExpr.steps == 0 then
      val term = LTLEvaluator.step(processedExpr.term, state)
      term match
        case LTLTrue(_, _) => LTLConstructors.`true`()
        case LTLFalse(_, _) => TagUtils.applyTags(LTLConstructors.strongNext(processedExpr), ownTags)
        case _ if LTLFormula.isGuarded(term) => 
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.or(term, LTLConstructors.strongNext(LTLConstructors.eventually(processedExpr.term, processedExpr.steps))), 
            ownTags
          ), state)
        case _ => LTLConstructors.or(term, LTLConstructors.strongNext(processedExpr))
    else
      val term = LTLEvaluator.step(processedExpr.term, state)
      term match
        case LTLTrue(_, _) => term
        case LTLFalse(_, _) => TagUtils.applyTags(LTLConstructors.requiredNext(LTLConstructors.eventually(processedExpr.term, processedExpr.steps - 1)), ownTags)
        case _ if LTLFormula.isGuarded(term) => 
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.or(term, LTLConstructors.requiredNext(LTLConstructors.eventually(processedExpr.term, processedExpr.steps - 1))), 
            ownTags
          ), state)
        case _ => LTLConstructors.or(term, TagUtils.applyTags(LTLConstructors.requiredNext(LTLConstructors.eventually(processedExpr.term, processedExpr.steps - 1)), ownTags))
  
  def stepAlways[A](expr: LTLAlways[A], state: A): LTLFormula[A] = 
    // Handle nested always
    val processedExpr = expr.term match
      case LTLAlways(term, termSteps, _, _) => 
        LTLConstructors.always(term, Math.max(expr.steps, termSteps))
      case _ => expr
    
    val term = LTLEvaluator.step(processedExpr.term, state)
    val ownTags = TagUtils.collectTags(processedExpr)
    val tags = ownTags ++ TagUtils.collectTags(term)
    
    term match
      case LTLFalse(_, _) => TagUtils.applyTags(LTLConstructors.`false`(), tags)
      case _ if processedExpr.steps == 0 =>
        if LTLFormula.containsTemporalOperator(processedExpr.term) then
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.and(processedExpr.term, LTLConstructors.weakNext(LTLConstructors.always(decrementSteps(processedExpr.term), processedExpr.steps))), 
            tags
          ), state)
        else
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.and(processedExpr.term, LTLConstructors.weakNext(processedExpr)), 
            tags
          ), state)
      case _ =>
        if LTLFormula.containsTemporalOperator(processedExpr.term) then
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.and(processedExpr.term, LTLConstructors.weakNext(LTLConstructors.always(decrementSteps(processedExpr.term), processedExpr.steps - 1))), 
            tags
          ), state)
        else
          LTLEvaluator.step(TagUtils.applyTags(
            LTLConstructors.and(processedExpr.term, LTLConstructors.requiredNext(LTLConstructors.always(processedExpr.term, processedExpr.steps - 1))), 
            tags
          ), state)
  
  def stepUntil[A](expr: LTLUntil[A], state: A): LTLFormula[A] = 
    val tags = TagUtils.collectTags(expr)
    
    if expr.steps == 0 then
      if LTLFormula.containsTemporalOperator(expr.condition) then
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.or(expr.term, LTLConstructors.and(expr.condition, LTLConstructors.strongNext(LTLConstructors.until(decrementSteps(expr.condition), expr.term, expr.steps)))), 
          tags
        ), state)
      else
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.or(expr.term, LTLConstructors.and(expr.condition, LTLConstructors.strongNext(expr))), 
          tags
        ), state)
    else
      if LTLFormula.containsTemporalOperator(expr.condition) then
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.or(expr.term, LTLConstructors.and(expr.condition, LTLConstructors.requiredNext(LTLConstructors.until(decrementSteps(expr.condition), expr.term, expr.steps - 1)))), 
          tags
        ), state)
      else
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.or(expr.term, LTLConstructors.and(expr.condition, LTLConstructors.requiredNext(LTLConstructors.until(expr.condition, expr.term, expr.steps - 1)))), 
          tags
        ), state)
  
  def stepRelease[A](expr: LTLRelease[A], state: A): LTLFormula[A] = 
    val tags = TagUtils.collectTags(expr)
    
    if expr.steps == 0 then
      if LTLFormula.containsTemporalOperator(expr.term) then
        // Prevent infinite step recursion by reducing the number of steps
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.and(expr.term, LTLConstructors.or(expr.condition, LTLConstructors.weakNext(LTLConstructors.release(expr.condition, decrementSteps(expr.term), expr.steps)))), 
          tags
        ), state)
      else
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.and(expr.term, LTLConstructors.or(expr.condition, LTLConstructors.weakNext(expr))), 
          tags
        ), state)
    else
      if LTLFormula.containsTemporalOperator(expr.term) then
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.and(expr.term, LTLConstructors.or(expr.condition, LTLConstructors.requiredNext(LTLConstructors.release(expr.condition, decrementSteps(expr.term), expr.steps - 1)))), 
          tags
        ), state)
      else
        LTLEvaluator.step(TagUtils.applyTags(
          LTLConstructors.and(expr.term, LTLConstructors.or(expr.condition, LTLConstructors.requiredNext(LTLConstructors.release(expr.condition, expr.term, expr.steps - 1)))), 
          tags
        ), state)
  
  // Helper function to decrement steps for temporal operators
  def decrementSteps[A](expr: LTLFormula[A]): LTLFormula[A] = 
    if LTLFormula.isTemporalOperator(expr) && expr.asInstanceOf[LTLEventually[A] | LTLAlways[A] | LTLUntil[A] | LTLRelease[A]] match
      case LTLEventually(_, steps, _, _) => steps == 0
      case LTLAlways(_, steps, _, _) => steps == 0
      case LTLUntil(_, _, steps, _, _) => steps == 0
      case LTLRelease(_, _, steps, _, _) => steps == 0
    then expr
    else expr match
      case LTLEventually(term, steps, tag, tags) => LTLConstructors.eventually(decrementSteps(term), steps - 1)
      case LTLAlways(term, steps, tag, tags) => LTLConstructors.always(decrementSteps(term), steps - 1)
      case LTLUntil(condition, term, steps, tag, tags) => LTLConstructors.until(decrementSteps(condition), decrementSteps(term), steps - 1)
      case LTLRelease(condition, term, steps, tag, tags) => LTLConstructors.release(decrementSteps(condition), decrementSteps(term), steps - 1)
      case LTLAnd(term1, term2, tag, tags) => LTLConstructors.and(decrementSteps(term1), decrementSteps(term2))
      case LTLOr(term1, term2, tag, tags) => LTLConstructors.or(decrementSteps(term1), decrementSteps(term2))
      case LTLNot(term, tag, tags) => LTLConstructors.not(decrementSteps(term))
      case LTLRequiredNext(term, tag, tags) => LTLConstructors.requiredNext(decrementSteps(term))
      case LTLWeakNext(term, tag, tags) => LTLConstructors.weakNext(decrementSteps(term))
      case LTLStrongNext(term, tag, tags) => LTLConstructors.strongNext(decrementSteps(term))
      case _ => expr
