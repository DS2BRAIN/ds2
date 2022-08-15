describe("createProject", function() {
  it("2종 생성 테스트", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      cy.enterMenuMarketList();

      //영문화
      cy.en();

      //맨 위에 올라온 서비스 선택
      cy.get("#0_start_button").click();

      //스넥바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "please contact the sales team."
      );

      //채널톡 닫기
      cy.closeChennalTalk();
    } else {
      //개발

      cy.enterMenuMarketList();

      //영문화
      cy.en();

      //맨 위에 올라온 서비스 선택
      cy.get("#0_start_button").click();

      //스넥바 확인
      cy.get("#client-snackbar").should(
        "contain",
        "please contact the sales team."
      );

      //채널톡 닫기
      cy.closeChennalTalk();
    }
  });

  it("3종 생성 테스트(카드 없음)", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      cy.enterMenuMarketList();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시
      cy.get("#client-snackbar").should(
        "contain",
        "카드 등록 후 서비스 이용이 가능합니다."
      );
    } else {
      //개발

      cy.enterMenuMarketList();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시
      cy.get("#client-snackbar").should(
        "contain",
        "카드 등록 후 서비스 이용이 가능합니다."
      );
    }
  });

  it("3종 생성 테스트(카드 있음)", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      cy.enterMenuMarketList_Card();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시(실제론 카드가 없어서 백엔드 오류)
      cy.get("#client-snackbar").should(
        "contain",
        "송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
      );
    } else {
      //개발

      cy.enterMenuMarketList_Card();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시(실제론 카드가 없어서 백엔드 오류)
      cy.get("#client-snackbar").should(
        "contain",
        "송합니다, 프로젝트 생성 중 오류가 발생하였습니다. 다시 시도해주세요."
      );
    }
  });

  it("3종 생성 테스트(카드 없음 2주 무료사용 테스트)", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //개발

      cy.enterMenuMarketList_2Weeks();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //2주사용인지 확인
      cy.get("#create_project_button").should("contain","2주 무료사용");

        //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시(2주사용 안했으면 사용, 했으면 오류 없어서 백엔드 오류)
     
    } else {
      //운영

      cy.enterMenuMarketList_2Weeks();

      //영문화
      cy.ko();

      //3번 서비스 선택
      cy.get("#2_start_button").click();

      //뒤로가기
      cy.get("#back_button").click();

      //3종 서비스 선택
      cy.get("#2_start_button").click();

      //프로젝트 이름 입력
      cy.get("#projectNameInput").type("Test Project Name");

      //프로젝트 설명 입력
      cy.get("#projectDescriptionInput").type("Test Project Description");

      //프로젝트 사용량 선택
      cy.get("#1_hour_button").click();

      //2주사용인지 확인
      cy.get("#create_project_button").should("contain","2주 무료사용");

        //프로젝트 생성
      cy.get("#create_project_button").click();

      //카드 등록창 표시(2주사용 안했으면 사용, 했으면 오류 없어서 백엔드 오류)
    }
  });
});
