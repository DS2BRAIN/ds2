describe("Dataset2", () => {
  beforeEach(() => {
    cy.login();

    // 로그인 후 데이터셋 화면 이동 확인
    cy.get("#data_link").click();
  });

  // 215 ~ 224
  it("upload ex3_temperature.csv", () => {
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

            // "ex3_temperature.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("ex3_temperature.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "ex3_temperature.csv"
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
          .click({ force: true })
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "ex3_temperature.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should(
          "contain.text",
          "ex3_temperature.csv"
        );
      });
  });

  // 225 ~ 234
  it("upload ex4_movie_ratings.csv", () => {
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

            // "ex4_movie_ratings.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("ex4_movie_ratings.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "ex4_movie_ratings.csv"
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
            // 항목 영역에서 "rating"을 클릭하면 선택이 되는가?
            cy.get("#selectColumnTag").select("rating");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click({ force: true })
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "ex4_movie_ratings.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should(
          "contain.text",
          "ex4_movie_ratings.csv"
        );
      });
  });

  // 235 ~ 245
  it("upload videoplayback.mp4", () => {
    cy.get("#add_dataset_btn:not([disabled])")
      .click({ force: true })
      .then(() => {
        // "데이터 추가하기 - 1. 데이터 형식 선택" 제목 문구가 보이는 팝업창이 뜨는가?
        cy.get("#modalDataconnectorContainer").should("be.visible");
        cy.get("#modalDataconnectorContainer").should(
          "contain.text",
          "데이터 추가하기 - 1. 데이터 형식 선택"
        );

        cy.get("#Video_container")
          .click()
          .then(() => {
            cy.get("#nextDataModal_btn").click({ force: true });

            // "데이터 추가하기 - 2. 데이터 업로드 및 설정" 제목 문구가 보이는 화면으로 이동되는가?
            cy.get("#modalDataconnectorContainer").should(
              "contain.text",
              "데이터 추가하기 - 2. 데이터 업로드 및 설정"
            );

            // "videoplayback.mp4" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.fixture("videoplayback.mp4", "binary")
              .then(Cypress.Blob.binaryStringToBlob)
              .then((fileContent) => {
                const uploadVideo = {
                  fileContent,
                  fileName: "videoplayback.mp4",
                  mimeType: "video/mp4",
                  encoding: "utf-8",
                };
                cy.wait(2000);
                cy.get('[type="file"]')
                  .attachFile(uploadVideo)
                  .then(() => {
                    // "파일이 업로드 되었습니다" 문구가 나타나는가
                    cy.contains("파일이 업로드 되었습니다.").should(
                      "be.visible"
                    );

                    // "업로드된 파일" 영역에 video 아이콘과 함께 데이터명이 보이는가?
                    cy.get("#uploadedFileInfo").should(
                      "contain.text",
                      "videoplayback.mp4"
                    );
                  });
              });
          });

        // 파일 업로드 후 disabled 해제까지 약간 딜레이
        cy.wait(500);

        // 데이터 설정 영역에서 "프레임 값"이 보이는가?
        cy.get("#frameValue_label").should("contain.text", "프레임 값");

        // 프레임 값 하단에 "1 ~ 600 사이의 분당 프레임 값을 입력해주세요(기본값: 60)"이라고 적힌 네모박스가 보이는가?
        cy.get("#frameValue").should(
          "have.attr",
          "placeholder",
          "1 ~ 600 사이의 분당 프레임 값을 입력해주세요(기본값: 60)"
        );

        // "결과값 칼럼 선택"을 클릭하여 선택할 수 있는가?
        // 프레임 값 하단의 박스에 "아"를 입력할 수 있는가? (자동으로 60이 채워짐)
        cy.get("#frameValue")
          .click()
          .type("아")
          .then(() => {
            cy.get("#frameValue").should("have.attr", "value", 60);
          });

        cy.get("#frameValue").clear();

        // 프레임 값 하단의 박스에 "6"을 입력할 수 있는가?
        cy.get("#frameValue")
          .click()
          .type("6");

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click({ force: true })
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "videoplayback.mp4"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "videoplayback.mp4");
      });
  });

  // 246 ~ 252
  it("upload PJME_hourly_2.csv", () => {
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

            // "PJME_hourly_2.csv" 파일을 드래그하거나 클릭해서 업로드 수행
            cy.get('[type="file"]')
              .attachFile("PJME_hourly_2.csv")
              .then(() => {
                // "파일이 업로드 되었습니다" 문구가 나타나는가
                cy.contains("파일이 업로드 되었습니다.").should("be.visible");

                // "업로드된 파일" 영역에 csv 아이콘과 함께 데이터명이 보이는가?
                cy.get("#uploadedFileInfo").should(
                  "contain.text",
                  "PJME_hourly_2.csv"
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
            // 항목 영역에서 "rating"을 클릭하면 선택이 되는가?
            cy.get("#selectColumnTag").select("PJME_MW");
          });

        cy.intercept("POST", `/dataconnectorswithfile/`).as("postDataWithFile");

        // "확인" 버튼을 클릭하면 "데이터커넥터가 등록되었습니다"라는 문구와 함께 팝업창이 닫히는가?
        cy.get("#startSaveFilesBtn")
          .click({ force: true })
          .wait("@postDataWithFile")
          .then(() => {
            cy.contains("데이터커넥터가 등록되었습니다");
          });

        // "내 데이터" 탭 클릭
        cy.get("#privateDataTab").click();

        // 데이터 테이블에서 데이터명이 "PJME_hourly_2.csv"인 데이터가 보이는가?
        cy.get("#privateDataTable").should("contain.text", "PJME_hourly_2.csv");
      });
  });

  // 253 ~ 257
  it("check private table sorting", () => {
    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;
        let sortingValueArr = [
          "dataconnectorName",
          "dataconnectortype",
          "status",
          "hasLabelData",
          "created_at",
        ];

        sortingValueArr.forEach((sortingValue) => {
          cy.intercept(
            "GET",
            `/dataconnectors/?token=${jwt}&sorting=${sortingValue}&count=10&start=1&is_public=false&desc=true
          `
          ).as(`getDataBy${sortingValue}`);

          // 데이터명을 기준으로 오름차순 및 내림차순이 되는가? (화살표 모양이 생성됨)
          // 데이터타입을 기준으로 오름차순 및 내림차순이 되는가? (화살표 모양이 생성됨)
          // 상태를 기준으로 오름차순 및 내림차순이 되는가? (화살표 모양이 생성됨)
          // 학습가능여부를 기준으로 오름차순 및 내림차순이 되는가? (화살표 모양이 생성됨)
          // 생성일을 기준으로 오름차순 및 내림차순이 되는가? (화살표 모양이 생성됨)
          cy.get(`#privateDataHeaderCell_${sortingValue}`)
            .click()
            .then(() => {
              cy.wait(`@getDataBy${sortingValue}`, {
                timeout: 10000,
              }).then(() => {
                cy.get(`.arrow_descend`).should(
                  "have.id",
                  `descend_${sortingValue}`
                );
              });
            });
        });
      });
  });

  // 258 ~ 259
  it("check private table pagination", () => {
    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;
        let pagiCmdArr = ["up", "up", "down", "down"];
        let start = 1;
        let count = 10;
        let direction = "";

        pagiCmdArr.forEach((command) => {
          if (command === "up") {
            start += 1;
            direction = "next";
          } else if (command === "down") {
            start -= 1;
            direction = "prev";
          }

          cy.intercept(
            "GET",
            `/dataconnectors/?token=${jwt}&sorting=created_at&count=${count}&start=${start}&is_public=false&desc=true
          `
          ).as(`getDataByPage${start}`);

          // 다음 페이지에 대한 데이터가 잘 보이는가?
          // 이전 페이지에 대한 데이터가 잘 보이는가?
          cy.get(`#datatable_${direction}page`)
            .click()
            .wait(`@getDataByPage${start}`, {
              timeout: 10000,
            });

          cy.get(`#tablebodyrow_0 > td`)
            .eq(2)
            .should(
              "have.id",
              `datatablecell_page${start - 1}row0_dataconnectorName`
            );
        });
      });
  });

  // 260
  it("check all 12 data on list", () => {
    cy.get("#pagerow_select").click();
    cy.get("ul > li.MuiTablePagination-menuItem")
      .eq(2)
      .click();

    // 데이터 리스트에서 다음과 같은 데이터명을 지닌 데이터 12개가 목록에 모두 있는가?
    const dataList = [
      "noshow_modified.csv",
      "insurance.csv",
      "yelp_modified.csv",
      "pet.zip",
      "fire.zip",
      "ratings.csv",
      "ex1_resignation.csv",
      "ex2_titanic.csv",
      "ex3_temperature.csv",
      "ex4_movie_ratings.csv",
      "videoplayback.mp4",
      "PJME_hourly_2.csv",
    ];
    dataList.forEach((data) => {
      cy.get("table").should("contain.text", data);
    });
    cy.get("#pagerow_select").click();
    cy.get("ul > li.MuiTablePagination-menuItem")
      .eq(0)
      .click();
  });

  // 261 ~ 273
  it("search data", () => {
    // "검색"이라고 표시된 검색 필드가 보이는가? (우측 상단)
    cy.get("#search_input").should("have.attr", "placeholder", "검색");

    // “데이터명을 입력해주세요” 라는 안내 문구가 나타나는가?
    cy.get("#search_input")
      .click()
      .then(() => {
        cy.get("#search_tooltip").should(
          "contain.text",
          "데이터명을 입력해주세요"
        );
      });

    // 데이터명 검색 필드를 클릭한 후, data라는 텍스트를 입력할 수 있는가?
    cy.get("#search_input")
      .type("data")
      .then(() => {
        // data를 입력한 상태에서 우측에 "X" 버튼이 보이는가?
        cy.get("#search_close").should("be.visible");
        // data를 입력한 상태에서 우측에 돋보기 아이콘이 보이는가?
        cy.get("#search_icon").should("be.visible");
      });

    // data를 입력한 상태에서 돋보기 아이콘을 클릭하면, 하단 데이터 리스트 영역에 "검색 결과가 없습니다."라는 문구가 나타나는가?
    cy.get("#search_icon")
      .click()
      .then(() => {
        cy.get("#divNoDataSearchAgain").should(
          "contain.text",
          "검색 결과가 없습니다."
        );
      });

    // data가 검색된 상태에서 검색 필드 우측에 "X" 버튼이 보이는가?
    cy.get("#search_close").should("be.visible");

    // "X" 버튼을 클릭하면 검색 필드에 입력되었던 data가 지워지는가?
    cy.get("#search_close")
      .click()
      .then(() => {
        cy.get("#search_input").should("not.contain.text", "data");
      });

    // 데이터명 검색 필드를 클릭한 후, noshow라는 텍스트를 입력할 수 있는가?
    // noshow를 입력한 상태에서 키보드의 엔터를 치면, 하단 데이터 리스트에 데이터명이 "noshow_modified.csv"인 데이터 목록이 나타나는가?
    cy.get("#search_input")
      .type("noshow")
      .type("{enter}")
      .then(() => {
        cy.get("#tablebodyrow_0").should("contain.text", "noshow_modified.csv");
      });

    // noshow 검색 결과가 하단 데이터 리스트에 보이는 상태에서, 검색 필드 우측에 "X" 버튼이 보이는가?
    cy.get("#search_close").should("be.visible");

    // "X" 버튼을 클릭하면 검색 필드에 입력되었던 noshow가 지워지는가?
    cy.get("#search_close").click();
    cy.get("#search_input").should("not.contain.text", "noshow");

    // 새로고침을 클릭하면 데이터 저장소로 다시 돌아오는가?
    cy.reload();
    cy.url().should("include", "admin/dataconnector");
  });

  // 274 ~ 286
  it("start buttons disabled/enabled", () => {
    cy.get("#privateDataTable").should("be.visible");

    // 내 데이터 탭의 데이터 리스트에서 하나도 클릭하지 않은 경우 "AI 개발 시작하기" 버튼이 비활성화 되어있는가?
    cy.get("#start_develop_btn").should("be.disabled");

    // 데이터 리스트에서 데이터명이 "noshow_modified.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("noshow_modified.csv{enter}");
    cy.wait(500);
    cy.get("#dataconnector_chkbox_0").check();

    // 선택한 데이터의 체크박스 체크로 변경되는 것 확인
    cy.get("#dataconnector_chkbox_0").should("be.checked");

    // 데이터 리스트 상단에 선택한 데이터인 태그 형식으로 데이터명과 X 버튼이 함께 나타나는가? (예: NOSHOW_MODIFIED... X)
    cy.get("#selected_tag_0").should("contain.text", "noshow");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    // 데이터 리스트에서 선택되어 있던 "noshow_modified.csv"인 데이터 한개 체크박스 클릭 (해제)
    cy.get("#dataconnector_chkbox_0").uncheck();
    cy.get("#dataconnector_chkbox_0").should("not.be.checked");

    // "AI 개발 시작하기" 버튼이 비활성화 되었는가?
    cy.get("#start_develop_btn").should("be.disabled");

    // "라벨링 시작하기" 버튼이 비활성화 되어있는가?
    cy.get("#start_labelling_disabled_btn").should("be.disabled");

    cy.get("#search_close").click();

    cy.get("#privateDataTable").should("be.visible");

    // 데이터 리스트에서 데이터명이 "insurance.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("insurance.csv{enter}");
    cy.wait(500);
    cy.get("#dataconnector_chkbox_0").check();

    // 선택한 데이터의 체크박스 체크로 변경되는 것 확인
    cy.get("#dataconnector_chkbox_0").should("be.checked");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    // 데이터 리스트 상단에 선택한 데이터인 태그 형식으로 데이터명과 X 버튼이 함께 나타나는가? (예: NOSHOW_MODIFIED... X)
    cy.get("#selected_tag_0").should("contain.text", "insurance");

    // 데이터 리스트 상단에 표시된 "insurance.csv X" 태그를 클릭하면 선택 해제되는가?
    cy.get("#selected_tag_0 > svg")
      .click()
      .then(() => {
        cy.get("#dataconnector_chkbox_0").should("not.be.checked");
      });
  });

  // 287 ~ 293
  it("start project with two data", () => {
    cy.get("#privateDataTable").should("be.visible");

    // 데이터 리스트에서 데이터명이 "noshow_modified.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("noshow_modified.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#search_input").clear();

    // 데이터 리스트에서 데이터명이 "insurance.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("insurance.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    // 데이터 리스트 상단에 선택한 데이터 2개 모두 태그 형식으로 데이터명과 X 버튼이 함께 나타나는가? (예: INSURANCE.CSV X, NOSHOW_MODIFIED... X)
    cy.get("#selected_tag_0").should("contain.text", "noshow");
    cy.get("#selected_tag_1").should("contain.text", "insurance");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_disabled_btn").should("be.disabled");

    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;

        cy.intercept("POST", `/projectfromdataconnectors/?token=${jwt}`).as(
          `postProjectFromDataConnectors`
        );
      });

    // 데이터가 2개 선택된 상태에서 AI 개발 시작하기 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click()
      .wait("@postProjectFromDataConnectors")
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });
  });

  // 294 ~ 301
  it("start project with three data", () => {
    cy.get("#privateDataTable").should("be.visible");

    // 데이터 리스트에서 데이터명이 "insurance.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("insurance.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#search_input").clear();

    // 데이터 리스트에서 데이터명이 "yelp_modified.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("yelp_modified.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#search_input").clear();

    // 데이터 리스트에서 데이터명이 "ratings.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("ratings.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    // 데이터 리스트 상단에 선택한 데이터 3개 모두 태그 형식으로 데이터명과 X 버튼이 함께 나타나는가? (예: INSURANCE.CSV X, NOSHOW_MODIFIED... X)
    cy.get("#selected_tag_0").should("contain.text", "insurance");
    cy.get("#selected_tag_1").should("contain.text", "yelp_modified");
    cy.get("#selected_tag_2").should("contain.text", "ratings");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_disabled_btn").should("be.disabled");

    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;

        cy.intercept("POST", `/projectfromdataconnectors/?token=${jwt}`).as(
          `postProjectFromDataConnectors`
        );
      });

    // 데이터가 3개 선택된 상태에서 AI 개발 시작하기 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click({ force: true })
      .wait("@postProjectFromDataConnectors")
      .wait(3000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });
  });

  // 302 ~ 320
  it("start buttons disabled/enabled & check project start", () => {
    cy.get("#privateDataTable").should("be.visible");

    // 데이터 리스트에서 데이터명이 "ex4_movie_ratings.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("ex4_movie_ratings.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#search_input").clear();

    // 데이터 리스트에서 데이터명이 "pet.zip"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("pet.zip{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#search_input").clear();

    // 데이터 리스트 상단에 선택한 데이터 2개 모두 태그 형식으로 데이터명과 X 버튼이 함께 나타나는가? (예: EX4_MOVIE_RATING... X, PET.ZIP X)
    cy.get("#selected_tag_0").should("contain.text", "ex4_movie_ratings");
    cy.get("#selected_tag_1").should("contain.text", "pet");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.disabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_disabled_btn").should("be.disabled");

    // 데이터 리스트에서 선택되어 있던 "ex4_movie_ratings.csv"인 데이터 한개 체크박스 클릭 (ex4 movie_rating.csv 체크박스 해제)
    cy.get("#selected_tag_0 > svg").click();

    cy.get("#selected_tag_0").should("contain.text", "pet");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // 데이터 리스트에서 데이터명이 "fire.zip"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("fire.zip{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#selected_tag_0").should("contain.text", "pet");
    cy.get("#selected_tag_1").should("contain.text", "fire");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.disabled");

    // 데이터 리스트에서 선택되어 있던 "fire.zip"인 데이터 한개 체크박스 클릭 (ex4 movie_rating.csv 체크박스 해제)
    cy.get("#selected_tag_1 > svg").click();

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;

        cy.intercept("POST", `/projectfromdataconnectors/?token=${jwt}`).as(
          `postProjectFromDataConnectors`
        );
      });

    // "AI 개발 시작하기" 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click()
      .wait("@postProjectFromDataConnectors")
      .wait(3000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });

    // 데이터 리스트에서 데이터명이 "fire.zip"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("fire.zip{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#selected_tag_0").should("contain.text", "fire");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    // "AI 개발 시작하기" 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click()
      .wait("@postProjectFromDataConnectors")
      .wait(3000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });

    // 데이터 리스트에서 데이터명이 "noshow_modified.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("noshow_modified.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    cy.get("#selected_tag_0").should("contain.text", "noshow_modified");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    // "AI 개발 시작하기" 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click()
      .wait("@postProjectFromDataConnectors")
      .wait(3000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });
  });

  // 321 ~ 327
  it("start project in data detail page & check project start", () => {
    cy.get("#privateDataTable").should("be.visible");

    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        let jwt = c.value;

        cy.intercept("POST", `/projectfromdataconnectors/?token=${jwt}`).as(
          `postProjectFromDataConnectors`
        );
      });

    cy.get("ul > li.MuiTablePagination-menuItem")
      .eq(2)
      .click();

    cy.get("#privateDataTable")
      .contains("insurance.csv")
      .click()
      .wait(10000)
      .then(() => {
        // 데이터 요약 화면이 나타나는가?
        cy.get("#dataconnectorName").should("contain.text", "insurance.csv");

        // "AI 개발 시작하기" 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
        cy.get("#start_develop_btn")
          .click()
          .wait("@postProjectFromDataConnectors")
          .wait(3000)
          .then(() => {
            cy.url().should("include", "admin/train");
          });
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });

    // 데이터 리스트에서 데이터명이 "yelp_modified.csv"인 데이터 한개 체크박스 클릭 (선택)
    cy.get("#search_input").type("yelp_modified.csv{enter}");
    cy.wait(500);
    cy.get("#privateDataTable").should("be.visible");
    cy.get("#dataconnector_chkbox_0").check();

    // "라벨링 시작하기" 버튼이 활성화 되어있는가?
    cy.get("#start_labelling_btn").should("be.enabled");

    // "AI 개발 시작하기" 버튼이 활성화 되었는가?
    cy.get("#start_develop_btn").should("be.enabled");

    // "AI 개발 시작하기" 버튼을 클릭하면 프로젝트 페이지로 이동하는가?
    cy.get("#start_develop_btn")
      .click()
      .wait("@postProjectFromDataConnectors")
      .wait(3000)
      .then(() => {
        cy.url().should("include", "admin/train");
      });

    // 데이터 저장소 페이지로 다시 이동할 수 있는가?
    cy.get("#data_link")
      .click()
      .wait(2000)
      .then(() => {
        cy.url().should("include", "admin/dataconnector");
      });
  });
});
