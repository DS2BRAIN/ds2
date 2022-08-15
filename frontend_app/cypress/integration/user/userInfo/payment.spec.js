describe('payment', function() {

    beforeEach(() => {
        cy.enterUserInfo();
    });

    it("payment",()=>{

        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬

            //결제창 이동
            cy.get('#payment').click();
            
            //한글화
            cy.ko();

            //크레딧 충전 클릭
            cy.get('#modifyCardInfo').click();

            //가격 박스 선택
            cy.get('#selectPrice1').select("5");
            cy.get('#selectPrice2').select("5");
            
            //랜더링 확인
            cy.get('#rawPrice').should("contain","495,000");
            cy.get('#totalCredit').should("contain","431.25");
            cy.get('#totalVat').should("contain","49,500");
            cy.get('#totalPrice').should("contain","544,500");

            //가격 박스 선택
            cy.get('#selectPrice1').select("0");
            cy.get('#selectPrice2').select("7");
            
            //랜더링 확인
            cy.get('#rawPrice').should("contain","630,000");
            cy.get('#totalCredit').should("contain","551.25");
            cy.get('#totalVat').should("contain","63,000");
            cy.get('#totalPrice').should("contain","693,000");

            //가격 박스 선택
            cy.get('#selectPrice1').select("10");
            cy.get('#selectPrice2').select("0");
            
            //랜더링 확인
            cy.get('#rawPrice').should("contain","90,000");
            cy.get('#totalCredit').should("contain","75");
            cy.get('#totalVat').should("contain","9,000");
            cy.get('#totalPrice').should("contain","99,000");

            //영문 번역
            cy.en();
            
            //구매 클릭
            cy.get('#purchaseCredit').click();

            //카드 등록 랜더링 확인
            cy.get('#cardNeedText').should("contain","You can continue to use the card after registering it on the account management page.");
            cy.get('#client-snackbar').should("contain","You can use the service after registering your card.");

            //등록 클릭(영문)
            cy.get('#registCard_en').click();

            //카드 번호 입력
            cy.get('#cardno1').type("1234")
            cy.get('#cardno2').type("1234")
            cy.get('#cardno3').type("1234")
            cy.get('#cardno4').type("1234")

        }
    });


});