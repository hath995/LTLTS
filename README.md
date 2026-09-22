# fast-check-ltl

Model-based property testing for [fast-check](https://fast-check.dev/) using [linear temporal logic](https://en.wikipedia.org/wiki/Linear_temporal_logic) (LTL). Based on the work of [Oskar Wickström](https://quickstrom.io/) and [Liam O'Connor](https://arxiv.org/pdf/2203.11532.pdf).

## Why

Unit tests only show the absence of bugs on the specific examples you happen to pick. Property-based testing checks that a function obeys some predicate across random inputs.

But many programs are **stateful and long-lived**. Testing them usually boils down to exercising sequences of state transitions. `fast-check-ltl` closes that gap: you describe the behavior you expect *over time* as a temporal-logic formula, and fast-check drives a model through random command sequences to check that the formula holds at every step.

You can either:

- **mirror** the program's state in a lightweight *model* that your commands update as they run, or
- **inspect** the real program state directly as feasible actions are applied.

A temporal formula is evaluated against the model state at every step. When the formula is violated, the test fails and reports the old/new model state, a diff, and which sub-formula (by tag) broke.

## Install

```sh
npm i --save-dev fast-check-ltl
```

`fast-check` is a peer dependency — you should already have it (or install it alongside):

```sh
npm i --save-dev fast-check
```

## How it works

A test is built from three pieces:

1. **A setup** — a function returning `{ model, real }`. `model` is the state you reason about; `real` is the actual system under test.
2. **Commands** — fast-check `Command`s (or `AsyncCommand`s) that act on `real` and keep `model` in sync.
3. **A temporal formula** — an `LTL.LTLFormula<Model>` describing how the model state should evolve over time.

The runner applies a random sequence of commands, stepping the formula forward one state at a time. If at any step the formula evaluates to *false*, the run throws.

The result of evaluating a formula is a **four-valued** `Validity` (see [Four-valued logic](#four-valued-logic)), not a plain boolean, because a finite trace can only ever *probably* confirm an unbounded temporal property.

## Quick start (synchronous)

```typescript
import * as fc from "fast-check";
import * as LTL from "fast-check-ltl";
import { temporalModelRun } from "fast-check-ltl";

type Model = { num: number };
class Queue {
  data: number[] = [];
  push = (v: number) => this.data.push(v);
  pop = () => this.data.pop()!;
  size = () => this.data.length;
}

class PushCommand implements fc.Command<Model, Queue> {
  constructor(readonly value: number) {}
  check = () => true;
  run(m: Model, r: Queue): void {
    r.push(this.value);
    m.num = r.size();
  }
  toString = () => `push(${this.value})`;
}
class PopCommand implements fc.Command<Model, Queue> {
  check(m: Model): boolean {
    return m.num > 0; // don't pop an empty queue
  }
  run(m: Model, r: Queue): void {
    r.pop();
    m.num = r.size();
  }
  toString = () => "pop";
}

it("queue size changes by at most one per operation", () => {
  const commands = [
    fc.integer().map((v) => new PushCommand(v)),
    fc.constant(new PopCommand()),
  ];
  fc.assert(
    fc.property(fc.commands(commands, {}), (cmds) => {
      const setup = () => ({ model: { num: 0 }, real: new Queue() });
      const spec: LTL.LTLFormula<Model> = LTL.Always(
        LTL.Or(
          LTL.Unchanged("num"), // a no-op keeps the size
          LTL.Comparison((s, n) => s.num + 1 === n.num), // a push grows it by one
          LTL.Comparison((s, n) => s.num - 1 === n.num) // a pop shrinks it by one
        )
      );
      temporalModelRun(setup, cmds, spec);
    })
  );
});
```

Every operation must leave `num` unchanged or move it by exactly one. If a real `Queue` implementation ever broke that invariant, the run throws with the offending state transition.

## Asynchronous

`temporalAsyncModelRun` works identically but awaits async commands and an async setup — useful when the system under test is a browser, a server, or anything I/O-bound.

```typescript
import * as fc from "fast-check";
import * as LTL from "fast-check-ltl";
import { temporalAsyncModelRun } from "fast-check-ltl";

class Timer {
  time = 0;
  running = false;
  async start() { this.running = true; }
  async step() { if (this.running) this.time++; }
  async stop() { this.running = false; }
}

type TimerModel = { time: number; running: boolean };

class StartCommand implements fc.AsyncCommand<TimerModel, Timer> {
  check = () => true;
  async run(m: TimerModel, r: Timer) { await r.start(); m.running = true; }
  toString = () => "start";
}
class StepCommand implements fc.AsyncCommand<TimerModel, Timer> {
  check(m: TimerModel) { return m.running; }
  async run(m: TimerModel, r: Timer) { await r.step(); m.time++; }
  toString = () => "step";
}
class StopCommand implements fc.AsyncCommand<TimerModel, Timer> {
  check(m: TimerModel) { return m.running; }
  async run(m: TimerModel, r: Timer) { await r.stop(); m.running = false; }
  toString = () => "stop";
}

it("timer time only ever increases by one per step", async () => {
  const commands = [fc.constant(new StartCommand()), fc.constant(new StepCommand()), fc.constant(new StopCommand())];
  await fc.assert(
    fc.asyncProperty(fc.commands(commands, {}), async (cmds) => {
      const setup = async () => ({ model: { time: 0, running: false }, real: new Timer() });
      const spec: LTL.LTLFormula<TimerModel> = LTL.Always(
        LTL.Or(
          LTL.Unchanged("time"),
          LTL.Comparison((s, n) => s.time + 1 === n.time)
        )
      );
      await temporalAsyncModelRun(setup, cmds, spec);
    })
  );
});
```

## Evaluating a formula over a known trace

You don't have to drive a live system. `ltlEvaluate` evaluates a formula against an array of states you already have (e.g. a recorded trace or a hand-built sequence), returning a `Validity`:

```typescript
import * as LTL from "fast-check-ltl";

LTL.ltlEvaluate([1, 2, 3], LTL.Eventually((x) => x === 2, 1));
// => { kind: "definitely", value: true }  — 2 appears within the next state

LTL.ltlEvaluate([1, 2, 3], LTL.Eventually((x) => x === 4, 1));
// => { kind: "probably", value: false }  — 4 never appears in the window

LTL.ltlEvaluate([2, 2, 2], LTL.Always((x) => x === 2, 1));
// => { kind: "probably", value: true }   — held everywhere, but the trace is finite

LTL.ltlEvaluate([2, 2, 2], LTL.Always((x) => x === 3, 1));
// => { kind: "definitely", value: false } — 3 never holds
```

`ltlEvaluateGenerator` is the streaming variant: it yields a `PartialValidity` as each new state is fed in, so you can evaluate incrementally (this is what the model runner uses internally).

```typescript
import * as LTL from "fast-check-ltl";

const gen = LTL.ltlEvaluateGenerator<number>(LTL.Eventually((x) => x === 3, 1), 1);
gen.next();   // { requiresNext: true,  validity: { kind: "probably", value: true } }
gen.next(2);  // { requiresNext: false, validity: { kind: "probably", value: false } }
gen.next(3);  // { requiresNext: false, validity: { kind: "definitely", value: true } }
```

> **Note:** the top-level formula passed to `ltlEvaluate` / `ltlEvaluateGenerator` must be a real `LTLFormula` — wrap a bare function with `LTL.Predicate(...)`. The connective builders (`And`, `Or`, `Eventually`, …) wrap bare functions for you, but the evaluators do not.

## Debugging failures with tags

When a spec is a large combination of rules, "the property failed" isn't enough — you need to know *which* rule broke. `fast-check-ltl` gives every formula a **tag**, and when a run fails it reports exactly which tags were responsible, alongside the before/after model state and a diff.

### Tagging a sub-formula

`Tag(name, formula)` labels a formula. Name every meaningful rule so a failure points straight at it:

```typescript
const spec: LTL.LTLFormula<Model> = LTL.Always(LTL.And(
  LTL.Tag("countMatchesItems", LTL.Comparison((s, n) => n.count === n.items.length)),
  LTL.Tag("itemsOnlyGrow",   LTL.Comparison((s, n) => n.items.length >= s.items.length)),
  LTL.Tag("filterValid",     (m) => ["All", "Active", "Completed"].includes(m.filter))
));
```

### What a failure looks like

When a command moves the model into a state that breaks a rule, the run throws:

```text
LTL property violated: countMatchesItems,itemsOnlyGrow
  { "items": ["a", "b"], "count": 2 }
  { "items": ["b"],      "count": 6 }
  diff:
    items: [
    -   "a"
        "b"
    ]
    - count: 2
    + count: 6

Properties violated: countMatchesItems,itemsOnlyGrow
```

The **tags** name the rules the transition broke; the **diff** shows exactly how the state changed.

### How tags propagate

Tags bubble up the formula tree. When a tagged sub-formula fails, its tag is collected; and if an enclosing formula is also tagged, that tag is added as well. So a nested spec like

```typescript
LTL.Tag("invariants", LTL.Always(LTL.And(
  LTL.Tag("countMatchesItems", ...),
  LTL.Tag("itemsOnlyGrow", ...)
)))
```

reports the full breadcrumb — `invariants`, `countMatchesItems`, `itemsOnlyGrow` — telling you both *where in the spec* and *which rule* failed.

> **Tip:** tag the top-level groups *and* each individual rule. That gives you a navigation trail from the high-level spec down to the exact failing condition.

---

# API Reference

## Test runners

### `temporalModelRun`

Runs a synchronous model-based property test.

```typescript
temporalModelRun<Model extends object, Real>(
  setup: () => { model: Model; real: Real },
  commands: Iterable<fc.Command<Model, Real>>,
  formula: LTL.LTLFormula<Model>
): void
```

Applies each command (updating `model` via the command's `run`), steps `formula` forward by one state, and **throws** as soon as the formula evaluates to a falsy `Validity`. The thrown error includes the previous and next model state, a `json-diff` between them, and the tags of the sub-formulas that failed.

### `temporalAsyncModelRun`

The asynchronous counterpart.

```typescript
temporalAsyncModelRun<Model extends object, Real>(
  setup: () => { model: Model; real: Real } | Promise<{ model: Model; real: Real }>,
  commands: Iterable<fc.AsyncCommand<Model, Real>>,
  formula: LTL.LTLFormula<Model>
): Promise<void>
```

Behaves like `temporalModelRun` but awaits async commands and an async setup.

## Evaluators

### `ltlEvaluate`

```typescript
ltlEvaluate<A>(states: A[], formula: LTL.LTLFormula<A>): Validity
```

Evaluates `formula` over the finite trace `states` and returns a `Validity`. An empty trace is `definitely false`.

### `ltlEvaluateGenerator`

```typescript
ltlEvaluateGenerator<A>(formula: LTL.LTLFormula<A>, state: A): Generator<PartialValidity, PartialValidity, A>
```

Evaluates `formula` incrementally. Call `gen.next()` to prime, then `gen.next(nextState)` for each subsequent state. Each yield is a `PartialValidity`:

```typescript
type PartialValidity = {
  requiresNext: boolean;   // does the formula still need another state?
  validity: Validity;      // the current four-valued assessment
  tags: Set<string>;       // tags of the sub-formulas responsible
};
```

## Four-valued logic

A formula is never just true or false over a finite trace — it's one of four values, because an unbounded temporal operator (like "eventually" with no bound) can't be conclusively settled by a trace that ends.

| Constant | Value | Meaning |
| --- | --- | --- |
| `DT` | `{ kind: "definitely", value: true }` | The trace **confirms** the property. |
| `DF` | `{ kind: "definitely", value: false }` | The trace **proves** the property is violated. |
| `PT` | `{ kind: "probably", value: true }` | Held everywhere so far, but the trace ended before it could be confirmed (e.g. an unbounded `Always`). |
| `PF` | `{ kind: "probably", value: false }` | Not confirmed, but the trace ended before it could be disproven (e.g. an unbounded `Eventually` that never fired). |

Helpers to build and combine these:

- `Definitely(value: boolean): Validity`
- `Probably(value: boolean): Validity`
- `FVAnd(a, b)`, `FVOr(a, b)`, `FVNot(a)` — the four-valued logical operations.

> The model runner treats any `value === false` (DF **or** PF) as a failure.

## Building formulas

Every builder returns an `LTL.LTLFormula<A>` (or a more specific sub-type). Any builder that takes a `Predicate<A>` also accepts a plain `(state: A) => boolean` function and wraps it for you.

### Atomic

- **`Predicate<A>(pred: (state: A) => boolean)`** — a formula that is true exactly when `pred(state)` is.
- **`True()`** — always true.
- **`False()`** — always false.

### State comparisons (between consecutive states)

These relate the current state `s` to the next state `n`:

- **`Unchanged<A>(prop)`** — the selected property (or properties) is equal between the two states. Accepts a property name (`"num"`), an array of names (`["num", "count"]`), or a `(s, n) => boolean` predicate. For a **nested** property, use the array form with a dot-path: `Unchanged(["a.b"])`.
- **`Changed<A>(prop)`** — the negation of `Unchanged`: the property differs between the two states. Same argument forms.
- **`Comparison<A>(pred: (s, n) => boolean)`** — an arbitrary relationship between the current and next state.

```typescript
LTL.Unchanged("num");                       // num is the same after this step
LTL.Unchanged(["items", "selectedFilter"]); // both unchanged
LTL.Unchanged(["a.b"]);                     // nested property a.b is unchanged
LTL.Comparison((s, n) => n.num === s.num + 1); // num grew by exactly one
```

### Logical connectives

- **`And(...terms)`** — logical AND (variadic; `And(a)` is `a ∧ True`).
- **`Or(...terms)`** — logical OR (variadic; `Or(a)` is `False ∨ a`).
- **`Not(term)`** — logical NOT.
- **`Implies(cond, term)`** — `cond ⇒ term` (a first-class operator, not just sugar).

### Temporal operators

- **`Next(term)`** — `term` holds in the *next* state. (Alias for `WeakNext`.)
- **`Eventually(term, steps = 0)`** — `term` holds at some future state. `steps = 0` means *unbounded* ("eventually"); `steps = N` means *within the next N states*.
- **`Always(term, steps = 0)`** — `term` holds at every state. `steps = 0` means *unbounded* ("always"); `steps = N` means *for the next N states*.
- **`Until(cond, term, steps = 0)`** — `term` holds until `cond` becomes true.
- **`Release(cond, term, steps = 0)`** — the dual of `Until`: `term` holds, and `cond` must hold once `term` stops.
- **`LeadsTo(cond, term)`** — `Always(Implies(cond, Eventually(term)))`: whenever `cond` holds, `term` eventually follows.
- **`RequiredNext(term)` / `WeakNext(term)` / `StrongNext(term)`** — the three flavors of the "next" operator with different strength of commitment (used internally; `Next` is the weak form).

### Advanced

- **`Bind<A>(fn: (state: A) => LTL.LTLFormula<A>)`** — capture a value from the *current* state and use it in a formula evaluated over *future* states.
  ```typescript
  // "the value we saw now stays the same from here on"
  LTL.Bind((x: number) => LTL.Always((y: number) => y === x, 1));
  ```
- **`Match<A, B>(selector: (state: A) => B)`** — case analysis on a selected value. Chain `.with(valueOrPredicate, formula)` clauses and finish with `.exhaustive()` (which asserts the cases cover all possibilities).
  ```typescript
  LTL.Match((m) => m.selectedFilter)
    .with(null, (m) => m.numItems === 0)
    .with("All", (m) => m.todoCount === m.numUnchecked)
    .with("Active", (m) => m.todoCount === m.numItems)
    .with("Completed", LTL.True())
    .exhaustive();
  ```
  A `.with` clause takes either a concrete value (compared with deep equality) or a predicate function.
- **`Contramap<A, B>(fn: (state: A) => B, expr: LTL.LTLFormula<B>)`** — lift a formula written over a *projection* `B` of the state back onto the full state `A`. Preserves tags.
- **`Tag<T>(name: string, expr: LTL.LTLFormula<T>)`** — label a sub-formula so that when the run fails, the error reports *which* part broke. Tags bubble up the formula tree, so a failing rule reports its own tag plus the tags of any enclosing tagged formulas (see [Debugging failures with tags](#debugging-failures-with-tags)). Use liberally to make failures readable.

```typescript
const spec = LTL.Tag("invariants", LTL.Always(
  LTL.And(
    LTL.Tag("hasFilters", ...),
    LTL.Tag("correctFilterStates", LTL.Match(...).exhaustive())
  )
));
```

## Introspection helpers

- **`requiredSteps<A>(formula)`** — the number of states needed to fully evaluate `formula`.
- **`requiresNext(formula)`** — whether `formula` still needs another state to be determined.
- **`containsTemporalOperator<A>(expr)`** — whether `expr` (recursively) contains a temporal operator.
- **`isTemporalOperator<A>(expr)`** — whether `expr` is one of `Eventually` / `Always` / `Until` / `Release`.
- **`isGuarded<A>(expr)`** — whether `expr` is guarded (a `Next`-family operator or a combination thereof).
- **`isDetermined<A>(expr)`** — whether `expr` has reduced to `True`/`False`.
- **`isTrue(expr)` / `isFalse(expr)`** — type guards for the `True`/`False` constants.
- **`PartialValidity(formula)`** — compute the `{ requiresNext, validity, tags }` of a formula.
- **`evaluateValidity(expr)`** — reduce a formula to a `[Validity, Set<string>]` pair.

## The `step` family (advanced)

The evaluation engine is a family of `step*` functions that reduce a formula one state at a time. These are exported for advanced use or for writing your own runner, but most users won't need them directly:

`step`, `stepResidual`, `stepPred`, `stepBind`, `stepTrue`, `stepFalse`, `stepAnd`, `stepOr`, `stepNot`, `stepImplies`, `stepComparison`, `stepNext`, `stepWeakNext`, `stepStrongNext`, `stepEventually`, `stepAlways`, `stepUntil`, `stepRelease`, `strongestNext`, `weakestNext`.

## Type exports

- `LTLFormula<A>` — the discriminated union of all formula kinds (each also carries optional `tag`/`tags`).
- `Predicate<A>` — `(state: A) => boolean`.
- `Validity` — `{ kind: "definitely" | "probably"; value: boolean }`.
- `PartialValidity` — `{ requiresNext: boolean; validity: Validity; tags: Set<string> }`.
- Individual formula kinds: `LTLPredicate`, `LTLTrue`, `LTLFalse`, `LTLAnd`, `LTLOr`, `LTLImplies`, `LTLNot`, `LTLBind`, `LTLComparison`, `LTLEventually`, `LTLAlways`, `LTLUntil`, `LTLRelease`, `LLTLRequiredNext`, `LLTLWeakNext`, `LLTLStrongNext`.
