// https://docs.cypress.io/api/table-of-contents

describe("My First Test", () => {
  it("Visits the app root url", () => {
    cy.visit("/shop");
    cy.log("Navigated to shop home page");
    // cy.get("img").then(($selectedElement) => {
    //   // debugger;
    //   cy.log("$selectedElement.get(0): ", $selectedElement.get(0));
    // });
    cy.get("img").then((selected) => {
      expect(selected.length).gte(1);
    });
  });
});
