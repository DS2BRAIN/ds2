import { userInfo } from "../../../support/commands";
describe('SignIn', function() {

    it('signIn',()=>{
        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬

            //사이트 SignIn 방문
            cy.visit('/signin');    
            //한글 변환
            cy.ko();
            //signIn click
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should('contain', '이메일 주소를 입력해주세요');  
            //이메일 입력
            cy.get('#email').type(userInfo.email);
            //영문 변환
            cy.en();
            //이메일 저장 클릭
            cy.get('#rememberEmailCheckBox').click();
            //이메일 저장 클릭
            cy.get('#rememberEmailCheckBox').click();
            //signIn click
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should('contain', 'Please enter your password.');  
            //password 입력
            cy.get('#password').type(userInfo.password);
            //signIn click
            cy.get('#signInBtn').click();
            //라우팅 확인
            cy.url().should('include', '/admin');

            

        }else{ //운영서버
            
            //사이트 SignIn 방문
            cy.visit('/signin');    
            //한글 변환
            cy.ko();
            //signIn click
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should('contain', '이메일 주소를 입력해주세요');  
            //이메일 입력
            cy.get('#email').type('rakhyeon.seong@dslab.global');
            //영문 변환
            cy.en();
            //이메일 저장 클릭
            cy.get('#rememberEmailCheckBox').click();
            //이메일 저장 클릭
            cy.get('#rememberEmailCheckBox').click();
            //signIn click
            cy.get('#signInBtn').click();
            //스낵바 확인
            cy.get('#client-snackbar').should('contain', 'Please enter your password.');  
            //password 입력
            cy.get('#password').type('a713s228@#');
            //signIn click
            cy.get('#signInBtn').click();
            //라우팅 확인
            cy.url().should('include', '/admin');

        }
    })
})