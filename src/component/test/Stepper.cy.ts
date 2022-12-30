import Stepper from "./Stepper.vue";
import { mount } from "cypress/vue";

describe("Component Test: <Stepper />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-vue
    mount(Stepper);
    // Each Cypress query is equivalent to its jQuery counterpart.
    cy.get("#main-content").should("not.exist");
    // .find(".article");
    // .children('img[src^="/static"]')
    // .first()
    // .then((el) => {
    //   console.log("then element: ", el);
    // });
  });
  it('supports an "initial" prop to set the value', () => {
    mount(Stepper, { props: { initial: 100 } });
    cy.get("[data-cy=counter]").should("have.text", "100");
  });
  it("when the increment button is pressed, the counter is incremented", () => {
    mount(Stepper);
    cy.get("[data-cy=increment]").click();
    cy.get("[data-cy=counter]").should("have.text", "1");
  });

  it("when the decrement button is pressed, the counter is decremented", () => {
    mount(Stepper);
    cy.get("[data-cy=decrement]").click();
    cy.get("[data-cy=counter]").should("have.text", "-1");
  });
  it("clicking + fires a change event with the incremented value", () => {
    const onChangeSpy = cy.spy().as("onChangeSpy");
    mount(Stepper, { props: { onChange: onChangeSpy } });
    cy.get("[data-cy=increment]").click();
    cy.get("@onChangeSpy").should("have.been.calledWith", 1);
  });
});
