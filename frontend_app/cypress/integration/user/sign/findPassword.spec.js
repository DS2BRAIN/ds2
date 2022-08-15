describe('findPassword', function() {
    it('findPassword',()=>{
        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬

            //사이트 SignIn 방문
            cy.visit('/signin');    
            //회원가입 클릭
            cy.get('#findPasswordPage').click();
            //라우팅 확인
            cy.url().should('include', '/forgetpassword');
            //한글 번역
            cy.ko();
            //존재하지 않는 이메일 입력
            cy.get('#email').type("rakhyeon.seong@dslab.globa1");
            //찾기 클릭
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)");
            //이메일 초기화
            cy.get('#email').clear();
            //올바르지 않은 이메일 입력
            cy.get('#email').type("rakhyeㅁㄴㅇㅁㄴㅇn.seong@dslab.globa1");
            //영문 번역
            cy.en();
            //찾기 클릭
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","The e-mail address is not valid");
            //signIn으로 라우팅
            cy.get('#goToSignIn').click();
            //라우팅 확인
            cy.url().should("contain","/signin");
        }else{
            //사이트 SignIn 방문
            cy.visit('/signin');    
            //회원가입 클릭
            cy.get('#findPasswordPage').click();
            //라우팅 확인
            cy.url().should('include', '/forgetpassword');
            //한글 번역
            cy.ko();
            //존재하지 않는 이메일 입력
            cy.get('#email').type("rakhyeon.seong@dslab.globa1");
            //찾기 클릭
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","이메일주소가 올바르지 않습니다. (영문 소문자만 입력가능)");
            //이메일 초기화
            cy.get('#email').clear();
            //올바르지 않은 이메일 입력
            cy.get('#email').type("rakhyeㅁㄴㅇㅁㄴㅇn.seong@dslab.globa1");
            //영문 번역
            cy.en();
            //찾기 클릭
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should("contain","The e-mail address is not valid");
            //signIn으로 라우팅
            cy.get('#goToSignIn').click();
            //라우팅 확인
            cy.url().should("contain","/signin");

        }
    })
})
