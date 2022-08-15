describe('usageHistory', function() {

    beforeEach(() => {
        cy.enterUserInfo();
    });

    const next=(date)=>{
        if(date[1]+1>12){
            return [date[0]+1,1];
        }else{
            return [date[0],date[1]+1]
        }
    }
    const prev=(date)=>{
        if(date[1]-1==0){
            return [date[0]-1,12];
        }else{
            return [date[0],date[1]-1]
        }
    }
    it("usagehistory",()=>{

        if(cy.url().userInvocationStack.indexOf("https://console.ds2.ai")==-1){ //로컬

            //현재 년도 달 저장
            let date=[0,0];
            date[0]=new Date().getFullYear();
            date[1]=new Date().getMonth() + 1;

            //usagehistory 접근
            cy.get('#usagehistory').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //이전달 확인
            date=prev(date);
            cy.get('#prevBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //이전달 확인
            date=prev(date);
            cy.get('#prevBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);
            
             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

        }else{

            //현재 년도 달 저장
            let date=[0,0];
            date[0]=new Date().getFullYear();
            date[1]=new Date().getMonth() + 1;

            //usagehistory 접근
            cy.get('#usagehistory').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //이전달 확인
            date=prev(date);
            cy.get('#prevBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

            //이전달 확인
            date=prev(date);
            cy.get('#prevBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);
            
             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

             //다음달 확인
             date=next(date);
             cy.get('#nextBtn').click();
 
             //년월 확인
             cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

              //다음달 확인
            date=next(date);
            cy.get('#nextBtn').click();

            //년월 확인
            cy.get('#dateTime').should("contain",`${date[0]}.${date[1]}`);

        }
    });
});