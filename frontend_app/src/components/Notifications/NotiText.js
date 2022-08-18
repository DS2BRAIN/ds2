export const getNotificationText = (status, type, statText, lang) => {
  const isKor = lang === "ko" ? true : false;

  const renderTypeError = (type) => {
    switch (type) {
      case "runAll":
        return isKor ? "일괄예측" : "during the batch prediction.";
      case "runMovie":
        return isKor ? "영상예측" : "during the video prediction.";
      case "develop":
        return isKor ? "인공지능 개발" : "during the AI development.";
      case "runAnalyzing":
        return isKor ? "코랩 인공지능 분석" : "during the Colab AI Anaylsis.";
      case "exportData":
        return isKor
          ? "라벨프로젝트의 데이터 추출"
          : "while extracting the data from the labeling project.";
      case "exportCoco":
        return isKor
          ? "라벨프로젝트의 Coco 데이터 추출"
          : "while extracting the data from the labeling project.";
      case "exportVoc":
        return isKor
          ? "라벨프로젝트의 Voc 데이터 추출"
          : "while extracting Voc data from the labeling project.";
      case "uploadDataConnector":
        return isKor
          ? "데이터커넥터 업로드"
          : "while uploading the dataconnector.";
      case "addObject":
        return isKor
          ? "라벨프로젝트의 데이터 업로드"
          : "while uploading the data of the labeling project.";
      case "autoLabeling":
        return isKor
          ? "라벨프로젝트의 오토라벨링"
          : "while auto-labeling of label project.";
      case "uploadLabelProjectData":
        return isKor
          ? "라벨프로젝트 생성"
          : "while creating the label project.";
      case "customAi" || "labeling":
        return isKor
          ? "라벨프로젝트의 커스텀AI 학습"
          : "while training the custom AI.";
      case "train":
        return isKor ? "프로젝트의 학습" : "during training.";
      case "verify":
        return isKor ? "프로젝트의 검증" : "during verifying";
      default:
        return "";
    }
  };

  const renderTypeEtc = (type) => {
    switch (type) {
      case "runAll":
        return isKor ? "일괄예측이" : "batch prediction";
      case "runMovie":
        return isKor ? "영상예측이" : "video prediction";
      case "develop":
        return isKor ? "인공지능 개발이" : "AI development";
      case "runAnalyzing":
        return isKor ? "코랩 인공지능 분석이" : "Colab AI analysis";
      case "exportData":
        return isKor
          ? "라벨프로젝트의 데이터 추출이"
          : "data extraction of the labeling project";
      case "exportCoco":
        return isKor
          ? "라벨프로젝트의 Coco 데이터 추출이"
          : "Coco data extraction of the labeling project";
      case "exportVoc":
        return isKor
          ? "라벨프로젝트의 Voc 데이터 추출"
          : "voc data extraction of the labeling project";
      case "uploadDataConnector":
        return isKor ? "데이터커넥터 업로드가" : "dataconnector upload";
      case "addObject":
        return isKor
          ? "라벨프로젝트의 데이터 업로드가"
          : "data upload on the label project";
      case "autoLabeling":
        return isKor
          ? "라벨프로젝트의 오토라벨링이"
          : "auto-labeling for the label project";
      case "uploadLabelProjectData":
        return isKor
          ? "라벨프로젝트 생성이"
          : "while creating the label project.";
      case "customAi" || "labeling":
        return isKor ? "라벨프로젝트의 커스텀AI 학습이" : "custom AI training";
      case "train":
        return isKor ? "프로젝트의 학습이" : "training";
      case "verify":
        return isKor ? "프로젝트의 검증이" : "verifying";
      default:
        return "";
    }
  };

  let notiText = "";
  let dateText = "";
  let statusText = "";
  let typeText = "";

  if (status === 9 || status === 99) {
    statusText = isKor ? "중 에러가 발생하였습니다." : "An error occured";
    typeText = renderTypeError(type);

    notiText = isKor
      ? `${typeText} ${statusText}`
      : `${statusText} ${typeText}`;
  } else {
    statusText =
      status === 1 || status === 0
        ? isKor
          ? "시작되었습니다."
          : "has started"
        : status === 100
        ? isKor
          ? "완료되었습니다."
          : "has been completed."
        : isKor
        ? "진행중입니다."
        : "is in progress.";
    if (statusText === "") return;
    typeText = renderTypeEtc(type);

    if (type === "uploadDataConnector") {
      if (status === 100 && statText?.failFileList?.length > 0)
        notiText = isKor
          ? "데이터커넥터 업로드가 완료되었으나 일부 파일에 에러가 발생하였습니다."
          : "dataconnector has been uploaded, but errors occurred in some data.";
    } else if (type === "addObject") {
      if (status === 100 && statText?.failFileList?.length > 0)
        notiText = isKor
          ? "라벨프로젝트의 데이터 업로드가 완료되었으나 일부 데이터에 에러가 발생하였습니다."
          : "labeling project data has been uploaded, but errors occurred in some data.";
    } else if (type === "uploadLabelProjectData")
      notiText =
        status === 1
          ? isKor
            ? "라벨프로젝트가 생성되어 데이터 업로드 중입니다."
            : "label project is being created and uploading data."
          : status === 100
          ? isKor
            ? "라벨프로젝트가 생성되었습니다."
            : "label project has been created."
          : "";

    if (notiText === "")
      notiText =
        !isKor && (status === 1 || status === 0)
          ? `${statusText} ${typeText}`
          : `${typeText} ${statusText}`;
  }
  if (type === "planPayment") {
    if (statText && statText["year"])
      dateText = isKor
        ? `(${statText["year"]}년 ${statText["month"]}월분)`
        : `(${statText["month"]}/${statText["year"]})`;
    if (status === 100)
      notiText = isKor
        ? "정기결제에 성공하였습니다."
        : "Succeeded in regular payment.";
    else {
      if (status === 99)
        notiText = isKor
          ? "정기결제에 실패하였습니다."
          : "Failed in regular payment.";
      dateText =
        dateText === ""
          ? isKor
            ? "다음날 다시 결제됩니다."
            : "It will be charged again the next day."
          : isKor
          ? `${dateText} 다음날 다시 결제됩니다.`
          : `${dateText} It will be charged again the next day.`;
    }
    return `${notiText} ${dateText}`;
  }
  return notiText;
};
