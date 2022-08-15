import React, { useEffect, useRef, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import * as api from "controller/labelApi.js";
import Loading from "components/Loading/Loading.js";
import Cookies from "helpers/Cookies";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { getLabelProjectRequestAction } from "redux/reducers/labelprojects.js";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import { Container, Grid } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Pagination from "@material-ui/lab/Pagination";
import IconButton from "@material-ui/core/IconButton";
import ListIcon from "@material-ui/icons/List";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "components/CustomButtons/Button";
import Language from "components/Language/Language";

const useModalStyles = makeStyles({
  modalContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  modalContent: {
    position: "absolute",
    width: "400px",
    height: "100vh",
    background: "#010101",
    padding: "0 30px",
  },
  title: {
    height: "8%",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
  },
  lists: {
    height: "84%",
    overflowY: "auto",
  },
  imageContainer: {
    display: "flex",
    cursor: "pointer",
    height: "40px",
    alignItems: "center",
    marginBottom: "12px",
    padding: "8px",
  },
  root: {
    ".MuiPagination-ul": {
      color: "#fff",
    },
  },
});

const useRadioStyles = makeStyles({
  radio: {
    "&$checked": {
      // color: "#3f51b5",
      color: "#fff",
    },
  },
  checked: {},
});

const LabelStructure = ({ history }) => {
  const classes = currentTheme();
  const modalClasses = useModalStyles();
  const radioClasses = useRadioStyles();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({
      user: state.user,
      messages: state.messages,
    }),
    []
  );
  const textInput = useRef();

  const { t } = useTranslation();
  const [labelFileDetail, setLabelFileDetail] = useState({});
  const [labelClasses, setLabelClasses] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [isSavingLoading, setIsSavingLoading] = useState(false);
  const [isNextOrPrevLoading, setIsNextOrPrevLoading] = useState(false);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [labelFiles, setLabelFiles] = useState([]);
  const [totalLength, setTotalLength] = useState(0);
  const [isListPageChanged, setIsListPageChanged] = useState(false);
  const [selectedLabelFile, setSelectedLabelFile] = useState({});
  const [selectedValueId, setSelectedValueId] = useState(0);
  const [selectedValueName, setSelectedValueName] = useState("");
  const [isSavingFail, setIsSavingFail] = useState(false);
  const [isCardRequestError, setIsCardRequestError] = useState(false);
  const [fileStatus, setFileStatus] = useState("");
  const [appStatusForRequestValue, setAppStatusForRequestValue] = useState("");
  const [appStatusTxt, setAppStatusTxt] = useState("");
  const [prevButtonDisabled, setPrevButtonDisabled] = useState(false);
  const [page, setPage] = useState(0);
  const [isHistoryChanged, setIsHistoryChanged] = useState(false);
  const [isReview, setIsReview] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(0);
  const [labelProjectName, setLabelProjectName] = useState("");
  const [workapp, setWorkapp] = useState("");

  const listCnt = 10;
  let isSavingSuccess = false;
  let checkSaveNum = 0;

  let url = "none";
  const currentUrl = window.location.href;
  var tempUrl = "http://localhost:3000/";

  if (process.env.REACT_APP_DEPLOY) {
    tempUrl = process.env.REACT_APP_FRONTEND_URL;
  }

  if (process.env.REACT_APP_ENTERPRISE) {
    tempUrl = process.env.REACT_APP_FRONTEND_URL;
  }

  let path = history.location.pathname;
  let qs = history.location.search;
  const pathArr = path.split("/");

  const labelFileType = pathArr[2];
  const labelProjectId = parseInt(pathArr[3]);
  const labelFileId = pathArr[4];
  const appStatus = qs.split("appStatus=")[1].split("&")[0];
  const timeStamp = qs.split("timeStamp=")[1];

  const handleChange = (event) => {
    setInspectionResult(event.target.value);
  };

  useEffect(() => {
    setIsContentLoading(true);
    setIsHistoryChanged(false);
    // dispatch(getLabelProjectRequestAction(labelProjectId));
    getLabelFileDetail(labelFileId, labelProjectId);
  }, [currentUrl]);

  useEffect(() => {
    function handleKeyDown(e) {
      const activeTextarea = document.activeElement;

      if (checkSaveNum === 0 && activeTextarea.tagName !== "INPUT") {
        switch (e.key) {
          case "a":
          case "ㅁ":
            document.getElementById("prevBtn") &&
              document.getElementById("prevBtn").click();
            break;
          case "s":
          case "ㄴ":
            document.getElementById("saveBtn") &&
              document.getElementById("saveBtn").click();
            break;
          case "d":
          case "ㅇ":
            document.getElementById("nextBtn") &&
              document.getElementById("nextBtn").click();
            break;
          default:
            break;
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (qs.includes("start=true")) {
      Cookies.setCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`,
        labelFileId,
        1
      );
    } else {
      let fileHistoryCookieArr = Cookies.getCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`
      ).split(",");

      if (
        fileHistoryCookieArr.indexOf(labelFileId) === -1 &&
        labelFileId !== "" &&
        labelFileId !== "null" &&
        labelFileId !== "undefined"
      ) {
        if (fileHistoryCookieArr.length >= 10) {
          fileHistoryCookieArr.shift();
        }
        fileHistoryCookieArr.push(labelFileId);
        Cookies.setCookie(
          `fileHistoryBy${labelProjectId}At${timeStamp}`,
          fileHistoryCookieArr,
          1
        );
      }
    }
    setIsHistoryChanged(true);
  }, [labelFileId]);

  useEffect(() => {
    if (isHistoryChanged) {
      let fileHistoryCookieArr = Cookies.getCookie(
        `fileHistoryBy${labelProjectId}At${timeStamp}`
      ).split(",");
      let fileIndex = fileHistoryCookieArr.indexOf(labelFileId);

      if (fileHistoryCookieArr[fileIndex - 1] === undefined) {
        setPrevButtonDisabled(true);
      } else {
        setPrevButtonDisabled(false);
      }
      setIsHistoryChanged(false);
    }
  }, [isHistoryChanged]);

  useEffect(() => {
    let tmp =
      appStatus === "prepare" || appStatus === "working"
        ? "prepare"
        : appStatus === "review"
        ? "review"
        : appStatus === "done"
        ? "done"
        : appStatus === "reject"
        ? "reject"
        : "none";
    let tmpTxt =
      appStatus === "prepare" || appStatus === "working"
        ? "시작 전"
        : appStatus === "review"
        ? "리뷰 중"
        : appStatus === "done"
        ? "완료"
        : appStatus === "reject"
        ? "반려"
        : "없음";

    setAppStatusForRequestValue(tmp);
    setAppStatusTxt(tmpTxt);
  }, [appStatus]);

  useEffect(() => {
    if (labelFileDetail.labelData) {
      setSelectedValueName(String(Object.values(labelFileDetail.labelData)[0]));
    }
  }, [labelFileDetail.labelData]);

  useEffect(() => {
    if (isSavingFail) {
      dispatch(
        openErrorSnackbarRequestAction(t("Failed to save the file."))
      );
    }
  }, [isSavingFail]);

  useEffect(() => {
    if (isListPageChanged) {
      setIsLoadingModalOpen(true);
      api
        .getListObjects({
          sorting: "id",
          count: listCnt,
          page: page - 1,
          labelprojectId: labelProjectId,
          tab: appStatus,
          isDesc: true,
          workapp,
          // workAsignee: Cookies.getCookie("asignee"),
        })
        .then((res) => {
          const tempFiles = res.data.file;
          setTotalLength(res.data.totalCount);
          tempFiles.forEach((file) => {
            if (labelFileId === file.id) setSelectedLabelFile(file);
          });
          setLabelFiles(tempFiles);
          setIsLoadingModalOpen(false);
        });
    }
  }, [isListPageChanged, page]);

  const onClickListButton = () => {
    setIsLoadingModalOpen(true);
    setPage(1);

    api
      .getListObjects({
        sorting: "id",
        count: listCnt,
        page: 0,
        labelprojectId: labelProjectId,
        tab: appStatus,
        isDesc: true,
        workapp,
        // workAsignee: Cookies.getCookie("asignee"),
      })
      .then((res) => {
        const tempFiles = res.data.file;
        setTotalLength(res.data.totalCount);
        tempFiles.forEach((file) => {
          if (labelFileId === file.id) setSelectedLabelFile(file);
        });
        setLabelFiles(tempFiles);
        setIsLoadingModalOpen(false);
      });
    setIsListModalOpen(true);
  };

  const onChangeListPage = (e, page) => {
    setPage(page);
    setIsListPageChanged(true);
  };

  const closeListModal = () => {
    setIsListModalOpen(false);
  };

  const onSelectClass = (e) => {
    setSelectedValueId(e.currentTarget.value);
    setSelectedValueName(e.currentTarget.name);
  };

  const getLabelFileDetail = (labelFileId, labelProjectId) => {
    setIsContentLoading(true);

    api
      .getLabelAppData(labelProjectId, labelFileId)
      .then((res) => {
        const fileDetail = res.data.sthreefile;
        const labelData =
          fileDetail.labelData === null ? {} : fileDetail.labelData;
        const labelClasses = res.data.labelclass;
        const rawData = fileDetail.rawData === null ? {} : fileDetail.rawData;

        setLabelFileDetail({
          ...fileDetail,
          labelData,
          rawData,
        });
        setLabelClasses(labelClasses);
        setWorkapp(fileDetail.workapp);
        let isReviewTmp =
          fileDetail.status === "review" ||
          (fileDetail.inspectionResult !== undefined &&
            fileDetail.inspectionResult !== null);

        if (fileDetail && fileDetail.labelData !== null) {
          Object.values(fileDetail.labelData)[0] === null
            ? setSelectedValueName("")
            : setSelectedValueName(
                String(Object.values(fileDetail.labelData)[0])
              );
        } else {
          setSelectedValueName("");
        }
        setFileStatus(fileDetail.status);
        setIsReview(isReviewTmp);
        setLabelProjectName(fileDetail.labelprojectName);
        setInspectionResult(String(fileDetail.inspectionResult));
        setIsContentLoading(false);
        setIsNextOrPrevLoading(false);
        setIsSavingLoading(false);
      })
      .catch((e) => {
        console.log(e);
        dispatch(
          openErrorSnackbarRequestAction(
            t(
              "죄송합니다. 일시적인 오류 발생으로 라벨링 파일 정보를 불러오는데 실패하였습니다."
            )
          )
        );
      });
  };

  const onGoToSelectedPage = (id) => {
    if (
      window.confirm(
        t(
          "진행중이던 라벨링 정보는 초기화 됩니다. 선택하신 행으로 이동하시겠습니까?"
        )
      )
    ) {
      setSelectedValueName("");
      setSelectedValueId(0);
      setFileStatus("");
      history.push(
        `/admin/${labelFileType}/${labelProjectId}/${id}/?token=${Cookies.getCookie(
          "jwt"
        )}&appStatus=${appStatus}&timeStamp=${timeStamp}`
      );
      setIsListModalOpen(false);
    }
  };

  const changeLabel = async (buttonType) => {
    const structuredData = {
      [Object.keys(labelFileDetail.labelData)[0]]: selectedValueName,
    };

    let labelToChangeInfo = [
      {
        id: labelFileDetail.id,
        labelproject: labelProjectId,
        status: "done",
        labeltype: workapp,
        sthreefile: labelFileDetail.id,
        labelclass: parseInt(selectedValueId),
        ismagictool: false,
        structuredData,
      },
    ];

    isSavingSuccess = true;
    await api
      .putLabels(labelToChangeInfo)
      .then(() => {
        dispatch(openSuccessSnackbarRequestAction(t("Saved.")));
        setLabelFileDetail({
          ...labelFileDetail,
          labelData: structuredData,
        });
        setObjectStatus(buttonType);
        // setIsSavingLoading(false);
      })
      .catch(() => {
        isSavingSuccess = false;
        dispatch(
          openErrorSnackbarRequestAction(t("Failed to save the file."))
        );
        setIsSavingLoading(false);
      });
    return isSavingSuccess;
  };

  const saveLabel = async (buttonType) => {
    if (checkSaveNum === 0) {
      checkSaveNum++;
      if (selectedValueName === "") {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Select or enter a value to label.")
          )
        );
        checkSaveNum = 0;
        return;
      }

      if (workapp === "normal_regression") {
        if (isNaN(Number(selectedValueName)) && selectedValueName !== "") {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Only numeric types can be entered. Please re-enter.")
            )
          );
          setIsSavingLoading(false);
          checkSaveNum = 0;
          return;
        }
      }
      setIsSavingLoading(true);
      // 클래스 버튼을 한 번이라도 눌렀을 때
      if (selectedValueId !== 0) {
        // 기존에 저장된 라벨이 있을 때
        if (Object.values(labelFileDetail.labelData)[0] !== null) {
          if (
            selectedValueName !==
            String(Object.values(labelFileDetail.labelData)[0])
          ) {
            // 다른 클래스 버튼을 클릭하여 클래스가 변경되었을 때
            await changeLabel(buttonType);
            isSavingSuccess = true;
            return isSavingSuccess;
          } else {
            // 클래스가 변경되지는 않았으나 다른 클래스 버튼 클릭하고 다시 선택했을 때
            isSavingSuccess = true;

            await setObjectStatus(buttonType);
            // setIsSavingLoading(false);
            return isSavingSuccess;
          }
        } else {
          // 기존에 저장된 라벨이 없을 때
          const structuredData =
            // 클래스를 선택하지 않은 경우
            selectedValueName === ""
              ? {
                  [Object.keys(labelFileDetail.labelData)[0]]: null,
                }
              : {
                  // 클래스를 선택한 경우
                  [Object.keys(
                    labelFileDetail.labelData
                  )[0]]: selectedValueName,
                };

          let labelToPostInfo = [
            {
              labelproject: labelProjectId,
              status: "done",
              labeltype: workapp,
              sthreefile: labelFileDetail.id,
              labelclass: parseInt(selectedValueId),
              ismagictool: false,
              structuredData,
            },
          ];

          await api
            .postLabels(labelToPostInfo)
            .then(async (res) => {
              // console.log("라벨이 없는 상태에서 저장 했을 때");
              isSavingSuccess = true;

              await setObjectStatus(buttonType);
              return isSavingSuccess;
            })
            .catch((e) => {
              isSavingSuccess = false;
              if (
                process.env.REACT_APP_ENTERPRISE !== "true" &&
                e.response &&
                e.response.status === 402
              ) {
                var tempUrl = `http://localhost:3000/`;
                setIsCardRequestError(true);

                if (process.env.REACT_APP_DEPLOY) {
                  tempUrl = `${process.env.REACT_APP_FRONTEND_URL}`;
                }

                if (process.env.REACT_APP_ENTERPRISE) {
                  tempUrl =
                    "http://" + window.location.host.split(":")[0] + ":13000/";
                }
                window.open(
                  `${tempUrl}admin/setting/payment/?cardRequest=true`,
                  "_blank"
                );
              }
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "죄송합니다. 일시적인 오류 발생으로 라벨링 파일 정보를 불러오는데 실패하였습니다."
                  )
                )
              );
              return isSavingSuccess;
            });
        }
      } else {
        // 아무것도 클릭하지 않고 저장 눌렀을 때
        await setObjectStatus(buttonType);
        return isSavingSuccess;
      }
    }
  };

  const goToPrevOrNextFilePage = async (buttonType, res) => {
    setIsNextOrPrevLoading(true);

    let fileHistoryCookieArr = Cookies.getCookie(
      `fileHistoryBy${labelProjectId}At${timeStamp}`
    ).split(",");
    let currentFileIdx = fileHistoryCookieArr.indexOf(labelFileId);
    let nextFileId = "";
    let prevFileId = "";

    if (buttonType === "next") {
      if (
        currentFileIdx !== -1 &&
        currentFileIdx === fileHistoryCookieArr.length - 1
      ) {
        nextFileId = res.data.nextSthreeFile.id;
        // console.log("현재 아이디가 포함되어 있으면서 마지막 파일인 경우");
      } else {
        nextFileId = fileHistoryCookieArr[currentFileIdx + 1];
        // console.log(
        //   "현재 아이디가 포함되어 있지 않거나 마지막 파일이 아닌 경우"
        // );
      }
    } else {
      prevFileId = fileHistoryCookieArr[currentFileIdx - 1];
    }

    let prevUrl =
      fileHistoryCookieArr[currentFileIdx - 1] !== undefined
        ? `/admin/${labelFileType}/${labelProjectId}/${prevFileId}/?token=${Cookies.getCookie(
            "jwt"
          )}&appStatus=${appStatus}&timeStamp=${timeStamp}`
        : "none";

    let nextUrl = `/admin/${labelFileType}/${labelProjectId}/${nextFileId}/?token=${Cookies.getCookie(
      "jwt"
    )}&appStatus=${appStatus}&timeStamp=${timeStamp}`;

    if (fileHistoryCookieArr[currentFileIdx + 1] === undefined) {
      if (res.data.nextSthreeFile.id === null) {
        nextUrl = "none";
      }
    }

    url = buttonType === "prev" ? prevUrl : nextUrl;

    // 다음 파일이 더 이상 없는 경우
    if (url === "none") {
      await setTimeout(() => {
        if (isSavingSuccess) {
          setFileStatus("");
          dispatch(
            openErrorSnackbarRequestAction(t("There are no labelable files."))
          );
          setIsSavingLoading(false);
          setIsNextOrPrevLoading(false);
          checkSaveNum = 0;
        } else {
          setFileStatus("");
          dispatch(
            openErrorSnackbarRequestAction(t("Sorry. please try again."))
          );
          setIsSavingLoading(false);
          setIsNextOrPrevLoading(false);
          checkSaveNum = 0;
        }
      }, [100]);
    } else {
      // 다음 파일이 존재하는 경우
      await setTimeout(() => {
        if (isSavingSuccess) {
          let keyword = buttonType === "prev" ? "이전" : "다음";

          dispatch(
            openSuccessSnackbarRequestAction(t(`${keyword} 행으로 이동합니다.`))
          );

          history.push(url);
          // checkSaveNum = 0;
          setFileStatus("");
        } else {
          dispatch(
            openErrorSnackbarRequestAction(t("Sorry. please try again."))
          );
          setIsContentLoading(false);
          setIsNextOrPrevLoading(false);
          setIsSavingLoading(false);
          setFileStatus("");
          checkSaveNum = 0;
        }
      }, [100]);
    }
  };

  const setObjectStatus = (buttonType) => {
    const structuredData =
      selectedValueName === ""
        ? {
            [Object.keys(labelFileDetail.labelData)[0]]: null,
          }
        : {
            [Object.keys(labelFileDetail.labelData)[0]]: selectedValueName,
          };

    api
      .setObjectStatus(
        labelFileDetail.id,
        "done",
        // user.me.email,
        appStatusForRequestValue,
        isReview,
        inspectionResult
      )
      .then((res) => {
        isSavingSuccess = true;
        dispatch(openSuccessSnackbarRequestAction(t("Saved.")));
        setLabelFileDetail({
          ...labelFileDetail,
          labelData: structuredData,
        });
        if (buttonType === "prev" || buttonType === "next") {
          goToPrevOrNextFilePage(buttonType, res);
        }
        setIsSavingLoading(false);
        // checkSaveNum = 0;
      })
      .catch((e) => {
        isSavingSuccess = false;
        dispatch(
          openErrorSnackbarRequestAction(t("Failed to save the file."))
        );
        setIsSavingLoading(false);
        // checkSaveNum = 0;
      });
  };

  const onChangeInputText = (e) => {
    setSelectedValueName(e.target.value);
    setSelectedValueId(e.target.value);
  };
  // };

  //TODO: 로딩 중에는 제출하기 대신 "로딩 중입니다." 출력, status="loading" 로 시작
  //TODO: 페이지 열리자 마자 /talknote/submit/ 엔드포인트를 요청해서 받아올 값이 있는지 확인
  //TODO: 받아올 값이 더 없는 경우 제출하기 대신 status="nomore" => "라벨링이 필요한 음성 인식 데이터가 현재 없습니다." 출력
  //TODO: 받아 왔을 경우 preview 에 값 입력해주고, 자동으로 음성 파일 재생하기
  //TODO: 재생하기 버튼 눌렀을 때 다시 재생하게 하기
  //TODO: 제출하기 버튼 눌렀을 때 라벨링 데이터 + 라벨링 아이디만 해서 올리기
  //TODO: 백엔드에서는 토큰으로 누가 보낸건지 확인하고, 라벨링 데이터 있는 경우 업데이트 해주고 빈 라벨 음성 데이터 반환해서 보내주고, 할당 된 경우 status = 1 로 잡기 + assignedTime 설정해서 1시간 이상 반환되지 않은 경우 status = 0 과 같이 새로 지급
  //TODO: 한 시간 이상 반환 되지 않아서 다른 라벨러가 먼저 한 경우 toast 로 "긴 시간 동안 작업하지 않아 다른 라벨러가 이미 작업하였습니다. 다음으로 넘어갑니다." 출력
  //TODO: B: preview sttdata에 비속어,공포물,음란물에 관한 데이터는 라벨링 하지 않고 넘어가게 하기
  //TODO: B: labelingvoice 테이블 만들고, id, status, voiceFileS3Path, from, to, previewSTTdata, submittedSTTData, submittedLabelerId, assignedTime, submittedTime, calllogId 정도로 만들어 놓기
  //TODO: B: 주기적으로 데몬으로 calllogs 에 있는 stt 데이터를 잘라서 labelingvoice 에 넣어줄 수 있도록 만들기 (실시간으로 자르면 서버 비용 날릴 가능성 높음)
  //TODO: B: 넣었으면 넣었다고 calllogs 에 업데이트 시켜주고, 데몬 돌아갈 때 모든 labelingvoice 가 바라보고 있는 calllogId 가 같은 것들의 status=100 일 때 합친 내용을 calllogs 에 업데이트 시켜주기

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Structured Labelling")} />
      <Container maxWidth="lg" style={{ padding: "0px" }}>
        {isNextOrPrevLoading ||
        isContentLoading ||
        isSavingLoading ||
        isClassesLoading ? (
          <div
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loading />
          </div>
        ) : (
          <Grid container item xs={12} justify="center">
            <Grid
              container
              item
              xs={12}
              justify="center"
              style={
                isReview
                  ? {
                      marginBottom: "0",
                    }
                  : {
                      marginBottom: "60px",
                    }
              }
            >
              <Grid
                container
                item
                xs={12}
                justify="center"
                alignItems="center"
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,.2)",
                }}
              >
                <Grid
                  container
                  item
                  xs={7}
                  justify="flex-start"
                  alignItems="center"
                  style={{ flexWrap: "nowrap" }}
                >
                  <Grid item>
                    <IconButton
                      aria-label="파일리스트"
                      onClick={onClickListButton}
                    >
                      <ListIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                  <Grid
                    item
                    style={{
                      width: "80%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {labelProjectName}
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  xs={5}
                  justify="flex-end"
                  alignItems="center"
                  style={{ flexWrap: "nowrap" }}
                >
                  <Button
                    className={
                      prevButtonDisabled
                        ? `${classes.defaultDisabledButton} ${classes.labeling_default_button}`
                        : `${classes.defaultOutlineButton} ${classes.labeling_default_button}`
                    }
                    style={{
                      width: "25%",
                      textTransform: "none",
                    }}
                    disabled={prevButtonDisabled}
                    onClick={() => saveLabel("prev")}
                    id="prevBtn"
                  >
                    {t("Previous")} (a)
                  </Button>
                  <Button
                    className={`${classes.defaultHighlightButton} ${classes.labeling_default_button}`}
                    style={{
                      width: "25%",
                      textTransform: "none",
                    }}
                    onClick={() => saveLabel("save")}
                    id="saveBtn"
                  >
                    {t("Save")} (s)
                  </Button>
                  <Button
                    className={`${classes.defaultOutlineButton} ${classes.labeling_default_button}`}
                    style={{
                      width: "25%",
                      marginRight: "16px",
                      textTransform: "none",
                    }}
                    onClick={() => saveLabel("next")}
                    id="nextBtn"
                  >
                    {t("Next")} (d)
                  </Button>
                  <Language />
                </Grid>
              </Grid>
            </Grid>
            {isReview && (
              <Grid
                container
                item
                xs={12}
                justify="center"
                style={{
                  marginBottom: "60px",
                }}
              >
                <Grid
                  container
                  item
                  xs={12}
                  justify="space-between"
                  alignItems="center"
                  style={{ padding: "12px 0" }}
                >
                  <Grid
                    container
                    item
                    xs={4}
                    justify="flex-start"
                    alignItems="center"
                  >
                    <Grid item>
                      <PlaylistAddCheckIcon
                        style={{
                          fontSize: "59",
                          padding: "0 12px",
                          color: "var(--textWhite87) !important",
                        }}
                      />
                    </Grid>
                    <Grid item>{t("Inspection Result")}</Grid>
                  </Grid>
                  <Grid
                    container
                    item
                    xs
                    justify="flex-end"
                    alignItems="center"
                  >
                    <FormControl component="fieldset" style={{ width: "100%" }}>
                      <RadioGroup
                        aria-label="model-types"
                        name="model-types"
                        value={inspectionResult}
                        onChange={handleChange}
                        row
                        style={{ justifyContent: "flex-end" }}
                      >
                        <FormControlLabel
                          value="1"
                          control={
                            <Radio
                              classes={{
                                root: radioClasses.radio,
                                checked: radioClasses.checked,
                              }}
                              checked={inspectionResult === "1"}
                            />
                          }
                          className={
                            inspectionResult === "1"
                              ? classes.defaultHighlightButton
                              : classes.defaultOutlineButton
                          }
                          style={{
                            justifyContent: "center",
                            height: "30px",
                          }}
                          label={t("Pass")}
                          labelPlacement="left"
                        />
                        <FormControlLabel
                          value="2"
                          control={
                            <Radio
                              classes={{
                                root: radioClasses.radio,
                                checked: radioClasses.checked,
                              }}
                              checked={inspectionResult === "2"}
                            />
                          }
                          className={
                            inspectionResult === "2"
                              ? classes.defaultHighlightButton
                              : classes.defaultOutlineButton
                          }
                          style={{
                            justifyContent: "center",
                            height: "30px",
                            marginLeft: "12px",
                          }}
                          label={t("Reject")}
                          labelPlacement="left"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      marginLeft: "8px",
                      fontSize: "13px",
                      color: "red",
                    }}
                  >
                    {t(
                      "* '반려'할 경우 기존의 라벨 데이터가 모두 삭제되며, 복구 불가능한 점 유의바랍니다."
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )}
            <Grid
              container
              item
              xs={12}
              justify="center"
              style={{ marginBottom: "120px" }}
            >
              <Grid
                container
                xs={10}
                justify="center"
                style={{ marginBottom: "20px" }}
              >
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <TableContainer
                    component={Paper}
                    style={{ margin: "32px 0 20px", padding: "50px 0" }}
                  >
                    <Table aria-label="caption table">
                      <caption className="sr-only">
                        정형화 할 데이터 목록입니다.
                      </caption>
                      <TableHead>
                        <TableRow>
                          {Object.keys(labelFileDetail.rawData).map(
                            (key, i) => (
                              <TableCell
                                key={i}
                                align="center"
                                style={{
                                  color: "var(--textWhite)",
                                  fontSize: "16px",
                                }}
                              >
                                {key}
                              </TableCell>
                            )
                          )}
                          <TableCell
                            align="center"
                            style={{
                              color: "var(--textWhite)",
                              fontSize: "16px",
                            }}
                          >
                            {Object.keys(labelFileDetail.labelData)[0]}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          {Object.values(labelFileDetail.rawData).map(
                            (value, i) => (
                              <TableCell
                                key={i}
                                align="center"
                                style={{ color: "var(--textWhite)" }}
                              >
                                {value}
                              </TableCell>
                            )
                          )}
                          <TableCell
                            align="center"
                            style={{
                              color: "var(--textWhite)",
                              backgroundColor: "#0A84FF",
                            }}
                          >
                            {selectedValueName !== null
                              ? selectedValueName
                              : ""}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              <Grid container item xs={10} justify="center" alignItems="center">
                <Grid
                  item
                  xs={12}
                  style={{
                    textAlign: "center",
                    color: "var(--textWhite)",
                    marginBottom: "36px",
                    fontSize: "28px",
                  }}
                >
                  {`"${Object.keys(labelFileDetail.labelData)[0]}"`}
                </Grid>
                <Grid container spacing={3} justify="center">
                  {workapp === "normal_classification" ? (
                    Object.entries(labelClasses).map((labelClass) => (
                      <Grid
                        item
                        justify="center"
                        style={{ marginBottom: "10px" }}
                      >
                        <Button
                          variant="outlined"
                          style={
                            selectedValueName === labelClass[1].name
                              ? {
                                  border: `3px solid ${labelClass[1].color}`,
                                  color: "#FFFFFF",
                                  width: "100%",
                                  // backgroundColor: `${labelClass[1].color}`,
                                  backgroundColor: "#0A84FF",
                                  textTransform: "none",
                                }
                              : {
                                  border: `3px solid ${labelClass[1].color}`,
                                  color: "#FFFFFF",
                                  width: "100%",
                                  textTransform: "none",
                                }
                          }
                          onClick={onSelectClass}
                          value={labelClass[1].id}
                          name={labelClass[1].name}
                        >
                          {labelClass[1].name}
                        </Button>
                      </Grid>
                    ))
                  ) : (
                    <Grid item>
                      <TextField
                        variant="outlined"
                        inputProps={{
                          className: classes.labeling_structure_linear_button,
                        }}
                        style={{ color: "#FFFFFF" }}
                        // placeholder="linear input"
                        value={selectedValueName}
                        onChange={onChangeInputText}
                        ref={textInput}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isListModalOpen}
          onClose={closeListModal}
          className={modalClasses.modalContainer}
        >
          <div className={modalClasses.modalContent}>
            <div className={modalClasses.title}>
              <div>{t("file list")}</div>
            </div>
            <div className={modalClasses.lists} style={{ height: "77%" }}>
              {labelFiles &&
                labelFiles.map((file, i) => {
                  return (
                    <div
                      className={modalClasses.imageContainer}
                      onClick={() => {
                        onGoToSelectedPage(file.id);
                      }}
                      style={
                        file.id === labelFileId
                          ? {
                              fontWeight: "bold",
                              background: "rgba(33, 150, 243, 0.2)",
                            }
                          : null
                      }
                    >
                      <div>row{(page - 1) * 10 + (i + 1)}</div>
                    </div>
                  );
                })}
              {labelFiles.length === 0 && (
                <div>{t(`'${appStatusTxt}'인 상태의 행이 없습니다.`)}</div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
                zIndex: "1000",
              }}
            >
              <Pagination
                count={totalLength ? Math.ceil(totalLength / listCnt) : 0}
                page={page}
                size="small"
                onChange={onChangeListPage}
                classes={{ ul: classes.paginationNum }}
              />
            </div>
            <div
              className={modalClasses.title}
              style={{ justifyContent: "flex-end" }}
            >
              <Button
                onClick={() => {
                  setIsListModalOpen(false);
                }}
              >
                CLOSE
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          open={isLoadingModalOpen}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loading />
        </Modal>
      </Container>
    </>
  );
};

export default React.memo(LabelStructure);
