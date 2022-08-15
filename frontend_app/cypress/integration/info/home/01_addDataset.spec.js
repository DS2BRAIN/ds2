// 빠른 시작 기능 확인
describe("01_addDataset", function() {
  let csvFileForSuccess = "ph예측.csv";
  let zipFileForSuccess = "나무열매.zip";
  let videoFileForSuccess = "catVideo.mp4";

  beforeEach(() => {
    cy.login();
  });

  // 빠른시작 확인
  it("quick start in admin page", () => {
    cy.contains("빠른 시작").should("be.visible");
  });

  // CSV 추가
  it("csv file save", () => {
    cy.get("#quickStartDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.url().should("include", "/admin/dataconnector");
    cy.contains("파일이 업로드 되었습니다").should("be.visible");
  });

  // ZIP 추가
  it("zip file save", () => {
    cy.get("#quickStartDropzoneContainer div").attachFile(zipFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.url().should("include", "/admin/dataconnector");
    cy.contains("파일이 업로드 되었습니다").should("be.visible");
  });

  // VIDEO 추가
  it("video file save", () => {
    cy.get("#quickStartDropzoneContainer div").attachFile(videoFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.url().should("include", "/admin/dataconnector");
    cy.contains("파일이 업로드 되었습니다").should("be.visible");
  });
});
