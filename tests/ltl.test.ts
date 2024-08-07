import * as LTL from "../src/index";
import * as fc from "fast-check";
import { temporalModelRun, temporalAsyncModelRun } from "../src/ltlModelRunner";

describe("FVAnd", () => {
  test("DT and DT", () => {
    expect(LTL.FVAnd(LTL.DT, LTL.DT)).toBe(LTL.DT);
  });
  test("DT and PT", () => {
    expect(LTL.FVAnd(LTL.DT, LTL.PT)).toBe(LTL.PT);
  });
  test("DT and PF", () => {
    expect(LTL.FVAnd(LTL.DT, LTL.PF)).toBe(LTL.PF);
  });
  test("DT and DF", () => {
    expect(LTL.FVAnd(LTL.DT, LTL.DF)).toBe(LTL.DF);
  });
  test("PT and DT", () => {
    expect(LTL.FVAnd(LTL.PT, LTL.DT)).toBe(LTL.PT);
  });
  test("PT and PT", () => {
    expect(LTL.FVAnd(LTL.PT, LTL.PT)).toBe(LTL.PT);
  });
  test("PT and PF", () => {
    expect(LTL.FVAnd(LTL.PT, LTL.PF)).toBe(LTL.PF);
  });
  test("PT and DF", () => {
    expect(LTL.FVAnd(LTL.PT, LTL.DF)).toBe(LTL.DF);
  });
  test("PF and DT", () => {
    expect(LTL.FVAnd(LTL.PF, LTL.DT)).toBe(LTL.PF);
  });
  test("PF and PT", () => {
    expect(LTL.FVAnd(LTL.PF, LTL.PT)).toBe(LTL.PF);
  });
  test("PF and PF", () => {
    expect(LTL.FVAnd(LTL.PF, LTL.PF)).toBe(LTL.PF);
  });
  test("PF and DF", () => {
    expect(LTL.FVAnd(LTL.PF, LTL.DF)).toBe(LTL.DF);
  });
  test("DF and DT", () => {
    expect(LTL.FVAnd(LTL.DF, LTL.DT)).toBe(LTL.DF);
  });
  test("DF and PT", () => {
    expect(LTL.FVAnd(LTL.DF, LTL.PT)).toBe(LTL.DF);
  });
  test("DF and PF", () => {
    expect(LTL.FVAnd(LTL.DF, LTL.PF)).toBe(LTL.DF);
  });
  test("DF and DF", () => {
    expect(LTL.FVAnd(LTL.DF, LTL.DF)).toBe(LTL.DF);
  });
});

describe("FVOr", () => {
  test("DT or DT", () => {
    expect(LTL.FVOr(LTL.DT, LTL.DT)).toBe(LTL.DT);
  });
  test("DT or PT", () => {
    expect(LTL.FVOr(LTL.DT, LTL.PT)).toBe(LTL.DT);
  });
  test("DT or PF", () => {
    expect(LTL.FVOr(LTL.DT, LTL.PF)).toBe(LTL.DT);
  });
  test("DT or DF", () => {
    expect(LTL.FVOr(LTL.DT, LTL.DF)).toBe(LTL.DT);
  });
  test("PT or DT", () => {
    expect(LTL.FVOr(LTL.PT, LTL.DT)).toBe(LTL.DT);
  });
  test("PT or PT", () => {
    expect(LTL.FVOr(LTL.PT, LTL.PT)).toBe(LTL.PT);
  });
  test("PT or PF", () => {
    expect(LTL.FVOr(LTL.PT, LTL.PF)).toBe(LTL.PT);
  });
  test("PT or DF", () => {
    expect(LTL.FVOr(LTL.PT, LTL.DF)).toBe(LTL.PT);
  });
  test("PF or DT", () => {
    expect(LTL.FVOr(LTL.PF, LTL.DT)).toBe(LTL.DT);
  });
  test("PF or PT", () => {
    expect(LTL.FVOr(LTL.PF, LTL.PT)).toBe(LTL.PT);
  });
  test("PF or PF", () => {
    expect(LTL.FVOr(LTL.PF, LTL.PF)).toBe(LTL.PF);
  });
  test("PF or DF", () => {
    expect(LTL.FVOr(LTL.PF, LTL.DF)).toBe(LTL.PF);
  });
  test("DF or DT", () => {
    expect(LTL.FVOr(LTL.DF, LTL.DT)).toBe(LTL.DT);
  });
  test("DF or PT", () => {
    expect(LTL.FVOr(LTL.DF, LTL.PT)).toBe(LTL.PT);
  });
  test("DF or PF", () => {
    expect(LTL.FVOr(LTL.DF, LTL.PF)).toBe(LTL.PF);
  });
  test("DF or DF", () => {
    expect(LTL.FVOr(LTL.DF, LTL.DF)).toBe(LTL.DF);
  });
});

