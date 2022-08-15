describe('myItem', function() {

    beforeEach(() => {
        cy.enterMyItem();
    });

    it("myItem",()=>{

        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬
            
            //영문화
            cy.en();


        }else{
            
            //영문화
            cy.en();
        }
    });
});