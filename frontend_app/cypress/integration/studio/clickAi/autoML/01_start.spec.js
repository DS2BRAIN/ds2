beforeEach(() => {
  cy.enterAutoML();
});

describe("01_start", function() {
  it("newStart", () => {
    cy.get("#startProjectBtn").click();
    cy.url().should("include", "/admin/dataconnector");
  });

  it("start with sampleData", () => {
    cy.get("#sampleDataBtn").click();
    cy.get("#제조_sampleCategory").click();
    cy.get("#2341").click();
    cy.url().should("include", "/admin/sample");
  });

  it("enter process", () => {
    cy.get("body").then(($body) => {
      if ($body.find("tbody > tr").length) {
        cy.get("tbody > tr")
          .eq(0)
          .click();
        cy.url().should("include", "/admin/process");
      }
    });
  });
});