describe("step", () => {
  it("should handle true", () => {
    expect(LTL.step(LTL.True(), null)).toEqual(LTL.True());
  });

  it("should handle false", () => {
    expect(LTL.step(LTL.False(), null)).toEqual(LTL.False());
  });

  it("should handle not", () => {
    expect(LTL.step(LTL.Not(LTL.True()), null)).toEqual(LTL.False());
  });

  it("should handle and", () => {
    expect(LTL.step(LTL.And(LTL.True(), LTL.True()), null)).toEqual(LTL.True());
  });

  it("should handle or", () => {
    expect(LTL.step(LTL.Or(LTL.True(), LTL.False()), null)).toEqual(LTL.True());
  });

  it("should handle or", () => {
    expect(LTL.step(LTL.Or(LTL.False(), LTL.True()), null)).toEqual(LTL.True());
  });

  it("should handle a true predicate", () => {
    expect(
      LTL.step(
        LTL.Predicate((x: number) => x === 1),
        1
      )
    ).toEqual(LTL.True());
  });

  it("should handle a false predicate", () => {
    expect(
      LTL.step(
        LTL.Predicate((x: number) => x === 2),
        1
      )
    ).toEqual(LTL.False());
  });

  it("should handle eventually true", () => {
    expect(
      LTL.step(
        LTL.Eventually((x: number) => x === 2, 1),
        2
      )
    ).toEqual(LTL.True());
  });

  it("should handle eventually unsure", () => {
    let term = LTL.Eventually((x: number) => x === 4, 1);
    expect(LTL.step(term, 1)).toEqual(LTL.RequiredNext(LTL.Eventually(term.term)));
  });

  it("should handle eventually unsure with 0 steps", () => {
    let term = LTL.Eventually((x: number) => x === 4);
    expect(LTL.step(term, 1)).toEqual(LTL.StrongNext(LTL.Eventually(term.term)));
  });

  it("should handle always false", () => {
    expect(
      LTL.step(
        LTL.Always((x: number) => x === 2, 1),
        1
      )
    ).toEqual(LTL.False());
  });

  it("should handle always unsure", () => {
    let term = LTL.Always((x: number) => x === 4, 1);
    expect(LTL.step(term, 4)).toEqual(LTL.RequiredNext(LTL.Always(term.term, 0)));
  });

  it("should handle always unsure with 0 steps", () => {
    let term = LTL.Always((x: number) => x === 4, 0);
    expect(LTL.step(term, 4)).toEqual(LTL.WeakNext(LTL.Always(term.term, 0)));
  });

  it("should handle until where it is satisfied", () => {
    expect(
      LTL.step(
        LTL.Until(
          (x: number) => x === 3,
          (x: number) => x === 2,
          1
        ),
        2
      )
    ).toEqual(LTL.True());
  });

  it("should handle until where the condition is maintained with 0 steps", () => {
    let term = LTL.Until(
      (x: number) => x === 3,
      (x: number) => x === 2,
      0
    );
    expect(LTL.step(term, 3)).toEqual(LTL.StrongNext(term));
  });

  it("should handle until which is unsatisfied", () => {
    let term = LTL.Until(
      (x: number) => x === 3,
      (x: number) => x === 2,
      1
    );
    expect(LTL.step(term, 1)).toEqual(LTL.False());
    let term2 = LTL.Until(
      (x: number) => x === 3,
      (x: number) => x === 2
    );
    expect(LTL.step(term2, 1)).toEqual(LTL.False());
  });

  it("should handle release which is statisfied", () => {
    let term = LTL.Release(
      (x: number) => x % 2 == 0,
      (x: number) => x % 3 == 0,
      1
    );
    expect(LTL.step(term, 12)).toEqual(LTL.True());
  });

  it("should handle release which matches the condition", () => {
    let term = LTL.Release(
      (x: number) => x % 2 == 0,
      (x: number) => x % 3 == 0,
      1
    );
    expect(LTL.step(term, 9)).toEqual(LTL.RequiredNext(LTL.Release(term.condition, term.term)));
  });

  it("should handle release which matches the condition with 0 steps", () => {
    let term = LTL.Release(
      (x: number) => x % 2 == 0,
      (x: number) => x % 3 == 0
    );
    expect(LTL.step(term, 9)).toEqual(LTL.WeakNext(LTL.Release(term.condition, term.term)));
  });

  it("should handle implies", () => { 
    let term = LTL.Implies((x: number) => x % 5 == 0, x => x % 2 == 0);  
    expect(LTL.step(term, 5)).toEqual(LTL.False());
    expect(LTL.step(term, 10)).toEqual(LTL.True());
    let term2 = LTL.Implies<number>(LTL.Comparison((m, n) => m == n), n => n % 2 == 0);  
    let next = LTL.step(term2, 1) as LTL.LTLImplies<number>;
    expect(next.term2).toEqual(LTL.WeakNext(term2.term2));
    expect(LTL.stepResidual(LTL.step(term2, 1),1)).toEqual(LTL.False());
    expect(LTL.stepResidual(LTL.step(term2, 2),2)).toEqual(LTL.True());
  });


  // it("should handle And on two temporal formulas", () => {
  //     let term = LTL.And(LTL.Eventually(1, (x: number) => x === 2), LTL.Henceforth(1, (x: number) => x === 2));
  //     expect(LTL.step(term, 3)).toEqual(LTL.And(LTL.RequiredNext(LTL.Eventually(0, term.term1)), LTL.Henceforth(0, term.term2)));
  // });

  // it("should handle And on two unsatisfied temporal formulas", () => {
  //     let term = LTL.And(LTL.Eventually(1, (x: number) => x === 2), LTL.Eventually(1, (x: number) => x === 2));
  //     expect(LTL.step(term, 3)).toEqual(LTL.True());
  // });
});

