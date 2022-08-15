/// <reference types="cypress" />

describe("LabelProject Detail", () => {
  beforeEach(() => {
    cy.login();
    cy.get("#menu라벨링").click({ multiple: true, force: true });
    cy.url().should(
      "include",
      "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
    );

    // 첫 번째 프로젝트 진입
    cy.get("tbody > tr")
      .eq(0)
      .click();
  });

  it("compare class lists", () => {
    let jwt = "";
    let labelClasses = [];
    let projectId = "";

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.url().then((url) => {
        const urlArr = url.split("/");
        projectId = urlArr[urlArr.length - 1];

        cy.getCookie("jwt")
          .should("exist")
          .then((c) => {
            jwt = c.value;
            cy.intercept(
              "GET",
              `/labelclasses/?token=${jwt}&labelproject_Id=${projectId}&page=1&count=10`
            ).as("getLabelclasses");

            // '클래스'탭 선택
            cy.get("#labelClassTab").click();

            // 요청 response 기다렸다가 라벨 클래스 저장
            cy.wait("@getLabelclasses", { timeout: 10000 })
              .then((interception) => {
                labelClasses = interception.response.body.labelclass;
              })
              .and(() => {
                // 등록된 클래스가 있으면 전체 리스트 name, completedLabelCount 비교, 없으면 tr 개수 0 확인
                if (labelClasses.length > 0) {
                  cy.get("tbody > tr").each(($el, index, $list) => {
                    cy.wrap($el).within(() => {
                      cy.get("td")
                        .eq(3)
                        .should("contain", labelClasses[index].name);
                      cy.get("td")
                        .eq(4)
                        .should(
                          "contain",
                          labelClasses[index].completedLabelCount
                        );
                    });
                  });
                } else {
                  cy.get("tbody > tr").should("have.length", 0);
                }
              });
          });
      });
    }
  });

  it("click checkbox", () => {
    cy.get("#labelClassTab").click();

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // checkbox 전체 클릭 후 체크 여부 확인
      cy.get("[type='checkbox']")
        .first()
        .check();
      cy.get("[type='checkbox']").should("be.checked");
      cy.get("#deleteClassBtn")
        .invoke("attr", "class")
        .should("contain", "defaultGreenOutlineButton");

      // checkbox 전체 클릭 해제 후 체크 여부 확인
      cy.get("[type='checkbox']")
        .first()
        .uncheck();
      cy.get("[type='checkbox']").should("not.be.checked");
      cy.get("#deleteClassBtn")
        .invoke("attr", "class")
        .should("contain", "dataConnectorDisabledButton");

      // checkbox 개별 클릭 & 해제 후 체크 여부 확인
      cy.get("[type='checkbox']").each(($el, index, $list) => {
        if (index !== 0) {
          cy.wrap($el).check();
          cy.wrap($el).should("be.checked");
          cy.get("#deleteClassBtn")
            .invoke("attr", "class")
            .should("contain", "defaultGreenOutlineButton");
          cy.wrap($el).uncheck();
          cy.wrap($el).should("not.be.checked");
          cy.get("#deleteClassBtn")
            .invoke("attr", "class")
            .should("contain", "dataConnectorDisabledButton");
        }
      });
    }
  });

  it("add class list", () => {
    cy.get("#labelClassTab").click();
    cy.deleteAllClassLists();

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // '클래스 추가' 버튼 클릭
      cy.get("#addClassBtn").click();

      // 클래스 등록 모달창이 출력되는가?
      cy.get("#labelClass_modify_class_modal").should("exist");

      // 값 변경 후 '취소' 작업
      // 취소 버튼 클릭 후 확인 창이 나타나는가?
      cy.get("#closeModal").click();
      cy.contains("창을 닫으시겠습니까?").should("exist");

      // '아니오' 클릭 후 확인 창 사라지는가?
      cy.get("#noBtn").click();
      cy.contains("창을 닫으시겠습니까?").should("not.exist");

      // "예" 클릭 후 등록 모달창이 사라지는가?
      cy.get("#closeModal").click();
      cy.get("#yesBtn").click();
      cy.get("#labelClass_modify_class_modal").should("not.exist");

      // 값 변경 후 '완료'(클래스 등록) 작업
      cy.get("body").then(($body) => {
        cy.get("thead > tr").then(() => {
          let totalClassCnt = $body.find("tbody > tr").length;
          cy.get("#addClassBtn").click();

          // 클래스 등록 모달창이 출력되는가?
          cy.get("#labelClass_modify_class_modal").should("exist");

          // 클래스명 input에 focus가 가있는가?
          cy.get("#renameInput").should("be.focused");

          // '완료' 버튼이 비활성화 되어 있는가?
          cy.get("#submitBtn").should("be.disabled");

          // 클래스 테스트 값으로 변경 후 변경된 값 비교
          cy.modifyClassInfo();
          cy.matchClassInfo(`test class${new Date().getDate()}`, "#FFFFFF");

          // '완료' 버튼이 활성화 되어 있는가?
          cy.get("#submitBtn").should("not.be.disabled");

          // '완료' 버튼 클릭 후 모달창이 사라지며, 완료 스낵바가 출력되는가?
          cy.get("#submitBtn").click();
          cy.get("#labelClass_modify_class_modal").should("not.exist");
          cy.get("#client-snackbar").should(
            "contain",
            "클래스가 성공적으로 생성되었습니다."
          );

          // 기존 리스트 개수보다 한 개 더 늘어났는가?
          cy.get("tbody > tr").should("have.length", totalClassCnt + 1);
        });
      });

      // 중복된 클래스 등록 시 에러 스낵바 확인되는가?
      cy.get("#addClassBtn").click();
      cy.modifyClassInfo();
      cy.get("#submitBtn").click();
      cy.get("#client-snackbar").should(
        "contain",
        "중복된 클래스명이 있습니다."
      );

      // 모달창 종료
      cy.get("body").click();
      cy.get("#closeModal").click();
      cy.get("#yesBtn").click();
    }
  });

  it("modify class information", () => {
    let jwt = "";
    let labelClasses = [];
    let projectId = "";

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.url().then((url) => {
        const urlArr = url.split("/");
        projectId = urlArr[urlArr.length - 1];

        cy.getCookie("jwt")
          .should("exist")
          .then((c) => {
            jwt = c.value;
            cy.intercept(
              "GET",
              `/labelclasses/?token=${jwt}&labelproject_Id=${projectId}&page=1&count=10`
            ).as("getLabelclasses");

            // '클래스'탭 선택
            cy.get("#labelClassTab").click();

            // 요청 response 기다렸다가 라벨 클래스 저장
            cy.wait("@getLabelclasses", { timeout: 10000 })
              .then((interception) => {
                labelClasses = interception.response.body.labelclass;
              })
              .and(() => {
                // 등록된 클래스가 있으면 name, completedLabelCount 비교, 없으면 tr 개수 0 확인
                if (labelClasses.length > 0) {
                  let idx = 0;
                  // 클래스 '수정' 버튼 클릭
                  cy.get("tbody > tr")
                    .eq(idx)
                    .within(() => {
                      cy.get("#labelClass_modyfy_class_btn").click();
                    });

                  // 클래스 수정 모달창이 출력되는가?
                  cy.get("#labelClass_modify_class_modal").should("exist");

                  // 해당 클래스 정보 maching & 값 변경 후 확인
                  cy.matchClassInfo(
                    labelClasses[idx].name,
                    labelClasses[idx].color
                  );

                  // 클래스명 input에 focus가 가있는가?
                  cy.get("#renameInput").should("be.focused");
                  cy.modifyClassInfo();

                  // 모달 '완료' 버튼 클릭 후 완료 스낵바 확인;
                  cy.get("#submitBtn").click();
                  cy.get("#client-snackbar").should(
                    "contain",
                    "클래스가 정상적으로 변경되었습니다."
                  );

                  // 클래스 '수정' 버튼 클릭
                  cy.get("tbody > tr")
                    .eq(idx)
                    .within(() => {
                      cy.get("#labelClass_modyfy_class_btn").click();
                    });

                  // 변경된 값 비교
                  cy.matchClassInfo(
                    `test class${new Date().getDate()}`,
                    "#FFFFFF"
                  );

                  // 모달 '취소' 버튼 클릭 후 '아니오' 선택 시 모달창이 그대로 남아있는가?
                  cy.get("#closeModal").click();
                  cy.get("#noBtn").click();
                  cy.get("#labelClass_modify_class_modal").should("exist");

                  // 모달 '취소' 버튼 클릭 후 '예' 선택 시 모달창이 사라지는가?
                  cy.get("#closeModal").click();
                  cy.get("#yesBtn").click();
                  cy.get("#labelClass_modify_class_modal").should("not.exist");
                } else {
                  cy.get("tbody > tr").should("have.length", 0);
                }
              });
          });
      });
    }
  });

  it("delete selected class list", () => {
    cy.get("#labelClassTab").click();

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // 테이블이 나타나고, 리스트가 존재할 때만 테스트
      cy.get("body").then(($body) => {
        cy.get("thead > tr").then(() => {
          if ($body.find("tbody > tr").length) {
            let totalClassCnt = $body.find("tbody > tr").length;

            // 한 개의 클래스 삭제
            cy.get("[type='checkbox']")
              .first()
              .check()
              .should("be.checked");
            cy.get("#deleteClassBtn").click();

            // 삭제 확인 모달창이 나타나는가?
            cy.contains(
              "정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다."
            ).should("exist");

            // '아니오' 클릭 시 모달창이 사라지는가?
            cy.get("#noBtn").click();
            cy.contains(
              "정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다."
            ).should("not.exist");

            // '예' 클릭 시 모달창이 사라지고 리스트에서 삭제되는가?
            cy.get("#deleteClassBtn").click();
            cy.get("#yesBtn").click();
            cy.contains(
              "정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다."
            ).should("not.exist");

            // 삭제 완료 스낵바가 확인되는가?
            cy.get("#client-snackbar").should(
              "contain",
              "클래스가 성공적으로 삭제되었습니다."
            );
            cy.get("tbody > tr").should("have.length", totalClassCnt - 1);
          }
        });
      });
    }
  });

  it("delete all class lists", () => {
    cy.get("#labelClassTab").click();

    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      // 테이블이 나타나고, 리스트가 존재할 때만 테스트
      cy.get("body").then(($body) => {
        cy.get("thead > tr").then(() => {
          if ($body.find("tbody > tr").length) {
            // 모든 클래스 삭제 후 리스트가 전부 사라졌는가?
            cy.get("[type='checkbox']")
              .first()
              .check();
            cy.get("[type='checkbox']").should("be.checked");
            cy.get("#deleteClassBtn").click();
            cy.get("#yesBtn").click();

            // 삭제 확인 창이 나타나는가?
            cy.contains(
              "정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다."
            ).should("not.exist");

            // 삭제 완료 스낵바가 확인되는가?
            cy.get("#client-snackbar").should(
              "contain",
              "클래스가 성공적으로 삭제되었습니다."
            );
            cy.get("tbody > tr").should("have.length", 0);
          }
        });
      });
    }
  });
});
