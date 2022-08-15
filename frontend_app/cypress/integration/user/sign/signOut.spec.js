describe("SignOut", function() {
  it("signOut", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      //로그인
      cy.login();

      //라우팅 확인
      cy.url().should("include", "/admin");

      //로그이웃 클릭
      cy.get("#logoutLink").click();

      //로그아웃 확인 (로그인 페이지)
      cy.url().should("include", "/signin");

      //로그인
      cy.login();

      //라우팅으로 로그아웃
      cy.visit("/signout");

      //로그아웃 확인 (로그인 페이지)
      cy.url().should("include", "/signin");
    } else {
      //운영서버

      //로그인
      cy.login();

      //라우팅 확인
      cy.url().should("include", "/admin");

      //로그이웃 클릭
      cy.get("#logoutLink").click();

      //로그아웃 확인 (로그인 페이지)
      cy.url().should("include", "/signin");

      //로그인
      cy.login();

      //라우팅으로 로그아웃
      cy.visit("/signout");

      //로그아웃 확인 (로그인 페이지)
      cy.url().should("include", "/signin");
    }
  });
});