describe("ltlEvaluate", () => {
  it("should handle true", () => {
    expect(LTL.ltlEvaluate([1], LTL.True())).toEqual(LTL.Definitely(true));
  });

  it("should handle false", () => {
    expect(LTL.ltlEvaluate([1], LTL.False())).toEqual(LTL.Definitely(false));
  });

  it("should handle not", () => {
    expect(LTL.ltlEvaluate([1], LTL.Not(LTL.True()))).toEqual(LTL.Definitely(false));
  });

  it("should handle and", () => {
    expect(LTL.ltlEvaluate([1], LTL.And(LTL.True(), LTL.True()))).toEqual(LTL.Definitely(true));
  });

  it("should handle or", () => {
    expect(LTL.ltlEvaluate([1], LTL.Or(LTL.True(), LTL.False()))).toEqual(LTL.Definitely(true));
  });

  it("should handle bind", () => {
    let term = LTL.Bind<number>(x => LTL.Always((y: number) => y === x, 1));
    expect(LTL.ltlEvaluate([1, 2, 3], term)).toEqual(LTL.DF);
    expect(LTL.ltlEvaluate([1, 1, 1], term)).toEqual(LTL.PT);

    let term2 = LTL.Bind<number>(x => LTL.Next(LTL.Eventually((y: number) => y === x, 1)));
    expect(LTL.ltlEvaluate([1, 2, 3], term2)).toEqual(LTL.PF);
    expect(LTL.ltlEvaluate([1, 2, 2, 3, 1], term2)).toEqual(LTL.DT);
  })

  it("should handle a true predicate", () => {
    expect(
      LTL.ltlEvaluate(
        [1, 2, 3],
        LTL.Predicate((x: number) => x === 1)
      )
    ).toEqual(LTL.Definitely(true));
  });

  it("should handle a false predicate", () => {
    expect(
      LTL.ltlEvaluate(
        [1, 2, 3],
        LTL.Predicate((x: number) => x === 2)
      )
    ).toEqual(LTL.Definitely(false));
  });

  it("should handle next", () => {
    expect(LTL.ltlEvaluate([1, 2, 3], LTL.Next(LTL.Predicate((x: number) => x === 2)))).toEqual(LTL.Definitely(true));
    expect(LTL.ltlEvaluate([1], LTL.Next(LTL.Predicate((x: number) => x === 2)))).toEqual(LTL.Probably(true));
    expect(LTL.ltlEvaluate([1, 1], LTL.Next(LTL.Predicate((x: number) => x === 2)))).toEqual(LTL.Definitely(false));
  });

  it("should handle eventually true", () => {
    expect(
      LTL.ltlEvaluate(
        [1, 2, 3],
        LTL.Eventually((x: number) => x === 2, 1)
      )
    ).toEqual(LTL.Definitely(true));
    expect(
      LTL.ltlEvaluate(
        [2, 1, 3],
        LTL.Eventually((x: number) => x === 2, 1)
      )
    ).toEqual(LTL.Definitely(true));
    expect(
      LTL.ltlEvaluate(
        [3, 2, 1],
        LTL.Eventually((x: number) => x === 2, 1)
      )
    ).toEqual(LTL.Definitely(true));
  });

  it("should handle eventually false", () => {
    expect(
      LTL.ltlEvaluate(
        [1, 2, 3],
        LTL.Eventually((x: number) => x === 4, 1)
      )
    ).toEqual(LTL.Probably(false));
  });

  it("should handle always true", () => {
    expect(
      LTL.ltlEvaluate(
        [2, 2, 2],
        LTL.Always((x: number) => x === 2, 1)
      )
    ).toEqual(LTL.Probably(true));
    // expect(LTL.ltlEvaluate([0, 2, 2], LTL.Henceforth(1, (x: number) => x === 2))).toBe(true);
    // expect(LTL.ltlEvaluate([0, 0, 2], LTL.Henceforth(1, (x: number) => x === 2))).toBe(true);
  });

  it("should handle always false", () => {
    expect(
      LTL.ltlEvaluate(
        [2, 2, 2],
        LTL.Always((x: number) => x === 3, 1)
      )
    ).toEqual(LTL.Definitely(false));
    // expect(LTL.ltlEvaluate([0, 2, 2], LTL.Henceforth(1, (x: number) => x === 3), 1)).toBe(false);
    // expect(LTL.ltlEvaluate([0, 0, 2], LTL.Henceforth(1, (x: number) => x === 3), 2)).toBe(false);
  });

  it("should property based test eventually", () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { minLength: 1 }), fc.integer(), (arr, x) => {
        return expect(
          LTL.ltlEvaluate(
            arr,
            LTL.Eventually((y: number) => y === x, arr.length)
          )
        ).toEqual(arr.includes(x) ? LTL.Definitely(true) : LTL.Probably(true));
      }),
      {
        examples: [[[0], -1]]
      }
    );
  });

  it("should property based test always", () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { minLength: 1 }), fc.integer(), (arr, x) => {
        return expect(
          LTL.ltlEvaluate(
            arr,
            LTL.Always((y: number) => y === x, arr.length)
          )
        ).toEqual(arr.every((y: number) => y === x) ? LTL.Probably(true) : LTL.Definitely(false));
      }), {
        examples: [[[0,-28],-28]]
        
      }
    );
  });

    // it("should handle always eventually", () => {

  // })

  it("should handle eventually always", () => {
    let phi = (x: number) => x === 3;
    let expr = LTL.Eventually(LTL.Always(phi, 1));
    expect(LTL.ltlEvaluate([2, 2, 3, 3, 3], expr)).toBe(LTL.PT);
    let gen = LTL.ltlEvaluateGenerator<number>(expr, 2);
    let res = gen.next();
    for(let s of [2,3,3,2]) {
      res = gen.next(s);
    }
    // console.log(res);
    expect(LTL.ltlEvaluate([2, 2, 3, 3, 2], expr)).toBe(LTL.PF);
    expect(LTL.ltlEvaluate([2, 2, 3, 3, 2, 3], expr)).toBe(LTL.PT);
    let expr2 = LTL.Eventually(LTL.Always(LTL.True(), 0));
    expect(LTL.ltlEvaluate([3, 3, 3], expr2)).toBe(LTL.PT);
  })

  it("should handle until", () => {
    expect(
      LTL.ltlEvaluate(
        [2, 2, 3],
        LTL.Until(
          (x: number) => x === 2,
          (x: number) => x === 3,
          1
        )
      )
    ).toEqual(LTL.Definitely(true));
    expect(
      LTL.ltlEvaluate(
        [2, 1, 3],
        LTL.Until(
          (x: number) => x === 2,
          (x: number) => x === 3,
          1
        )
      )
    ).toEqual(LTL.Definitely(false));
    expect(
      LTL.ltlEvaluate(
        [2, 2],
        LTL.Until(
          (x: number) => x === 2,
          (x: number) => x === 3,
          1
        )
      )
    ).toEqual(LTL.Probably(false));
    expect(
      LTL.ltlEvaluate(
        [3],
        LTL.Until(
          (x: number) => x === 2,
          (x: number) => x === 3,
          1
        )
      )
    ).toEqual(LTL.Definitely(true));
    expect(LTL.ltlEvaluate([30], LTL.Until((x: number) => x === 30, (x: number) => x === 0, 0))).toEqual(LTL.Probably(false));
  });

  it("should handle until and always", () => {
    expect(
      LTL.ltlEvaluate(
        [2, 2, 2, 3, 3, 3],
        LTL.Until(
          (x: number) => x === 2,
          LTL.Always((x: number) => x === 3, 1),
          1
        )
      )
    ).toEqual(LTL.PT);

    expect(
      LTL.ltlEvaluate(
        [2, 2, 2, 3, 3, 2, 3],
        LTL.Until(
          (x: number) => x === 2,
          LTL.Always((x: number) => x === 3, 1),
          1
        )
      )
    ).toEqual(LTL.DF);
  });

  it("should handle release and always", () => {
    expect(
      LTL.ltlEvaluate(
        [2, 2, 2, 6, 6, 6],
        LTL.Release(
          LTL.Always((x: number) => x % 3 == 0, 1),
          (x: number) => x % 2 == 0,
          1
        )
      )
    ).toEqual(LTL.PT);
    expect(
      LTL.ltlEvaluate(
        [2, 2, 2, 3, 6, 6],
        LTL.Release(
          LTL.Always((x: number) => x % 3 == 0, 1),
          (x: number) => x % 2 == 0,
          1
        )
      )
    ).toEqual(LTL.DF);
  });

  it("should property based test until", () => {
    fc.assert(
      fc.property(fc.array(fc.integer(), { minLength: 1 }), fc.integer(), fc.integer(), (arr, x, y) => {
        let result = LTL.ltlEvaluate(
            arr,
            LTL.Until(
              (z: number) => z === x,
              (z: number) => z === y,
              0
            )
          );
        return expect(result).toEqual(
          arr.some((z: number, i: number) => z === y && arr.slice(0, i).every((z: number) => z === x))
            ? LTL.Definitely(true)
            : arr.every((z: number) => z === x)
              ? LTL.Probably(false)
              : LTL.Definitely(false)
        );
      }), {
        examples: [[[30],30,0]]
      }
    );
  });

  it("should handle release", () => {
    // let p = [false, true, true, true];
    // let q = [true, true, false, false];
    let p = [false, false, false, true];
    let q = [true, true, true, true];
    type Pair = { p: boolean; q: boolean };
    function zip(p: boolean[], q: boolean[]): { p: boolean; q: boolean }[] {
      return p.map((x, i) => {
        return { p: x, q: q[i] };
      });
    }
    let data = zip(p, q);
    let truthline = data.map((x: Pair, index) =>
      LTL.ltlEvaluate(
        data.slice(0, index + 1),
        LTL.Release(
          (x: Pair) => x.p,
          (x: Pair) => x.q,
          index
        )
      )
    );
    expect(truthline).toEqual([LTL.Probably(true), LTL.Probably(true), LTL.Probably(true), LTL.Definitely(true)]);
  });

  it("should handle unchanged temporal formulas", () => {
    let stateTrue = [1,1,1];
    let stateFalse = [1,2,2];
    let term = LTL.Unchanged<number>((a: number,b: number) => a == b);
    // console.log(term.toString());
    expect(LTL.ltlEvaluate(stateTrue, term)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalse, term)).toEqual(LTL.DF);
    let propUnchanged: LTL.LTLFormula<{val: number}> = LTL.Unchanged("val");
    // console.log(propUnchanged.toString());
    let stateTrueObj = [{val: 1},{val: 1}];
    let stateFalseObj = [{val: 1},{val: 2}];
    expect(LTL.ltlEvaluate(stateTrueObj, propUnchanged)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalseObj, propUnchanged)).toEqual(LTL.DF);
    let propUnchangedMultiple: LTL.LTLFormula<{a: number, b: number, c: {d: boolean}}> = LTL.Tag("unchangedABCDE",LTL.Unchanged(["a", "b", "c.d","e"]));
    let stateTrueMultiple = [{a: 1, b: 1, c: {d: true},e: [1,2,3]}, {a: 1, b: 1, c: {d: true}, e: [1,2,3]}];
    let stateFalseMultiple = [{a: 1, b: 1, c: {d: true}, e: [1,2,3]}, {a: 1, b: 1, c: {d: true}, e: [1,2,4]}];
    // console.log(propUnchangedMultiple.toString());
    expect(LTL.ltlEvaluate(stateTrueMultiple, propUnchangedMultiple)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalseMultiple, propUnchangedMultiple)).toEqual(LTL.DF);
  })

  it("should handle changed temporal formulas", () => {
    let stateTrue = [1,2,2];
    let stateFalse = [1,1,1];
    let term = LTL.Changed<number>((a: number,b: number) => a !== b);
    expect(LTL.ltlEvaluate(stateTrue, term)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalse, term)).toEqual(LTL.DF);
    let propChanged: LTL.LTLFormula<{val: number}> = LTL.Changed("val");
    let stateTrueObj = [{val: 1},{val: 2}];
    let stateFalseObj = [{val: 1},{val: 1}];
    expect(LTL.ltlEvaluate(stateTrueObj, propChanged)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalseObj, propChanged)).toEqual(LTL.DF);
    let propChangedMultiple: LTL.LTLFormula<{a: number, b: number, c: {d: boolean}}> = LTL.Changed(["a", "b", "c.d","e"]);
    let stateTrueMultiple = [{a: 1, b: 2, c: {d: true},e: [1,2,3]}, {a: 2, b: 3, c: {d: false}, e: [1,2,4]}];
    let stateFalseMultiple = [{a: 1, b: 1, c: {d: true}, e: [1,2,3]}, {a: 1, b: 1, c: {d: true}, e: [1,2,3]}];
    expect(LTL.ltlEvaluate(stateTrueMultiple, propChangedMultiple)).toEqual(LTL.DT);
    expect(LTL.ltlEvaluate(stateFalseMultiple, propChangedMultiple)).toEqual(LTL.DF);
  })

  it("should handle handle stuttering steps or advances", () => {
    let stateTrue = [1,1,1,2,2,2,3,4,4,4];
    let stateFalseDec = [1,1,1,2,2,2,3,4,5,4];
    let stateFalseJump = [1,1,2,3,4,5,7];
    let monotonic: LTL.LTLFormula<number> = LTL.Always(LTL.Or(LTL.Unchanged((a,b) => a == b), LTL.Comparison((a, b) => a+1 == b)), 1)
    expect(LTL.ltlEvaluate(stateTrue, monotonic)).toEqual(LTL.PT);
    expect(LTL.ltlEvaluate(stateFalseDec, monotonic)).toEqual(LTL.DF);
    expect(LTL.ltlEvaluate(stateFalseJump, monotonic)).toEqual(LTL.DF);

    // let stateStart = [1,1,1,2,2,2,3,4,4,4];
    let stateStart = [9,9,9,9,9,9,9,2,2,3,3,4,4,4];
    let stateStartFail = [9,9,9,9,9,9,9,2,2,3,3,4,5,4];
    let until: LTL.LTLFormula<number> = LTL.Until((x: number) => x == 9, monotonic);
    expect(LTL.ltlEvaluate(stateStart, until)).toEqual(LTL.PT);
    expect(LTL.ltlEvaluate(stateStartFail, until)).toEqual(LTL.DF);
  });

  it("should handle this weird case", () => {
    let states = [0,0,0,0];
    // let term: LTL.LTLFormula<number> = {"kind":"release","term":{"kind":"always","term":{"kind":"true"},"steps":1},"condition":{"kind":"false"},"steps":0};
    let term: LTL.LTLFormula<number> = LTL.Release(LTL.False(), LTL.Always(LTL.True(), 1), 0);
    expect(LTL.ltlEvaluate(states, term)).toEqual(LTL.PT);
    // let term3: LTL.LTLFormula<number> = {"kind":"always","term":{"kind":"until","term":{"kind":"weak-next","term":{"kind":"true"}},"condition":{"kind":"weak-next","term":{"kind":"true"}},"steps":1},"steps":0}
    let term3: LTL.LTLFormula<number> = LTL.Always(LTL.Until(LTL.WeakNext(LTL.True()), LTL.WeakNext(LTL.True()), 1), 0);
    expect(LTL.ltlEvaluate(states, term3)).toEqual(LTL.PT);
  })

  it("should handle leads to", () => {
    let term: LTL.LTLFormula<number> = LTL.Always(LTL.Implies(x => x === 1, LTL.Eventually(x => x ===3)), 1);
    expect(LTL.ltlEvaluate([1,2,3], term)).toEqual(LTL.PT);
    expect(LTL.ltlEvaluate([1,1,1], term)).toEqual(LTL.PF);
    expect(LTL.ltlEvaluate([2,2,2], term)).toEqual(LTL.PT);
  })

  it("should handle implies", () => {
    type TimerModel = { time: number; running: boolean };
    let modelState = {
      time: 0,
      running: false
    }
    let term = LTL.Tag<TimerModel>("RunningRequired", LTL.Implies(LTL.Comparison((state, nextState) => state.time + 1 === nextState.time), LTL.Tag("IsRunning", LTL.Predicate((state) => state.running))))
    let gen = LTL.ltlEvaluateGenerator(term, modelState);
    gen.next()
    let result = gen.next({time: 1, running: false})
    expect(result.value.tags).toEqual(new Set(["RunningRequired", "IsRunning"]));
    expect(result.value.validity).toEqual(LTL.DF);

    let genFalse = LTL.ltlEvaluateGenerator(term, {time: 1, running: false});
    genFalse.next();
    let resultFalse = genFalse.next({time: 1, running: false});
    expect(resultFalse.value.validity).toEqual(LTL.DT);

    let genTrue = LTL.ltlEvaluateGenerator(term, {time: 1, running: true});
    genTrue.next();
    let resultTrue = genTrue.next({time: 2, running: true});
    expect(resultTrue.value.validity).toEqual(LTL.DT);
  });

  it("should handle implies forever", () => {
    type CobrowseModel = { remoteControlPresent: boolean; remoteControlActive: boolean; };
    let rcPresent: LTL.LTLFormula<CobrowseModel> = LTL.Tag("RCPresent", LTL.Predicate(s => s.remoteControlPresent));
    let np = LTL.Implies(s => !s.remoteControlActive,  LTL.Always( LTL.Not(rcPresent)));
    function Triggered<A>(pred: LTL.LTLFormula<A>): LTL.LTLFormula<A> {
      return LTL.Until(LTL.Not(pred), LTL.Always(pred));
    }
    let rp = LTL.Implies(s => s.remoteControlActive, Triggered(rcPresent))
    expect(LTL.ltlEvaluate([{
      remoteControlPresent: false,
      remoteControlActive: false
    }, {remoteControlPresent: false, remoteControlActive: false}, {remoteControlPresent: true, remoteControlActive: false}], np)).toEqual(LTL.DF);

    expect(LTL.ltlEvaluate([{
      remoteControlPresent: false,
      remoteControlActive: true
    }, {remoteControlPresent: false, remoteControlActive: true}, {remoteControlPresent: true, remoteControlActive: true}], rp)).toEqual(LTL.PT);

    expect(LTL.ltlEvaluate([{
      remoteControlPresent: false,
      remoteControlActive: true
    }, {remoteControlPresent: false, remoteControlActive: true}, {remoteControlPresent: true, remoteControlActive: true}, {remoteControlPresent: false, remoteControlActive: true}], rp)).toEqual(LTL.DF);
  });
});

