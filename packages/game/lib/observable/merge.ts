import { Observable } from "observable-polyfill/fn";

/**
 * Merges multiple observables into a single observable.
 * Subscribes to all input observables and emits values from any of them.
 *
 * @param observables - The observables to merge
 * @returns A new observable that emits values from all input observables
 */
const mergeObservables = <T>(
  ...observables: Array<Observable<T>>
): Observable<T> =>
  new Observable((observer) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    const subs = observables.map(
      (obs) =>
        obs.subscribe((value) => observer.next(value)) as unknown as {
          unsubscribe(): void;
        },
    );
    return () => {
      for (const sub of subs) {
        sub.unsubscribe();
      }
    };
  });

export default mergeObservables;
