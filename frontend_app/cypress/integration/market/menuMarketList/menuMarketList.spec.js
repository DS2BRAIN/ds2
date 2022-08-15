describe("menuMarketList", function() {
  beforeEach(() => {
    cy.enterMenuMarketList();
  });

  it("menuMarketList", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      //한글화
      cy.ko();

      cy.get("#marketTable").then((data) => {
        //첫번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(6) > :nth-child(7)").click();

        //사람 업로드
        cy.get('input[type="file"]').attachFile("face.jpg");

        //예측하기
        cy.get("#sendApiBtn").click();

        //예측된 이미지 확인
        cy.get("#resultImg").then(($resultImg) => {
          expect($resultImg.is(":visible")).to.equal(true);
        });

        //새로 예측하기
        cy.get("#resetData").click();

        //모달 닫기
        cy.get("#cancelBtn").click();
        cy.get("#yesBtn").click();
      });

      //카테고리 선택(기타)
      cy.get(".MuiInputBase-root > #category_select").click({ force: true });
      cy.get('li[data-value="기타"]').click({ force: true });

      cy.get("#marketTable").then((data) => {
        //마켓 상품이 정상적으로 출력되는지 확인
        expect(data[0].childElementCount > 1).to.equal(true);

        //5번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(4) > :nth-child(7)").click();

        //아무것도 입력하지 않고 예측하기;
        cy.get("#sendApiBtn").click();

        //스낵바 확인
        cy.get("#client-snackbar").should(
          "contain",
          "파일을 업로드 후 진행해주세요."
        );

        //모달 닫기
        cy.get("#cancelBtn").click();
        cy.get("#yesBtn").click();

        //8번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(8) > :nth-child(7)").click();

        // 요청사항 작성
        cy.get("#requestContent").type("Racgoo_Racgoo_Racgoo");

        //휴대전화 입력
        cy.get("#requestPhoneNumber").type("01099999999");

        //신청하기 클릭
        cy.get("#requestModalRequestBtn").click();

        //스낵바 확인
        cy.get("#client-snackbar").should("contain", "파일을 업로드해주세요.");

        //모달 닫기
        cy.get("#requestModalCancelBtn").click();

        //영문화
        cy.en();

        //카테고리 선택(기타)
        cy.get(".MuiInputBase-root > #category_select").click({ force: true });
        cy.get('li[data-value="전체"]').click({ force: true });

        cy.get("#marketTable").then((data) => {
          //마켓 상품이 정상적으로 출력되는지 확인
          expect(data[0].childElementCount > 1).to.equal(true);

          //7번째 상품 예측하기 클릭
          cy.get("#marketTable > :nth-child(7) > :nth-child(7)").click();

          //아무것도 입력하지 않고 예측하기;
          cy.get("#sendApiBtn").click();

          //스낵바 확인
          cy.get("#client-snackbar").should(
            "contain",
            "Please upload the file and proceed"
          );

          //모달 닫기
          cy.get("#cancelBtn").click();
          cy.get("#yesBtn").click();

          //한글화
          cy.ko();

          //카테고리 탐색
          let countArr = [
            "공통",
            "금융",
            "보험",
            "제조",
            "물류",
            "마케팅",
            "경영",
            "농축산업",
            "에너지",
            "법",
            "공공",
            "기타",
          ];
          cy.wrap(countArr).each((data) => {
            cy.get(".MuiInputBase-root > #category_select").click({
              force: true,
            });
            cy.get(`li[data-value="${data}"]`).click({ force: true });
            cy.get("#marketTable").then((data) => {
              //마켓 상품이 정상적으로 출력되는지 확인
              expect(data[0].childElementCount > 0).to.equal(true);
            });
          });
        });
      });
    } else {
      //운영

      //한글화
      cy.ko();

      cy.get("#marketTable").then((data) => {
        //첫번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(6) > :nth-child(7)").click();

        //사람 업로드
        cy.get('input[type="file"]').attachFile("face.jpg");

        //예측하기
        cy.get("#sendApiBtn").click();

        //예측된 이미지 확인
        cy.get("#resultImg").then(($resultImg) => {
          expect($resultImg.is(":visible")).to.equal(true);
        });

        //새로 예측하기
        cy.get("#resetData").click();

        //모달 닫기
        cy.get("#cancelBtn").click();
        cy.get("#yesBtn").click();
      });

      //카테고리 선택(기타)
      cy.get(".MuiInputBase-root > #category_select").click({ force: true });
      cy.get('li[data-value="기타"]').click({ force: true });

      cy.get("#marketTable").then((data) => {
        //마켓 상품이 정상적으로 출력되는지 확인
        expect(data[0].childElementCount > 1).to.equal(true);

        //5번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(4) > :nth-child(7)").click();

        //아무것도 입력하지 않고 예측하기;
        cy.get("#sendApiBtn").click();

        //스낵바 확인
        cy.get("#client-snackbar").should(
          "contain",
          "파일을 업로드 후 진행해주세요."
        );

        //모달 닫기
        cy.get("#cancelBtn").click();
        cy.get("#yesBtn").click();

        //8번째 상품 예측하기 클릭
        cy.get("#marketTable > :nth-child(8) > :nth-child(7)").click();

        // 요청사항 작성
        cy.get("#requestContent").type("Racgoo_Racgoo_Racgoo");

        //휴대전화 입력
        cy.get("#requestPhoneNumber").type("01099999999");

        //신청하기 클릭
        cy.get("#requestModalRequestBtn").click();

        //스낵바 확인
        cy.get("#client-snackbar").should("contain", "파일을 업로드해주세요.");

        //모달 닫기
        cy.get("#requestModalCancelBtn").click();

        //영문화
        cy.en();

        //카테고리 선택(기타)
        cy.get(".MuiInputBase-root > #category_select").click({ force: true });
        cy.get('li[data-value="전체"]').click({ force: true });

        cy.get("#marketTable").then((data) => {
          //마켓 상품이 정상적으로 출력되는지 확인
          expect(data[0].childElementCount > 1).to.equal(true);

          //7번째 상품 예측하기 클릭
          cy.get("#marketTable > :nth-child(7) > :nth-child(7)").click();

          //아무것도 입력하지 않고 예측하기;
          cy.get("#sendApiBtn").click();

          //스낵바 확인
          cy.get("#client-snackbar").should(
            "contain",
            "Please upload the file and proceed"
          );

          //모달 닫기
          cy.get("#cancelBtn").click();
          cy.get("#yesBtn").click();

          //한글화
          cy.ko();

          //카테고리 탐색
          let countArr = [
            "공통",
            "금융",
            "보험",
            "제조",
            "물류",
            "마케팅",
            "경영",
            "농축산업",
            "에너지",
            "법",
            "공공",
            "기타",
          ];
          cy.wrap(countArr).each((data) => {
            cy.get(".MuiInputBase-root > #category_select").click({
              force: true,
            });
            cy.get(`li[data-value="${data}"]`).click({ force: true });
            cy.get("#marketTable").then((data) => {
              //마켓 상품이 정상적으로 출력되는지 확인
              expect(data[0].childElementCount > 0).to.equal(true);
            });
          });
        });
      });
    }
  });
});
