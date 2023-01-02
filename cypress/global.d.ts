/// <reference types="cypress" />
// It's possible to define the class type without methods, as described in TS documentation. But unfortunately it still contains dogYears getter. As I know, it cannot be solved because when dealing with types, there is no difference between fields and getters.

type NonFunctionPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type MountParams = Parameters<typeof mount>;
type OptionsParam = MountParams[1];

declare namespace Cypress {
  interface Chainable {
    window(options?: Partial<Loggable & Timeoutable>): Chainable<CustomWindow>;
  }
}
