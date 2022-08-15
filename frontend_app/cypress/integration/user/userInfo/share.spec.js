describe('share', function() {

    beforeEach(() => {
        cy.enterUserInfo();
    });

    it("share",()=>{

        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬
            
            //영문화
            cy.en();

            //그룹 공유로 이동 
            cy.get('#share').click();

            //그룹 추가 클릭
            cy.get('#addGroupBtn').click();

            //취소 클릭
            cy.get('#closeBtn').click();

            //더블체크 확인
            cy.get('#yesBtn').click();

            //기존 그룹 전체 삭제 (초기화)
            cy.get('#groupTableBody').then(data=>{
                if(data[0].innerHTML.indexOf("No Groups")==-1){
                    let countArr=Array.from({length:data[0].childElementCount},(v,k)=>k+1)
                    cy.wrap(countArr).each(()=>{
                        cy.get('#groupTableBody tr:first').find("#deleteGroup").click();
                        cy.get('#yesBtn').click();
                    });
                }
            });
                    
            //그룹 추가 클릭 
            cy.get('#addGroupBtn').click();

            //그룹 이름 지정
            cy.get('#groupInput').type("racgoo100");

            //추가 클릭
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","Group registered.");

            //한글화
            cy.ko();

            //그룹 이름 변경 클릭
            cy.get('#onSetNameChangeBtn').click()

            //이름 입력
            cy.get('#companyInput').type("racgoo98");

            //변경 클릭
            cy.get('#changeGroupName').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","그룹정보가 변경되었습니다.");

            //변경값 확인
            cy.get('#groupTableBody').should("contain","racgoo98");

            //그룹 추가 클릭 
            cy.get('#addGroupBtn').click();

            //그룹 이름 지정
            cy.get('#groupInput').type("racgoo101");

            //추가 클릭
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","그룹이 등록되었습니다.");

            //그룹 추가 클릭 
            cy.get('#addGroupBtn').click();

            //그룹 이름 지정
            cy.get('#groupInput').type("racgoo102");

            //추가 클릭
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","그룹이 등록되었습니다.");

            //그룹 수 3개인지 확인
            cy.get('#groupTableBody').then(data=>{
                expect(data[0].childElementCount).to.equal(3);
            });

            //기존 그룹 전체 삭제 (초기화)
            cy.get('#groupTableBody').then(data=>{
                let countArr=Array.from({length:data[0].childElementCount},(v,k)=>k+1)
                cy.wrap(countArr).each(()=>{
                    cy.get('#groupTableBody tr:first').find("#deleteGroup").click();
                    cy.get('#yesBtn').click();
                });
            });

        }else{
            
             //영문화
             cy.en();
 
             //그룹 공유로 이동 
             cy.get('#share').click();
 
             //그룹 추가 클릭
             cy.get('#addGroupBtn').click();
 
             //취소 클릭
             cy.get('#closeBtn').click();
 
             //더블체크 확인
             cy.get('#yesBtn').click();
 
             //기존 그룹 전체 삭제 (초기화)
             cy.get('#groupTableBody').then(data=>{
                 if(data[0].innerHTML.indexOf("No Groups")==-1){
                     let countArr=Array.from({length:data[0].childElementCount},(v,k)=>k+1)
                     cy.wrap(countArr).each(()=>{
                         cy.get('#groupTableBody tr:first').find("#deleteGroup").click();
                         cy.get('#yesBtn').click();
                     });
                 }
             });
                     
             //그룹 추가 클릭 
             cy.get('#addGroupBtn').click();
 
             //그룹 이름 지정
             cy.get('#groupInput').type("racgoo100");
 
             //추가 클릭
             cy.get('#submitBtn').click();
 
             //스낵바 확인
             cy.get('#client-snackbar').should("contain","Group registered.");
 
             //한글화
             cy.ko();
 
             //그룹 이름 변경 클릭
             cy.get('#onSetNameChangeBtn').click()
 
             //이름 입력
             cy.get('#companyInput').type("racgoo98");
 
             //변경 클릭
             cy.get('#changeGroupName').click();
 
             //스낵바 확인
             cy.get('#client-snackbar').should("contain","그룹정보가 변경되었습니다.");
 
             //변경값 확인
             cy.get('#groupTableBody').should("contain","racgoo98");
 
             //그룹 추가 클릭 
             cy.get('#addGroupBtn').click();
 
             //그룹 이름 지정
             cy.get('#groupInput').type("racgoo101");
 
             //추가 클릭
             cy.get('#submitBtn').click();
 
             //스낵바 확인
             cy.get('#client-snackbar').should("contain","그룹이 등록되었습니다.");
 
             //그룹 추가 클릭 
             cy.get('#addGroupBtn').click();
 
             //그룹 이름 지정
             cy.get('#groupInput').type("racgoo102");
 
             //추가 클릭
             cy.get('#submitBtn').click();
 
             //스낵바 확인
             cy.get('#client-snackbar').should("contain","그룹이 등록되었습니다.");
 
             //그룹 수 3개인지 확인
             cy.get('#groupTableBody').then(data=>{
                 expect(data[0].childElementCount).to.equal(3);
             });
 
             //기존 그룹 전체 삭제 (초기화)
             cy.get('#groupTableBody').then(data=>{
                 let countArr=Array.from({length:data[0].childElementCount},(v,k)=>k+1)
                 cy.wrap(countArr).each(()=>{
                     cy.get('#groupTableBody tr:first').find("#deleteGroup").click();
                     cy.get('#yesBtn').click();
                 });
             });

        }
    });
});