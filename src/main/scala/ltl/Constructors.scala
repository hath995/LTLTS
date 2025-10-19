package ltl

import scala.collection.immutable.Set as ImmutableSet

// Constructor functions for LTL formulas
object LTLConstructors:
  
  // Basic constructors
  def predicate[A](pred: Predicate[A]): LTLPredicate[A] = 
    LTLPredicate(pred)
  
  def predicate[A](pred: Predicate[A], tag: String): LTLPredicate[A] = 
    LTLPredicate(pred, Some(tag))
  
  def `true`[A](): LTLTrue[A] = LTLTrue()
  def `false`[A](): LTLFalse[A] = LTLFalse()
  
  def `true`[A](tag: String): LTLTrue[A] = LTLTrue(Some(tag))
  def `false`[A](tag: String): LTLFalse[A] = LTLFalse(Some(tag))
  
  // Logical operators
  def and[A](term1: LTLFormula[A], term2: LTLFormula[A]): LTLAnd[A] = 
    LTLAnd(term1, term2)
  
  def and[A](terms: LTLFormula[A]*): LTLFormula[A] = 
    if terms.isEmpty then throw new IllegalArgumentException("And requires at least one argument")
    else if terms.length == 1 then terms.head
    else terms.reduceLeft(and)
  
  def or[A](term1: LTLFormula[A], term2: LTLFormula[A]): LTLOr[A] = 
    LTLOr(term1, term2)
  
  def or[A](terms: LTLFormula[A]*): LTLFormula[A] = 
    if terms.isEmpty then throw new IllegalArgumentException("Or requires at least one argument")
    else if terms.length == 1 then terms.head
    else terms.reduceLeft(or)
  
  def not[A](term: LTLFormula[A]): LTLNot[A] = 
    LTLNot(term)
  
  def implies[A](term1: LTLFormula[A], term2: LTLFormula[A]): LTLImplies[A] = 
    LTLImplies(term1, term2)
  
  // Temporal operators
  def eventually[A](term: LTLFormula[A], steps: Int = 0): LTLEventually[A] = 
    LTLEventually(term, steps)
  
  def always[A](term: LTLFormula[A], steps: Int = 0): LTLAlways[A] = 
    LTLAlways(term, steps)
  
  def until[A](condition: LTLFormula[A], term: LTLFormula[A], steps: Int = 0): LTLUntil[A] = 
    LTLUntil(condition, term, steps)
  
  def release[A](condition: LTLFormula[A], term: LTLFormula[A], steps: Int = 0): LTLRelease[A] = 
    LTLRelease(condition, term, steps)
  
  // Next operators
  def requiredNext[A](term: LTLFormula[A]): LTLRequiredNext[A] = 
    LTLRequiredNext(term)
  
  def weakNext[A](term: LTLFormula[A]): LTLWeakNext[A] = 
    LTLWeakNext(term)
  
  def strongNext[A](term: LTLFormula[A]): LTLStrongNext[A] = 
    LTLStrongNext(term)
  
  def next[A](term: LTLFormula[A]): LTLWeakNext[A] = 
    weakNext(term)
  
  // Special operators
  def comparison[A](pred: Comparison[A]): LTLComparison[A] = 
    LTLComparison(pred)
  
  def bind[A](fn: BindFn[A]): LTLBind[A] = 
    LTLBind(fn)
  
  // State comparison operators
  def unchanged[A](pred: Comparison[A]): LTLComparison[A] = 
    LTLComparison(pred)
  
  def changed[A](pred: Comparison[A]): LTLComparison[A] = 
    LTLComparison((state1, state2) => !pred(state1, state2))
  
  // Utility functions
  def tag[A](tag: String, expr: LTLFormula[A]): LTLFormula[A] = 
    expr match
      case p: LTLPredicate[A] => p.copy(tag = Some(tag))
      case t: LTLTrue[A] => t.copy(tag = Some(tag))
      case f: LTLFalse[A] => f.copy(tag = Some(tag))
      case a: LTLAnd[A] => a.copy(tag = Some(tag))
      case o: LTLOr[A] => o.copy(tag = Some(tag))
      case i: LTLImplies[A] => i.copy(tag = Some(tag))
      case n: LTLNot[A] => n.copy(tag = Some(tag))
      case e: LTLEventually[A] => e.copy(tag = Some(tag))
      case a: LTLAlways[A] => a.copy(tag = Some(tag))
      case u: LTLUntil[A] => u.copy(tag = Some(tag))
      case r: LTLRelease[A] => r.copy(tag = Some(tag))
      case rn: LTLRequiredNext[A] => rn.copy(tag = Some(tag))
      case wn: LTLWeakNext[A] => wn.copy(tag = Some(tag))
      case sn: LTLStrongNext[A] => sn.copy(tag = Some(tag))
      case c: LTLComparison[A] => c.copy(tag = Some(tag))
      case b: LTLBind[A] => b.copy(tag = Some(tag))
  
  def leadsTo[A](condition: LTLFormula[A], term: LTLFormula[A]): LTLFormula[A] = 
    always(implies(condition, eventually(term)))
  
  // Contramap for transforming state types
  def contramap[A, B](fn: A => B, expr: LTLFormula[B]): LTLFormula[A] = 
    expr match
      case LTLPredicate(pred, tag, tags) => 
        LTLPredicate((state: A) => pred(fn(state)), tag, tags)
      case LTLTrue(tag, tags) => LTLTrue(tag, tags)
      case LTLFalse(tag, tags) => LTLFalse(tag, tags)
      case LTLAnd(term1, term2, tag, tags) => 
        LTLAnd(contramap(fn, term1), contramap(fn, term2), tag, tags)
      case LTLOr(term1, term2, tag, tags) => 
        LTLOr(contramap(fn, term1), contramap(fn, term2), tag, tags)
      case LTLImplies(term1, term2, tag, tags) => 
        LTLImplies(contramap(fn, term1), contramap(fn, term2), tag, tags)
      case LTLNot(term, tag, tags) => 
        LTLNot(contramap(fn, term), tag, tags)
      case LTLEventually(term, steps, tag, tags) => 
        LTLEventually(contramap(fn, term), steps, tag, tags)
      case LTLAlways(term, steps, tag, tags) => 
        LTLAlways(contramap(fn, term), steps, tag, tags)
      case LTLUntil(condition, term, steps, tag, tags) => 
        LTLUntil(contramap(fn, condition), contramap(fn, term), steps, tag, tags)
      case LTLRelease(condition, term, steps, tag, tags) => 
        LTLRelease(contramap(fn, condition), contramap(fn, term), steps, tag, tags)
      case LTLComparison(pred, tag, tags) => 
        LTLComparison((state1: A, state2: A) => pred(fn(state1), fn(state2)), tag, tags)
      case LTLBind(fn2, tag, tags) => 
        LTLBind((state: A) => contramap(fn, fn2(fn(state))), tag, tags)
      case LTLRequiredNext(term, tag, tags) => 
        LTLRequiredNext(contramap(fn, term), tag, tags)
      case LTLWeakNext(term, tag, tags) => 
        LTLWeakNext(contramap(fn, term), tag, tags)
      case LTLStrongNext(term, tag, tags) => 
        LTLStrongNext(contramap(fn, term), tag, tags)

// Import aliases for easier usage
object LTL:
  export LTLConstructors.{predicate, `true`, `false`, and, or, not, implies}
  export LTLConstructors.{eventually, always, until, release}
  export LTLConstructors.{requiredNext, weakNext, strongNext, next}
  export LTLConstructors.{comparison, bind, unchanged, changed, tag, leadsTo, contramap}