describe("ltlEvaluateGenerator", () => {
  it("should handle eventually", () => {
    let gen = LTL.ltlEvaluateGenerator<number>(
      LTL.Eventually((x: number) => x === 2, 1),
      1
    );
    expect(gen.next(1)).toEqual({ value: { requiresNext: true, tags: new Set(), validity: LTL.PT }, done: false });
    expect(gen.next(2)).toEqual({ value: { requiresNext: false, tags: new Set(), validity: LTL.DT }, done: false });
    expect(gen.next(3)).toEqual({ value: { requiresNext: false, tags: new Set(), validity: LTL.DT }, done: false });
  });
});

const depthIdentifier = fc.createDepthIdentifier();
const LTLFormulaArbitrary = fc.letrec((tie) => {
  return {
    term: fc.oneof(
      { maxDepth: 4, depthIdentifier },
      tie("true"),
      tie("false"),
      tie("not"),
      tie("and"),
      tie("or"),
      tie("next"),
      tie("pred"),
      tie("comparison"),
      tie("until"),
      tie("release"),
      tie("eventually"),
      tie("always")
    ) as fc.Arbitrary<LTL.LTLFormula<number>>,
    true: fc.constant(LTL.True()),
    false: fc.constant(LTL.False()),
    not: fc.record({ kind: fc.constant("not"), term: tie("term") }, {}) as fc.Arbitrary<LTL.LTLNot<number>>,
    and: fc.record(
      {
        kind: fc.constant("and"),
        term1: tie("term"),
        term2: tie("term")
      },
      {}
    ) as fc.Arbitrary<LTL.LTLAnd<number>>,
    or: fc.record(
      {
        kind: fc.constant("or"),
        term1: tie("term"),
        term2: tie("term")
      },
      {}
    ) as fc.Arbitrary<LTL.LTLOr<number>>,
    next: fc.record({ kind: fc.constant("weak-next"), term: tie("term") }, {}) as fc.Arbitrary<LTL.LLTLWeakNext<number>>,
    pred: fc.record({ kind: fc.constant("pred"), pred: fc.oneof(fc.constant(() => true),fc.constant(()=> false), fc.integer({min: 1, max: 1000}).chain((num) => fc.constant((x: number) => x % num == 0))) }, {}) as fc.Arbitrary<LTL.LTLPredicate<number>>,
    comparison: fc.record({ kind: fc.constant("comparison"), pred: fc.oneof(fc.constant(()=>true), fc.constant(() => false) ,fc.integer({min: 1, max: 1000}).chain((num) => fc.constant((x: number, y: number) => x % num == 0 && y % num == 0))) }, {}) as fc.Arbitrary<LTL.LTLComparison<number>>,
    until: fc.record(
      {
        kind: fc.constant("until"),
        term: tie("term"),
        condition: tie("term"),
        steps: fc.nat()
      },
      {}
    ) as fc.Arbitrary<LTL.LTLUntil<number>>,
    release: fc.record(
      {
        kind: fc.constant("release"),
        term: tie("term"),
        condition: tie("term"),
        steps: fc.nat()
      },
      {}
    ) as fc.Arbitrary<LTL.LTLRelease<number>>,
    eventually: fc.record({ kind: fc.constant("eventually"), term: tie("term"), steps: fc.nat() }, {}) as fc.Arbitrary<LTL.LTLEventually<number>>,
    always: fc.record({ kind: fc.constant("always"), term: tie("term"), steps: fc.nat() }, {}) as fc.Arbitrary<LTL.LTLAlways<number>>
  };
});

