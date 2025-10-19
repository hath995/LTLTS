package ltl

import scala.collection.mutable.Set as MutableSet
import scala.collection.immutable.Set as ImmutableSet

// Type aliases for clarity
type Predicate[A] = A => Boolean
type Comparison[A] = (A, A) => Boolean
type BindFn[A] = A => LTLFormula[A]

// Four-valued logic for validity
sealed trait Validity:
  def value: Boolean

case class Definitely(value: Boolean) extends Validity
case class Probably(value: Boolean) extends Validity

object Validity:
  val DT: Validity = Definitely(true)
  val PT: Validity = Probably(true)
  val PF: Validity = Probably(false)
  val DF: Validity = Definitely(false)

// Partial validity for intermediate evaluation results
case class PartialValidity(
  requiresNext: Boolean,
  validity: Validity,
  tags: ImmutableSet[String]
)

// Tagged trait for formulas that can have tags
trait Tagged:
  def tag: Option[String] = None
  def tags: ImmutableSet[String] = ImmutableSet.empty

// Core LTL formula types
sealed trait LTLFormula[A] extends Tagged:
  def toString: String

// Basic logical operators
case class LTLPredicate[A](
  pred: Predicate[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Pred$tagStr(${pred.toString})"

case class LTLTrue[A](
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"True$tagStr"

case class LTLFalse[A](
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"False$tagStr"

case class LTLAnd[A](
  term1: LTLFormula[A],
  term2: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"And$tagStr(${term1.toString}, ${term2.toString})"

case class LTLOr[A](
  term1: LTLFormula[A],
  term2: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Or$tagStr(${term1.toString}, ${term2.toString})"

case class LTLImplies[A](
  term1: LTLFormula[A],
  term2: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Implies$tagStr(${term1.toString}, ${term2.toString})"

case class LTLNot[A](
  term: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Not$tagStr(${term.toString})"

// Temporal operators
case class LTLEventually[A](
  term: LTLFormula[A],
  steps: Int = 0,
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Eventually$tagStr(${term.toString}, $steps)"

case class LTLAlways[A](
  term: LTLFormula[A],
  steps: Int = 0,
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Always$tagStr(${term.toString}, $steps)"

case class LTLUntil[A](
  condition: LTLFormula[A],
  term: LTLFormula[A],
  steps: Int = 0,
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Until$tagStr(${condition.toString}, ${term.toString}, $steps)"

case class LTLRelease[A](
  condition: LTLFormula[A],
  term: LTLFormula[A],
  steps: Int = 0,
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Release$tagStr(${condition.toString}, ${term.toString}, $steps)"

// Next operators
case class LTLRequiredNext[A](
  term: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"RequiredNext$tagStr(${term.toString})"

case class LTLWeakNext[A](
  term: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"WeakNext$tagStr(${term.toString})"

case class LTLStrongNext[A](
  term: LTLFormula[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"StrongNext$tagStr(${term.toString})"

// Special operators
case class LTLComparison[A](
  pred: Comparison[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Comparison$tagStr(${pred.toString})"

case class LTLBind[A](
  fn: BindFn[A],
  override val tag: Option[String] = None,
  override val tags: ImmutableSet[String] = ImmutableSet.empty
) extends LTLFormula[A]:
  override def toString: String = 
    val tagStr = if tag.isDefined || tags.nonEmpty then 
      s"{${(tag.toSeq ++ tags).mkString(",")}}" 
    else ""
    s"Bind$tagStr(${fn.toString})"

// Companion object for LTL formulas
object LTLFormula:
  // Type predicates
  def isTrue[A](expr: LTLFormula[A]): Boolean = expr.isInstanceOf[LTLTrue[A]]
  def isFalse[A](expr: LTLFormula[A]): Boolean = expr.isInstanceOf[LTLFalse[A]]
  def isDetermined[A](expr: LTLFormula[A]): Boolean = isTrue(expr) || isFalse(expr)
  
  def isTemporalOperator[A](expr: LTLFormula[A]): Boolean = expr match
    case _: LTLEventually[A] | _: LTLAlways[A] | _: LTLUntil[A] | _: LTLRelease[A] => true
    case _ => false
  
  def isGuarded[A](expr: LTLFormula[A]): Boolean = expr match
    case _: LTLRequiredNext[A] | _: LTLWeakNext[A] | _: LTLStrongNext[A] => true
    case LTLAnd(term1, term2, _, _) => isGuarded(term1) && isGuarded(term2)
    case LTLOr(term1, term2, _, _) => isGuarded(term1) && isGuarded(term2)
    case LTLImplies(term1, _, _, _) => isGuarded(term1)
    case LTLNot(term, _, _) => isGuarded(term)
    case _ => false
  
  def containsTemporalOperator[A](expr: LTLFormula[A]): Boolean = expr match
    case _: LTLEventually[A] | _: LTLAlways[A] | _: LTLUntil[A] | _: LTLRelease[A] => true
    case LTLAnd(term1, term2, _, _) => containsTemporalOperator(term1) || containsTemporalOperator(term2)
    case LTLOr(term1, term2, _, _) => containsTemporalOperator(term1) || containsTemporalOperator(term2)
    case LTLNot(term, _, _) => containsTemporalOperator(term)
    case _ => false

// Utility functions for tag management
object TagUtils:
  def collectTags[A](expr: LTLFormula[A]): ImmutableSet[String] = 
    val tagSet = MutableSet[String]()
    if expr.tag.isDefined then tagSet += expr.tag.get
    tagSet ++= expr.tags
    tagSet.to(ImmutableSet)
  
  def applyTags[A](expr: LTLFormula[A], tags: ImmutableSet[String]): LTLFormula[A] = 
    if tags.isEmpty then expr
    else
      val newTags = if expr.tags.nonEmpty then expr.tags ++ tags else tags
      expr match
        case p: LTLPredicate[A] => p.copy(tags = newTags)
        case t: LTLTrue[A] => t.copy(tags = newTags)
        case f: LTLFalse[A] => f.copy(tags = newTags)
        case a: LTLAnd[A] => a.copy(tags = newTags)
        case o: LTLOr[A] => o.copy(tags = newTags)
        case i: LTLImplies[A] => i.copy(tags = newTags)
        case n: LTLNot[A] => n.copy(tags = newTags)
        case e: LTLEventually[A] => e.copy(tags = newTags)
        case a: LTLAlways[A] => a.copy(tags = newTags)
        case u: LTLUntil[A] => u.copy(tags = newTags)
        case r: LTLRelease[A] => r.copy(tags = newTags)
        case rn: LTLRequiredNext[A] => rn.copy(tags = newTags)
        case wn: LTLWeakNext[A] => wn.copy(tags = newTags)
        case sn: LTLStrongNext[A] => sn.copy(tags = newTags)
        case c: LTLComparison[A] => c.copy(tags = newTags)
        case b: LTLBind[A] => b.copy(tags = newTags)
