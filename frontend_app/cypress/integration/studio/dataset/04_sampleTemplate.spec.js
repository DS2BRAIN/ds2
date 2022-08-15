describe("04_sampleTemplate", function() {
  beforeEach(() => {
    cy.enterDataset();
  });

  it("open sampleTemplate modal", () => {
    // 샘플템플릿 모달 보여주기
    cy.get("sampleTemplateBtn").click();
  });
});
