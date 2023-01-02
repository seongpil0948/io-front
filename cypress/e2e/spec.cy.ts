// https://mochajs.org/
describe("test cypress  ", () => {
  // http://www.chaijs.com/
  it("visit", () => {
    cy.visit("https://example.cypress.io");
    cy.contains("type").click();
    cy.url().should("include", "/commands/actions");
    cy.get(".action-email").type("fake@email.com");
    cy.get(".action-email").should("have.value", "fake@email.com");
  });
});

describe("test cypress without visit", () => {
  it("Does not do much!", () => {
    expect(true).to.equal(true);
  });
});
