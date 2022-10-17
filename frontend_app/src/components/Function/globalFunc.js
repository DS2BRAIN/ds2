import * as api from "controller/api";
import { fileurl } from "controller/api";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages";
import {
  setIsValidUserRequestAction,
  setIsGetKeyStatusLoadingRequestAction,
} from "redux/reducers/user";
import { IS_DEPLOY, IS_ENTERPRISE, IS_DEV } from "variables/common";
import Cookies from "helpers/Cookies";

const checkHttps = () => {
  if (IS_DEPLOY && window.location.href.indexOf("https://") === -1) {
    //리다이렉트
    window.location.href = `https://${window.location.href.slice(
      7,
      window.location.href.length
    )}`;
    return;
  }
};

export default checkHttps;

export const sendErrorMessage = (message, message_en, lang) => {
  if (lang === "ko") {
    return message;
  } else {
    return message_en;
  }
};

export const renderSnackbarMessage = (type, response, replace) => {
  let lang = Cookies.getCookie("language");
  let etcText = "";
  let errorMessage = "";
  let data = response?.data;

  if (replace) {
    etcText = replace;
  } else if (type === "error") {
    etcText =
      lang === "ko"
        ? "죄송합니다. 일시적인 오류가 발생하였습니다."
        : "A temporary error has occurred.";
  }

  if (data?.message) {
    if (lang === "en" && data.message_en) errorMessage = data.message_en;
    else errorMessage = data.message;
  } else errorMessage = etcText;

  if (
    errorMessage === "허용되지 않은 토큰 값입니다." ||
    errorMessage === "Token value not allowed."
  )
    window.location.href = "/signout";

  return errorMessage;
};

export const convertToLocalDateStr = (reqDate) => {
  let convertedStr = "";
  let createdDate = reqDate?.includes("Z")
    ? new Date(reqDate)
    : new Date(reqDate + "Z");

  let dataSet = {
    year: createdDate.getFullYear(),
    month: createdDate.getMonth() + 1,
    date: createdDate.getDate(),
    hour: createdDate.getHours(),
    minute: createdDate.getMinutes(),
  };

  Object.keys(dataSet).map((key, i) => {
    dataSet[key] = dataSet[key] < 10 ? `0${dataSet[key]}` : dataSet[key];
  });

  convertedStr = `${dataSet.year}-${dataSet.month}-${dataSet.date} ${dataSet.hour}:${dataSet.minute}`;

  return convertedStr;
};

export const linkDownloadUrl = (url) => {
  // let file = null;
  // const xhr = new XMLHttpRequest();
  // const reqUrl =
  //   fileurl + (process.env.REACT_APP_ENTERPRISE ? "static/" : "") + url;
  // const link = document.createElement("a");
  // const urlArr = url.split("/");
  // console.log(type);
  // // const fileName =
  // //   type === "exportData" || type === "exportVoc" || type === "exportCoco"
  // //     ? urlArr[urlArr.length - 1]
  // //     : urlArr[urlArr.length - 1].substring(12);
  // const fileName = urlArr[urlArr.length - 1];

  // xhr.open("GET", reqUrl, true);
  // xhr.responseType = "blob";
  // xhr.onload = function() {
  //   file = new Blob([xhr.response], { type: "application/octet-stream" });
  //   link.href = window.URL.createObjectURL(file);
  //   link.download = fileName;
  //   link.click();
  // };
  // xhr.send();
  const link = document.createElement("a");
  link.href = IS_ENTERPRISE ? fileurl + "static/" + url : url;
  link.download = "download";
  link.click();
};