describe("ltlEvaluateGenerator and ltlEvaluate", () => {
  it("should be equivalent", () => {
    fc.assert(
      fc.property(LTLFormulaArbitrary.term, fc.array(fc.integer(), { minLength: 1 }), (formula, data) => {
        fc.pre(data.length > LTL.requiredSteps(formula))
        let gen = LTL.ltlEvaluateGenerator(formula as LTL.LTLFormula<number>, data[0]);
        let next = gen.next();
        let allNext = [next];
        let allResults = [LTL.ltlEvaluate(data.slice(0, 1), formula as LTL.LTLFormula<number>)];
        for (let i = 1; i < data.length; i++) {
          let result = LTL.ltlEvaluate(data.slice(0, i + 1), formula as LTL.LTLFormula<number>);
          allResults.push(result);
          next = gen.next(data[i]);
          allNext.push(next);
          expect(next.value.validity).toEqual(result);
        }

        if(next.value.validity !== LTL.DF) {
          // console.log("All Results", next.value)
          expect(next.value.requiresNext).toBeFalsy();
        }
      }),
      {
        examples: [
          [{"kind":"not","term":{"kind":"comparison","pred":(x, y) => x % 4 == 0 && y % 4 == 0}},[0,0,0]],
          [{"kind":"not","term":{"kind":"weak-next","term":LTL.True()}},[0,0,0]],
          [{ kind: "always", term: { kind: "always", term: { kind: "true" }, steps: 0 }, steps: 0 }, [0]],
          [{ kind: "eventually", term: { kind: "not", term: { kind: "true" } }, steps: 2 }, [0, 0]],
          [
            {
              kind: "until",
              steps: 1,
              term: { kind: "always", term: { kind: "true" }, steps: 0 },
              condition: { kind: "and", term1: { kind: "true" }, term2: { kind: "true" } }
            },
            [0]
          ],
          [
            {
              kind: "or",
              term1: { kind: "always", term: { kind: "true" }, steps: 0 },
              term2: { kind: "eventually", term: { kind: "true" }, steps: 0 }
            },
            [0]
          ],
          [
            {
              kind: "not",
              term: { kind: "and", term1: { kind: "always", term: { kind: "true" }, steps: 0 }, term2: { kind: "true" } }
            },
            [0]
          ],
          [{"kind":"eventually","term":{"kind":"and","term1":{"kind":"true"},"term2":{"kind":"comparison","pred":(x, y) => x % 1 == 0 && y % 1 == 0}},"steps":2},[2,3,4,5,6]],
          [{"kind":"release","term": {kind: "always", steps: 5, term: {kind: "pred", pred: (x) => x % 3 === 0}}, "condition":{kind: "always", steps: 10, term: {kind: "pred", pred: (x)=> x%4==0}},"steps":2},[3,3,3,3,12,4,4,4,4,4,4,4,4,4]],
          [{"kind":"release","term":{"kind":"always","term":{"kind":"true"},"steps":1},"condition":{"kind":"false"},"steps":0},[0,0,0]],
          [{"kind":"until","condition":{"kind":"always","term":{"kind":"true"},"steps":1},"term":{"kind":"false"},"steps":0},[0,0,0]],
          [{"kind":"always","term":{"kind":"until","term":{"kind":"weak-next","term":{"kind":"true"}},"condition":{"kind":"weak-next","term":{"kind":"true"}},"steps":1},"steps":0},[0,0,0,0]],
          [{"kind":"release","term":{"kind":"or","term1":{"kind":"always","term":{"kind":"weak-next","term":{"kind":"true"}},"steps":1},"term2":{"kind":"comparison","pred":(x, y) => true}},"condition":{"kind":"pred","pred":(x) => false},"steps":0},[0,0,0]],
          [{"kind":"eventually","term":{"kind":"release","term":{"kind":"false"}, condition: {kind: "false"},"steps":1},"steps":0},[0,0]],
        ],
        numRuns: 100
      }
    );
  });
});

