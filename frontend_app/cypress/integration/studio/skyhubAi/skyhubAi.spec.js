describe('skyhubAi', function() {

    beforeEach(() => {
        cy.enterSkyhubAi();
    });

    it("skyhubAi",()=>{
       if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬
            cy.get('#addProjcet').click();    
        }else{
            cy.get('#addProjcet').click();    
        }
    });
})