// 문자열 기준 정렬 함수
export const dynamicSort = (property) => {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function(a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    const result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
};

export const setMemoryUnit = (size) => {
  const fileSize = Number(size);
  const unitArr = ["Byte", "KB", "MB", "GB", "TB"];
  let unit = "";
  let resultSize = 0;
  let result = "";

  unitArr.map((v, i) => {
    const calculatedNum = fileSize / 1024 ** i;

    if (calculatedNum > 1) {
      resultSize = calculatedNum;
      unit = v;
    } else return;
  });

  result = `${resultSize.toFixed(2)}${unit}`;

  return result;
};

// iterable 타입인지 판별
export const checkIsIterable = (obj) => {
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
};

export const getLabelAppUrl = (category) => {
  let labelAppUrl =
    category === "object_detection"
      ? `http://localhost:${IS_ENTERPRISE ? 13001 : 3001}/`
      : `http://localhost:${IS_ENTERPRISE ? 13000 : 3000}/`;

  if (IS_DEPLOY) {
    labelAppUrl =
      category === "object_detection"
        ? process.env.REACT_APP_LABELAPP_URL
        : process.env.REACT_APP_FRONTEND_URL;

    if (IS_ENTERPRISE) {
      labelAppUrl = IS_DEV
        ? category === "object_detection"
          ? "https://staginglabelapp.ds2.ai/"
          : "https://refactoring.ds2.ai/"
        : category === "object_detection"
        ? "http://" + window.location.host.split(":")[0] + ":13001/"
        : "http://" + window.location.host.split(":")[0] + ":13000/";

      labelAppUrl =
        category === "object_detection"
          ? IS_DEV
            ? "https://staginglabelapp.ds2.ai/"
            : "http://" + window.location.host.split(":")[0] + ":13001/"
          : IS_DEV
          ? "https://refactoring.ds2.ai/"
          : "http://" + window.location.host.split(":")[0] + ":13000/";
    }
  }

  if (window.location.href.indexOf("https") > -1) {
    labelAppUrl = category === "object_detection"
      ? window.location.origin + "/"
      : window.location.origin.replaceAll("console", "labelapp") + "/";
  }

  return labelAppUrl;
};

export const openChat = () => {
  if (IS_ENTERPRISE) {
    let feedbackDom = document.getElementById("feedback_container").firstChild
      .firstChild;
    feedbackDom.click();
  } else {
    window.ChannelIO("show");
  }
};

export async function checkIsValidKey(user, dispatch, t) {
  if (IS_ENTERPRISE) {
    if (user.isGetKeyStatusLoading) return;

    await dispatch(setIsGetKeyStatusLoadingRequestAction(true));

    let isValidUser = true;
    let keyInfo = null;

    await api
      .getKeyStatus()
      .then((res) => {
        keyInfo = res.data;
        if (!keyInfo || !keyInfo.is_valid) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Available after purchasing the License")
            )
          );

          isValidUser = false;
        }

        if (keyInfo.is_opensource) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Available as a download version. Visit https://ds2.ai")
            )
          );

          isValidUser = false;
        }
      })
      .catch((err) => {
        const errMsg = renderSnackbarMessage(
          "error",
          err.response,
          t("Key value authentication failed. Return to the signIn screen.")
        );

        dispatch(openErrorSnackbarRequestAction(errMsg));

        isValidUser = false;
      })
      .finally(() => {
        dispatch(setIsValidUserRequestAction(isValidUser));
        dispatch(setIsGetKeyStatusLoadingRequestAction(false));
      });

    return isValidUser;
  }
}

export const listPagination = (location) => {
  let pagiDict = {};
  const urlSP = new URLSearchParams(location.search);

  let paramTab = urlSP.get("tab");
  let paramPage = urlSP.get("page");
  let paramSorting = urlSP.get("sorting");
  let paramDesc = urlSP.get("desc");
  let paramRows = urlSP.get("rows");
  let paramSearch = urlSP.get("search");
  let paramPublic = urlSP.get("public");

  pagiDict["tab"] = paramTab ? paramTab : "all";
  pagiDict["page"] = paramPage ? parseInt(paramPage) - 1 : 0;
  pagiDict["sorting"] = paramSorting ? paramSorting : "created_at";
  pagiDict["desc"] = paramDesc === "false" ? false : true;
  pagiDict["rows"] = paramRows ? parseInt(paramRows) : 10;
  pagiDict["search"] = paramSearch ? paramSearch : "";
  pagiDict["public"] = paramPublic === "true" ? true : false;

  return pagiDict;
};

export const toHome = (history) => {
  history.push("/admin/train");
};
