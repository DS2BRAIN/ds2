/// <reference types="cypress" />

const { hexToRgb } = require("@material-ui/core");

describe("Labeling AI 1)", () => {
  beforeEach(() => {
    cy.login();

    // 화면 상단 리스트에서 "라벨링" 버튼 클릭
    cy.get("#label_link").click({ force: true });

    // '서비스 시작하기' 버튼 보이면 클릭
    cy.get("body").then(($body) => {
      // 인트로페이지가 표시되는가?

      // 상단 서비스 시작하기 버튼 확인
      if ($body.find("#labelIntro_start_btn").length) {
        cy.get("#labelIntro_start_btn").click({ force: true });
      }
    });
  });

  // #6 ~
  it("load labelproject lists page", () => {
    // 상단 타이틀 (탭 이름) 확인 -> 헤드 타이틀태그가 "DS2.ai - 라벨링" 으로 되어 있는가?
    cy.title().should("eq", "DS2.ai - 라벨링");

    // 프로젝트 리스트 페이지에서 한글/영어 전환 -> 모든 텍스트의 한/영 변환이 정상적으로 이루어지는가?
    // cy.checkENMode();
  });

  // #8 ~
  it("create new label project", () => {
    // "라벨링 시작하기" 버튼 클릭 -> 데이터 저장소 화면이 출력되는가?
    cy.get("#add_project_btn")
      .click({ force: true })
      .then(() => {
        cy.url().should("include", "/admin/dataconnector");
      });

    // "데이터 추가하기" 버튼 클릭 -> 데이터 형식 선택 팝업이 나타나는가?
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        cy.get("#modalDataconnectorContainer").should("be.visible");
      });

    // "zip"형태 클릭 -> 다음 버튼이 활성화 되는가?
    cy.get("#ZIP_container")
      .click({ force: true })
      .then(() => {
        cy.get("#nextDataModal_btn")
          .should("not.have.class", "disabled")
          .click({ force: true });

        // 파일 찾기 버튼 클릭 -> 파일을 업로드 할 수 있는 화면이 나타나는가?
        cy.get("#data_upload_button").should("be.visible");

        // cat_dog.zip 파일 업로드 -> 파일 업로드가 되었다는 팝업창이 나타나는가?
        cy.get('[type="file"]')
          .attachFile("cat_dog.zip")
          .then(() => {
            cy.contains("파일이 업로드 되었습니다.").should("be.visible");
          });

        // 업로드된 파일 칸에서 삭제 버튼 클릭 -> 삭제버튼을 누르면 "업로드된 파일이 없습니다" 라는 문구가 나타나는가?
        cy.get("#deleteFilesBtn")
          .click({ force: true })
          .then(() => {
            cy.contains("업로드된 파일이 없습니다.").should("be.visible");
          });

        // 파일찾기 위쪽 공간을 클릭 -> 파일을 업로드 할 수 있는 화면이 나타나는가?
        // cy.get(".dropzoneSolidSquareBorder")
        //   .click({ force: true })
        // cy.get("#data_upload_button").click({force:true});

        // cat_dog.zip 파일을 드래그해서 업로드 -> 파일 업로드가 되었다는 팝업창이 나타나는가?
        cy.get(".dropzoneSolidSquareBorder")
          .attachFile("cat_dog.zip", {
            subjectType: "drag-n-drop",
          })
          .then(() => {
            cy.contains("파일이 업로드 되었습니다.").should("be.visible");
          });

        // 라벨링 데이터 포함 체크박스 클릭 후 → 확인 버튼 클릭
        // => 아래와 같은 알림창이 나타나는가? "압축파일 내 라벨링 데이터가 존재하지 않습니다."
        cy.get("#label_data_chkbox")
          .check()
          .then(($el) => {
            // 체크박스가 체크되는가?
            cy.wrap($el).should("be.checked");
          });

        // 라벨링 데이터 포함 체크박스 해제 후 → 확인 버튼 클릭
        cy.get("#label_data_chkbox")
          .uncheck()
          .then(($el) => {
            // 체크박스가 해제되는가?
            cy.wrap($el).should("not.be.checked");

            cy.get("#startSaveFilesBtn").click({ force: true });

            cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
          });

        // 데이터 저장소 리스트 확인 -> 데이터 저장소 리스트에 "cat_dog.zip" 파일이 보이는가?
        cy.get("table > tbody > tr")
          .eq(0)
          .should("contain.text", "cat_dog.zip");

        cy.wait(20000);

        // cat_dog.zip 리스트 좌측 체크박스 클릭 -> 좌측 상단의 라벨링 시작하기 버튼이 활성화되는가?
        cy.get("#dataconnector_chkbox_0")
          .check()
          .then(() => {
            // 라벨링 시작하기 버튼 클릭 -> 프로젝트 생성 페이지로 이동하는가?
            cy.get("#start_labelling_btn", { timeout: 60000 }).should(
              "not.be.disabled"
            );

            cy.get("#start_labelling_btn")
              .click({ force: true })
              .then(() => {
                cy.url().should("include", "/admin/newProject");
              });
          });

        // 프로젝트 생성 페이지에서 한글/영어 전환 -> 모든 텍스트의 한/영 변환이 정상적으로 이루어지는가?
        // cy.checkENMode();

        // 프로젝트 생성 페이지내 카테고리 선택창 확인 -> 데이터 카테고리에 "물체인식" 과 "이미지 분류" 만 보이는가?
        cy.get('[aria-label="dataCategory"]')
          .children()
          .should("have.length", 2);

        const lists = ["물체 인식", "이미지 분류"];

        lists.map((v, i) => {
          cy.get('[aria-label="dataCategory"] > label')
            .eq(i)
            .should("contain.text", v);
        });

        // 프로젝트 이름에 "test1"을 입력 -> 프로젝트 이름을 입력할 수 있는가?
        cy.get("#projectNameInput")
          .type("test1")
          .should("have.value", "test1");

        // 프로젝트 설명 입력창에 "cat_dog" 입력 -> 프로젝트 설명을 입력할 수 있는가?
        cy.get("#projectDescInput")
          .type("cat_dog")
          .should("have.value", "cat_dog");

        // 카테고리: 물체인식 선택 후- "다음" 버튼 클릭 -> "프로젝트가 정상적으로 생성되었다"는 알림창이 나타나는가?
        cy.get('[aria-label="dataCategory"] > label')
          .eq(0)
          .click({ force: true })
          .then(() => {
            cy.get("#next_btn").click({ force: true });
            cy.contains("프로젝트가 정상적으로 생성되었습니다.").should(
              "be.visible"
            );
          });

        // 프로젝트 생성 페이지에서 한글/영어 전환 -> 모든 텍스트의 한/영 변환이 정상적으로 이루어지는가?
        // cy.checkENMode();

        // 프로젝트 리스트 바로가기 버튼 클릭 -> 라벨링 프로젝트 리스트에서 test1 프로젝트가 보이는가?
        cy.get("#go_to_project_lists_btn").click({ force: true });

        // test1 프로젝트 상태 확인 (1~3분 가량 시간 필요) -> test 프로젝트 상태가 업로드중 → 완료로 바뀌는가?
        cy.wait(5000);
        cy.reload();
        cy.get("tbody > tr")
          .eq(0)
          .find("td")
          .eq(7)
          .should("contain.text", "완료");
      });
  });

  // #31 ~
  it("labelproject dashboard tab", () => {
    // 프로젝트 리스트에서 “test1” 프로젝트 클릭 -> 프로젝트 대시보드 화면이 나타나는가?
    cy.contains("td", "test1")
      .eq(0)
      .dblclick({ force: true })
      .then(() => {
        cy.get("#dashboard_tab").should("be.visible");
        // cy.url().should("include", "/admin/labelling/");
      });

    // 프로젝트 명 수정 버튼 클릭 -> 프로젝트명을 수정할 수 있는 입력창이 나타나는가?
    cy.get("#change_name_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#label_project_name").should("not.have.attr", "disabled");
      });

    // 프로젝트 명을 "test2"로 수정 후 취소 버튼 클릭 -> 수정사항이 반영 되었는가?(실패 케이스)
    cy.get("#label_project_name")
      .clear({ force: true })
      .type("test2", { force: true });
    cy.get("#change_name_cancel_btn")
      .click({ force: true })
      .then(() => {
        // test1으로 복구 되었는지 확인으로 대체
        cy.get("#label_project_name").should("have.text", "test1");
      });

    // 프로젝트 명을 "test2"로 수정 후 저장 버튼 클릭 -> “프로젝트명을 바꾸시겠습니까?” 라는 팝업창이 나타나는가?
    cy.get("#label_project_name")
      .clear({ force: true })
      .type("test2", { force: true });
    cy.get("#change_name_btn").click({ force: true });
    cy.get("#change_name_confirm_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("프로젝트명을 바꾸시겠습니까?").should("be.visible");
      });

    // 팝업창에서 “예” 버튼 클릭 -> “프로젝트 정보가 정상적으로 변경되었습니다” 라는 팝업창이 나타나는가?
    cy.get("#yes_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#client-snackbar").should(
          "have.text",
          "프로젝트 정보가 정상적으로 변경되었습니다."
        );
        cy.get("#label_project_name").should("have.text", "test2");
      });

    // 프로젝트 설명 수정 버튼 클릭 -> 프로젝트명을 수정할 수 있는 입력창이 나타나는가?
    cy.get("#change_detail_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#label_project_detail").should("not.have.attr", "disabled");
      });

    // 프로젝트 설명을 "cat_dog2"로 수정 후 취소 버튼 클릭 -> 수정사항이 반영 되었는가?(실패 케이스)
    cy.get("#label_project_detail")
      .clear({ force: true })
      .type("cat_dog2", { force: true });
    cy.get("#change_detail_cancel_btn")
      .click({ force: true })
      .then(() => {
        // cat_dog로 복구 되었는지 확인으로 대체
        cy.get("#label_project_detail").should("have.text", "cat_dog");
      });

    // 프로젝트 설명을 "cat_dog2"로 수정 후 저장 버튼 클릭 -> “프로젝트명을 바꾸시겠습니까?” 라는 팝업창이 나타나는가?
    cy.get("#label_project_detail")
      .clear({ force: true })
      .type("cat_dog2", { force: true });
    cy.get("#change_detail_btn").click({ force: true });
    cy.get("#change_detail_confirm_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("프로젝트 설명을 바꾸시겠습니까?").should("be.visible");
      });

    // 팝업창에서 “예” 버튼 클릭 -> “프로젝트 정보가 정상적으로 변경되었습니다” 라는 팝업창이 나타나는가?
    cy.get("#yes_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#client-snackbar").should(
          "have.text",
          "프로젝트 정보가 정상적으로 변경되었습니다."
        );
        cy.get("#label_project_detail").should("have.text", "cat_dog2");
      });
  });

  // #42 ~
  it("labelproject class tab", () => {
    cy.visit("/admin/labelling/11942");

    cy.deleteAllRemainingClasses().then(() => {
      cy.wait(3000);

      // 클래스 설정하지 않고 수동 라벨링 시작 버튼(좌측 상단) 클릭 -> 아래와 같은 알림창이 나타나는가? "라벨리스트는 클래스를 최소 1개 이상 등록한 뒤 볼 수 있습니다."
      cy.get("#start_labelling_btn")
        .click({ force: true })
        .then(() => {
          cy.contains(
            "라벨리스트는 클래스를 최소 1개 이상 등록한 뒤 볼 수 있습니다."
          ).should("be.visible");

          // 클래스명 입력창 확인 -> 팝업창과 함께 클래스명을 입력할 수 있는 모달창이 나타나는가?
          cy.get("#labelClass_modify_class_modal").should("be.visible");

          cy.get("body").click();

          // 클래스 명에 human 입력 -> “입력 완료” 버튼이 활성화 되는가?
          cy.get("#labelclass_name_input")
            .type("human")
            .then(() => {
              // “입력 완료” 버튼 클릭 -> “클래스가 성공적으로 생성되었습니다” 라는 팝업창이 나타나는가?
              cy.get("#change_class_btn")
                .should("not.be.disabled")
                .click({ force: true });
              cy.contains("클래스가 성공적으로 생성되었습니다.").should(
                "be.visible"
              );

              cy.get("#labelClass_modify_class_modal").should("not.exist");
            });

          // 클래스 리스트 확인 -> 클래스 리스트에 “human” 클래스가 생성 되었는가?
          cy.contains("human").should("be.visible");

          // 클래스 탭 페이지 내 한글/영어 전환 -> 모든 텍스트의 한/영 변환이 정상적으로 이루어지는가?
          // 프로젝트명이 한글인 경우 판단 불가 -> 대체 코드 필요
          // cy.checkENMode();

          // 클래스 추가 버튼 클릭 -> 클래스 명과 색을 지정할 수 있는 창이 나타나는가?
          cy.get("#add_class_btn")
            .click({ force: true })
            .then(() => {
              cy.get("#labelClass_modify_class_modal").should("be.visible");
            });

          // 클래스 명에 cat 입력 -> 클래스명에 작업에서 안내한 이름 입력이 가능한가?
          cy.get("#labelclass_name_input")
            .type("cat")
            .then(($el) => {
              cy.wrap($el).should("have.text", "cat");

              cy.get("#change_class_btn").click({ force: true });
            });

          cy.get("body").click({ force: true });

          cy.get("#add_class_btn")
            .click({ force: true })
            .then(() => {
              // 클래스 명에 dog 입력
              cy.get("#labelclass_name_input").type("dog");

              // 클래스 색상에서 색상코드 0067a3으로 변경 후 엔터 -> 클래스 색상 우측 네모칸이 색이 파란색으로 변하는가?
              cy.get("#labelClass_color_picker div:first-child input")
                .clear()
                .type("0067a3")
                .then(() => {
                  cy.get("#class_color_block").should(
                    "have.css",
                    "background-color",
                    hexToRgb("#0067a3")
                  );
                });

              // 입력 완료 버튼 클릭
              cy.get("#change_class_btn").click({ force: true });
            });

          cy.get("body").click({ force: true });

          cy.get("#add_class_btn")
            .click({ force: true })
            .then(() => {
              // 클래스명에 "deleted" 입력
              cy.get("#labelclass_name_input").type("deleted");

              // 입력 완료 버튼 클릭
              cy.get("#change_class_btn").click({ force: true });
            });

          cy.wait(3000);

          cy.get("body").click({ force: true });

          // 클래스명 deleted 체크박스 선택 -> 체크박스 선택시 체크 모양이 나타나는가?
          cy.get('input[type="checkbox"]')
            .eq(1)
            .check()
            .then(($el) => cy.wrap($el).should("be.checked"));

          // deleted 체크박스 선택 후 선택 삭제 버튼 클릭 -> 정말 삭제하겠냐는 알림창이 나타나는가?
          cy.get("#delete_class_btn")
            .click({ force: true })
            .then(() => {
              cy.contains(
                "정말 삭제 하시겠습니까? 삭제하시면 선택하신 클래스에 대한 모든 라벨 정보가 초기화 됩니다."
              ).should("be.visible");
            });

          // “예” 버튼 클릭 -> 삭제한 클래스가 클래스 리스트에서 보여지는가?
          cy.get("#yes_btn")
            .click({ force: true })
            .then(() => {
              cy.wait(3000);

              cy.contains("deleted").should("not.exist");
            });
        });
    });
  });

  // #64 ~
  it("labelproject data list tab", () => {
    let jwt = "";
    let urlArr = null;
    let dataList = null;
    let projectId = null;

    cy.visit("/admin/labelling/11942");

    cy.url().then((url) => {
      urlArr = url.split("/");
      projectId = urlArr[urlArr.length - 1];

      cy.getCookie("jwt").then((c) => {
        jwt = c.value;

        cy.intercept(
          `/listobjects/?token=${jwt}&sorting=id&tab=all&count=10&page=1&labelprojectId=${projectId}&workapp=object_detection&desc=false`
        ).as("getListObjects");

        // 데이터리스트 탭 클릭 -> 데이터리스트 탭 리스트 탭으로 이동하는가?
        cy.get("#data_list_tab").click({ force: true });
        cy.get("#add_label_file_btn").should("be.visible");

        cy.wait("@getListObjects", { timeout: 10000 }).then((interception) => {
          dataList = interception.response.body.file;

          if (dataList[0].originalFileName === "dog_single.jpg") {
            cy.get('input[type="checkbox"]')
              .eq(1)
              .check();

            cy.get("#delete_data_btn").click({ force: true });

            cy.get("#yes_btn").click({ force: true });
          }

          // 데이터리스트 탭 내  한글/영어 전환 -> 모든 텍스트의 한/영 변환이 정상적으로 이루어지는가?
          // cy.checkENMode();

          // 라벨링 파일 추가 버튼 클릭 -> 데이터 업로드 안내 창이 나타나는가?
          cy.get("#add_label_file_btn")
            .click({ force: true })
            .then(() => {
              cy.get("#file_upload_modal").should("be.visible");
            });

          // dog_single 파일 업로드 -> 파일 업로드가 정상적으로 이루어지는가?
          cy.get('[type="file"]')
            .attachFile("dog_single.jpg")
            .then(() => {
              const text =
                "데이터 업로드가 시작되었습니다. 파일의 형태나 용량에 따라 소요되는 시간이 다를 수 있으며, 알림내역에서 작업 상태를 확인 가능합니다.";

              cy.contains("dog_single.jpg").should("be.visible");
              cy.get("#submit_file_btn").click({ force: true });
              cy.contains(text).should("be.visible");
            });

          // 검색창에 dog 입력 후 엔터
          cy.get("#search_file_input").type("dog");
          cy.get("#label_file_search_form")
            .type("{enter}")
            .then(() => {
              cy.get("#data_list_tab").click({ force: true });

              // dog_single.jpg 파일이 나타나는가?
              cy.get("tbody > tr")
                .eq(0)
                .should("contain", "dog_single.jpg");

              // 이미지 파일(dog_single.jpg) 선택(클릭) -> 이미지파일 인포메이션 창이 나타나는가?
              cy.get("tbody > tr > td")
                .eq(1)
                .click({ force: true })
                .then(() => {
                  cy.get("#label_preivew_modal").should("be.visible");

                  // 이미지 파일 선택 - 라벨 편집하기 버튼 클릭 -> 새 창에서 라벨링이 가능한 페이지가 나타나는가?
                  cy.window().then((win) => {
                    cy.stub(win, "open").as("labelAppOpen");
                  });

                  cy.get("#start_labeling_btn")
                    .click({ force: true })
                    .then(() => {
                      cy.get("@labelAppOpen").should("be.called");
                    });
                });
            });
        });
      });

      // 검색어 초기화
      cy.get("#delete_searching_value_btn").click({ force: true });

      // 테스트 파일 삭제
      cy.get("#exit_button").click({ force: true });

      cy.get('input[type="checkbox"]')
        .eq(1)
        .check();

      cy.get("#delete_data_btn").click({ force: true });

      cy.get("#yes_btn").click({ force: true });
    });

    // 데이터리스트 작업자 부분을 "없음" 으로 선택 -> 작업자 항목이 "없음" 으로 표시되는가?
    // 데이터리스트 상태 부분을 "시작전"으로 선택 -> 상태 항목이 "시작전"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (성공)
    // 데이터리스트 상태 부분을 "진행중"으로 선택 -> 상태 항목이 "진행중"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "오토라벨링"으로 선택 -> 상태 항목이 "오토라벨링"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "검수중"으로 선택 -> 상태 항목이 "검수중"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "완료"으로 선택 -> 상태 항목이 "완료"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)

    // 데이터리스트 작업자 부분을 "전체" 으로 선택 -> 작업자 항목이 "전체" 으로 표시되는가?
    // 데이터리스트 상태 부분을 "시작전"으로 선택 -> 상태 항목이 "시작전"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (성공)
    // 데이터리스트 상태 부분을 "진행중"으로 선택 -> 상태 항목이 "진행중"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "오토라벨링"으로 선택 -> 상태 항목이 "오토라벨링"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "검수중"으로 선택 -> 상태 항목이 "검수중"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (실패)
    // 데이터리스트 상태 부분을 "완료"으로 선택 -> 상태 항목이 "완료"으로 표시되는가?
    // 데이터리스트 이미지 목록 확인 -> 이미지 목록에 이미지가 나타나는가? (성공)

    const listFilterCondition = [
      { type: "asignee", value: "null", expected: true },
      { type: "status", value: "prepare", expected: true },
      { type: "status", value: "working", expected: false },
      { type: "status", value: "ready", expected: false },
      { type: "status", value: "review", expected: false },
      { type: "status", value: "done", expected: false },
      { type: "asignee", value: "all", expected: true },
      { type: "status", value: "prepare", expected: true },
      { type: "status", value: "working", expected: false },
      { type: "status", value: "ready", expected: false },
      { type: "status", value: "review", expected: false },
      { type: "status", value: "done", expected: true },
    ];

    listFilterCondition.map((v) => {
      cy.checkLabelListByCondition(v.type, v.value, v.expected);
    });
  });

  // #116 ~
  it("labelproject export tab", () => {
    cy.visit("/admin/labelling/11942");

    // 내보내기 탭 클릭 -> COCO 저장, VOC 저장 화면이 나타나는가?
    cy.get("#export_tab")
      .click({ force: true })
      .then(() => {
        cy.contains("button", "coco 저장").should("be.visible");
        cy.contains("button", "voc 저장").should("be.visible");
      });

    // coco저장 우측의 이미지포함 체크박스 클릭(해제) -> 체크박스가 해제되는가?
    cy.get("#include_img_btn_coco")
      .uncheck()
      .should("not.be.checked");

    // coco저장 버튼 클릭 -> 예/아니오 팝업창이 나타나는가?
    cy.get("#export_coco_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("COCO 양식으로 export 하시겠습니까?").should("be.visible");
      });

    // 아니오 버튼 클릭 -> 예/아니오 팝업창이 사라지는가?
    cy.get("#no_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("COCO 양식으로 export 하시겠습니까?").should("not.exist");
      });

    // coco저장 버튼 클릭 -> 예/아니오 팝업창이 나타나는가?
    cy.get("#export_coco_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("COCO 양식으로 export 하시겠습니까?").should("be.visible");
      });

    // 예 버튼 클릭 -> COCO파일 변환이 시작되었다는 알림창이 나타나는가?
    cy.get("#yes_btn")
      .click({ force: true })
      .then(() => {
        cy.contains(
          "COCO파일 변환이 시작되었습니다. 완료시 알림내역에서 다운로드 가능합니다."
        ).should("be.visible");

        // 우측 상단 종모양 알림버튼 클릭 -> COCO 파일 변환이 완료되었다는 문구와 COCO파일 다운받기 버튼이 나타나는가? (없을 경우 전체보기 버튼 클릭)
        cy.get("#notice_icon_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("Coco 데이터 추출이 완료되었습니다.").should(
              "be.visible"
            );
          });

        // COCO파일 다운받기 버튼 클릭 -> 다운받은 coco.zip 파일을 해제하면 coco.json 파일이 보이는가?
        cy.contains("button", "COCO파일 다운받기").should("be.visible");

        // const downloadsFolder = Cypress.config("downloadsFolder");
        // cy.readFile(downloadsFolder + "coco.zip").should("exist");

        // cy.get("#notification_popover")
        //   .contains("Voc 데이터 추출이 완료되었습니다.")
        //   .should("be.visible");
      });
  });

  // #149 ~
  it.only("labelproject member tab", () => {
    //! test project name : setting_tab_test_project_labeling_1
    cy.visit("/admin/labelling/11955");

    // 화면 중앙의 멤버 탭 클릭 -> 공유하기 버튼이 포함되어 있는 화면이 나타나는가?
    cy.get("#member_tab")
      .click({ force: true })
      .then(() => {
        cy.get("#share_member_btn").should("be.visible");
      });

    // 그룹이라고 적힌 리스트 클릭 -> "test_group_본인이름" 선택이 가능한가? (실패)
    // cy.get("#group_select_box")
    //   .click({force:true})
    //   .then(() => {
    //     cy.contains("option", "test_group_front_qa_account").should(
    //       "not.exist"
    //     );
    //   });

    // 화면 우측 상단의 계정(ex test1@dslab.global) 클릭 -> 마이페이지 화면이 나타나는가?
    cy.get("#setting_link")
      .click({ force: true })
      .then(() => {
        cy.url().should("include", "/admin/setting/userinfo");
      });

    // 그룹관리 탭 클릭 -> 그룹관리 화면이 나타나는가?
    cy.get("#share")
      .click({ force: true })
      .then(() => {
        cy.contains("Groups").should("be.visible");
        cy.contains("Invitation").should("be.visible");
      });

    // 그룹 추가 버튼 클릭 -> 그룹명을 입력할 수 있는 팝업창이 나타나는가?
    cy.get("#add_group_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#add_group_modal").should("be.visible");
      });

    const testGroupName = "test_group_front_qa_account";
    const testGroupName2 = "test_group_front_qa_account";

    const testMemberEmail = "front_test_2@dslab.global";
    const testMemberEmail2 = "front_test_2@dslab.global";

    // 그룹명에 "test_group_본인이름" 입력 -> 그룹명 입력 팝업창에 입력이 가능한가?
    cy.get("#add_group_input")
      .type(testGroupName)
      .should("have.value", testGroupName);

    // 추가 버튼 클릭 -> 그룹이 등록되었다는 팝업창이 나타나는가?
    cy.get("#submit_addgroupmodal_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("그룹이 등록되었습니다.").should("be.visible");
      });

    // Groups 영역 확인 ->	"test_group_본인이름" 이 Groups 목록에 나타나는가?
    cy.contains("td", testGroupName).should("exist");

    cy.get("body").click({ force: true });

    // 멤버 추가 버튼 클릭 (+) ->	이메일 입력창이 나타나는가?
    cy.get("#add_member_to_group_btn")
      .dblclick({ force: true })
      .then(() => {
        cy.get("#member_email_input").should("exist");
      });

    // 테스트 계정으로 멤버요청 (front_testa@dslab.global) -> 멤버 요청이 전송 되었다는 팝업창이 나타나는가?
    cy.get("#member_email_input")
      .type(testMemberEmail, { force: true })
      .then(() => {
        cy.get("#submit_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("해당 회원님께 멤버 요청을 보냈습니다.").should(
              "be.visible"
            );
          });
      });

    // Groups 영역 확인 ->	자신이 초대한 멤버(요청중)가 리스트에 나타나는가?
    cy.contains("td", `${testMemberEmail}(요청중)`).should("be.visible");

    // 멤버 추가 버튼 클릭 ->	이메일 입력창이 나타나는가?
    cy.get("#add_member_to_group_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#member_email_input").should("exist");
      });

    // dummydummy@dslab.global 입력 후 "추가하기" 버튼 클릭 ->	유효하지 않은 이메일이라는 팝업창이 나타나는가?
    cy.get("#member_email_input")
      .type("dummydummy@dslab.global", { force: true })
      .then(() => {
        cy.get("#submit_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("유효하지 않은 이메일입니다.").should("be.visible");
          });
      });

    cy.get("body").click({ force: true });

    // 그룹 추가 버튼 클릭 ->	그룹 추가 팝업이 나타나는가?
    cy.get("#add_group_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#add_group_modal").should("be.visible");
      });

    // 그룹명에 "test_group2_본인이름" 입력 ->	그룹명 입력 팝업창에 입력이 가능한가?
    cy.get("#add_group_input")
      .type(testGroupName2)
      .should("have.value", testGroupName2);

    // 추가 버튼 클릭 ->	그룹이 등록되었다는 팝업창이 나타나는가?
    cy.get("#submit_addgroupmodal_btn")
      .click({ force: true })
      .then(() => {
        cy.contains("그룹이 등록되었습니다.").should("be.visible");
      });

    // “test_group2_본인이름” 옆의 연필 모양 아이콘 (이름 변경) 클릭 ->	변경 그룹명을 입력할 수 있는 팝업창이 나타나는가?
    cy.get("#change_group_name_btn")
      .click()
      .then(() => {
        cy.get("#change_group_name_popover").should("be.visible");
      });

    // 그룹명 변경 팝업창에 "2b_deleted" 입력 ->	그룹명 변경  팝업창에 입력이 가능한가?
    cy.get("#change_group_name_input")
      .type("2b_deleted")
      .should("have.value", "2b_deleted");

    // 그룹명 변경 팝업창에서 "변경하기" 버튼 클릭 -> 그룹명이 변경 되었는가?
    cy.get("#submit_group_name_btn")
      .click()
      .then(() => {
        cy.wait(3000);

        cy.contains("그룹정보가 변경되었습니다.").should("be.visible");
        cy.contains("tbody > tr:first-child > td", "2b_deleted").should(
          "be.visible"
        );
      });

    // 그룹 리스트에서 2b_deleted 그룹의 삭제 버튼 클릭 ->	그룹 삭제 여부를 묻는 팝업이 나타나는가?
    cy.get("#delete_group_btn")
      .click()
      .then(() => {
        cy.contains("해당 그룹을 삭제시키겠습니까?").should("be.visible");
      });

    // 그룹 삭제 팝업에서 No 버튼 클릭 ->	팝업창이 꺼지는가?
    cy.get("#no_btn")
      .click()
      .then(() => {
        cy.contains("해당 그룹을 삭제시키겠습니까?").should("not.exist");
      });

    // 그룹 리스트에서 2b_deleted 그룹의 삭제 버튼 클릭 -> 그룹 삭제 여부를 묻는 팝업이 나타나는가?
    cy.get("#delete_group_btn")
      .click()
      .then(() => {
        cy.contains("해당 그룹을 삭제시키겠습니까?").should("be.visible");
      });

    // 그룹 삭제 팝업에서 “예“ 버튼 클릭 -> 그룹이 삭제되었다는 팝업이 나타나는가?
    cy.get("#yes_btn")
      .click()
      .then(() => {
        cy.contains("해당 그룹을 삭제하였습니다.").should("be.visible");
      });
  });

  // #242 ~
  it("labelproject setting tab", () => {
    //! test project name : setting_tab_test_project_labeling_1
    cy.visit("/admin/labelling/11955");

    // #242, 243 skip
    // 설정 탭 클릭 -> 설정 탭으로 정상적으로 이동하는가?
    cy.get("#setting_tab")
      .click({ force: true })
      .then(() => {
        cy.contains("프로젝트 정보").should("be.visible");
        cy.contains("알림 내역").should("be.visible");
      });

    // 프로젝트 이름 옆 연필모양 클릭 -> 프로젝트 이름 뒤에 커서가 생성되는가?
    cy.get("#change_project_name_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#project_name_input").should("be.focused");

        // 기존 프로젝트 이름을 삭제하고 test3 입력 -> 입력이 정상적으로 되는가?
        cy.get("#project_name_input")
          .clear()
          .type("test3");

        cy.get("body").click({ force: true });

        // “수정하기” 버튼 클릭 -> “프로젝트 정보를 수정하시겠습니까?” 라는 창이 출력되는가?
        cy.get("#edit_project_info_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "be.visible"
            );
          });

        // “예” 버튼 클릭 -> 프로젝트 정보가 정상적으로 변경되었다는 팝업이 출력되는가?
        cy.get("#yes_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보가 정상적으로 변경되었습니다.").should(
              "be.visible"
            );
            cy.get("#project_name_input").should("have.value", "test3");
          });
      });

    // 프로젝트 설명 옆 연필모양 클릭 -> 프로젝트 설명 뒤에 커서가 생성되는가?
    cy.get("#change_project_desc_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#project_desc_input").should("be.focused");

        // 기존 프로젝트 설명을 삭제하고 test3 입력 -> 입력이 정상적으로 되는가?
        cy.get("#project_desc_input")
          .clear()
          .type("cat_dog3");

        cy.get("body").click({ force: true });

        // “수정하기” 버튼 클릭 -> “프로젝트 정보를 수정하시겠습니까?” 라는 창이 출력되는가?
        cy.get("#edit_project_info_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "be.visible"
            );
          });

        // “아니오” 버튼 클릭 -> 프로젝트 정보를 수정 여부를 묻는 팝업창이 꺼지는가?
        cy.get("#no_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "not.be.exist"
            );
          });

        cy.get("body").click({ force: true });

        // “수정하기” 버튼 클릭 -> “프로젝트 정보를 수정하시겠습니까?” 라는 창이 출력되는가?
        cy.get("#edit_project_info_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "be.visible"
            );
          });

        // “예” 버튼 클릭 -> 프로젝트 정보가 정상적으로 변경되었다는 팝업이 출력되는가?
        cy.get("#yes_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보가 정상적으로 변경되었습니다.").should(
              "be.visible"
            );
            cy.get("#project_desc_input").should("have.value", "cat_dog3");
          });
      });

    cy.get("body").click({ force: true });

    // 수정하기 버튼 위 “검수진행여부” 클릭 (활성화) -> 왼쪽의 토글버튼이 활성화 되는가?
    cy.get("#inspection_switch_btn")
      .check()
      .then(() => {
        cy.get("#inspection_switch_btn").should("be.checked");

        // “수정하기” 버튼 클릭 -> “프로젝트 정보를 수정하시겠습니까?” 라는 창이 출력되는가?
        cy.get("#edit_project_info_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "be.visible"
            );
          });

        // “예” 버튼 클릭 -> 프로젝트 정보가 정상적으로 변경되었다는 팝업이 출력되는가?
        cy.get("#yes_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보가 정상적으로 변경되었습니다.").should(
              "be.visible"
            );
            cy.get("#inspection_switch_btn").should("be.checked");
          });
      });

    cy.get("body").click({ force: true });

    // 수정하기 버튼 위 “검수진행여부” 클릭 (비활성화) -> 왼쪽의 토글버튼이 비활성화 되는가?
    cy.get("#inspection_switch_btn")
      .uncheck()
      .then(() => {
        cy.get("#inspection_switch_btn").should("not.be.checked");

        // “수정하기” 버튼 클릭 -> “프로젝트 정보를 수정하시겠습니까?” 라는 창이 출력되는가?
        cy.get("#edit_project_info_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보를 수정하시겠습니까?").should(
              "be.visible"
            );
          });

        // “예” 버튼 클릭 -> 프로젝트 정보가 정상적으로 변경되었다는 팝업이 출력되는가?
        cy.get("#yes_btn")
          .click({ force: true })
          .then(() => {
            cy.contains("프로젝트 정보가 정상적으로 변경되었습니다.").should(
              "be.visible"
            );
            cy.get("#inspection_switch_btn").should("not.be.checked");
          });
      });

    //! 프로젝트 정보 원복
    cy.get("#change_project_name_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#project_name_input")
          .clear()
          .type("setting_tab_test_project_labeling_1");

        cy.get("body").click({ force: true });

        cy.get("#edit_project_info_btn").click({ force: true });

        cy.get("#yes_btn").click({ force: true });
      });

    cy.get("#change_project_desc_btn")
      .click({ force: true })
      .then(() => {
        cy.get("#project_desc_input")
          .clear()
          .type("Don't delete the project");

        cy.get("body").click({ force: true });

        cy.get("#edit_project_info_btn").click({ force: true });

        cy.get("#yes_btn").click({ force: true });
      });
  });
});
