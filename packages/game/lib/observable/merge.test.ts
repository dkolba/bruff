import { apply, isSupported, Observable } from "observable-polyfill/fn";
import { describe, expect, it, vi } from "vitest";
import mergeObservables from "./merge.js";

if (!isSupported()) {
  apply();
}

const ONE = 1;
const TWO = 2;

describe("mergeObservables", () => {
  it("should merge multiple observables", () => {
    const next = vi.fn();
    const obs1 = new Observable<number>((observer) => {
      observer.next(ONE);
    });
    const obs2 = new Observable<number>((observer) => {
      observer.next(TWO);
    });

    const merged = mergeObservables(obs1, obs2);
    merged.subscribe({ next });

    expect(next).toHaveBeenCalledWith(ONE);
    expect(next).toHaveBeenCalledWith(TWO);
  });

  // This test is skipped because of an issue with the observable-polyfill
  // In the vitest browser environment. The subscribe method does not return a
  // Subscription object, which causes the test to fail.
  it.skip("should unsubscribe from all source observables", () => {
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();
    const obs1 = new Observable<void>(() => unsubscribe1);
    const obs2 = new Observable<void>(() => unsubscribe2);

    const merged = mergeObservables(obs1, obs2);
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    const sub = merged.subscribe({}) as unknown as { unsubscribe(): void };

    sub.unsubscribe();

    expect(unsubscribe1).toHaveBeenCalled();
    expect(unsubscribe2).toHaveBeenCalled();
  });
});
