describe('userInfo', function() {

    beforeEach(() => {
        cy.enterUserInfo();
    });

    it("userInfo",()=>{

        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬

             //앱코드 저장
             let appCode;
            
             cy.get('#userAppCode').then(tag=>{
                 appCode=tag[0].outerText;
             });
 
             //앱코드 리셋
             cy.get('#resetAppCodeIcon').click();
         
             //한영 번역
             cy.ko();
 
             //모달창 확인
             cy.get('#client-snackbar').should("contain","앱코드를 재발급 하시겠습니까?");
             //yes 클릭
             cy.get('#yesBtn').click();
             //어뷰징 테스트
             cy.get('#client-snackbar').then(tag=>{
                 if(tag[0].outerText!=="24시간 내에 한 번만 앱토큰 변경이 가능합니다."){
                     cy.get('#userAppCode').then(tag=>{
                         expect(tag[0].outerText).to.not.eq(appCode);
                     });
                 }
             });
 
             //앱코드 리셋
             cy.get('#resetAppCodeIcon').click();
         
             //모달창 확인
             cy.get('#client-snackbar').should("contain","앱코드를 재발급 하시겠습니까?");
             //yes 클릭
             cy.get('#yesBtn').click();
             //어뷰징 테스트
             cy.get('#client-snackbar').should("contain","24시간 내에 한 번만 앱토큰 변경이 가능합니다.");
             
             //회원정보 수정 클릭
             cy.get('#changeUserInfo').click();
 
             //초기화
             cy.get('#userNameInput').clear();
             cy.get('#companyInput').clear();
             cy.get('#promotionInput').clear();
 
             //이름,회사,프로모션 입력
             cy.get('#userNameInput').type("racgoo1^^");
             cy.get('#companyInput').type("racgoo2^^");
             cy.get('#promotionInput').type("racgoo3^^");
             
             //회원정보 수정 모달 닫기
             cy.get('#informationModalClose').click();
             cy.get('#yesBtn').click();
 
              //회원정보 수정 클릭
              cy.get('#changeUserInfo').click();
              //초기화
              cy.get('#userNameInput').clear();
              cy.get('#companyInput').clear();
              cy.get('#promotionInput').clear();
 
 
              //새로 설정할 문자열
             let randomString1=Math.random().toString(36).substr(2,11);
             let randomString2=Math.random().toString(36).substr(2,11);
             let randomString3=Math.random().toString(36).substr(2,11);
 
            //이름,회사,프로모션 입력
            cy.get('#userNameInput').type(randomString1);
            cy.get('#companyInput').type(randomString2);
            cy.get('#promotionInput').type(randomString3); 
 
             //변경될 로고 이름
             let nextLogoName;

            if(document.getElementById('#userCompanyLogo')!==null){
                cy.get('#userCompanyLogo').then(logo=>{
                    if(logo[0].currentSrc.indexOf("logo.png")==-1){
                        cy.get('#files').attachFile('logo.png');
                        nextLogoName="logo.png";
                    }else{
                        cy.get('#files').attachFile('3.jpg');
                        nextLogoName="3.jpg";
                    }
                 });
            }else{
                cy.get('#files').attachFile('logo.png');
                nextLogoName="logo.png";
            }

              //설정 완료
             cy.get('#submitBtn').click();
 
             cy.wait(2000)

             //바뀐 값 확인
             cy.get('#userName').should("contain",randomString1);
             cy.get('#userCompany').should("contain",randomString2);
             cy.get('#userCompanyLogo').then(logo=>{
                 let tmp=logo[0].currentSrc.split("/");
                 console.log(tmp)
                 let newLogo=tmp[tmp.length-1];
                 console.log(newLogo)
                expect(newLogo).to.equal(nextLogoName);
             });

            //회원정보 수정 클릭
            cy.get('#changeUserInfo').click();
            //초기화
            cy.get('#userNameInput').clear();
            cy.get('#companyInput').clear();
            cy.get('#promotionInput').clear();

            //새로 설정할 문자열
            randomString1=Math.random().toString(36).substr(2,11);
            randomString2=Math.random().toString(36).substr(2,11);
            randomString3=Math.random().toString(36).substr(2,11);

            //이름,회사,프로모션 입력
            cy.get('#userNameInput').type(randomString1);
            cy.get('#companyInput').type(randomString2);
            cy.get('#promotionInput').type(randomString3); 

            //로고 입력
            cy.get('#userCompanyLogo').then(logo=>{
                if(logo[0].currentSrc.indexOf("logo.png")==-1){
                    cy.get('#files').attachFile('logo.png');
                    nextLogoName="logo.png";
                }else{
                    cy.get('#files').attachFile('3.jpg');
                    nextLogoName="3.jpg";
                }
            });

            //설정 완료
            cy.get('#submitBtn').click();

            cy.wait(2000)

            //바뀐 값 확인
            cy.get('#userName').should("contain",randomString1);
            cy.get('#userCompany').should("contain",randomString2);
            cy.get('#userCompanyLogo').then(logo=>{
                let tmp=logo[0].currentSrc.split("/");
                console.log(tmp)
                let newLogo=tmp[tmp.length-1];
                console.log(newLogo)
                expect(newLogo).to.equal(nextLogoName);
            });

            //회원정보 수정 클릭
            cy.get('#changeUserInfo').click();

            //로고 삭제
            cy.get('#deleteLogo').click();
            cy.get('#yesBtn').click();
            
            //모달창 닫기
            cy.get('#informationModalClose').click();
            cy.get('#yesBtn').click();

            //비밀번호 변경창 모달 열기
            cy.get('#changeUserPassword').click();

            //비밀번호 변경창 모달 닫기
            cy.get('#changePasswordModalClose').click();
            cy.get('#yesBtn').click();

            //비밀번호 변경창 모달 열기
            cy.get('#changeUserPassword').click();

            //변경하기 클릭
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","고객님의 메일로 링크를 보내드렸습니다.");

            //회원탈퇴 모달 열기
            cy.get('#withdrawUser').click();

            //아무 입력없이 제출하기
            cy.get('#submitBtn').click();
            
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","죄송합니다, 다시 한번 시도해 주세요.");

            //랜덤 숫자 넣고 제출하기
            cy.get('#passwordInput').type(randomString1);
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","비밀번호를 다시 한번 확인해 주세요.")
            
            //회원탈퇴 모달 닫기
            cy.get('#withdrawModalClose').click();
            cy.get('#yesBtn').click();   
        
        }else{

             //앱코드 저장
             let appCode;
            
             cy.get('#userAppCode').then(tag=>{
                 appCode=tag[0].outerText;
             });
 
             //앱코드 리셋
             cy.get('#resetAppCodeIcon').click();
         
             //한영 번역
             cy.ko();
 
             //모달창 확인
             cy.get('#client-snackbar').should("contain","앱코드를 재발급 하시겠습니까?");
             //yes 클릭
             cy.get('#yesBtn').click();
             //어뷰징 테스트
             cy.get('#client-snackbar').then(tag=>{
                 if(tag[0].outerText!=="24시간 내에 한 번만 앱토큰 변경이 가능합니다."){
                     cy.get('#userAppCode').then(tag=>{
                         expect(tag[0].outerText).to.not.eq(appCode);
                     });
                 }
             });
 
             //앱코드 리셋
             cy.get('#resetAppCodeIcon').click();
         
             //모달창 확인
             cy.get('#client-snackbar').should("contain","앱코드를 재발급 하시겠습니까?");
             //yes 클릭
             cy.get('#yesBtn').click();
             //어뷰징 테스트
             cy.get('#client-snackbar').should("contain","24시간 내에 한 번만 앱토큰 변경이 가능합니다.");
             
             //회원정보 수정 클릭
             cy.get('#changeUserInfo').click();
 
             //초기화
             cy.get('#userNameInput').clear();
             cy.get('#companyInput').clear();
             cy.get('#promotionInput').clear();
 
             //이름,회사,프로모션 입력
             cy.get('#userNameInput').type("racgoo1^^");
             cy.get('#companyInput').type("racgoo2^^");
             cy.get('#promotionInput').type("racgoo3^^");
             
             //회원정보 수정 모달 닫기
             cy.get('#informationModalClose').click();
             cy.get('#yesBtn').click();
 
              //회원정보 수정 클릭
              cy.get('#changeUserInfo').click();
              //초기화
              cy.get('#userNameInput').clear();
              cy.get('#companyInput').clear();
              cy.get('#promotionInput').clear();
 
 
              //새로 설정할 문자열
             let randomString1=Math.random().toString(36).substr(2,11);
             let randomString2=Math.random().toString(36).substr(2,11);
             let randomString3=Math.random().toString(36).substr(2,11);
 
            //이름,회사,프로모션 입력
            cy.get('#userNameInput').type(randomString1);
            cy.get('#companyInput').type(randomString2);
            cy.get('#promotionInput').type(randomString3); 
 
             //변경될 로고 이름
             let nextLogoName;

            if(document.getElementById('#userCompanyLogo')!==null){
                cy.get('#userCompanyLogo').then(logo=>{
                    if(logo[0].currentSrc.indexOf("logo.png")==-1){
                        cy.get('#files').attachFile('logo.png');
                        nextLogoName="logo.png";
                    }else{
                        cy.get('#files').attachFile('3.jpg');
                        nextLogoName="3.jpg";
                    }
                 });
            }else{
                cy.get('#files').attachFile('logo.png');
                nextLogoName="logo.png";
            }

             //로고 입력
             

              //설정 완료
             cy.get('#submitBtn').click();
 
             cy.wait(2000)

             //바뀐 값 확인
             cy.get('#userName').should("contain",randomString1);
             cy.get('#userCompany').should("contain",randomString2);
             cy.get('#userCompanyLogo').then(logo=>{
                 let tmp=logo[0].currentSrc.split("/");
                 console.log(tmp)
                 let newLogo=tmp[tmp.length-1];
                 console.log(newLogo)
                expect(newLogo).to.equal(nextLogoName);
             });

            //회원정보 수정 클릭
            cy.get('#changeUserInfo').click();
            //초기화
            cy.get('#userNameInput').clear();
            cy.get('#companyInput').clear();
            cy.get('#promotionInput').clear();

            //새로 설정할 문자열
            randomString1=Math.random().toString(36).substr(2,11);
            randomString2=Math.random().toString(36).substr(2,11);
            randomString3=Math.random().toString(36).substr(2,11);

            //이름,회사,프로모션 입력
            cy.get('#userNameInput').type(randomString1);
            cy.get('#companyInput').type(randomString2);
            cy.get('#promotionInput').type(randomString3); 

            //로고 입력
            cy.get('#userCompanyLogo').then(logo=>{
                if(logo[0].currentSrc.indexOf("logo.png")==-1){
                    cy.get('#files').attachFile('logo.png');
                    nextLogoName="logo.png";
                }else{
                    cy.get('#files').attachFile('3.jpg');
                    nextLogoName="3.jpg";
                }
            });

            //설정 완료
            cy.get('#submitBtn').click();

            cy.wait(2000)

            //바뀐 값 확인
            cy.get('#userName').should("contain",randomString1);
            cy.get('#userCompany').should("contain",randomString2);
            cy.get('#userCompanyLogo').then(logo=>{
                let tmp=logo[0].currentSrc.split("/");
                console.log(tmp)
                let newLogo=tmp[tmp.length-1];
                console.log(newLogo)
                expect(newLogo).to.equal(nextLogoName);
            });

            //회원정보 수정 클릭
            cy.get('#changeUserInfo').click();

            //로고 삭제
            cy.get('#deleteLogo').click();
            cy.get('#yesBtn').click();
            
            //모달창 닫기
            cy.get('#informationModalClose').click();
            cy.get('#yesBtn').click();

            //비밀번호 변경창 모달 열기
            cy.get('#changeUserPassword').click();

            //비밀번호 변경창 모달 닫기
            cy.get('#changePasswordModalClose').click();
            cy.get('#yesBtn').click();

            //비밀번호 변경창 모달 열기
            cy.get('#changeUserPassword').click();

            //변경하기 클릭
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","고객님의 메일로 링크를 보내드렸습니다.");

            //회원탈퇴 모달 열기
            cy.get('#withdrawUser').click();

            //아무 입력없이 제출하기
            cy.get('#submitBtn').click();
            
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","죄송합니다, 다시 한번 시도해 주세요.");

            //랜덤 숫자 넣고 제출하기
            cy.get('#passwordInput').type(randomString1);
            cy.get('#submitBtn').click();

            //스낵바 확인
            cy.get('#client-snackbar').should("contain","비밀번호를 다시 한번 확인해 주세요.")
            
            //회원탈퇴 모달 닫기
            cy.get('#withdrawModalClose').click();
            cy.get('#yesBtn').click();    

        } 
    })
});
