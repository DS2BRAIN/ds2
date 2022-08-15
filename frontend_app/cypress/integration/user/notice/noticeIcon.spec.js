import { backendurl } from "../../../support/commands";
describe("noticeIcon", function() {
  beforeEach(() => {
    cy.login();
  });

  it("noticeIcon", () => {
    if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
      //로컬

      //영문화
      cy.en();

      //알림 인터셉트
      cy.intercept(
        "GET",
        "/asynctask/*",

        [
          {
            angle_score: null,
            autolabelingCount: null,
            autolabelingproject: null,
            created_at: "2021-09-02T02:24:25",
            distance_score: null,
            duration: null,
            file_creation_time: null,
            id: 20024,
            inputFilePath: null,
            isChecked: false,
            isStandardMovie: null,
            labelproject: null,
            marketproject: null,
            model: null,
            movieStartTime: null,
            outputFilePath: null,
            project: null,
            status: 100,
            statusText: null,
            sync_cut_at: null,
            taskName:
              "dsaf 마켓프로젝트의 정기결제(2021년 9월)에 성공하였습니다.",
            taskNameEn:
              "Succeeded in regular payment (2021.9) of the dsaf Market Project.",
            taskType: "planPayment",
            total_score: null,
            updated_at: "2021-09-02T02:24:25",
          },
        ]
      ).as("getnotice");

      //알림 아이콘 클릭
      cy.get("#noticeIcon").click();

      //알림 받기
      cy.wait("@getnotice", { timeout: 10000 });

      //알림 확인
      cy.get("#alarmBellList_0").then((data) => {
        expect(data.length > 0).to.equal(true);
      });

      //모든 알림 확인하기 클릭
      cy.get("#viewAllAlarms").click();

      //최근 알림 내용 확인
      cy.get("#noticeTable").then((data) => {
        expect(data[0].childNodes.length > 0).to.equal(true);
      });
    } else {
      //운영
      //로컬

      //영문화
      cy.en();

      //알림 인터셉트
      cy.intercept(
        "GET",
        "/asynctask/*",

        [
          {
            angle_score: null,
            autolabelingCount: null,
            autolabelingproject: null,
            created_at: "2021-09-02T02:24:25",
            distance_score: null,
            duration: null,
            file_creation_time: null,
            id: 20024,
            inputFilePath: null,
            isChecked: false,
            isStandardMovie: null,
            labelproject: null,
            marketproject: null,
            model: null,
            movieStartTime: null,
            outputFilePath: null,
            project: null,
            status: 100,
            statusText: null,
            sync_cut_at: null,
            taskName:
              "dsaf 마켓프로젝트의 정기결제(2021년 9월)에 성공하였습니다.",
            taskNameEn:
              "Succeeded in regular payment (2021.9) of the dsaf Market Project.",
            taskType: "planPayment",
            total_score: null,
            updated_at: "2021-09-02T02:24:25",
          },
        ]
      ).as("getnotice");

      //알림 아이콘 클릭
      cy.get("#noticeIcon").click();

      //알림 받기
      cy.wait("@getnotice", { timeout: 10000 });

      //알림 확인
      cy.get("#alarmBellList_0").then((data) => {
        expect(data.length > 0).to.equal(true);
      });

      //모든 알림 확인하기 클릭
      cy.get("#viewAllAlarms").click();

      //최근 알림 내용 확인
      cy.get("#noticeTable").then((data) => {
        expect(data[0].childNodes.length > 0).to.equal(true);
      });
    }
  });
});
