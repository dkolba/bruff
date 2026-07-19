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
    /* eslint-disable @typescript-eslint/consistent-type-assertions -- observable-polyfill's subscribe() return type does not expose unsubscribe(); the cast is safe because the polyfill implements it at runtime */
    const subs = observables.map(
      (obs) =>
        obs.subscribe((value) => observer.next(value)) as unknown as {
          unsubscribe(): void;
        },
    );
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
    return () => {
      for (const sub of subs) {
        sub.unsubscribe();
      }
    };
  });

export default mergeObservables;
