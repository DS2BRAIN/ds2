/// <reference types="cypress" />

describe("LabelProject List", () => {
  beforeEach(() => {
    cy.login();

    // '서비스 시작하기' 버튼 보이면 클릭
    cy.get("body").then(($body) => {
      if ($body.find("#labelIntro_start_btn").length) {
        cy.get("#labelIntro_start_btn").click();
      }
    });
  });

  it("compare project lists", () => {
    // GET /labelprojets로 받은 project list와 실제 출력된 리스트 비교
    let jwt = "";
    let projects = [];

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.getCookie("jwt")
        .should("exist")
        .then((c) => (jwt = c.value))
        .then(() => {
          cy.intercept(
            "GET",
            `/labelprojects/?token=${jwt}&sorting=created_at&page=10&start=1&desc=True`
          ).as("getLabelprojects");

          cy.get("#menu라벨링").click({ multiple: true, force: true });
          cy.url().should(
            "include",
            "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
          );

          cy.wait("@getLabelprojects", { timeout: 10000 })
            .then((interception) => {
              projects = interception.response.body.projects;
            })
            .and(() => {
              // 프로젝트가 있으면 project name 비교, 없으면 문구 확인
              if (projects.length > 0) {
                cy.get("tbody > tr").each(($el, index, $list) => {
                  cy.wrap($el).should("contain", projects[index].name);
                });
                cy.get(".MuiTablePagination-caption").contains(projects.length);
              } else {
                cy.get("#labeling_no_project_text").should("be.visible");
              }
            });
        });
    }
  });

  it("click checkbox", () => {
    cy.get("#menu라벨링").click({ multiple: true, force: true });

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

  it("search project name", () => {
    let jwt = "";
    let projects = [];

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.getCookie("jwt")
        .should("exist")
        .then((c) => (jwt = c.value))
        .then(() => {
          cy.intercept(
            "GET",
            `/labelprojects/?token=${jwt}&sorting=created_at&page=10&start=1&desc=True`
          ).as("getLabelprojects");

          cy.get("#menu라벨링").click({ multiple: true, force: true });
          cy.url().should(
            "include",
            "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
          );

          cy.wait("@getLabelprojects", { timeout: 10000 })
            .then((interception) => {
              projects = interception.response.body.projects;
            })
            .and(() => {
              // 프로젝트가 있으면 project name 비교, 없으면 문구 확인
              if (projects.length > 0) {
                // 프로젝트 첫 번째 리스트 검색 & name 비교
                cy.get("#searchInput").type(projects[0].name);
                cy.get("#labeling_search_form").submit();
                cy.get("tbody > tr").should("contain", projects[0].name);

                // 존재하지 않는 프로젝트명 검색 후 문구 확인
                cy.get("#searchInput").clear();
                cy.get("#searchInput").type("notFoundProject");
                cy.get("#labeling_search_form").submit();
                cy.get("#labeling_no_project_text").should("be.visible");
              } else {
                cy.get("#labeling_no_project_text").should("be.visible");
              }
            });
        });
    }
  });

  it("change list count", () => {
    cy.get("#menu라벨링").click({ multiple: true, force: true });

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
    cy.get("#menu라벨링").click({ multiple: true, force: true });

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

  it.skip("delete project", () => {
    cy.get("#menu라벨링").click({ multiple: true, force: true });
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

  it("start project", () => {
    cy.get("#menu라벨링").click({ multiple: true, force: true });

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // '라벨링 시작하기' 버튼 클릭 후 '데이터셋' 페이지 이동 확인
      cy.get("#addProjcetBtn").click();
      cy.get("a[href='/admin/dataconnector']").should("have.class", "active");
      cy.url().should("include", "/admin/dataconnector");
    }
  });
});
