/// <reference types="cypress" />
// 01 ~ 113번 문항

describe("Dataset1", () => {
  beforeEach(() => {
    cy.login();

    // 로그인 후 데이터셋 화면 이동 확인
    cy.get("#data_link").click();
  });

  // 2 ~ 5
  it("check data intro page", () => {
    cy.get("body").then(($body) => {
      if ($body.find("#dataIntroOpenText").length) {
        // 인트로페이지가 표시되는가?
        cy.get("#dataIntroOpenText").should(
          "contain.text",
          "학습용 데이터셋을 구성하는 간편한 방법"
        );

        // 서비스 시작하기 버튼 확인, 클릭
        if ($body.find("#dataintro_top_start_btn").length) {
          cy.get("#dataintro_top_start_btn").click();
        }
      }
    });
  });

  // 6 ~ 11
  it("check data title & data buttons", () => {
    // 제목과 설명 문구 확인
    cy.contains("데이터 저장소").should("be.visible");
    cy.contains("데이터셋으로 인공지능 개발을 시작합니다.").should(
      "be.visible"
    );

    // 업로드한 데이터가 없는 경우 -> 문구 확인
    cy.get("body").then(($body) => {
      if ($body.find("#divNoDataAddNewData").length) {
        cy.get("#divNoDataAddNewData").should(
          "contain.text",
          "현재 진행 중인 데이터가 없습니다. 데이터를 새로 생성해주세요."
        );
      }
    });

    // 라벨링 시작하기 버튼이 비활성화 되어 있는가? (클릭해도 아무런 반응이 없는가?)
    cy.get("#start_labelling_disabled_btn").should("be.disabled");
    // AI 개발 시작하기 버튼에 마우스 커서를 올리면, "AI 개발을 시작하기 위해서 데이터를 선택해주세요!" 문구가 나타나는가?
    cy.get("#start_develop_btn").should("be.disabled");
  });

  // 12 ~ 78
  // coverage: Templates.js
  it("test sample template", () => {
    // 샘플 템플릿 버튼 클릭
    cy.get("#sampleTemplateBtn").click({ force: true });
    cy.contains("학습형태별").should("be.visible");

    // 학습형태별 탭 클릭
    cy.get("#methodSampleTab")
      .click()
      .then(() => {
        // 카테고리 클릭
        cy.get("#category1")
          .click()
          .then(() => {
            // 카테고리를 클릭하면, 우측에 설명이 나타나는가?
            cy.get("#description_div").should(
              "contain.text",
              "클릭AI에서 제공되는 카테고리분류란"
            );
            // 카테고리 → 예제) 직원 퇴사여부 DOWNLOAD 버튼 클릭
            cy.get(`#category8_download_btn`).click();
          });

        // 연속값 클릭
        cy.get("#regression2")
          .click()
          .then(() => {
            // 연속값을 클릭하면, 우측에 설명이 나타나는가?
            cy.get("#description_div").should(
              "contain.text",
              "클릭AI에서 제공되는 연속값분류란"
            );
            // 연속값 → 예제) 도서관방문객입출입예측 DOWNLOAD 버튼 클릭
            cy.get("#regression27_download_btn").click();
          });

        // 자연어 클릭
        cy.get("#naturalLanguage3")
          .click()
          .then(() => {
            // 자연어를 클릭하면, 우측에 설명이 나타나는가?
            cy.get("#description_div").should("contain.text", "자연어 처리란");
            // 자연어 → 예제) 영화리뷰 DOWNLOAD 버튼 클릭
            cy.get("#naturalLanguage33_download_btn").click();
          });

        // 이미지분류 클릭
        cy.get("#image4")
          .click()
          .then(() => {
            // 이미지 분류를 클릭하면, 우측에 설명이 나타나는가?
            cy.get("#description_div").should(
              "contain.text",
              "이미지 분류 인공지능 모델"
            );
            // 이미지 분류 → 예제) 차량분류 DOWNLOAD 버튼 클릭
            cy.get("#image37_download_btn").click();
          });

        // 물체인식 클릭
        cy.get("#objectDetection6")
          .click()
          .then(() => {
            // 물체인식을 클릭하면, 우측에 설명이 나타나는가?
            cy.get("#description_div").should(
              "contain.text",
              "물체 인식 인공지능 모델"
            );
            // 물체인식 → 예제) 차량인식 DOWNLOAD 버튼 클릭
            cy.get("#objectDetection46_download_btn").click();
          });
      });

    // 산업군별 탭 클릭
    cy.get("#businessSampleTab")
      .click()
      .then(() => {
        // 금융 및 자산관리 클릭
        cy.get("#listItem_2")
          .click()
          .then(() => {
            // 예제) 카드발급심사 DOWNLOAD 버튼 클릭
            cy.get("#category12_download_btn").click({ force: true });
          });

        // // 보험 탭 클릭 => enterprise 보험 없음
        // cy.get("#listItem_5")
        //   .click()
        //   .then(() => {
        //     // 예제) 생명보험가입위험수준예측 DOWNLOAD 버튼 클릭
        //     cy.get("#category16_download_btn").click();
        //   });

        // 제조 탭 클릭
        cy.get("#listItem_6")
          .click()
          .then(() => {
            // 예제) ph농도예측 DOWNLOAD 버튼 클릭
            cy.get("#category17_download_btn").click({ force: true });
          });

        // 마케팅 탭 클릭
        cy.get("#listItem_7")
          .click()
          .then(() => {
            // 예제) 과금예측 DOWNLOAD 버튼 클릭
            cy.get("#category21_download_btn").click();
          });
      });

    // 샘플데이터셋 모달 닫기
    cy.get("#closeSampleModal").click();
  });

  // 78 ~ 113
  // coverage: DataModalsFileAdd.js
  it("upload data file", () => {
    // "데이터 추가하기" 버튼 클릭 -> 데이터 형식 선택 팝업이 나타나는가?
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        cy.get("#modalDataconnectorContainer").should("be.visible");
      });

    // 업로드 가능한 데이터 종류들이 잘 보이는가? CSV, ZIP, Video
    ["CSV", "ZIP", "Video"].forEach((type) => {
      cy.get("#modalDataconnectorContainer").should("contain.text", type);
    });

    // 데이터 형식을 아무 것도 선택하지 않은 상태에서 "다음" 버튼을 클릭하면 화면 이동하는가?
    cy.get("#disabled_nextDataModal_btn").should("be.disabled");

    // CSV 클릭 → 다음 버튼 클릭
    cy.get("#CSV_container")
      .click()
      .then(() => {
        cy.get("#nextDataModal_btn").click({ force: true });
        // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 2. 데이터 업로드 및 설정"
        );

        // "이전" 버튼을 클릭하면 "데이터 추가하기 - 1. 데이터 형식 선택" 화면으로 돌아가는가?
        cy.get("#previousDataconnectorModal")
          .click()
          .then(() => {
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 1. 데이터 형식 선택"
            );
          });
      });

    // CSV 클릭 → 다음 버튼 클릭
    cy.get("#CSV_container")
      .click()
      .then(() => {
        cy.get("#nextDataModal_btn").click({ force: true });

        // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 2. 데이터 업로드 및 설정"
        );

        // 데이터 업로드하지 않은 상태에서 "확인" 버튼을 클릭하면 화면 이동하는가?
        cy.get("#nextDataconnectorModal").should("be.disabled");

        // "ex_1_ph_level.csv" 파일을 드래그하거나 클릭해서 업로드 수행
        cy.get('[type="file"]')
          .attachFile("ex1_ph_level.csv")
          .then(() => {
            // "파일이 업로드 되었습니다" 문구가 나타나면서 업로드한 데이터 이름이 보이는가?
            cy.contains("파일이 업로드 되었습니다.");

            // "결과값 칼럼 선택"을 클릭하여 선택할 수 있는가?
            cy.get("#selectColumnRadio")
              .click()
              .then(() => {
                // "결과값 칼럼 선택" 하단에 항목 네모박스 영역이 보이는가?
                // 항목 영역을 클릭하면 "blue", "green", "red", "label" 총 4가지가 리스트로 나타나는가?
                // 항목 영역에서 "blue"를 클릭하면 선택이 되는가?
                ["blue", "green", "red", "label"].forEach((column) => {
                  cy.get("#selectColumnTag").select(column);
                });
              });

            // "칼럼명 직접 입력" 클릭하여 선택할 수 있는가?
            cy.get("#inputColumnRadio")
              .click()
              .then(() => {
                // "칼럼명 직접 입력" 하단의 칼럼명 영역을 클릭한 후 "label"이라고 입력할 수 있는가?
                cy.get("#input_self").type("label");

                // "확인" 버튼을 클릭하면 "이미 동일한 이름의 칼럼명이 존재합니다. 새로운 칼럼명을 입력해주세요."라는 문구가 나타나는가?
                cy.get("#startSaveFilesBtn")
                  .click()
                  .then(() => {
                    cy.contains(
                      "이미 동일한 이름의 칼럼명이 존재합니다. 새로운 칼럼명을 입력해주세요."
                    );
                  });

                // "칼럼명 직접 입력" 하단의 칼럼명 영역에 입력된 "label" 텍스트를 모두 지울 수 있는가?
                cy.get("#input_self").clear();

                // "확인" 버튼을 클릭하면 "결과값 칼럼을 입력해주세요"라는 문구가 나타나는가?
                cy.get("#startSaveFilesBtn")
                  .click()
                  .then(() => {
                    cy.contains("결과값 칼럼을 입력해주세요");
                  });
              });

            // "결과값 칼럼 선택” 을 클릭하여 선택할 수 있는가?
            cy.get("#selectColumnRadio")
              .click()
              .then(() => {
                // 항목 영역을 클릭한 후 "label"을 클릭하면 선택이 되는가?
                cy.get("#selectColumnTag").select("label");
              });

            // 파일이 업로드된 상태에서 업로드된 파일 영역의 "삭제" 버튼을 클릭하면, "파일이 삭제 되었습니다"라는 문구와 함께 업로드 했던 파일이 사라지는가?
            cy.get("#deleteFilesBtn")
              .click()
              .then(() => {
                cy.contains("파일이 삭제 되었습니다");
              });
          });

        // "noshow_modified.csv" 파일을 드래그하거나 클릭해서 업로드 수행
        cy.get('[type="file"]')
          .attachFile("noshow_modified.csv")
          .then(() => {
            // "파일이 업로드 되었습니다" 문구가 나타나는가?
            cy.contains("파일이 업로드 되었습니다.");

            // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
            cy.get("#uploadedFileInfo").should(
              "contain.text",
              "noshow_modified.csv"
            );

            // (예:"noshow_modified.csv", "5.61 MB")
            cy.get("#uploadedFileInfo").should("contain.text", "MB");

            // 파일 업로드 후 disabled 해제까지 약간 딜레이
            cy.wait(500);

            // "결과값 칼럼 선택” 을 클릭하여 선택할 수 있는가?
            cy.get("#selectColumnRadio")
              .click()
              .then(() => {
                // "결과값 칼럼 선택" 하단에 항목 네모박스 영역이 보이는가?
                // 항목 영역을 클릭하면 다음과 같이 목록이 보이는가?
                [
                  "Gender",
                  "Age",
                  "Scholarship",
                  "Hipertension",
                  "Diabetes",
                  "Alcoholism",
                  "SMS_received",
                  "No-show",
                  "Handicap_0",
                  "Handicap_1",
                  "Handicap_2",
                  "Handicap_3",
                  "Handicap_4",
                  "AwaitingTime",
                  "Num_App_Missed",
                ].forEach((column) => {
                  cy.get("#selectColumnTag").select(column);
                });

                // 항목 영역에서 "No-show"를 클릭하면 선택이 되는가?
                cy.get("#selectColumnTag").select("No-show");
              });

            cy.intercept("POST", `/dataconnectorswithfile/`).as(
              "postDataWithFile"
            );

            // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
            cy.get("#startSaveFilesBtn")
              .click()
              .wait("@postDataWithFile")
              .then(() => {
                cy.contains("데이터커넥터가 등록되었습니다");
              });
          });
      });
  });

  // 114 ~ 120
  // coverage: DataconnectorDetail.js (일부)
  it("check noshow_modified.csv file uploaded", () => {
    // "내 데이터" 탭 클릭
    cy.get("#privateDataTab").click();

    // 데이터 테이블에서 데이터명이 "noshow_modified.csv"인 데이터가 보이는가?
    cy.get("#privateDataTable").should("contain.text", "noshow_modified.csv");

    // 데이터 테이블에서 “noshow_modified.csv” 클릭
    cy.get("#privateDataTable")
      .contains("noshow_modified.csv")
      .click()
      .wait(10000)
      .then(() => {
        // 데이터 요약 화면이 나타나는가?
        cy.get("#dataconnectorName").should(
          "contain.text",
          "noshow_modified.csv"
        );

        // RAW DATA DOWNLOAD 버튼 클릭
        cy.get("#dataDownloadBtn").click();
      });

    // 좌측 상단 “데이터셋” 클릭
    cy.get("#data_link").click();
  });

  // 121 ~ 132
  it("upload insurance.csv", () => {
    // "데이터 추가하기" 버튼 클릭
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        cy.get("#modalDataconnectorContainer").should("be.visible");

        // CSV 클릭 → 다음 버튼 클릭
        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ex_1_ph_level.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("insurance.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "insurance.csv"
                );

                // 파일 업로드 후 disabled 해제까지 약간 딜레이
                cy.wait(500);

                // "결과값 칼럼 선택"을 클릭하여 선택할 수 있는가?
                cy.get("#selectColumnRadio")
                  .click()
                  .then(() => {
                    // "결과값 칼럼 선택" 하단에 항목 네모박스 영역이 보이는가?
                    // 항목 영역을 클릭하면 다음과 같이 목록이 보이는가?
                    [
                      "age",
                      "sex",
                      "bmi",
                      "children",
                      "smoker",
                      "region",
                      "charges",
                    ].forEach((column) => {
                      cy.get("#selectColumnTag").select(column);
                    });
                  });

                // 항목 영역에서 "charges"를 클릭하면 선택이 되는가?
                cy.get("#selectColumnTag").select("charges");

                cy.intercept("POST", `/dataconnectorswithfile/`).as(
                  "postDataWithFile"
                );

                // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
                cy.get("#startSaveFilesBtn")
                  .click()
                  .wait("@postDataWithFile")
                  .then(() => {
                    cy.contains("데이터커넥터가 등록되었습니다");
                  });

                // "내 데이터" 탭 클릭
                cy.get("#privateDataTab").click();

                // 데이터 테이블에서 데이터명이 "insurance.csv"인 데이터가 보이는가?
                cy.get("#privateDataTable").should(
                  "contain.text",
                  "insurance.csv"
                );
              });
          });
      });
  });

  // 132 ~ 145
  it("upload yelp_modified.csv", () => {
    // "내 데이터" 탭 클릭
    cy.get("#privateDataTab").click();

    // "데이터 추가하기" 버튼 클릭
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        cy.get("#modalDataconnectorContainer").should("be.visible");

        // CSV 클릭 → 다음 버튼 클릭
        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ex_1_ph_level.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("yelp_modified.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "yelp_modified.csv"
                );

                // 파일 업로드 후 disabled 해제까지 약간 딜레이
                cy.wait(500);

                // "결과값 칼럼 선택"을 클릭하여 선택할 수 있는가?
                cy.get("#selectColumnRadio")
                  .click()
                  .then(() => {
                    // "결과값 칼럼 선택" 하단에 항목 네모박스 영역이 보이는가?
                    // 항목 영역을 클릭하면 다음과 같이 목록이 보이는가?
                    [
                      "business_id",
                      "date",
                      "review_id",
                      "stars",
                      "text",
                      "type",
                      "user_id",
                      "cool",
                      "useful",
                      "funny",
                    ].forEach((column) => {
                      cy.get("#selectColumnTag").select(column);
                    });
                  });

                // 항목 영역에서 "charges"를 클릭하면 선택이 되는가?
                cy.get("#selectColumnTag").select("stars");

                cy.intercept("POST", `/dataconnectorswithfile/`).as(
                  "postDataWithFile"
                );

                // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
                cy.get("#startSaveFilesBtn")
                  .click()
                  .wait("@postDataWithFile")
                  .then(() => {
                    cy.contains("데이터커넥터가 등록되었습니다");
                  });

                // "내 데이터" 탭 클릭
                cy.get("#privateDataTab").click();

                // 데이터 테이블에서 데이터명이 "yelp_modified.csv"인 데이터가 보이는가?
                cy.get("#privateDataTable").should(
                  "contain.text",
                  "yelp_modified.csv"
                );
              });
          });
      });
  });

  // 146 ~ 166
  it("upload pet.zip", () => {
    // "데이터 추가하기" 버튼 클릭
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        // CSV 클릭 → 다음 버튼 클릭
        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ex_1_ph_level.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("pet.zip")
              .then(() => {
                cy.contains("csv 파일을 업로드해주세요");
              });
          });

        // "이전" 버튼을 클릭하면 "데이터 추가하기 - 1. 데이터 형식 선택" 화면으로 돌아가는가?
        cy.get("#previousDataconnectorModal")
          .click({ force: true })
          .then(() => {
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 1. 데이터 형식 선택"
            );
          });

        cy.get("#ZIP_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "pet.zip" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("pet.zip")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 zip 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should("contain.text", "pet.zip");
              });
          });

        // 라벨링 데이터 포함 체크박스 클릭 후 → 확인 버튼 클릭
        cy.get("#label_data_chkbox")
          .check()
          .then(($el) => {
            // 체크박스가 체크되는가?
            cy.wrap($el).should("be.checked");
          });

        // 선택된 체크박스를 클릭하면 해제되는가?
        cy.get("#label_data_chkbox")
          .click()
          .then(($el) => {
            cy.wrap($el).should("not.be.checked");
          });

        // 라벨링 데이터 포함 체크박스 클릭 후 → 확인 버튼 클릭
        cy.get("#label_data_chkbox")
          .check()
          .then(($el) => {
            cy.wrap($el).should("be.checked");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼 클릭
        cy.get("#startSaveFilesBtn")
          .click({ force: true })
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "pet.zip"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "pet.zip");
      });
  });

  // 167 ~ 175
  it("upload fire.zip", () => {
    // "데이터 추가하기" 버튼 클릭
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        cy.get("#ZIP_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "fire.zip" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("fire.zip")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 zip 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should("contain.text", "fire.zip");
              });
          });

        // 라벨링 데이터 포함 체크박스 클릭 후 → 확인 버튼 클릭
        cy.get("#label_data_chkbox")
          .check()
          .then(($el) => {
            cy.wrap($el).should("be.checked");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼 클릭
        cy.get("#startSaveFilesBtn")
          .click()
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "fire.zip"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "fire.zip");
      });
  });

  // 176 ~ 186
  it("upload ratings.csv", () => {
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ratings.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("ratings.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "ratings.csv"
                );
              });
          });

        // 파일 업로드 후 disabled 해제까지 약간 딜레이
        cy.wait(500);

        // "결과값 칼럼 선택"을 클릭하여 선택할 수 있는가?
        cy.get("#selectColumnRadio")
          .click()
          .then(() => {
            // "결과값 칼럼 선택" 하단에 항목 네모박스 영역이 보이는가?
            // 항목 영역을 클릭하면 다음과 같이 목록이 보이는가?
            ["userId", "movieId", "rating", "timestamp"].forEach((column) => {
              cy.get("#selectColumnTag").select(column);
            });
          });

        // 항목 영역에서 "rating"을 클릭하면 선택이 되는가?
        cy.get("#selectColumnTag").select("rating");

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click()
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "ratings.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "ratings.csv");
      });
  });

  // 187 ~ 196
  it("upload ex1_resignation.csv", () => {
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ex1_resignation.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("ex1_resignation.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "ex1_resignation.csv"
                );
              });
          });

        // 파일 업로드 후 disabled 해제까지 약간 딜레이
        cy.wait(500);

        // "칼럼명 직접 입력" 클릭하여 선택할 수 있는가?
        cy.get("#inputColumnRadio")
          .click()
          .then(() => {
            // "칼럼명 직접 입력" 하단의 칼럼명 영역을 클릭한 후 "dummy"이라고 입력할 수 있는가?
            cy.get("#input_self").type("dummy");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click()
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "ex1_resignation.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should(
          "contain.text",
          "ex1_resignation.csv"
        );
      });
  });

  // 197 ~ 206
  it("upload ex2_titanic.csv", () => {
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        cy.get("#CSV_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "ex2_titanic.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("ex2_titanic.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "ex2_titanic.csv"
                );
              });
          });

        // 파일 업로드 후 disabled 해제까지 약간 딜레이
        cy.wait(500);

        // "칼럼명 직접 입력" 클릭하여 선택할 수 있는가?
        cy.get("#inputColumnRadio")
          .click()
          .then(() => {
            // "칼럼명 직접 입력" 하단의 칼럼명 영역을 클릭한 후 "dummy"이라고 입력할 수 있는가?
            cy.get("#input_self").type("dummy");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click()
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "ex2_titanic.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "ex2_titanic.csv");
      });
  });

  // 207 ~ 213
  // coverage: DataconnectorDetail.js (일부)
  it("check fire.zip file uploaded", () => {
    // "내 데이터" 탭 클릭
    cy.get("#privateDataTab").click();

    // 데이터 테이블에서 데이터명이 "fire.zip"인 데이터가 보이는가?
    cy.get("#privateDataTable").should("contain.text", "fire.zip");

    // 데이터 테이블에서 “fire.zip” 클릭
    cy.get("#privateDataTable")
      .contains("fire.zip")
      .click()
      .wait(10000)
      .then(() => {
        // 데이터 요약 화면이 나타나는가?
        cy.get("#dataconnectorName").should("contain.text", "fire.zip");

        // “fire.zip” 에 있는 이미지들이 화면에 나타나는가? (미리보기)
        // 이미지 확인 검증 가능한지.. 확인
        cy.get(".img_info")
          .eq(0)
          .click()
          .then(() => {
            cy.get("#previewImage");
            cy.get("#close_img_dialog").click();
          });

        // RAW DATA DOWNLOAD 버튼 클릭
        cy.get("#dataDownloadBtn").click();
      });
  });
});
