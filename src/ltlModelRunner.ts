import * as LTL from './index';
import * as immer from 'immer';
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
          let draft = immer.createDraft(model);
          // No need to check incoming state
          // as c.run "throws" in case of exception
          let newState: P  = runCmd(c, draft as Model, real);
          return then(newState, () => {
            let oldModel = model;
            model = immer.finishDraft(draft) as Model;
            let validity = ltlState.next(model);
            if (validity.value !== undefined && validity.value.validity.kind === "definitely" && validity.value.validity.value === false) {
              console.error(validity.value.tags)
              let oldModelS = JSON.stringify(oldModel, null, 2), newmodelS = JSON.stringify(model, null, 2);
              throw new Error(`LTL property violated: ${Array.from(validity.value.tags)} ${oldModelS} \n\n ${newmodelS}`);
            }
            return newState;
          });
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
  const isAsyncSetup = <Model, Real>(
    s: ReturnType<ModelRunSetup<Model, Real>> | ReturnType<ModelRunAsyncSetup<Model, Real>>,
  ): s is ReturnType<ModelRunAsyncSetup<Model, Real>> => {
    return typeof (s as any).then === 'function';
  };

  const internalAsyncModelRun = async <Model extends object, Real, CheckAsync extends boolean>(
    s: ModelRunSetup<Model, Real> | ModelRunAsyncSetup<Model, Real>,
    cmds: Iterable<AsyncCommand<Model, Real, CheckAsync>>,
    ltlProperty: LTL.LTLFormula<Model>,
    defaultPromise = Promise.resolve()
  ): Promise<void> => {
    const then = (p: Promise<void>, c: () => Promise<void> | undefined) => p.then(c);
    const setupProducer = {
      then: (fun: SetupFun<Model, Real, Promise<void>>) => {
        const out = s();
        if (isAsyncSetup(out)) return out.then(fun);
        else return fun(out);
      },
    };
    const runAsync = async (cmd: AsyncCommand<Model, Real, CheckAsync>, m: Model, r: Real) => {
      if (await cmd.check(m)) await cmd.run(m, r);
    };
    return await genericModelRun(setupProducer, cmds, defaultPromise, runAsync, then, ltlProperty);
  };


  export async function temporalAsyncModelRun<Model extends object, Real, CheckAsync extends boolean, InitialModel extends Model>(
    s: ModelRunSetup<InitialModel, Real> | ModelRunAsyncSetup<InitialModel, Real>,
    cmds: Iterable<AsyncCommand<Model, Real, CheckAsync>>,
    ltlProperty: LTL.LTLFormula<Model>
  ): Promise<void> {
    await internalAsyncModelRun(s, cmds, ltlProperty);
  }