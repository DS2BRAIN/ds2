describe("01_lookupSidebar", function() {
  
  // it("goToHome", () => {
  //   // 다른 페이지 방문 후 홈으로 돌아오기
  //   cy.enterDataset();
  //   cy.get("#logoToAdmin").click();
  //   cy.url().should("include", "/admin");
  //   cy.contains("빠른 시작").should("be.visible");
  // });

  // it("goToPriceGuide", () => {
  //   cy.login();
  //   //한글화
  //   cy.ko();
  //   if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
  //     //로컬
  //     cy.get("#goToPriceGuide")
  //       .should("have.attr", "href")
  //       .and("include", "https://ds2.ai/ko/pricing_detail.html");
  //   } else {
  //     //운영서버
  //     cy.get("#goToPriceGuide")
  //       .should("have.attr", "href")
  //       .and("include", "https://ds2.ai/ko/pricing_detail.html");
  //   }
  // });

  // it("goToPriceGuide_en", () => {
  //   cy.login();
  //   //영문화
  //   cy.en();
  //   if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
  //     //로컬
  //     cy.get("#goToPriceGuide")
  //       .should("have.attr", "href")
  //       .and("include", "https://ds2.ai/pricing_detail.html");
  //   } else {
  //     //운영서버
  //     cy.get("#goToPriceGuide")
  //       .should("have.attr", "href")
  //       .and("include", "https://ds2.ai/ko/pricing_detail.html");
  //   }
  // });

  // it("goToData", () => {
  //   // dataset 페이지 접속 확인
  //   cy.enterDataset();
  //   cy.url().should("include", "/admin/dataconnector");
  // });


  it("goToLabel", () => {
    // labeling 페이지 접속 확인
    cy.login();
    cy.get("#menu라벨링").click({ multiple: true, force: true });
    cy.url().should(
      "include",
      "/admin/labelling?page=1&sorting=created_at&desc=true&rows=10"
    );
  });

  it("goToClickAi", () => {
    // click ai 메인 페이지 접속 확인
    cy.enterClickAi();
    cy.url().should("include", "/admin/project");
  });

  it("goToCustomTraining", () => {
    // 커스텀 학습 페이지 접속 확인
    cy.enterCustomTraning();
    cy.url().should("include", "/admin/jupyterproject");
  });

  it("goToAutoML", () => {
    // automl 페이지 접속 확인
    cy.enterAutoML();
    cy.url().should("include", "/admin/automlproject");
  });

  it("goToSkyhubAi", () => {
    // skyhub ai 페이지 접속 확인
    cy.enterSkyhubAi();
    cy.url().should("include", "/admin/skyhubai");
  });

  it("goToMarketplace", () => {
    // marketplace 페이지 접속 확인
    cy.enterMenuMarketList();
    cy.url().should("include", "/admin/marketList");
  });

  it("goToMyItem", () => {
    // myItem 페이지 접속 확인
    cy.enterMenuMarketPurchaseList();
    cy.url().should("include", "/admin/marketPurchaseList");
  });

  it("goToGuide", () => {
    cy.login();
    //한글화
    cy.ko();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToGuide").should(
        "have.attr",
        "newurl",
        "https://krdocs.ds2.ai/"
      );
    } else {
      //운영서버
      cy.get("#goToGuide").should(
        "have.attr",
        "newurl",
        "https://krdocs.ds2.ai/"
      );
    }
  });

  it("goToGuide_en", () => {
    cy.login();
    //영문화
    cy.en();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToGuide").should(
        "have.attr",
        "newurl",
        "https://docs.ds2.ai/"
      );
    } else {
      //운영서버
      cy.get("#goToGuide").should(
        "have.attr",
        "newurl",
        "https://docs.ds2.ai/"
      );
    }
  });

  it("goToDS2", () => {
    cy.login();
    //한글화
    cy.ko();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToDS2").should("have.attr", "newurl", "https://ko.ds2.ai//");
    } else {
      //운영서버
      cy.get("#goToDS2").should("have.attr", "newurl", "https://ko.ds2.ai//");
    }
  });

  it("goToDS2_en", () => {
    cy.login();
    //영문화
    cy.en();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToDS2").should("have.attr", "newurl", "https://ds2.ai/");
    } else {
      //운영서버
      cy.get("#goToDS2").should("have.attr", "newurl", "https://ds2.ai/");
    }
  });

  it("goToPriceGuide", () => {
    cy.login();
    //한글화
    cy.ko();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToPriceGuide")
        .should("have.attr", "href")
        .and("include", "https://ko.ds2.ai//pricing_detail.html");
    } else {
      //운영서버
      cy.get("#goToPriceGuide")
        .should("have.attr", "href")
        .and("include", "https://ko.ds2.ai//pricing_detail.html");
    }
  });

  it("goToPriceGuide_en", () => {
    cy.login();
    //영문화
    cy.en();
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬
      cy.get("#goToPriceGuide")
        .should("have.attr", "href")
        .and("include", "https://ds2.ai/pricing_detail.html");
    } else {
      //운영서버
      cy.get("#goToPriceGuide")
        .should("have.attr", "href")
        .and("include", "https://ko.ds2.ai//pricing_detail.html");
    }
  });
});