describe("temporalModelRunner", () => {
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
      r.push(this.value); // impact the system
      m.num = r.size();
      // ++m.num; // impact the model
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

  const allCommands = [fc.integer().map((v) => new PushCommand(v)), fc.constant(new PopCommand()), fc.constant(new SizeCommand())];

  it("should work", () => {
    fc.assert(
      fc.property(fc.commands(allCommands, {}), (cmds) => {
        const s = () => ({ model: { num: 0 }, real: new Queue() });
        let sizeUpdatesBy1OrUnchanged: LTL.LTLFormula<Model> = LTL.Always(
          LTL.Or(
            LTL.Or(
              LTL.Unchanged((state, nextState) => state.num === nextState.num),
              LTL.Comparison((state, nextState) => state.num + 1 === nextState.num)
            ),
            LTL.Comparison((state, nextState) => state.num - 1 === nextState.num)
          )
        );
        temporalModelRun(s, cmds, sizeUpdatesBy1OrUnchanged);
      })
    );
  });
});

describe("temporalAsyncModelRunner", () => {
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
      // m.time++;
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

  it("should work", async () => {
    await fc.assert(
      fc.asyncProperty(fc.commands([fc.constant(new StartCommand()), fc.constant(new StepCommand()), fc.constant(new StatusCommand()), fc.constant(new StopCommand())], {}), async (cmds) => {
        const s = async () => ({ model: { time: 0, running: false }, real: new Timer() });
        let timeIncreasesBy1OrUnchanged: LTL.LTLFormula<TimerModel> = LTL.Always(
          LTL.And(
         LTL.Tag("MonotonicTime", LTL.Or(
            LTL.Unchanged((state, nextState) => state.time === nextState.time),
            LTL.Comparison((state, nextState) => state.time + 1 === nextState.time)
          )), 
          LTL.Tag("RunningRequired", LTL.Implies(LTL.Comparison((state, nextState) => state.time + 1 === nextState.time), (state) => state.running)))
        );
        await temporalAsyncModelRun(s, cmds, timeIncreasesBy1OrUnchanged);
      }),
      {examples:[[[new StepCommand()]]]}
    );
  }, 60*1000);
});

