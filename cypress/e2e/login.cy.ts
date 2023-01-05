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
  it("redirect to signup", () => {
    cy.visit("/login");
    cy.getBySel("input-email").type("blabla@naver.com");
    cy.getBySel("input-pw").type("0525ccc");
    cy.getBySel("email-submit").click();
    cy.url().should("include", "signup");
  });
  // it("reject shop login", () => {
  //   cy.visit("/login");
  //   cy.getBySel("input-email").type(TESTERS.SHOP_NO.id);
  //   cy.getBySel("input-pw").type(TESTERS.SHOP_NO.pw);
  //   cy.getBySel("email-submit").click();
  //   // cy.wait(60000).url().should("include", "shop");
  //   cy.get(".n-message").contains("관리자가 검토중인 계정입니다.");
  // });
  // it("successfully shop login", () => {
  //   cy.visit("/login");
  //   cy.getBySel("input-email").type(TESTERS.SHOP.id);
  //   cy.getBySel("input-pw").type(TESTERS.SHOP.pw);
  //   cy.getBySel("email-submit").click();
  //   cy.location("pathname").should("match", /\/shop$/);
  //   cy.contains("주문취합 엑셀양식 다운").should("be.visible");
  //   cy.contains("시트번호").should("be.visible");
  //   cy.contains("시작행번호").should("be.visible");
  //   cy.contains("주문취합").should("be.visible");
  //   cy.contains("선택주문").should("be.visible");
  //   cy.contains("전체주문").should("be.visible");
  //   cy.contains("선택삭제").should("be.visible");
  //   cy.contains("전체삭제").should("be.visible");
  //   cy.contains("주문정보 다운").should("be.visible");
  // });
});
