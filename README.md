# @fast-check/LTL

Add the ability to test models with [fast-check](https://fast-check.dev/) using [linear temporal logic](https://en.wikipedia.org/wiki/Linear_temporal_logic). Based on the work of [Oskar Wickstrom](https://quickstrom.io/) and [Liam O'Connor](https://arxiv.org/pdf/2203.11532.pdf).

## Install

```sh
npm i --save-dev \@fast-check/LTL
```

## Examples

```typescript
  type Model = { num: number };
  class Queue {
    data: number[] = [];
    push = (v: number) => this.data.push(v);
    pop = () => this.data.pop()!;
    size = () => this.data.length;
  }

  class PushCommand implements fc.Command<Model, Queue> {
    constructor(readonly value: number) {}
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Queue): void {
      r.push(this.value);
      m.num = r.size();
    }
    toString = () => `push(${this.value})`;
  }
  class PopCommand implements fc.Command<Model, Queue> {
    check(m: Readonly<Model>): boolean {
      // should not call pop on empty list
      return m.num > 0;
    }
    run(m: Model, r: Queue): void {
      expect(typeof r.pop()).toEqual("number");
      m.num = r.size();
    }
    toString = () => "pop";
  }
  class SizeCommand implements fc.Command<Model, Queue> {
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Queue): void {
      expect(r.size()).toEqual(m.num);
    }
    toString = () => "size";
  }

  it("should test a Queue implementation updates it's count correctly", () => {
    const allCommands = [fc.integer().map((v) => new PushCommand(v)), fc.constant(new PopCommand()), fc.constant(new SizeCommand())];
    fc.assert(
      fc.property(fc.commands(allCommands, {}), (cmds) => {
        const s = () => ({ model: { num: 0 }, real: new Queue() });
        let sizeUpdatesByOneOrUnchanged: LTL.LTLFormula<Model> = LTL.Henceforth(
          LTL.Or(
            LTL.Or(
              LTL.Unchanged((state, nextState) => state.num === nextState.num),
              LTL.Comparison((state, nextState) => state.num + 1 === nextState.num)
            ),
            LTL.Comparison((state, nextState) => state.num - 1 === nextState.num)
          )
        );
        temporalModelRun(s, cmds, sizeUpdatesByOneOrUnchanged);
      })
    );
  });

```

### Documentation

### Methods
* [`temporalModelRun`](#temporalModelRun) - Runs a syncronous model using fast-check and linear temporal logic.
* [`temporalAsyncModelRun`](#temporalAsyncModelRun) - Runs an asynchronous model using fast-check and linear temporal logic.
* [`ltlEvaluate`](#ltlEvaluate) - Evaluates a linear temporal logic expression on a given array of states.
* [`ltlEvaluateGenerator`](#ltlEvaluateGenerator) - Evaluates a linear temporal logic expression on a given state and provide generator to continue evaluating the temporal logic as new states are generate

* [`Predicate`](#Predicate) - Creates predicate function (returns boolean) on state 
* [`Unchanged`](#Unchanged) - Create predicate function to compare if two states are equal
* [`Comparison`](#Comparison) - Create predicate functions to compare if two states maintain some relationship
* [`Eventually`](#Eventually) - Create expression with the eventually operator.
* [`Until`](#Until) - Create expression with the until operator.
* [`Release`](#Release) - Create expression with the release operator.
* [`Henceforth`](#Henceforth) - Create expression with the henceforth operator.
* [`And`](#And) - Create expression with the logical AND operation.
* [`Or`](#Or) - Create expression with the logical OR operation.
* [`Not`](#Not) - Create expression with the logical NOT operation.
* [`Implies`](#Implies) - Create expression with the logical IMPLIES operation.
* [`True`](#True) - Create expression with the logical TRUE value.
* [`False`](#False) - Create expression with the logical FALSE value.
* [`Next`](#Next) - Create expression with the next state operator.

## Methods

<a name="temporalModelRun"></a>
### temporalModelRun

Runs a property-based test using a model and a real implemenation. Evaluates assertions and properties described with linear temporal logic against the model.

__Examples__

```typescript
 it("should test a Queue implementation updates it's count correctly", () => {
    const allCommands = [fc.integer().map((v) => new PushCommand(v)), fc.constant(new PopCommand()), fc.constant(new SizeCommand())];
    fc.assert(
      fc.property(fc.commands(allCommands, {}), (cmds) => {
        const setup = () => ({ model: { num: 0 }, real: new List() });
        let sizeUpdatesByOneOrUnchanged: LTL.LTLFormula<Model> = LTL.Henceforth(
          LTL.Or(
            LTL.Or(
              LTL.Unchanged((state, nextState) => state.num === nextState.num),
              LTL.Comparison((state, nextState) => state.num + 1 === nextState.num)
            ),
            LTL.Comparison((state, nextState) => state.num - 1 === nextState.num)
          )
        );
        temporalModelRun(setup, cmds, sizeUpdatesByOneOrUnchanged);
      })
    );
  });
});

```

---------------------------------------

<a name="temporalAsyncModelRun"></a>
### temporalAsyncModelRun

Runs an asynchronous property-based test using a model and a real implementation. Evaluates assertions and properties described with linear temporal logic against the model.

__Examples__

```typescript
  class Timer {
    time: number;
    running: boolean;
    constructor() {
      this.time = 0;
      this.running = false;
    }

    async start() {
      this.running = true;
      return this.running;
    }

    async step() {
      if (!this.running) {
        return;
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          this.time++;
          resolve(undefined);
        }, 10);
      });
    }

    async status() {
      return this.time;
    }
    
    async stop() {
      this.running = false;
      return this.running;
    }
  }

  type TimerModel = { time: number; running: boolean };
  class StartCommand implements fc.AsyncCommand<TimerModel, Timer, true> {
    async check(m: Readonly<TimerModel>) {
      return true;
    }
    async run(m: TimerModel, r: Timer) {
      await r.start();
      m.running = true;
      expect(r.running).toBe(true);
    }
    toString = () => `start`;
  }

  class StepCommand implements fc.AsyncCommand<TimerModel, Timer, true> {
    async check(m: Readonly<TimerModel>) {
      return true;
    }
    async run(m: TimerModel, r: Timer) {
      await r.step();
      if (m.running) m.time++;
    }
    toString = () => `step`;
  }

  class StatusCommand implements fc.AsyncCommand<TimerModel, Timer, true> {
    async check(m: Readonly<TimerModel>) {
      return true;
    }
    async run(m: TimerModel, r: Timer) {
      expect(await r.status()).toEqual(m.time);
    }
    toString = () => `status`;
  }

  class StopCommand implements fc.AsyncCommand<TimerModel, Timer, true> {
    async check(m: Readonly<TimerModel>) {
      return true;
    }
    async run(m: TimerModel, r: Timer) {
      await r.stop();
      m.running = false;
      expect(r.running).toBe(false);
    }
    toString = () => `stop`;
  } 

  it("should test an asyncronous Timer specification", async () => {
    await fc.assert(
      fc.asyncProperty(fc.commands([fc.constant(new StartCommand()), fc.constant(new StepCommand()), fc.constant(new StatusCommand()), fc.constant(new StopCommand())], {}), async (cmds) => {
        const setup = async () => ({ model: { time: 0, running: false }, real: new Timer() });
        let timeIncreasesByOneOrUnchanged: LTL.LTLFormula<TimerModel> = LTL.Henceforth(
          LTL.And(
           LTL.Or(
              LTL.Unchanged((state, nextState) => state.time === nextState.time),
              LTL.Comparison((state, nextState) => state.time + 1 === nextState.time)
            ), 
            LTL.Implies(LTL.Comparison((state, nextState) => state.time + 1 === nextState.time), (state) => state.running))
        );
        await temporalAsyncModelRun(setup, cmds, timeIncreasesByOneOrUnchanged);
      })
    );
  }, 60*1000);
```

---------------------------------------

<a name="ltlEvaluate"></a>
### ltlEvaluate

__Examples__

```typescript
```
---------------------------------------

<a name="ltlEvaluateGenerator"></a>
### ltlEvaluateGenerator

Evaluates a linear temporal logic expression on a given state and provides a generator to continue evaluating the temporal logic as new states are generated.

__Examples__

```typescript
```

---------------------------------------

<a name="Predicate"></a>
### Predicate

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Unchanged"></a>
### Unchanged

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Comparison"></a>
### Comparison

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Eventually"></a>
### Eventually

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Until"></a>
### Until

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Release"></a>
### Release

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Henceforth"></a>
### Henceforth

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Next"></a>
### Next

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="And"></a>
### And

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Or"></a>
### Or

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Not"></a>
### Not

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="Implies"></a>
### Implies

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="True"></a>
### True

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------

<a name="False"></a>
### False

DESCRIPTION

__Examples__

```typescript
```

---------------------------------------