describe("notilist", function() {
  beforeEach(() => {
    cy.enterUserInfo();
  });

  it("notilist", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      //영문화
      cy.en();

      //그룹 공유로 이동
      cy.get("#notilist").click();

      //라우팅 확인
      cy.url().should("include", "/admin/setting/notilist");
    } else {
      //영문화
      cy.en();

      //그룹 공유로 이동
      cy.get("#notilist").click();

      //라우팅 확인
      cy.url().should("include", "/admin/setting/notilist");
    }
  });
});
