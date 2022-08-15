describe("01_addDataset", function() {
  let csvFileForSuccess = "ph예측.csv";
  let csvFileForFailure = "ph예측_few.csv";
  let zipFileForFailure = "차량인식.zip";
  let zipFileForSuccess = "나무열매.zip";
  let videoFileForSuccess = "catVideo.mp4";

  beforeEach(() => {
    // 데이터커넥터 페이지 접속
    cy.enterDataset();
    // 데이터 추가하기 버튼 클릭
    cy.get("#addConnector").click();
  });

  // CSV 추가
  it("add data - csv open", () => {
    // CSV 데이터 업로드 모달 확인
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.contains("2GB 이하의 CSV 파일만 지원합니다").should("be.visible");
    cy.contains("업로드된 파일이 없습니다").should("be.visible");
  });

  it("not csv file on csv dropzone", () => {
    // CSV가 아닌 다른 형식 데이터(zip) 추가
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(zipFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.contains("csv 파일을 업로드해주세요").should("be.visible");
  });

  it("csv wrong file save", () => {
    // 컬럼 수가 10개 이하인 데이터(csv) 추가
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForFailure, {
      subjectType: "drag-n-drop",
    });
    cy.get("#selectColumnRadio").click();
    cy.get("#selectColumnTag").select("green");
    cy.get("#startSaveFilesBtn").click();
    cy.contains("데이터가 너무 적습니다").should("be.visible");
  });

  it("csv right file save", () => {
    // 정상적인 CSV 데이터 추가
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.contains("파일이 업로드 되었습니다").should("be.visible");
  });

  it("csv file delete", () => {
    // 데이터 업로드 후 저장하지 않고 삭제
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.contains("파일이 업로드 되었습니다").should("be.visible");
    cy.get("#deleteFilesBtn").click();
    cy.contains("파일이 삭제 되었습니다").should("be.visible");
  });

  it("csv file save (select original column)", () => {
    // CSV 내부 기존에 있던 컬럼으로 저장
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.get("#selectColumnRadio").click();
    // 기존 컬럼 선택
    cy.get("#selectColumnTag").select("green");
    cy.get("#startSaveFilesBtn").click();
    cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
  });

  it("csv file save (add new column)", () => {
    // 직접 입력한 새로운 컬럼으로 저장
    cy.get("#CSV_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.get("#inputColumnRadio").click();
    // 새로운 컬럼명 입력
    cy.get("#input_self").type("purple");
    cy.get("#startSaveFilesBtn").click();
    cy.contains("잠시만 기다려주세요").should("be.visible");
    cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
  });

  // ZIP 추가
  it("add data - zip open", () => {
    // ZIP 데이터 업로드 모달 확인
    cy.get("#ZIP_container").click();
    cy.get("#saveModal").click();
    cy.contains("1GB 이하의 ZIP 파일").should("be.visible");
    cy.contains("업로드된 파일이 없습니다").should("be.visible");
  });

  it("not zip file on zip dropzone", () => {
    // ZIP가 아닌 다른 형식 데이터(csv) 추가
    cy.get("#ZIP_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(csvFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.contains("zip 파일을 업로드해주세요").should("be.visible");
  });

  it("zip wrong file save", () => {
    // 이미지가 10개 이하인 데이터(zip) 추가
    cy.get("#ZIP_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(zipFileForFailure, {
      subjectType: "drag-n-drop",
    });
    cy.get("#startSaveFilesBtn").click();
    cy.contains("데이터가 너무 적습니다").should("be.visible");
  });

  it("zip file save", () => {
    // 정상적인 ZIP 데이터 추가
    cy.get("#ZIP_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(zipFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.get("#startSaveFilesBtn").click();
    cy.contains("잠시만 기다려주세요").should("be.visible");
    cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
  });

  it("zip file save with labelling data", () => {
    // 정상 ZIP 데이터 추가 + 라벨링 데이터 체크
    cy.get("#ZIP_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(zipFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.get("#zipLabellingCheckbox").click();
    cy.get("#startSaveFilesBtn").click();
    cy.contains("잠시만 기다려주세요").should("be.visible");
    cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
  });

  // VIDEO
  it("add data - video open", () => {
    // VIDEO 데이터 업로드 모달 확인
    cy.get("#Video_container").click();
    cy.get("#saveModal").click();
    cy.contains("5GB 이하의 MP4, MOV 파일").should("be.visible");
    cy.contains("업로드된 파일이 없습니다").should("be.visible");
  });

  it("video file save", () => {
    // frameValue 입력 없이 정상적인 ZIP 데이터 추가
    cy.get("#Video_container").click();
    cy.get("#saveModal").click();
    cy.get("#projectDropzoneContainer div").attachFile(videoFileForSuccess, {
      subjectType: "drag-n-drop",
    });
    cy.get("#startSaveFilesBtn").click();
    cy.contains("잠시만 기다려주세요").should("be.visible");
    cy.contains("데이터커넥터가 등록되었습니다").should("be.visible");
  });

  it("wrong frame value (string)", () => {
    // 잘못된 형식의 frameValue 입력시 60으로 입력값 수정 확인
    cy.get("#Video_container").click();
    cy.get("#saveModal").click();
    cy.get("#frameValue").type("wrong");
    cy.get("#frameValue").should("have.value", 60);
  });
});

describe("02_startPrivate", function() {
  beforeEach(() => {
    cy.enterDataset();
    // 데이터셋 중 첫번째 파일 선택 (0번째 => 전체체크)
    cy.get("[type='checkbox']")
      .eq(1)
      .check();
  });

  it("click checkbox", () => {
    // 정상적으로 체크가 되는지 확인
    cy.get("[type='checkbox']").should("be.checked");
  });

  it("start Labelling (private)", () => {
    // 내 데이터 라벨링 시작 확인
    cy.get("#startLabellingBtn").click();
    cy.url().should("include", "/admin/newProject");
  });

  it("start AI Develop", () => {
    // 공공 데이터 라벨링 시작 확인
    cy.get("#startAIDevelopBtn").click();
    cy.url().should("include", "/admin/process");
  });
});

describe("03_startPublic", function() {
  beforeEach(() => {
    cy.enterDataset();
    cy.get("#publicDataTab").click();
    // 공공데이터 1번째 데이터(두번째 데이터) 클릭
    cy.get("tbody > tr")
      .eq(1)
      .click();
  });

  it("start labelling (public)", () => {
    // 공공데이터 라벨링 시작하기
    cy.get("#startLabellingBtn").click();
    cy.url().should("include", "/admin/newProject");
  });
});

describe("04_sampleTemplate", function() {
  beforeEach(() => {
    cy.enterDataset();
  });

  it("open sampleTemplate modal", () => {
    // 샘플템플릿 모달 보여주기
    cy.get("sampleTemplateBtn").click();
  });
});