describe("Tag", () => {
  it("should report all tagged errors", () => {
    type TimerModel = { time: number; running: boolean };
    let modelState = {
      time: 0,
      running: false
    }
    let bothViolated: LTL.LTLFormula<TimerModel> = LTL.Always(
      LTL.And(
        LTL.Tag("MonotonicTime", LTL.Or(
          LTL.Unchanged((state, nextState) => state.time === nextState.time),
          LTL.Comparison((state, nextState) => state.time - 1 === nextState.time)
        )), 
        LTL.Tag("RunningRequired", LTL.Implies(LTL.Comparison((state, nextState) => state.time + 1 === nextState.time), (state) => state.running)))
    );
    let gen = LTL.ltlEvaluateGenerator(bothViolated, modelState);
    gen.next()
    let result = gen.next({time: 1, running: false})
    expect(result.value.validity).toEqual(LTL.DF);
    expect(result.value.tags).toEqual(new Set(["MonotonicTime", "RunningRequired"]))

  })

  it("should tag false", () => {
    let tagged = LTL.Tag("test", LTL.False());
    let res = LTL.ltlEvaluateGenerator(tagged, 2);
    expect(res.next().value.tags).toEqual(new Set(["test"]));
  });

  it("should tag predicate", () => {
    let pred = LTL.Predicate((x: number) => x === 1);
    let tagged = LTL.Tag("test", pred);
    let res = LTL.ltlEvaluateGenerator(tagged, 2);
    expect(res.next().value.tags).toEqual(new Set(["test"]));
  })

  it("should tag comparison", () => {
    let comp = LTL.Comparison((x: number, y: number) => x === y);
    let tagged = LTL.Tag("test", comp);
    let res = LTL.ltlEvaluateGenerator<number>(tagged, 2);
    let partial = res.next();
    let res2 = res.next(3);
    expect(res2.value.tags).toEqual(new Set(["test"]));
  });

  it("should tag not", () => {
    let not = LTL.Not(LTL.True());
    let tagged = LTL.Tag("test", not);
    let res = LTL.ltlEvaluateGenerator(tagged, 2);
    expect(res.next().value.tags).toEqual(new Set(["test"]));
  });

  it("should tag a not with a true predicate", () => {
    let not = LTL.Not(LTL.Tag("test", LTL.Predicate((x: number) => x === 1)));
    let res = LTL.ltlEvaluateGenerator(not, 1);
    expect(res.next().value.tags).toEqual(new Set(["test"]));
  });

  it("should propagate tags in nested nots", () => {
    let not = LTL.Not(LTL.Not(LTL.Not(LTL.Tag("test", LTL.Predicate((x: number) => x === 1)))));
    let res = LTL.ltlEvaluateGenerator(not, 1);
    expect(res.next().value.tags).toEqual(new Set(["test"]));
  });

  it("should propagate tags in ands", () => {
    let and = LTL.And(LTL.Tag("one", LTL.Predicate((x: number) => x === 1)), LTL.Tag("two", LTL.Predicate((x: number) => x === 2)));
    let res = LTL.ltlEvaluateGenerator(and, 1);
    expect(res.next().value.tags).toEqual(new Set(["two"]));

    let res2 = LTL.ltlEvaluateGenerator(and, 2);
    expect(res2.next().value.tags).toEqual(new Set(["one"]));

    let res3 = LTL.ltlEvaluateGenerator(and, 3);
    expect(res3.next().value.tags).toEqual(new Set(["one","two"]));
    
    let topAnd = LTL.Tag("top", and);
    let res4 = LTL.ltlEvaluateGenerator(topAnd, 2);
    expect(res4.next().value.tags).toEqual(new Set(["top","one"]));
  });

  it("should propagate tags in ors", () => {
    let or = LTL.Or(LTL.Tag("one", LTL.Predicate((x: number) => x === 1)), LTL.Tag("two", LTL.Predicate((x: number) => x === 2)));
    let res = LTL.ltlEvaluateGenerator(or, 1);
    expect(res.next().value.tags).toEqual(new Set([]));

    let res2 = LTL.ltlEvaluateGenerator(or, 2);
    expect(res2.next().value.tags).toEqual(new Set([]));

    let res3 = LTL.ltlEvaluateGenerator(or, 3);
    expect(res3.next().value.tags).toEqual(new Set(["one","two"]));

    let topOr = LTL.Tag("top", or);
    let res4 = LTL.ltlEvaluateGenerator(topOr, 3);
    expect(res4.next().value.tags).toEqual(new Set(["top","one","two"]));
  });

  it("should propagate tags in until", () => {
    let until = LTL.Tag("OnethenTwo", LTL.Until(LTL.Tag("isOne", LTL.Predicate((x: number) => x === 1)), LTL.Tag("isTwo", LTL.Predicate((x: number) => x === 2))));
    let res = LTL.ltlEvaluateGenerator(until, 1);
    expect(res.next().value.tags).toEqual(new Set(["OnethenTwo","isTwo"]));

    let res2 = LTL.ltlEvaluateGenerator(until, 2);
    expect(res2.next().value.tags).toEqual(new Set([]));

    let res3 = LTL.ltlEvaluateGenerator(until, 3);
    expect(res3.next().value.tags).toEqual(new Set(["OnethenTwo","isTwo","isOne"]));
  });

  it("should propagate tags in always", () => {
    let henceforth = LTL.Tag("AlwaysOne", LTL.Always(LTL.Tag("isOne", LTL.Predicate((x: number) => x === 1)), 1));
    let henceforthZero = LTL.Tag("AlwaysOne", LTL.Always(LTL.Tag("isOne", LTL.Predicate((x: number) => x === 1)), 0));
    let res = LTL.ltlEvaluateGenerator(henceforth, 1);
    expect(res.next().value.tags).toEqual(new Set(["AlwaysOne"]));
    let res3 = LTL.ltlEvaluateGenerator(henceforthZero, 1);
    expect(res3.next().value.tags).toEqual(new Set(["AlwaysOne"]));

    let res2 = LTL.ltlEvaluateGenerator(henceforth, 2);
    expect(res2.next().value.tags).toEqual(new Set(["AlwaysOne","isOne"]));

  });

  it("should propagate tags in implies", () => {
    let implies = LTL.Tag("FourImpliesTwo", LTL.Implies(LTL.Tag("mod4", LTL.Predicate((x: number) => x % 4 == 0)), LTL.Tag("mod2", LTL.Predicate((x: number) => x % 2 == 0))));
    let res = LTL.ltlEvaluateGenerator(implies, 8);
    res.next();
    expect(res.next().value.tags).toEqual(new Set());
    let falseImplies = LTL.Tag("fourImpliesThree", LTL.Implies(LTL.Tag("mod4", LTL.Predicate((x: number) => x % 4 == 0)), LTL.Tag("mod3", LTL.Predicate((x: number) => x % 3 == 0))));
    let res2 = LTL.ltlEvaluateGenerator(falseImplies, 8);
    res2.next();
    expect(res2.next().value.tags).toEqual(new Set(["fourImpliesThree","mod3"]));
  });

  it("should propagate tags for any false formula", () => {
    fc.assert(
      fc.property(LTLFormulaArbitrary.term, fc.array(fc.integer(), { minLength: 1 }), (formula, data) => {
        fc.pre(data.length > LTL.requiredSteps(formula));
        let tagged = LTL.Tag("test", formula);
        let res = LTL.ltlEvaluateGenerator(tagged, data[0]);
        res.next();
        for(let i = 1; i < data.length; i++) {
          let next = res.next(data[i]);
          // if(next.value.validity === LTL.DF) {
          if(next.value.validity.value === false) {
            // console.log(JSON.stringify(tagged, null, 2))
            // console.log("RECEIVED", next.value.tags)
            expect(next.value.tags).toEqual(new Set(["test"]));
          }
        }
      })
    , {
        examples: [
          [{"kind":"and","term1":{"kind":"comparison","pred":(x, y) => x % 0 == 0 && y % 0 == 0},"term2":{"kind":"and","term1":{"kind":"true"},"term2":{"kind":"true"}}},[0,0]],
          [{"kind":"and","term1":{"kind":"weak-next","term":{"kind":"false"}},"term2":{"kind":"weak-next","term":{"kind":"true"}}},[0,0]],
          [{"kind":"not","term":{"kind":"comparison","pred":() => true}},[0,0]],
          [{"kind":"or","term1":{"kind":"comparison","pred":(x, y) => x % 0 == 0 && y % 0 == 0},"term2":{"kind":"not","term":{"kind":"true"}}},[0,854563543]],
          [{"kind":"not","term":{"kind":"release","term":{"kind":"true"},"condition":{"kind":"true"},"steps":0}},[0,0]],
          [{"kind":"release","term":{"kind":"false"},"condition":{"kind":"false"},"steps":0},[0,0]],
          [{"kind":"eventually","term":{"kind":"false"},"steps":0}, [0,0]],
          [{"kind":"eventually","term":{"kind":"always","term":{"kind":"true"},"steps":0},"steps":0},[0,0,0]]
        ],
        numRuns: 100
      });
  });
});

