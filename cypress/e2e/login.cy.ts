import { TESTERS } from "../../src/constants";
describe("process login", () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    //   cy.exec("npm run db:reset && npm run db:seed");
    // TODO: conditional testing
    // https://github.com/cypress-io/cypress/issues/518
    cy.get("body > p.firebase-emulator-warning").contains("in emulator mode");
  });
  it("initial mount & redirect to login page", () => {
    cy.visit("/");
    cy.url().should("include", "/login");
  });
  it("successfully loads", () => {
    cy.visit("/login");
    cy.getBySel("input-email").type(TESTERS.SHOP.id);
    cy.getBySel("input-pw").type(TESTERS.SHOP.pw);
    cy.getBySel("email-submit").click();
    cy.url().should("include", "signup");
  });
});
