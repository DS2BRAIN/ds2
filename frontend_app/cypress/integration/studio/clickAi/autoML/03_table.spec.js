describe("03_table", function() {
  beforeEach(() => {
    cy.enterAutoML();
  });

  it("click checkbox", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // checkbox 전체 클릭
      cy.get("[type='checkbox']")
        .first()
        .check();
      cy.get("[type='checkbox']").should("be.checked");
      cy.get("#deleteProject").should("not.be.disabled");

      // checkbox 전체 클릭 해제
      cy.get("[type='checkbox']")
        .first()
        .uncheck();
      cy.get("[type='checkbox']").should("not.be.checked");
      cy.get("#deleteProject").should("be.disabled");

      // checkbox 개별 클릭&해제
      cy.get("[type='checkbox']").each(($el, index, $list) => {
        if (index !== 0) {
          cy.wrap($el).check();
          cy.wrap($el).should("be.checked");
          cy.get("#deleteProject").should("not.be.disabled");
          cy.wrap($el).uncheck();
          cy.wrap($el).should("not.be.checked");
          cy.get("#deleteProject").should("be.disabled");
        }
      });
    }
  });

  it("change list count", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("tbody > tr").then(() => {
        // Rows per page:20 설정 후 개수 확인
        cy.get(".MuiTablePagination-select").click({
          multiple: true,
          force: true,
        });
        cy.get("ul > li.MuiTablePagination-menuItem")
          .eq(1)
          .click({
            multiple: true,
            force: true,
          });
        cy.get("tbody > tr")
          .its("length")
          .should("to.lte", 20);

        // Rows per page:50 설정 후 개수 확인
        cy.get(".MuiTablePagination-select").click({
          multiple: true,
          force: true,
        });
        cy.get("ul > li.MuiTablePagination-menuItem")
          .eq(2)
          .click({
            multiple: true,
            force: true,
          });
        cy.get("tbody > tr")
          .its("length")
          .should("to.lte", 50);
      });
    }
  });

  it("change list page", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // 페이지 '다음' 버튼 클릭
      cy.get("[aria-label='next projectPage']").click();
      cy.url().should("include", "page=2");
      cy.get(".MuiTablePagination-caption").contains("11-20");

      // 페이지 '이전' 버튼 클릭
      cy.get("[aria-label='previous projectPage']").click();
      cy.url().should("include", "page=1");
      cy.get(".MuiTablePagination-caption").contains("1-10");
    }
  });

  it("delete project", () => {
    let projectName = "";

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // 프로젝트 삭제 버튼 누른 후 확인 모달 '아니오' 클릭
      cy.get("[type='checkbox']")
        .eq(1)
        .check();
      cy.get("#deleteProject").click();
      cy.contains("선택하신 라벨링프로젝트를 삭제하시겠습니까?");
      cy.get("#noBtn").click();
      cy.contains("선택하신 라벨링프로젝트를 삭제하시겠습니까?").should(
        "not.exist"
      );
      cy.get("[type='checkbox']")
        .eq(1)
        .uncheck();

      // 첫 번째 프로젝트 삭제
      cy.get("td")
        .eq(2)
        .then(($el) => {
          projectName = $el.text();

          cy.get("[type='checkbox']")
            .eq(1)
            .check();
          cy.get("#deleteProject").click();
          cy.get("#yesBtn").click();
          cy.get("#client-snackbar").contains(
            "프로젝트가 정상적으로 삭제되었습니다."
          );
          cy.get("tbody > tr")
            .eq(0)
            .should("not.contain.text", projectName);
        });
    }
  });
});