describe("Contramap", () => {
  it("should contramap a predicate", () => {
    type TPage = {
      loaded: boolean;
      sessionStarted: boolean;
    }
    type TestModel = {
      pages: TPage[];
    }

    let PageProps: LTL.LTLFormula<TPage> = LTL.And(
      LTL.Tag("pageLoadFirst", LTL.Implies(p => p.sessionStarted, p => p.loaded)),
      LTL.Tag("EventuallyLoaded", LTL.Eventually(p => p.loaded))
    )

    let PagePropsAll: LTL.LTLFormula<TestModel> = LTL.Always(LTL.Bind(m => {
      let pageProps = m.pages.map((p, index) => LTL.Contramap<TestModel, TPage>(q => q.pages[index], PageProps)); 
      if(pageProps.length === 0) return LTL.True();
      return LTL.And(...pageProps);
    }));

    let StatesTrue: TestModel[] = [
      {pages: [{loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}, {loaded: false, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}]}
    ]; 
    expect(LTL.ltlEvaluate(StatesTrue, PagePropsAll)).toEqual(LTL.PT);
    let StatesNotLoaded: TestModel[] = [
      {pages: [{loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}, {loaded: false, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}]}
    ]; 
    expect(LTL.ltlEvaluate(StatesNotLoaded, PagePropsAll)).toEqual(LTL.PF);
    let StatesAbsurd: TestModel[] = [
      {pages: [{loaded: true, sessionStarted: false}, {loaded: false, sessionStarted: false}, {loaded: false, sessionStarted: false}]},
      {pages: [{loaded: false, sessionStarted: true}, {loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}, {loaded: true, sessionStarted: false}]}
    ]; 
    expect(LTL.ltlEvaluate(StatesAbsurd, PagePropsAll)).toEqual(LTL.DF);
    let StatesOnePage: TestModel[] = [
      {pages: [{loaded: true, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: false}]},
      {pages: [{loaded: true, sessionStarted: true}]}
    ];
    expect(LTL.ltlEvaluate(StatesOnePage, PagePropsAll)).toEqual(LTL.PT);
    let StatesNoPages: TestModel[] = [
      {pages: []},
      {pages: []},
      {pages: []}
    ];
    expect(LTL.ltlEvaluate(StatesNoPages, PagePropsAll)).toEqual(LTL.PT);
  });
})

describe("Match", () => {

  type TodoMatchTest = {
    todoCount: null | number;
    numItems: number;
  };

  it("should allow adding multiple match conditions and evaluate correctly", ()=>{

      // LTL.And(
      //     LTL.Implies(m => m.todoCount === null, LTL.False()),
      //     LTL.Implies(m => m.todoCount === 0, LTL.Next(n => n.numItems === 0)),
      //     LTL.Implies(m => m.todoCount! > 0, LTL.Comparison((m, n) => n.numItems === m.numItems + m.todoCount!))
      // ))
      var expr = LTL.Match((s: TodoMatchTest) => s.todoCount)
      .with(null, LTL.False())
      .with(0, LTL.Next(n => n.numItems === 0))
      .with(m => m != null && m > 0, LTL.Comparison((m, n) => n.numItems === m.numItems + m.todoCount!));

      expect(LTL.ltlEvaluate([{
        todoCount: null,
        numItems: 0
      }], expr)).toEqual(LTL.DF)


      expect(LTL.ltlEvaluate([{
        todoCount: 0,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 0
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 0,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 2
      }], expr)).toEqual(LTL.DF)


      expect(LTL.ltlEvaluate([{
        todoCount: 1,
        numItems: 1
      }, {
        todoCount: 0,
        numItems: 2
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 1,
        numItems: 1
      }, {
        todoCount: 0,
        numItems: 0
      }], expr)).toEqual(LTL.DF)
  })

  it("should match exhaustively", () => {
      var expr = LTL.Match((s: TodoMatchTest) => s.todoCount)
      .with(null, LTL.False())
      .with(0,  LTL.Next(n => n.numItems === 0))
      .with(m => m != null && m > 0 && m < 10, LTL.Comparison((m, n) => n.numItems === m.numItems + m.todoCount!))
      .exhaustive();

      expect(LTL.ltlEvaluate([{
        todoCount: 0,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 0
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 9,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 9
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 10,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 10
      }], expr)).toEqual(LTL.DF)

      expect(LTL.ltlEvaluate([{
        todoCount: null,
        numItems: 0
      }], expr)).toEqual(LTL.DF)


      expect(LTL.ltlEvaluate([{
        todoCount: 0,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 0
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 0,
        numItems: 0
      }, {
        todoCount: 0,
        numItems: 2
      }], expr)).toEqual(LTL.DF)


      expect(LTL.ltlEvaluate([{
        todoCount: 1,
        numItems: 1
      }, {
        todoCount: 0,
        numItems: 2
      }], expr)).toEqual(LTL.DT)

      expect(LTL.ltlEvaluate([{
        todoCount: 1,
        numItems: 1
      }, {
        todoCount: 0,
        numItems: 0
      }], expr)).toEqual(LTL.DF)
  });
})