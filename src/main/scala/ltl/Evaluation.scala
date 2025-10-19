package ltl

import scala.collection.immutable.Set as ImmutableSet

// Core evaluation and stepping functions
object LTLEvaluator:
  
  // Main stepping function
  def step[A](expr: LTLFormula[A], state: A): LTLFormula[A] = expr match
    case LTLPredicate(pred, _, _) => stepPredicate(expr.asInstanceOf[LTLPredicate[A]], state)
    case LTLBind(fn, _, _) => stepBind(expr.asInstanceOf[LTLBind[A]], state)
    case LTLTrue(_, _) => stepTrue(expr.asInstanceOf[LTLTrue[A]])
    case LTLFalse(_, _) => stepFalse(expr.asInstanceOf[LTLFalse[A]])
    case LTLAnd(term1, term2, _, _) => stepAnd(expr.asInstanceOf[LTLAnd[A]], state)
    case LTLOr(term1, term2, _, _) => stepOr(expr.asInstanceOf[LTLOr[A]], state)
    case LTLNot(term, _, _) => stepNot(expr.asInstanceOf[LTLNot[A]], state)
    case LTLImplies(term1, term2, _, _) => stepImplies(expr.asInstanceOf[LTLImplies[A]], state)
    case LTLComparison(pred, _, _) => stepComparison(expr.asInstanceOf[LTLComparison[A]], state)
    case LTLRequiredNext(term, _, _) => stepRequiredNext(expr.asInstanceOf[LTLRequiredNext[A]], state)
    case LTLWeakNext(term, _, _) => stepWeakNext(expr.asInstanceOf[LTLWeakNext[A]], state)
    case LTLStrongNext(term, _, _) => stepStrongNext(expr.asInstanceOf[LTLStrongNext[A]], state)
    case LTLEventually(term, steps, _, _) => TemporalEvaluator.stepEventually(expr.asInstanceOf[LTLEventually[A]], state)
    case LTLAlways(term, steps, _, _) => TemporalEvaluator.stepAlways(expr.asInstanceOf[LTLAlways[A]], state)
    case LTLUntil(condition, term, steps, _, _) => TemporalEvaluator.stepUntil(expr.asInstanceOf[LTLUntil[A]], state)
    case LTLRelease(condition, term, steps, _, _) => TemporalEvaluator.stepRelease(expr.asInstanceOf[LTLRelease[A]], state)
  
  // Individual stepping functions
  def stepPredicate[A](expr: LTLPredicate[A], state: A): LTLFormula[A] = 
    if expr.pred(state) then LTLConstructors.`true`()
    else
      val tags = TagUtils.collectTags(expr)
      if tags.isEmpty then LTLConstructors.`false`()
      else TagUtils.applyTags(LTLConstructors.`false`(), tags)
  
  def stepBind[A](expr: LTLBind[A], state: A): LTLFormula[A] = 
    val ownTags = TagUtils.collectTags(expr)
    TagUtils.applyTags(step(expr.fn(state), state), ownTags)
  
  def stepTrue[A](expr: LTLTrue[A]): LTLTrue[A] = LTLConstructors.`true`()
  
  def stepFalse[A](expr: LTLFalse[A]): LTLFormula[A] = 
    val tags = TagUtils.collectTags(expr)
    TagUtils.applyTags(LTLConstructors.`false`(), tags)
  
  def stepAnd[A](expr: LTLAnd[A], state: A): LTLFormula[A] = 
    val term1 = step(expr.term1, state)
    val term2 = step(expr.term2, state)
    
    val processedTerm1 = if !LTLFormula.isGuarded(term1) && !LTLFormula.isDetermined(term1) 
                        then step(term1, state) else term1
    val processedTerm2 = if !LTLFormula.isGuarded(term2) && !LTLFormula.isDetermined(term2) 
                        then step(term2, state) else term2
    
    (processedTerm1, processedTerm2) match
      case (LTLFalse(_, _), _) | (_, LTLFalse(_, _)) =>
        val ownTags = TagUtils.collectTags(expr)
        val tags = if LTLFormula.isFalse(processedTerm1) && LTLFormula.isFalse(processedTerm2) then
          TagUtils.collectTags(processedTerm1) ++ TagUtils.collectTags(processedTerm2)
        else if LTLFormula.isFalse(processedTerm1) then TagUtils.collectTags(processedTerm1)
        else TagUtils.collectTags(processedTerm2)
        TagUtils.applyTags(LTLConstructors.`false`(), ownTags ++ tags)
      case (LTLTrue(_, _), LTLTrue(_, _)) => LTLConstructors.`true`()
      case (LTLTrue(_, _), _) => 
        val ownTags = TagUtils.collectTags(expr)
        TagUtils.applyTags(processedTerm2, ownTags)
      case (_, LTLTrue(_, _)) => 
        val ownTags = TagUtils.collectTags(expr)
        TagUtils.applyTags(processedTerm1, ownTags)
      case _ if LTLFormula.isGuarded(processedTerm1) && LTLFormula.isGuarded(processedTerm2) =>
        val ownTags = TagUtils.collectTags(expr)
        val term1Tags = TagUtils.collectTags(processedTerm1)
        val term2Tags = TagUtils.collectTags(processedTerm2)
        TagUtils.applyTags(
          LTLConstructors.and(
            TagUtils.applyTags(processedTerm1, term1Tags),
            TagUtils.applyTags(processedTerm2, term2Tags)
          ), 
          ownTags
        )
      case _ => throw new Error("GOT TO AND BAD SITUATION")
  
  def stepOr[A](expr: LTLOr[A], state: A): LTLFormula[A] = 
    val term1 = step(expr.term1, state)
    val term2 = step(expr.term2, state)
    
    val processedTerm1 = if !LTLFormula.isGuarded(term1) && !LTLFormula.isDetermined(term1) 
                        then step(term1, state) else term1
    val processedTerm2 = if !LTLFormula.isGuarded(term2) && !LTLFormula.isDetermined(term2) 
                        then step(term2, state) else term2
    
    (processedTerm1, processedTerm2) match
      case (LTLTrue(_, _), _) | (_, LTLTrue(_, _)) => LTLConstructors.`true`()
      case (LTLFalse(_, _), LTLFalse(_, _)) =>
        val tags = TagUtils.collectTags(expr) ++ TagUtils.collectTags(processedTerm1) ++ TagUtils.collectTags(processedTerm2)
        TagUtils.applyTags(LTLConstructors.`false`(), tags)
      case (LTLFalse(_, _), _) =>
        val tags = TagUtils.collectTags(expr) ++ TagUtils.collectTags(processedTerm1)
        TagUtils.applyTags(processedTerm2, tags)
      case (_, LTLFalse(_, _)) =>
        val tags = TagUtils.collectTags(expr) ++ TagUtils.collectTags(processedTerm2)
        TagUtils.applyTags(processedTerm1, tags)
      case _ if LTLFormula.isGuarded(processedTerm1) && LTLFormula.isGuarded(processedTerm2) =>
        val ownTags = TagUtils.collectTags(expr)
        val term1Tags = TagUtils.collectTags(processedTerm1)
        val term2Tags = TagUtils.collectTags(processedTerm2)
        TagUtils.applyTags(
          LTLConstructors.or(
            TagUtils.applyTags(processedTerm1, term1Tags),
            TagUtils.applyTags(processedTerm2, term2Tags)
          ), 
          ownTags
        )
      case _ => throw new Error("GOT TO OR BAD SITUATION")
  
  def stepNot[A](expr: LTLNot[A], state: A): LTLFormula[A] = 
    if LTLFormula.isTemporalOperator(expr.term) then
      val neg = negatedFormula(expr.term)
      val ownTags = TagUtils.collectTags(expr)
      step(TagUtils.applyTags(neg, ownTags), state)
    else expr.term match
      case LTLOr(term1, term2, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        step(TagUtils.applyTags(LTLConstructors.and(LTLConstructors.not(term1), LTLConstructors.not(term2)), ownTags), state)
      case LTLAnd(term1, term2, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        step(TagUtils.applyTags(LTLConstructors.or(LTLConstructors.not(term1), LTLConstructors.not(term2)), ownTags), state)
      case LTLNot(term, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        step(TagUtils.applyTags(term, ownTags), state)
      case LTLRequiredNext(term, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        TagUtils.applyTags(LTLConstructors.requiredNext(LTLConstructors.not(term)), ownTags)
      case LTLWeakNext(term, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        TagUtils.applyTags(LTLConstructors.weakNext(LTLConstructors.not(term)), ownTags)
      case LTLStrongNext(term, _, _) =>
        val ownTags = TagUtils.collectTags(expr)
        TagUtils.applyTags(LTLConstructors.strongNext(LTLConstructors.not(term)), ownTags)
      case _ =>
        val termTags = TagUtils.collectTags(expr.term)
        val term = step(expr.term, state)
        val ownTags = TagUtils.collectTags(expr)
        val tags = TagUtils.collectTags(term)
        term match
          case LTLTrue(_, _) => TagUtils.applyTags(LTLConstructors.`false`(), ownTags ++ tags ++ termTags)
          case LTLFalse(_, _) => TagUtils.applyTags(LTLConstructors.`true`(), ownTags ++ tags ++ termTags)
          case _ if LTLFormula.isGuarded(term) => term match
            case LTLRequiredNext(t, _, _) => TagUtils.applyTags(LTLConstructors.requiredNext(LTLConstructors.not(t)), ownTags ++ tags ++ termTags)
            case LTLWeakNext(t, _, _) => TagUtils.applyTags(LTLConstructors.weakNext(LTLConstructors.not(t)), ownTags ++ tags ++ termTags)
            case LTLStrongNext(t, _, _) => TagUtils.applyTags(LTLConstructors.strongNext(LTLConstructors.not(t)), ownTags ++ tags ++ termTags)
            case _ => TagUtils.applyTags(LTLConstructors.not(term), ownTags ++ tags ++ termTags)
          case _ => LTLConstructors.not(step(expr.term, state))
  
  def stepImplies[A](expr: LTLImplies[A], state: A): LTLFormula[A] = 
    val term1 = step(expr.term1, state)
    val term2 = step(expr.term2, state)
    
    if LTLFormula.isDetermined(term1) then
      term1 match
        case LTLTrue(_, _) => TagUtils.applyTags(term2, TagUtils.collectTags(expr))
        case LTLFalse(_, _) => LTLConstructors.`true`()
    else if LTLFormula.isGuarded(term1) && !LTLFormula.isGuarded(term2) then
      TagUtils.applyTags(LTLConstructors.implies(term1, LTLConstructors.weakNext(expr.term2)), TagUtils.collectTags(expr))
    else if LTLFormula.isGuarded(term2) && LTLFormula.isGuarded(term1) then
      TagUtils.applyTags(LTLConstructors.implies(term1, term2), TagUtils.collectTags(expr))
    else throw new Error("GOT TO IMPLIES BAD SITUATION")
  
  def stepComparison[A](expr: LTLComparison[A], state: A): LTLFormula[A] = 
    val tags = TagUtils.collectTags(expr)
    LTLConstructors.weakNext(TagUtils.applyTags(LTLConstructors.predicate((nextState: A) => expr.pred(state, nextState)), tags))
  
  def stepRequiredNext[A](expr: LTLRequiredNext[A], state: A): LTLFormula[A] = expr
  
  def stepWeakNext[A](expr: LTLWeakNext[A], state: A): LTLFormula[A] = expr
  
  def stepStrongNext[A](expr: LTLStrongNext[A], state: A): LTLFormula[A] = expr
  
  // Helper function for negating temporal operators
  def negatedFormula[A](expr: LTLFormula[A]): LTLFormula[A] = expr match
    case LTLEventually(term, steps, _, _) => LTLConstructors.always(LTLConstructors.not(term), steps)
    case LTLAlways(term, steps, _, _) => LTLConstructors.eventually(LTLConstructors.not(term), steps)
    case LTLUntil(condition, term, steps, _, _) => LTLConstructors.release(LTLConstructors.not(condition), LTLConstructors.not(term), steps)
    case LTLRelease(condition, term, steps, _, _) => LTLConstructors.until(LTLConstructors.not(condition), LTLConstructors.not(term), steps)
    case _ => throw new Error("Not a temporal operator")
  
  // Residual stepping for guarded formulas
  def stepResidual[A](expr: LTLFormula[A], state: A): LTLFormula[A] = expr match
    case LTLOr(term1, term2, _, _) =>
      val processedTerm1 = stepResidual(term1, state)
      val term1Tags = if LTLFormula.isFalse(processedTerm1) then TagUtils.collectTags(processedTerm1) else ImmutableSet.empty
      val processedTerm2 = stepResidual(term2, state)
      val term2Tags = if LTLFormula.isFalse(processedTerm2) then TagUtils.collectTags(processedTerm2) else ImmutableSet.empty
      val ownTags = if LTLFormula.isFalse(processedTerm1) && LTLFormula.isFalse(processedTerm2) then TagUtils.collectTags(expr) else ImmutableSet.empty
      val tags = ownTags ++ term1Tags ++ term2Tags
      try step(TagUtils.applyTags(LTLConstructors.or(processedTerm1, processedTerm2), tags), state)
      catch case e: Exception => 
        println(s"Warning: $e")
        println(s"expr: $expr")
        println(s"term1: $processedTerm1")
        println(s"term2: $processedTerm2")
        println(s"tags: $tags")
        throw e
    case LTLAnd(term1, term2, _, _) =>
      val processedTerm1 = stepResidual(term1, state)
      val term1Tags = if LTLFormula.isFalse(processedTerm1) then TagUtils.collectTags(processedTerm1) else ImmutableSet.empty
      val processedTerm2 = stepResidual(term2, state)
      val term2Tags = if LTLFormula.isFalse(processedTerm2) then TagUtils.collectTags(processedTerm2) else ImmutableSet.empty
      val ownTags = TagUtils.collectTags(expr)
      val tags = ownTags ++ term1Tags ++ term2Tags
      try step(TagUtils.applyTags(LTLConstructors.and(processedTerm1, processedTerm2), tags), state)
      catch case e: Exception => 
        println(s"Warning: $e")
        println(s"expr: $expr")
        println(s"term1: $processedTerm1")
        println(s"term2: $processedTerm2")
        println(s"tags: $tags")
        throw e
    case LTLImplies(term1, term2, _, _) =>
      val processedTerm1 = stepResidual(term1, state)
      val term1Tags = if LTLFormula.isFalse(processedTerm1) then TagUtils.collectTags(processedTerm1) else ImmutableSet.empty
      val processedTerm2 = if LTLFormula.isGuarded(term2) then stepResidual(term2, state) else step(term2, state)
      val ownTags = TagUtils.collectTags(expr)
      val tags = ownTags ++ term1Tags
      try step(TagUtils.applyTags(LTLConstructors.implies(processedTerm1, processedTerm2), tags), state)
      catch case e: Exception => 
        println(s"Warning: $e")
        println(s"expr: $expr")
        println(s"term1: $processedTerm1")
        println(s"term2: $processedTerm2")
        println(s"tags: $tags")
        throw e
    case LTLNot(term, _, _) =>
      try LTLConstructors.not(stepResidual(term, state))
      catch case e: Exception => 
        println(s"Warning: $e")
        println(s"expr: $expr")
        throw e
    case LTLRequiredNext(term, _, _) =>
      val ownTags = TagUtils.collectTags(expr)
      step(TagUtils.applyTags(term, ownTags), state)
    case LTLWeakNext(term, _, _) =>
      val ownTags = TagUtils.collectTags(expr)
      step(TagUtils.applyTags(term, ownTags), state)
    case LTLStrongNext(term, _, _) =>
      val ownTags = TagUtils.collectTags(expr)
      step(TagUtils.applyTags(term, ownTags), state)
    case LTLPredicate(_, _, _) => step(expr, state)
    case _ => throw new Error(s"Unexpected formula in residual computation: ${expr.toString}")
