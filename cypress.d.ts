import { mount } from "cypress/vue";
// It's possible to define the class type without methods, as described in TS documentation. But unfortunately it still contains dogYears getter. As I know, it cannot be solved because when dealing with types, there is no difference between fields and getters.

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Helper mount function for Vue Components
       * @param component Vue Component or JSX Element to mount
       * @param options Options passed to Vue Test Utils
       */
      mount: typeof mount;
      window(
        options?: Partial<Loggable & Timeoutable>
      ): Chainable<CustomWindow>;
    }
  }
}
