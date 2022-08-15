describe("02_startPrivate", function() {
  beforeEach(() => {
    cy.enterDataset();
    // 데이터셋 중 첫번째 파일 선택 (0번째 => 전체체크)
    cy.get("[type='checkbox']")
      .eq(1)
      .check();
  });

  it("click checkbox", () => {
    // 정상적으로 체크가 되는지 확인
    cy.get("[type='checkbox']").should("be.checked");
  });

  it("start Labelling (private)", () => {
    // 내 데이터 라벨링 시작 확인
    cy.get("#startLabellingBtn").click();
    cy.url().should("include", "/admin/newProject");
  });

  it("start AI Develop", () => {
    // 공공 데이터 라벨링 시작 확인
    cy.get("#startAIDevelopBtn").click();
    cy.url().should("include", "/admin/process");
  });
});
