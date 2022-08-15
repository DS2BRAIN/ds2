beforeEach(() => {
  cy.enterAutoML();
});

describe("02_activeStep", function() {
  it("데이터준비", () => {
    cy.get("#activeStep_0").click();
    cy.url().should("include", "/admin/dataconnector");
  });

  it("준비완료", () => {
    cy.get("#activeStep_1").click();
    cy.get("body").then(($body) => {
      if ($body.find("tbody > tr").length) {
        cy.get("tbody > tr")
          .contains("학습 중")
          .should("not.be.visible");
        cy.get("tbody > tr")
          .contains("학습완료")
          .should("not.be.visible");
        cy.get("tbody > tr")
          .contains("에러")
          .should("not.be.visible");
      }
    });
  });

  it("학습 중", () => {
    cy.get("#activeStep_2").click();
    cy.get("body").then(($body) => {
      if ($body.find("tbody > tr").length) {
        cy.get("tbody > tr")
          .contains("준비완료")
          .should("not.be.visible");
        cy.get("tbody > tr")
          .contains("학습완료")
          .should("not.be.visible");
        cy.get("tbody > tr")
          .contains("에러")
          .should("not.be.visible");
      }
    });
  });

  it("학습완료, 에러", () => {
    cy.get("#activeStep_3").click();
    cy.get("body").then(($body) => {
      if ($body.find("tbody > tr").length) {
        cy.get("tbody > tr")
          .contains("준비완료")
          .should("not.be.visible");
        cy.get("tbody > tr")
          .contains("학습 중")
          .should("not.be.visible");
      }
    });
  });
});
