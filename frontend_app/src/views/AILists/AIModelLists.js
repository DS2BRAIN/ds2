import React, { useState, useEffect, useRef } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Modal from "@material-ui/core/Modal";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import Loading from "components/Loading/Loading.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem.js";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { DropzoneArea } from "material-ui-dropzone";
import LinearProgress from "@material-ui/core/LinearProgress";
import JSONPretty from "react-json-pretty";
import Cookies from "helpers/Cookies";
import ForwardIcon from "@material-ui/icons/Forward";
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import InputBase from "@material-ui/core/InputBase";
import GridFullContainer from "components/Grid/GridFullContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { updatePredictCountRequestAction } from "redux/reducers/user.js";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import Plans from "components/Plans/Plans.js";
import CheckIcon from "@material-ui/icons/Check";
import { currentThemeColor } from "assets/jss/custom.js";
import { ReactTitle } from "react-meta-tags";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import { fileurl } from "controller/api";
import { openChat } from "components/Function/globalFunc";
let sortObj = { name: "up", displayName: "up", projectName: "up" };
const MOVIE_RECOMMENDATION_ID = 18;
const ACADEMY_RECOMMENDATION_ID = 17;

const AIModelLists = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const { t } = useTranslation();

  const [externalAIModels, setExternalAIModels] = useState([]);
  const [favoriteModels, setFavoriteModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modelPage, setModelPage] = useState(0);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);
  const [modelPageChanged, setModelPageChanged] = useState(true);

  const [sortValue, setSortValue] = useState("");
  const [isSortObjChanged, setIsSortObjChanged] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ocr");
  const [uploadFile, setUploadFile] = useState(null);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [apiLoading, setApiLoading] = useState("");
  const [completed, setCompleted] = useState(0);
  const [objectJson, setObjectJson] = useState(null);
  const [selectedOcrModel, setSelectedOcrModel] = useState({});
  const [predictType, setPredictType] = useState("");
  const [inputText, setInputText] = useState("");
  const [isOcrExplanationOpen, setIsOcrExplanationOpen] = useState(false);
  const [develpedModelsDict, setDevelopedModelsDict] = useState({});
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [myDevelopedModels, setMyDevelopedModels] = useState(null);
  const [myDevelopedModelsId, setMydevelopedModelsId] = useState({});
  const [
    myDevelopedModelsIdbyTypeId,
    setMydevelopedModelsIdbyTypeId,
  ] = useState({});
  const [paramsValue, setParamsValue] = useState({
    grade_id: null,
    school_id: null,
    type: "",
    school_jibun_address1: "",
    subject: "",
    channel: "",
  });
  const [isParamsChanged, setIsParamsChanged] = useState(false);
  const [movieRecommendValue, setMovieRecommendValue] = useState(0);
  const [loadingMesseage, setLoadingMessage] = useState(t("Predicting"));

  const url = window.location.href;
  let ref = useRef();
  const anomalyDetection = fileurl + "asset/front/img/anomalyDetection.png";
  const faceRecognition = fileurl + "asset/front/img/faceRecognition.png";
  const logoBlue = fileurl + "asset/front/img/logo_title.png";
  const Dance = fileurl + "asset/front/img/dance.mp4";

  useEffect(() => {
    (async () => {
      if (user.me) {
        await setIsLoading(true);
        //await getOCRModelData();
        //await getFavoriteModelData();
        await getDevelopedModelData();
        // await setIsLoading(false);
      }
    })();
  }, [user.me && url]);

  useEffect(() => {
    if (messages.shouldCloseModal) closeModalAction();
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (isSortObjChanged) setIsSortObjChanged(false);
  }, [isSortObjChanged]);

  useEffect(() => {
    if (completed && apiLoading === "loading") {
      const tempCompleted = completed + 5;
      if (completed >= 95) {
        return;
      }
      if (completed < 40) {
        if (completed >= 10)
          setLoadingMessage(
            t(
              "모델 다운로드 중입니다. 모델 파일 크기에 따라 3~5 분 이상 소요될 수 있습니다."
            )
          );
        setTimeout(() => {
          setCompleted(tempCompleted);
        }, 3000);
      } else if (completed < 80) {
        setTimeout(() => {
          setCompleted(tempCompleted);
        }, 5000);
      } else {
        setTimeout(() => {
          setCompleted(tempCompleted);
        }, 10000);
      }
    }
  }, [completed]);

  useEffect(() => {
    if (isParamsChanged) setIsParamsChanged(false);
  }, [isParamsChanged]);

  const closeModalAction = () => {
    setParamsValue({
      grade_id: null,
      school_id: null,
      type: "",
      school_jibun_address1: "",
      subject: "",
      channel: "",
    });
    setUploadFile(null);
    setObjectJson(null);
    setApiLoading("");
    setInputText("");
    setIsOcrModalOpen(false);
  };

  const onSetSelectedTab = async (value) => {
    setSelectedTab(value);
  };

  const getOCRModelData = () => {
    api
      .getExternalAi()
      .then((res) => {
        const data = res.data;
        data.sort((prev, next) => {
          let n = next["displayName"] ? next["displayName"] : "";
          let p = prev["displayName"] ? prev["displayName"] : "";
          return n.localeCompare(p, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        setExternalAIModels(res.data);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
              )
            )
          );
        }
      });
  };

  const getDevelopedModelData = () => {
    api
      .getDevelopedAiModels()
      .then((res) => {
        let tempDevelopedModels = {};
        let tempDevelopedModelsId = {};
        let tempDevelopedModelsIdbyTypeId = {};
        res.data.forEach((model) => {
          tempDevelopedModelsId[model.modelName] = model.id;
          tempDevelopedModelsIdbyTypeId[model.modeltype.id] = model.id;
          tempDevelopedModels[model.modeltype.id] = model.status;
        });
        setDevelopedModelsDict(tempDevelopedModels);
        setMyDevelopedModels(res.data);
        setMydevelopedModelsId(tempDevelopedModelsId);
        setMydevelopedModelsIdbyTypeId(tempDevelopedModelsIdbyTypeId);
      })
      .then(() => {
        setIsLoading(false);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 일시적인 오류가 발생하였습니다. 다시 시도해주세요."
              )
            )
          );
        }
      });
  };

  const getFavoriteModelData = () => {
    api
      .getFavoriteModels()
      .then((res) => {
        const data = res.data;
        data.sort((prev, next) => {
          let n = next["name"] ? next["name"] : "";
          let p = prev["name"] ? prev["name"] : "";
          return n.localeCompare(p, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        setFavoriteModels(data);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 즐겨찾기 목록을 가져오는데 실패했습니다. 잠시후 다시 시도해주세요."
              )
            )
          );
        }
      });
  };

  const onClickForFavorite = (isTrue, id) => {
    api
      .setFavoriteModel(isTrue, id)
      .then((res) => {
        setFavoriteModels(
          favoriteModels.filter(
            (model, i) => model.id !== parseInt(res.data.modelId)
          )
        );
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 즐겨찾기 추가에 실패했습니다. 잠시후 다시 시도해주세요."
              )
            )
          );
        }
      });
  };

  const openModal = async (model, item) => {
    history.push({
      pathname: `/admin/process/${model.project}?model=${model.id}&page=${item}`,
      state: { modelid: model.id, page: item },
    });
  };

  const changeModelPage = (event, newPage) => {
    setModelPage(newPage);
  };

  const changeRowsPerModelPage = (event) => {
    setRowsPerModelPage(+event.target.value);
    setModelPage(0);
  };

  const onSetSortValue = async (value) => {
    await setIsLoading(true);
    await onSortObjChange(value);
    await setIsSortObjChanged(true);
    await setIsLoading(false);
  };

  const onSortObjChange = (value) => {
    const sortedModels =
      selectedTab === "ocr" ? myDevelopedModels : favoriteModels;
    if (sortObj[value] === "up") {
      for (let index in sortObj) {
        sortObj[index] = "down";
      }
      sortedModels.sort((prev, next) => {
        let n = next[value] ? next[value] : "";
        let p = prev[value] ? prev[value] : "";
        return p.localeCompare(n, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    } else {
      for (let index in sortObj) {
        if (index === value) {
          sortObj[index] = "up";
        } else {
          sortObj[index] = "down";
        }
      }
      sortedModels.sort((prev, next) => {
        let n = next[value] ? next[value] : "";
        let p = prev[value] ? prev[value] : "";
        return n.localeCompare(p, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    }
    if (selectedTab === "ocr") {
      setExternalAIModels(sortedModels);
    } else {
      setFavoriteModels(sortedModels);
    }
    setSortValue(value);
  };

  const onOpenOcrModal = (model, prType) => {
    setIsOcrExplanationOpen(false);
    setSelectedOcrModel(model);
    setPredictType(prType);
    setIsOcrModalOpen(true);
  };

  const sendDevelopedAPI = async () => {
    await setApiLoading("loading");
    await setCompleted(5);
    if (selectedOcrModel.id === MOVIE_RECOMMENDATION_ID) {
      await predictDevelopedText(
        myDevelopedModelsIdbyTypeId[MOVIE_RECOMMENDATION_ID],
        { user_id: parseInt(movieRecommendValue) }
      );
    } else if (selectedOcrModel.id === ACADEMY_RECOMMENDATION_ID) {
      await predictDevelopedText(
        myDevelopedModelsIdbyTypeId[ACADEMY_RECOMMENDATION_ID],
        paramsValue
      );
    } else {
      await postDevelopedAiFile();
    }
  };

  const predictDevelopedText = async (id, value) => {
    await api
      .postDevelopedAiText(id, value)
      .then((res) => {
        setObjectJson(res.data);
        dispatch(updatePredictCountRequestAction());
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Sorry, we could not parse the values ​​you entered.")
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };

  const postDevelopedAiFile = async () => {
    if (!uploadFile) return;
    await api
      .postDevelopedAiFile(
        myDevelopedModelsId[selectedOcrModel.externalAiName],
        uploadFile[0]
      )
      .then((res) => {
        setObjectJson(res.data);
        dispatch(updatePredictCountRequestAction());
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 업로드하신 파일을 분석하지 못했습니다. 다른 파일을 업로드해주세요."
              )
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };

  const sendAPI = async () => {
    if (selectedOcrModel.externalAiType === "text" && predictType === "each") {
      if (!inputText || inputText.length === 0) {
        dispatch(
          openErrorSnackbarRequestAction(t("Please enter the text and proceed"))
        );
        return;
      }
    } else {
      if (!uploadFile || uploadFile.length < 1) {
        dispatch(
          openErrorSnackbarRequestAction(t("Please upload the file and proceed"))
        );
        return;
      }
    }
    await setApiLoading("loading");
    await setCompleted(5);
    if (predictType === "all") {
      await predictAll();
    } else {
      if (selectedOcrModel.externalAiType === "text") {
        if (selectedOcrModel.externalAiName === "polly") {
          await pollyPredict();
        } else {
          await textPredict();
        }
      } else {
        await imagePredict();
      }
    }
  };

  const pollyPredict = async () => {
    await api
      .postTextApi(inputText, selectedOcrModel.externalAiName)
      .then((res) => {
        const url = res.data.s3Url;
        const link = document.createElement("a");
        link.href = url;
        link.download = "polly.mp3";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setObjectJson(t("The voice file has been downloaded"));
      })
      .then(() => {
        dispatch(updatePredictCountRequestAction());
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Sorry, we were unable to analyze the text you entered")
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };
  const textPredict = async () => {
    await api
      .postTextApi(inputText, selectedOcrModel.externalAiName)
      .then((res) => {
        setObjectJson(res.data);
        dispatch(updatePredictCountRequestAction());
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Sorry, we were unable to analyze the text you entered")
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };

  const imagePredict = async () => {
    await api
      .postImageApi(uploadFile[0], selectedOcrModel.externalAiName)
      .then((res) => {
        setObjectJson(res.data);
        dispatch(updatePredictCountRequestAction());
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 업로드하신 파일을 분석하지 못했습니다. 다른 파일을 업로드해주세요."
              )
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };

  const predictAll = async () => {
    await api
      .postTextAllApi(uploadFile[0], selectedOcrModel.externalAiName)
      .then((res) => {
        if (res.status === 201) {
          dispatch(
            openSuccessSnackbarRequestAction(
              t("Batch prediction has started. You will see when it is completed in the notification center")
            )
          );
          dispatch(updatePredictCountRequestAction());
        }
      })
      .catch((e) => {
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        }
        if (e.response && e.response.status === 429) {
          apiRateExceedError();
          return;
        }
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t(
                "죄송합니다, 업로드하신 파일을 분석하지 못했습니다. 다른 파일을 업로드해주세요."
              )
            )
          );
        }
        setApiLoading("");
      })
      .finally(() => {
        setApiLoading("done");
        setCompleted(0);
        setApiLoading("예측중입니다.");
      });
  };

  const apiRateExceedError = () => {
    dispatch(
      openErrorSnackbarRequestAction(
        t("You have been logged out due to exceeded API requests, please log in again")
      )
    );
    setTimeout(() => {
      Cookies.deleteAllCookies();
      history.push("/signin/");
    }, 2000);
  };

  const showOCRTable = () => {
    return (
      <>
        <ReactTitle title={"DS2.ai - " + t("AI Products")} />
        <GridContainer
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            fontSize: 16,
            marginBottom: "20px",
          }}
        >
          <GridItem xs={6} lg={8}>
            <b>** {t("External AI consumes 100 units per prediction")}</b>
          </GridItem>
          <GridItem xs={3} lg={2}></GridItem>
          <GridItem xs={3} lg={2} style={{ display: "flex" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              {/* <div style={{ width: "100%" }}>
                <div>{t("Total number of predictions")}</div>
                <LinearProgress
                  variant="determinate"
                  color="blue"
                  value={
                    (+user.me.cumulativePredictCount /
                      (+user.me.remainPredictCount +
                        +user.me.usageplan.noOfPrediction *
                          (user.me.dynos ? +user.me.dynos : 1) +
                        +user.me.additionalPredictCount)) *
                    100
                  }
                />
                <div id="predictCountDiv" className="predictCountDiv">
                  {user.me.cumulativePredictCount.toLocaleString()} /{" "}
                  {(
                    +user.me.remainPredictCount +
                    +user.me.usageplan.noOfPrediction *
                      (user.me.dynos ? +user.me.dynos : 1) +
                    +user.me.additionalPredictCount
                  ).toLocaleString()}{" "}
                  {t("")}
                </div>
              </div> */}
            </div>
          </GridItem>
        </GridContainer>
        <Table
          className={classes.table}
          stickyheader="true"
          aria-label="sticky table"
        >
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "15%", cursor: "pointer" }}
              ></TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "25%", cursor: "pointer" }}
              >
                {/* <div className={classes.tableHeader} style={{marginLeft:'10%'}}>
                                    {sortValue === 'displayName' &&
                                    (sortObj[sortValue] === 'down' ? <ArrowUpwardIcon fontSize='small'/>
                                    : <ArrowDownwardIcon fontSize='small' />)} */}
                <div className={classes.tableHeader}>
                  <b>{t("Model")}</b>
                </div>
                {/* </div> */}
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "35%" }}
              >
                <div className={classes.tableHeader}>
                  <b>{t("Summary")}</b>
                </div>
              </TableCell>
              {/* <TableCell className={classes.tableHead} align="center" style={{width: '10%', cursor: 'pointer'}}
                                       onClick={()=>onSetSortValue('externalAiType')}>
                                <div className={classes.tableHeader} style={{marginLeft:'10%'}}>
                                    {sortValue === 'externalAiType' &&
                                    (sortObj[sortValue] === 'down' ? <ArrowUpwardIcon fontSize='small'/>
                                    : <ArrowDownwardIcon fontSize='small' />)}
                                    {t('Type')}
                                </div>
                            </TableCell> */}
              <TableCell
                className={classes.tableHead}
                style={{ width: "25%" }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {myDevelopedModels &&
              myDevelopedModels
                .slice(
                  modelPage * rowsPerModelPage,
                  modelPage * rowsPerModelPage + rowsPerModelPage
                )
                .map((model, idx) => {
                  const id = model.id;
                  return (
                    <TableRow
                      className={classes.tableRow}
                      key={model.name + idx}
                      style={{
                        background:
                          idx % 2 === 0
                            ? currentTheme.tableRow1
                            : currentTheme.tableRow2,
                      }}
                    >
                      <TableCell className={classes.tableRowCell} align="left">
                        <img
                          src={model.modeltype.imageUrl}
                          style={{ width: "50px", marginLeft: "20%" }}
                        />
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="left">
                        {t(model.modeltype.displayName)}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="left">
                        {t(model.modeltype.externalAiSummary)}
                      </TableCell>
                      {/* <TableCell className={classes.tableRowCell} align="left" >{t(model.externalAiType)}</TableCell> */}
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <GridItem xs={6} lg={6}>
                            <Button
                              className={`${classes.defaultOutlineButton} predictBtn`}
                              onClick={() => {
                                onOpenOcrModal(model.modeltype, "each");
                              }}
                            >
                              {model.externalAiType === "model"
                                ? t("Try")
                                : t("Single prediction")}
                            </Button>
                          </GridItem>
                          <GridItem xs={6} lg={6}></GridItem>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={myDevelopedModels.length}
          rowsPerPage={rowsPerModelPage}
          page={modelPage}
          backIconButtonProps={{
            "aria-label": "previous page",
          }}
          nextIconButtonProps={{
            "aria-label": "next page",
          }}
          onChangePage={changeModelPage}
          onChangeRowsPerPage={changeRowsPerModelPage}
        />
      </>
    );
  };

  const dropFilesReject = (type) => {
    dispatch(
      openErrorSnackbarRequestAction(
        `${t("Invalid file type")} ${t(
          type + "파일만 업로드 가능합니다."
        )}`
      )
    );
  };

  const dropFiles = () => {
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
  };

  const deleteFiles = () => {
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
  };

  const handelFileChange = (files) => {
    setUploadFile(
      files.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  };

  const onChangeTextInput = (e) => {
    setInputText(e.target.value);
  };

  const onSetTextFocus = () => {
    ref.current.focus();
  };

  const changeParamValue = (event) => {
    const tempParams = paramsValue;
    const id = event.target.id;
    let value = event.target.value;
    if (id === "grade_id" || id === "school_id") {
      if (value.length !== 0) {
        value = parseInt(value);
        if (!value) {
          return;
        }
      }
    }
    for (const param in tempParams) {
      if (param === event.target.id) {
        tempParams[event.target.id] = value;
      }
    }
    setParamsValue(tempParams);
    setIsParamsChanged(true);
  };
  const changeMovieRecommendValue = (event) => {
    setMovieRecommendValue(event.target.value);
  };

  const renderContents = () => {
    if (selectedOcrModel.externalAiType === "text") {
      if (predictType === "each") {
        return (
          <div
            style={{
              height: "250px",
              overflow: "auto",
              paddingTop: "20px",
              border: "1px solid #999999",
            }}
            onClick={onSetTextFocus}
          >
            <InputBase
              style={{ width: "100%", color: currentThemeColor.textWhite87 }}
              value={inputText}
              autoFocus={true}
              onChange={onChangeTextInput}
              multiline={true}
              inputRef={ref}
            />
          </div>
        );
      } else {
        const acceptedFiles = [".txt", ".csv"];
        if (uploadFile && uploadFile.length > 0) {
          return (
            <div style={{ minHeight: "250px", paddingTop: "20px" }}>
              <div>
                {t("Upload file")} : {uploadFile[0].name}
              </div>
            </div>
          );
        } else {
          return (
            <div id="imagePredict">
              <DropzoneArea
                onChange={handelFileChange}
                onDropRejected={() => {
                  dropFilesReject("텍스트");
                }}
                onDrop={dropFiles}
                onDelete={deleteFiles}
                acceptedFiles={acceptedFiles}
                showPreviews={false}
                showPreviewsInDropzone={false}
                maxFileSize={2147483648}
                dialogTitle={t("Upload text")}
                dropzoneText={t(
                  "드래그 앤 드롭으로 텍스트(txt/csv) 파일을 업로드해주세요."
                )}
                filesLimit={1}
                maxWidth={"xs"}
                fullWidth={false}
                showAlerts={false}
              />
            </div>
          );
        }
      }
    } else {
      if (selectedOcrModel.externalAiType === "image") {
        const acceptedFiles = [".jpg", ".jpeg", ".png"];
        if (uploadFile && uploadFile.length > 0) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
              }}
            >
              <img
                src={uploadFile[0].preview}
                style={{ width: "100%", maxHeight: "28em" }}
              />
            </div>
          );
        } else {
          return (
            <div id="imagePredict">
              <DropzoneArea
                id="imageDropZone"
                onChange={handelFileChange}
                onDropRejected={() => {
                  dropFilesReject("이미지");
                }}
                onDrop={dropFiles}
                onDelete={deleteFiles}
                acceptedFiles={acceptedFiles}
                showPreviews={false}
                showPreviewsInDropzone={false}
                maxFileSize={2147483648}
                dialogTitle={t("Upload image")}
                dropzoneText={t(
                  "드래그 앤 드롭으로 이미지 파일을 업로드해주세요."
                )}
                filesLimit={1}
                maxWidth={"xs"}
                fullWidth={false}
                showAlerts={false}
              />
            </div>
          );
        }
      } else if (
        selectedOcrModel.externalAiType === "audio" ||
        selectedOcrModel.externalAiType === "voice"
      ) {
        const acceptedFiles = [".mp4", ".mp3", ".wav", ".flac"];
        if (uploadFile && uploadFile.length > 0) {
          return (
            <div
              style={{
                display: "flex",
                minHeight: "250px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <audio controls>
                <source src={uploadFile[0].preview} type="audio/mpeg" />
              </audio>
            </div>
          );
        } else {
          return (
            <div id="imagePredict">
              <DropzoneArea
                onChange={handelFileChange}
                onDropRejected={() => {
                  dropFilesReject("오디오");
                }}
                onDrop={dropFiles}
                onDelete={deleteFiles}
                acceptedFiles={acceptedFiles}
                showPreviews={false}
                showPreviewsInDropzone={false}
                maxFileSize={2147483648}
                dialogTitle={t("Upload audio")}
                dropzoneText={t(
                  "드래그 앤 드롭으로 오디오 파일('mp4','mp3','wav','flac')을 업로드해주세요."
                )}
                filesLimit={1}
                maxWidth={"xs"}
                fullWidth={false}
                showAlerts={false}
              />
            </div>
          );
        }
      }
    }
  };

  const resetPredict = () => {
    setUploadFile(null);
    setObjectJson(null);
    setApiLoading("");
  };
  const resetDevelopedAIPredict = () => {
    setUploadFile(null);
    setParamsValue({
      grade_id: 0,
      school_id: 0,
      type: "",
      school_jibun_address1: "",
      subject: "",
      channel: "",
    });
    setObjectJson(null);
    setApiLoading("");
  };

  const onOpenChatbot = () => {
    setIsOcrModalOpen(false);
    openChat();
  };

  const getParamsName = (param) => {
    switch (param) {
      case "grade_id":
        return "학생 GRADE_ID";
      case "school_id":
        return "학생 SCHOOL_ID";
      case "type":
        return "학생 GRADE";
      case "school_jibun_address1":
        return "학교 ADDRESS";
      case "subject":
        return "과목";
      case "channel":
        return "선호하는 채널";
      default:
        return "";
    }
  };

  const renderModelImages = () => {
    if (selectedOcrModel.id === MOVIE_RECOMMENDATION_ID) {
      return (
        <>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Input")}</b>
              </div>
            </div>
            <div className={classes.modelPredictColumnBox}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      className={classes.tableRowCell}
                      style={{ width: "30%" }}
                      align="center"
                    >
                      <b>KEY</b>
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      style={{ width: "70%" }}
                      align="center"
                    >
                      <b>VALUE</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow className={classes.tableRow}>
                    <TableCell
                      className={classes.tableRowCell}
                      align="center"
                      style={{ wordBreak: "keep-all", width: "50%" }}
                    >
                      user_id
                    </TableCell>
                    <TableCell className={classes.tableRowCell} align="center">
                      <TextField
                        placeholder={t("Enter the value.")}
                        type="number"
                        style={{
                          width: "50%",
                          wordBreak: "keep-all",
                          minWidth: "160px",
                        }}
                        autoFocus={true}
                        fullWidth={true}
                        value={movieRecommendValue}
                        onChange={changeMovieRecommendValue}
                        multiline={true}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </GridItem>
          <GridItem
            xs={2}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ForwardIcon fontSize="large" color={"primary"} />
          </GridItem>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Output")}</b>
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ alignSelf: "center", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    maxHeight: "28em",
                    overflowY: "auto",
                  }}
                >
                  <JSONPretty
                    id="json-pretty"
                    data={objectJson}
                    className={classes.predictResultJson}
                  ></JSONPretty>
                </div>
              </div>
            </div>
          </GridItem>
        </>
      );
    } else if (selectedOcrModel.id === ACADEMY_RECOMMENDATION_ID) {
      return (
        <>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Input")}</b>
              </div>
            </div>
            <div className={classes.modelPredictColumnBox}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      className={classes.tableRowCell}
                      style={{ width: "30%" }}
                      align="center"
                    >
                      <b>KEY</b>
                    </TableCell>
                    <TableCell
                      className={classes.tableRowCell}
                      style={{ width: "70%" }}
                      align="center"
                    >
                      <b>VALUE</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(paramsValue).map((param, idx) => (
                    <TableRow key={param + idx} className={classes.tableRow}>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                        style={{ wordBreak: "keep-all", width: "50%" }}
                      >
                        {getParamsName(param)}
                      </TableCell>
                      <TableCell
                        className={classes.tableRowCell}
                        align="center"
                      >
                        <TextField
                          placeholder={t("Enter the value.")}
                          type={
                            (param === "grade_id" || param === "school_id") &&
                            "number"
                          }
                          style={{
                            width: "50%",
                            wordBreak: "keep-all",
                            minWidth: "160px",
                          }}
                          autoFocus={idx === 0 ? true : false}
                          fullWidth={true}
                          id={param}
                          value={paramsValue[param]}
                          onChange={changeParamValue}
                          multiline={true}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GridItem>
          <GridItem
            xs={2}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ForwardIcon fontSize="large" color={"primary"} />
          </GridItem>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Output")}</b>
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ alignSelf: "center", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    maxHeight: "28em",
                    overflowY: "auto",
                  }}
                >
                  <JSONPretty
                    id="json-pretty"
                    data={objectJson}
                    className={classes.predictResultJson}
                  ></JSONPretty>
                </div>
              </div>
            </div>
          </GridItem>
        </>
      );
    } else {
      const acceptedFiles = [".jpg", ".jpeg", ".png"];
      return (
        <>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Input")}</b>
              </div>
            </div>
            {uploadFile && uploadFile.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}
              >
                <img
                  src={uploadFile[0].preview}
                  style={{ width: "100%", maxHeight: "28em" }}
                />
              </div>
            ) : (
              <div id="imagePredict">
                <DropzoneArea
                  id="imageDropZone"
                  onChange={handelFileChange}
                  onDropRejected={() => {
                    dropFilesReject("이미지");
                  }}
                  onDrop={dropFiles}
                  onDelete={deleteFiles}
                  acceptedFiles={acceptedFiles}
                  showPreviews={false}
                  showPreviewsInDropzone={false}
                  maxFileSize={2147483648}
                  dialogTitle={t("Upload image")}
                  dropzoneText={t(
                    "드래그 앤 드롭으로 이미지 파일을 업로드해주세요."
                  )}
                  filesLimit={1}
                  maxWidth={"xs"}
                  fullWidth={false}
                  showAlerts={false}
                />
              </div>
            )}
          </GridItem>
          <GridItem
            xs={2}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ForwardIcon fontSize="large" color={"primary"} />
          </GridItem>
          <GridItem xs={5}>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Output")}</b>
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              {apiLoading === "done" && (
                <div style={{ alignSelf: "center", width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      maxHeight: "28em",
                      overflowY: "auto",
                    }}
                  >
                    <JSONPretty
                      id="json-pretty"
                      data={objectJson}
                      className={classes.predictResultJson}
                    ></JSONPretty>
                  </div>
                </div>
              )}
            </div>
          </GridItem>
        </>
      );
    }
  };

  return (
    <div>
      <div className={classes.topTitle}>{t("AI Products")}</div>
      <div className={classes.subTitleText} style={{ marginBottom: "60px" }}>
        {t("Experience all features and services of CLICK AI.")}
      </div>
      {isLoading ? (
        <div className={classes.loading}>
          <Loading size={400} />
        </div>
      ) : myDevelopedModels && myDevelopedModels.length > 0 ? (
        showOCRTable()
      ) : (
        <>
          <div className={classes.externalAiContainer}>
            <div className={classes.externalAiDiv}>
              <img
                style={{ width: "150px", paddingBottom: "42px" }}
                src={logoBlue}
                alt={"logo"}
              />
              <div className={classes.externalAiTitle}>Prepared AI</div>
              <div>
                <div className={classes.externalAiContent}>
                  <div style={{ marginBottom: "8px" }}>
                    {t("Experience all features")}
                  </div>
                  <div>{t("and services of CLICK AI.")}</div>
                </div>
                <div className={classes.externalAiSubContent}>
                  {t(
                    "CLICK AI를 통해 개발한 프로젝트와 접목하여 인공지능의 성능을 향상시킬 수 있습니다."
                  )}
                </div>
                <div style={{ display: "flex", marginTop: "20px" }}>
                  <div style={{ width: "50%" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      Object Tracking
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      Abnormal Detecting
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      Face Detection
                    </div>
                  </div>
                  <div style={{ width: "50%" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      OCR
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      TTS (Text To Speak)
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <CheckIcon />
                      STT (Speak To Text)
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <video style={{ width: "calc(100% - 426px)" }} autoPlay loop>
              <source src={Dance} type="video/mp4" />
            </video>
          </div>
          <div className={classes.externalAibottomContainer}>
            <div className={classes.externalAibottomContent}>
              <div>{t("Upgrade to CLICK AI ENTERPRISE PLAN")}</div>
              <div>
                {t(
                  "준비된 인공지능뿐 아니라 더 많은 기능과 서비스를 누려보세요!"
                )}
              </div>
            </div>
            <div className={classes.alignCenterDiv}>
              {user.me &&
                user.me.usageplan &&
                user.me.usageplan.planName === "trial" && (
                  <Button
                    onClick={() => {
                      setIsPlanModalOpen(true);
                    }}
                    className={classes.planTriggerBtn}
                  >
                    <b>{t("Plan comparison")}</b>
                  </Button>
                )}
              <Button
                onClick={onOpenChatbot}
                className={classes.inquiryTriggerBtn}
              >
                <b>{t("Contact us")}</b>
              </Button>
            </div>
          </div>
        </>
      )}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
        }}
        className={classes.modalContainer}
      >
        <div className={classes.planModalContent}>
          <CloseIcon
            className={classes.closeImg}
            style={{ margin: "8px" }}
            onClick={() => {
              setIsPlanModalOpen(false);
            }}
          />
          <div className={classes.planModalTitle}>
            <div style={{ fontSize: "24px", marginBottom: "6px" }}>
              {t("Upgrade your plan!")}
            </div>
          </div>
          <Plans onOpenChatbot={onOpenChatbot} />
        </div>
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isOcrModalOpen}
        onClose={() => {
          dispatch(askModalRequestAction());
        }}
        className={classes.modalContainer}
      >
        {apiLoading === "loading" ? (
          <div
            className={classes.predictModalContent}
            style={{ minHeight: "410px" }}
          >
            {
              <div className={classes.loading}>
                <Loading size={400} />
                {
                  <>
                    <LinearProgress
                      style={{ width: "100%", marginTop: "20px" }}
                      variant="determinate"
                      value={completed}
                    />
                    <p className={classes.text}>
                      {loadingMesseage} {completed}% {t("Completed")}...{" "}
                    </p>
                  </>
                }
              </div>
            }
          </div>
        ) : (
          <div className={classes.predictModalContent}>
            <GridContainer style={{ padding: "0 15px" }}>
              <GridItem
                xs={12}
                style={{ marginBottom: "30px", marginTop: "12px" }}
              >
                <h3>
                  <b style={{ borderBottom: "2px solid #00d69e" }}>
                    {t(selectedOcrModel.displayName)}
                  </b>
                </h3>
                {selectedOcrModel.externalAiDescription
                  ? selectedOcrModel.externalAiDescription.includes("\\n")
                    ? selectedOcrModel.externalAiDescription
                        .split("\\n")
                        .map((sentence, idx) => {
                          return <div key={idx}>{t(sentence)}</div>;
                        })
                    : t(selectedOcrModel.externalAiDescription)
                  : ""}
              </GridItem>
              {selectedOcrModel.externalAiType === "model" ? (
                renderModelImages()
              ) : (
                <>
                  <GridItem xs={5}>
                    <div className={classes.content}>
                      <div className={classes.displayText}>
                        <b>{t("Input")}</b>
                      </div>
                    </div>
                    {selectedOcrModel && renderContents()}
                  </GridItem>
                  <GridItem
                    xs={2}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ForwardIcon fontSize="large" color={"primary"} />
                  </GridItem>
                  <GridItem xs={5}>
                    <div className={classes.content}>
                      <div className={classes.displayText}>
                        <b>{t("Output")}</b>
                      </div>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      {apiLoading === "done" && (
                        <div style={{ alignSelf: "center", width: "100%" }}>
                          <div
                            style={{
                              width: "100%",
                              maxHeight: "28em",
                              overflowY: "auto",
                            }}
                          >
                            <JSONPretty
                              id="json-pretty"
                              data={objectJson}
                              className={classes.predictResultJson}
                            ></JSONPretty>
                          </div>
                        </div>
                      )}
                    </div>
                  </GridItem>
                </>
              )}
            </GridContainer>
            <GridContainer>
              {selectedOcrModel.externalAiType === "model" ? (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    paddingTop: "20px",
                  }}
                >
                  {!develpedModelsDict[selectedOcrModel.id] ? (
                    <GridContainer style={{ width: "100%", padding: "20px" }}>
                      <GridItem xs={6}>
                        <Button
                          id="cancelBtn"
                          className={classes.defaultOutlineButton}
                          style={{ marginRight: "20px", width: "100%" }}
                          onClick={closeModalAction}
                        >
                          {t("Cancel")}
                        </Button>
                      </GridItem>
                      {!process.env.REACT_APP_ENTERPRISE && (
                        <GridItem xs={6}>
                          <Button
                            className={classes.defaultHighlightButton}
                            onClick={onOpenChatbot}
                            id="askBtn"
                          >
                            {t("Contact us")}
                          </Button>
                        </GridItem>
                      )}
                    </GridContainer>
                  ) : (
                    <GridContainer style={{ width: "100%", padding: "20px" }}>
                      <GridItem xs={4}>
                        <Button
                          id="cancelBtn"
                          className={classes.defaultOutlineButton}
                          style={{ marginRight: "20px", width: "100%" }}
                          onClick={closeModalAction}
                        >
                          {t("Cancel")}
                        </Button>
                      </GridItem>
                      <GridItem xs={4}>
                        <Button
                          className={classes.defaultOutlineButton}
                          style={{ width: "100%" }}
                          onClick={resetDevelopedAIPredict}
                        >
                          {t("Reset")}
                        </Button>
                      </GridItem>
                      <GridItem xs={4}>
                        <Button
                          className={classes.defaultHighlightButton}
                          style={{ width: "100%" }}
                          onClick={sendDevelopedAPI}
                          id="sendApiBtn"
                        >
                          {t("Run")}
                        </Button>
                      </GridItem>
                    </GridContainer>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    paddingTop: "20px",
                  }}
                >
                  <GridContainer style={{ width: "100%", padding: "20px" }}>
                    <GridItem xs={4}>
                      <Button
                        id="cancelBtn"
                        className={classes.defaultOutlineButton}
                        style={{ marginRight: "20px", width: "100%" }}
                        onClick={closeModalAction}
                      >
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={4}>
                      <Button
                        className={classes.defaultOutlineButton}
                        style={{ width: "100%" }}
                        onClick={resetPredict}
                      >
                        {t("Reset")}
                      </Button>
                    </GridItem>
                    <GridItem xs={4}>
                      <Button
                        className={classes.defaultHighlightButton}
                        style={{ width: "100%" }}
                        onClick={sendAPI}
                        id="sendApiBtn"
                      >
                        {t("Run")}
                      </Button>
                    </GridItem>
                  </GridContainer>
                </div>
              )}
            </GridContainer>
          </div>
        )}
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isOcrExplanationOpen}
        onClose={() => {
          setIsOcrExplanationOpen(false);
        }}
        className={classes.modalContainer}
      >
        {selectedOcrModel && (
          <div className={classes.cancelModalContent}>
            <GridContainer style={{ padding: "0 15px" }}>
              <GridItem xs={12}>
                <div className={classes.title}>
                  {t(selectedOcrModel.displayName)}
                </div>
              </GridItem>
              <GridItem xs={12}>
                <div
                  className={classes.content}
                  style={{ margin: "20px 0 10px" }}
                >
                  {t(selectedOcrModel.externalAiDescription)}
                </div>
              </GridItem>
            </GridContainer>
            <GridContainer>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                  paddingTop: "20px",
                }}
              >
                <GridItem xs={4}>
                  <Button
                    id="cancelBtn"
                    className={classes.defaultOutlineButton}
                    style={{ marginRight: "20px" }}
                    onClick={() => {
                      setIsOcrExplanationOpen(false);
                    }}
                  >
                    {t("Cancel")}
                  </Button>
                </GridItem>
                <GridItem xs={4}>
                  <GridItem xs={4}></GridItem>
                  <Button
                    className={`${classes.defaultOutlineButton} modalPredictBtn`}
                    onClick={() => {
                      onOpenOcrModal(selectedOcrModel, "each");
                    }}
                  >
                    {t("Single prediction")}
                  </Button>
                </GridItem>
              </div>
            </GridContainer>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(AIModelLists);
