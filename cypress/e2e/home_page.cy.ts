describe("The Home Page", () => {
  //   beforeEach(() => {
  //     // reset and seed the database prior to every test
  //     cy.exec("npm run db:reset && npm run db:seed");
  //   });
  it("successfully loads", () => {
    cy.visit("/");
    cy.url().should("include", "/login");
  });
});
