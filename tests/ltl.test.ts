import * as LTL from "../src/index";
import * as fc from "fast-check";

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

describe.only("step", () => {
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
        expect(LTL.step(LTL.Predicate((x: number) => x === 1), 1)).toEqual(LTL.True());
    });

    it("should handle a false predicate", () => {
        expect(LTL.step(LTL.Predicate((x: number) => x === 2), 1)).toEqual(LTL.False());
    });

    it("should handle eventually true", () => {
        expect(LTL.step(LTL.Eventually(1, (x: number) => x === 2), 2)).toEqual(LTL.True());
    });

    it("should handle eventually unsure", () => {
        let term = LTL.Eventually(1, (x: number) => x === 4);
        expect(LTL.step(term, 1)).toEqual(LTL.RequiredNext(LTL.Eventually(0, term.term)));
    });

    it("should handle eventually unsure with 0 steps", () => {
        let term = LTL.Eventually(0, (x: number) => x === 4);
        expect(LTL.step(term, 1)).toEqual(LTL.StrongNext(LTL.Eventually(0, term.term)));
    });

    it("should handle henceforth false", () => {
        expect(LTL.step(LTL.Henceforth(1, (x: number) => x === 2), 1)).toEqual(LTL.False());
    });

    it("should handle henceforth unsure", () => {
        let term = LTL.Henceforth(1, (x: number) => x === 4);
        expect(LTL.step(term, 4)).toEqual(LTL.RequiredNext(LTL.Henceforth(0, term.term)));
    });

    it("should handle henceforth unsure with 0 steps", () => {
        let term = LTL.Henceforth(0, (x: number) => x === 4);
        expect(LTL.step(term, 4)).toEqual(LTL.WeakNext(LTL.Henceforth(0, term.term)));
    });

    it("should handle until where it is satisfied", () => {
        expect(LTL.step(LTL.Until(1, (x: number) => x === 3, (x: number) => x === 2), 2)).toEqual(LTL.True());
    });

    it("should handle until where the condition is maintained with 0 steps", () => {
        let term = LTL.Until(0, (x: number) => x === 3, (x: number) => x === 2);
        expect(LTL.step(term, 3)).toEqual(LTL.StrongNext(term));
    });

    it("should handle until which is unsatisfied", () => {
        let term = LTL.Until(1, (x: number) => x === 3, (x: number) => x === 2);
        expect(LTL.step(term, 1)).toEqual(LTL.False());
        let term2 = LTL.Until(0, (x: number) => x === 3, (x: number) => x === 2);
        expect(LTL.step(term2, 1)).toEqual(LTL.False());
    });

    it("should handle release which is statisfied", () => {
        let term = LTL.Release(1, (x: number) => x % 2 == 0, (x: number) => x % 3 == 0);
        expect(LTL.step(term, 12)).toEqual(LTL.True());
    });

    it("should handle release which matches the condition", () => {
        let term = LTL.Release(1, (x: number) => x % 2 == 0, (x: number) => x % 3 == 0);
        expect(LTL.step(term, 9)).toEqual(LTL.RequiredNext(LTL.Release(0, term.condition, term.term)));
    });

    it("should handle release which matches the condition with 0 steps", () => {
        let term = LTL.Release(0, (x: number) => x % 2 == 0, (x: number) => x % 3 == 0);
        expect(LTL.step(term, 9)).toEqual(LTL.WeakNext(LTL.Release(0, term.condition, term.term)));
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

describe.only("ltlEvaluate", () => {
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

    it("should handle a true predicate", () => {
        expect(LTL.ltlEvaluate([1, 2, 3], LTL.Predicate((x: number) => x === 1))).toEqual(LTL.Definitely(true));;
    });

    it("should handle a false predicate", () => {
        expect(LTL.ltlEvaluate([1, 2, 3], LTL.Predicate((x: number) => x === 2))).toEqual(LTL.Definitely(false));
    });

    it("should handle next", () => {
        expect(LTL.ltlEvaluate([1, 2, 3], LTL.Next(LTL.Predicate((x: number) => x === 2)))).toEqual(LTL.Definitely(true));
    });

    it("should handle eventually true", () => {
        expect(LTL.ltlEvaluate([1, 2, 3], LTL.Eventually(1, (x: number) => x === 2))).toEqual(LTL.Definitely(true));
        expect(LTL.ltlEvaluate([2, 1, 3], LTL.Eventually(1, (x: number) => x === 2))).toEqual(LTL.Definitely(true));
        expect(LTL.ltlEvaluate([3, 2, 1], LTL.Eventually(1, (x: number) => x === 2))).toEqual(LTL.Definitely(true));
    });

    it("should handle eventually false", () => {
        expect(LTL.ltlEvaluate([1, 2, 3], LTL.Eventually(1, (x: number) => x === 4))).toEqual(LTL.Probably(false));
    });

    it("should handle henceforth true", () => {
        expect(LTL.ltlEvaluate([2, 2, 2], LTL.Henceforth(1, (x: number) => x === 2))).toEqual(LTL.Probably(true));
        // expect(LTL.ltlEvaluate([0, 2, 2], LTL.Henceforth(1, (x: number) => x === 2))).toBe(true);
        // expect(LTL.ltlEvaluate([0, 0, 2], LTL.Henceforth(1, (x: number) => x === 2))).toBe(true);
    });

    it("should handle henceforth false", () => {
        expect(LTL.ltlEvaluate([2, 2, 2], LTL.Henceforth(1, (x: number) => x === 3))).toEqual(LTL.Definitely(false));
        // expect(LTL.ltlEvaluate([0, 2, 2], LTL.Henceforth(1, (x: number) => x === 3), 1)).toBe(false);
        // expect(LTL.ltlEvaluate([0, 0, 2], LTL.Henceforth(1, (x: number) => x === 3), 2)).toBe(false);
    });

    it("should property based test eventually", () => {
        fc.assert(fc.property(fc.array(fc.integer(), {minLength: 1}), fc.integer(), (arr, x) => {
            return expect(LTL.ltlEvaluate(arr, LTL.Eventually(arr.length, (y: number) => y === x))).toEqual(arr.includes(x) ? LTL.Definitely(true) : LTL.Probably(false));
        }));
    })

    it("should property based test henceforth", () => {
        fc.assert(fc.property(fc.array(fc.integer(), {minLength: 1}), fc.integer(), fc.integer(), (arr, x, i) => {
            return expect(LTL.ltlEvaluate(arr, LTL.Henceforth(arr.length, (y: number) => y === x))).toEqual(arr.slice(i%arr.length).every((y: number) => y === x) ? LTL.Probably(true) : LTL.Definitely(false));
        }));
    });

    it("should handle until", () => {
        expect(LTL.ltlEvaluate([2, 2, 3], LTL.Until(1, (x: number) => x === 2, (x: number) => x === 3))).toEqual(LTL.Definitely(true))
        expect(LTL.ltlEvaluate([2, 1, 3], LTL.Until(1, (x: number) => x === 2, (x: number) => x === 3))).toEqual(LTL.Definitely(false))
        expect(LTL.ltlEvaluate([2, 2], LTL.Until(1, (x: number) => x === 2, (x: number) => x === 3))).toEqual(LTL.Probably(false))
        expect(LTL.ltlEvaluate([3], LTL.Until(1, (x: number) => x === 2, (x: number) => x === 3))).toEqual(LTL.Definitely(true))
    });

    it("should property based test until", () => {
        fc.assert(fc.property(fc.array(fc.integer(), {minLength: 1}), fc.integer(), fc.integer(), (arr, x, y) => {
            return expect(LTL.ltlEvaluate(arr, LTL.Until(arr.length, (z: number) => z === x, (z: number) => z === y))).toEqual(
                arr.some((z: number, i: number) => z === y && arr.slice(0,i).every((z: number) => z === x)) ? LTL.Definitely(true) : 
                arr.every((z: number) => z === x) ? LTL.Probably(false) : LTL.Definitely(false));
        }));
    });

    it("should handle release", () => {
        // let p = [false, true, true, true];
        // let q = [true, true, false, false];
        let p = [false, false, false, true];
        let q = [true, true, true, true];
        type Pair = {p: boolean, q: boolean};
        function zip(p: boolean[], q: boolean[]): {p: boolean, q: boolean}[] {
            return p.map((x, i) => {return {p: x, q: q[i]}});
        }
        let data = zip(p,q);
        let truthline = data.map((x: Pair, index) => LTL.ltlEvaluate(data.slice(0,index+1), LTL.Release(index, (x: Pair) => x.p, (x: Pair) => x.q)));
        expect(truthline).toEqual([LTL.Probably(true), LTL.Probably(true), LTL.Probably(true), LTL.Definitely(true)]);
    });

});

describe.only("ltlEvaluateGenerator", () => {
    it("should handle eventually", () => {
        let gen = LTL.ltlEvaluateGenerator<number>(LTL.Eventually(1, (x: number) => x === 2), 1);
        expect(gen.next(1)).toEqual({value: {requiresNext: true, validity: LTL.PT}, done: false});
        expect(gen.next(2)).toEqual({value: {requiresNext: false, validity: LTL.DT}, done: false});
        expect(gen.next(3)).toEqual({value: {requiresNext: false, validity: LTL.DT}, done: false});
    });
});