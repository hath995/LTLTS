import * as LTL from './index';
import * as immer from 'immer';
import fc from 'fast-check';
import type { AsyncCommand, Command, ICommand, ModelRunAsyncSetup, ModelRunSetup } from "fast-check";

type SetupState<Model, Real> = { model: Model; real: Real };
/** @internal */
type SetupFun<Model, Real, P> = (s: { model: Model; real: Real }) => P;
/** @internal */
interface SetupProducer<Model, Real, P> {
  then: (fun: SetupFun<Model, Real, P>) => P;
}

const genericModelRun = <Model extends object, Real, P, CheckAsync extends boolean>(
    s: SetupProducer<Model, Real, P>,
    cmds: Iterable<ICommand<Model, Real, P, CheckAsync>>,
    initialValue: P,
    runCmd: (cmd: ICommand<Model, Real, P, CheckAsync>, m: Model, r: Real) => P,
    then: (p: P, c: () => P | undefined) => P,
    ltlProperty: LTL.LTLFormula<Model>
  ): P => {
    return s.then((o: { model: Model; real: Real }) => {
      // let modelStates: SetupState<Model, Real> = immer.produce(o, (a) => a);
      let { model, real } = { model: immer.produce(o.model, a => a), real: o.real };
      let state = initialValue;
      let ltlState = LTL.ltlEvaluateGenerator(ltlProperty, model);
      ltlState.next();
      for (const c of cmds) {
        state = then(state, () => {
          // No need to check incoming state
          // as c.run "throws" in case of exception
          let newState: P = state;
          model = immer.produce(model, (ms) => {
            newState = runCmd(c, ms as Model, real);
          });
          let validity = ltlState.next(model);
          if (validity.value !== undefined && validity.value.validity.kind === "definitely" && validity.value.validity.value === false) {
            throw new Error(`LTL property violated: ${validity.value}`);
          }
          return newState;
        });
      }
      return state;
    });
  };

  const internalModelRun = <Model extends object, Real>(
    s: ModelRunSetup<Model, Real>,
    cmds: Iterable<Command<Model, Real>>,
    ltlProperty: LTL.LTLFormula<Model>
  ): void => {
    const then = (_p: undefined, c: () => undefined) => c();
    const setupProducer: SetupProducer<Model, Real, undefined> = {
      then: (fun: SetupFun<Model, Real, void>) => {
        fun(s());
        return undefined;
      },
    };
    const runSync = (cmd: Command<Model, Real>, m: Model, r: Real) => {
      if (cmd.check(m)) cmd.run(m, r);
      return undefined;
    };
    return genericModelRun(
      setupProducer,
      cmds as Iterable<ICommand<Model, Real, undefined, false>>,
      undefined,
      runSync,
      then,
      ltlProperty
    );
  };

  export function temporalModelRun<Model extends object, Real, InitialModel extends Model>(
    s: ModelRunSetup<InitialModel, Real>,
    cmds: Iterable<Command<Model, Real>>,
    ltlProperty: LTL.LTLFormula<Model>
  ): void {
    internalModelRun(s, cmds, ltlProperty);
  }
