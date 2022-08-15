describe("03_startPublic", function() {
  beforeEach(() => {
    cy.enterDataset();
    cy.get("#publicDataTab").click();
    // 공공데이터 1번째 데이터(두번째 데이터) 클릭
    cy.get("tbody > tr")
      .eq(1)
      .click();
  });

  it("start labelling (public)", () => {
    // 공공데이터 라벨링 시작하기
    cy.get("#startLabellingBtn").click();
    cy.url().should("include", "/admin/newProject");
  });
});
