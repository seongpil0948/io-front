import { TESTERS } from "../../src/constants";
import admin from "firebase-admin";

describe("process login", () => {
  // beforeEach(() => {
  //   // reset and seed the database prior to every test
  //   //   cy.exec("npm run db:reset && npm run db:seed");
  //   // TODO: conditional testing
  //   // https://github.com/cypress-io/cypress/issues/518
  // });
  it("check emulator mode", () => {
    cy.visit("/login");
    // cy.get("body > p.firebase-emulator-warning").contains("in emulator mode");
    expect(window.navigator.onLine).to.equal(true);
  });
  it("redirect to login", () => {
    cy.visit("/");
    cy.url().should("include", "/login");
  });
  it("fail to login", () => {
    cy.visit("/login");
    cy.getBySel("input-email").type("bla bla");
    cy.getBySel("input-pw").type("bla bla");
    cy.get("#login-page-container").click();
    cy.get("#login-page-container").contains(
      "유효한 이메일 주소를 입력 해주세요."
    );
    cy.get("#login-page-container").contains("영문, 숫자");
  });
  // it("dev login", () => {
  //   cy.visit("/login");
  //   // cy.get("[data-test=login-shop]").click();
  //   cy.get(":nth-child(2) > .n-space > :nth-child(2) > .n-button").click();
  //   cy.url().should("include", "shop");
  // });
  // it("redirect to signup", () => {
  //   cy.visit("/login");
  //   cy.getBySel("input-email").type("blabla@naver.com");
  //   cy.getBySel("input-pw").type("0525ccc");
  //   cy.getBySel("email-submit").click();
  //   cy.url().should("include", "signup");
  // });
  it("successfully shop login", () => {
    cy.visit("/login");
    cy.getBySel("input-email").type(TESTERS.SHOP_NO.id);
    cy.getBySel("input-pw").type(TESTERS.SHOP_NO.pw);
    cy.getBySel("email-submit").click();
    // cy.wait(60000).url().should("include", "shop");
    cy.get(".n-message").contains("관리자가 검토중인 계정입니다.");
  });
});
