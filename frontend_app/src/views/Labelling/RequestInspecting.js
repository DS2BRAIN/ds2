import React, { useEffect, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import InputBase from "@material-ui/core/InputBase";
import { useDispatch, useSelector } from "react-redux";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import CircularProgress from "@mui/material/CircularProgress";
import * as api from "controller/labelApi.js";
import Button from "components/CustomButtons/Button.js";

const RequestInspecting = (props) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resData, setResData] = useState({});
  const [requestLabelingContent, setRequestLabelingContent] = useState("");
  const [requestPhoneNumber, setRequestPhoneNumber] = useState("");
  const [step, setStep] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalCnt, setTotalCnt] = useState(0);
  const { close } = props;
  const regExp = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;

  const labelingTypes = {
    box: { name: "박스" },
    polygon: { name: "폴리곤" },
    audio: { name: "음성" },
    standard: { name: "일반" },
    natural: { name: "자연어" },
    single_image: { name: "이미지 분류" },
  };

  useEffect(() => {
    setIsLoading(true);
    api
      .getPrepareLabelsByLabelprojectId(labelprojects.projectDetail.id)
      .then((res) => {
        setResData(res.data);
        for (let x in res.data) {
          setTotalPrice((prev) => prev + res.data[x].total_price);
          setTotalCnt((prev) => prev + res.data[x].count);
        }
      })
      .catch((e) => {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Failed to fetch information.")
          )
        );
      });

    setIsLoading(false);
  }, [labelprojects.projectDetail.id]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      close();
    }
  }, [messages.shouldCloseModal]);

  const changeRequestLabelingContent = (e) => {
    setRequestLabelingContent(e.target.value);
  };

  const changeRequestPhoneNumber = (e) => {
    setRequestPhoneNumber(e.target.value);
  };

  const cancelRequestInspecting = () => {
    // close();
    switch (step) {
      case 0:
        dispatch(askModalRequestAction());
        break;
      case 1:
        close();
        break;
    }
  };

  const requestNextStep = () => {
    if (regExp.test(requestPhoneNumber) === false) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please enter your mobile number."))
      );
      return;
    }
    api
      .postRequestInspect({
        labelprojectId: labelprojects.projectDetail.id,
        phoneNumber: requestPhoneNumber,
        description: requestLabelingContent,
        labelType: 0,
        price: totalPrice,
        labelCount: totalCnt,
        requestType: "Inspection",
      })
      .then((res) => {
        setStep((prevStep) => prevStep + 1);
      })
      .catch((e) => {
        if (
          process.env.REACT_APP_ENTERPRISE !== "true" &&
          e.response &&
          e.response.status === 402
        ) {
          window.location.href = "/admin/setting/payment/?cardRequest=true";
          return;
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("A problem occurred during the inspection request.")
            )
          );
        }
      });
  };

  return isLoading ? (
    <>
      <CircularProgress size={20} sx={{ mb: 2 }} />
      <b>{t("Getting project information. please wait for a moment.")}</b>
    </>
  ) : (
    <>
      {step < 1 ? (
        <div className={classes.defaultModalContent}>
          <header>
            <h6
              style={{
                margin: "0 0 20px",
                fontWeight: "bold",
                fontSize: "17px",
              }}
            >
              라벨링 검수 의뢰하기
            </h6>
          </header>
          <main>
            {step === 0 && (
              <>
                <div>
                  <Grid
                    container
                    justify="space-between"
                    style={{ marginBottom: "24px" }}
                  >
                    <Grid item>현재 진행된 라벨링 건수</Grid>
                    <Grid item>{totalCnt.toLocaleString()} 건</Grid>
                  </Grid>
                </div>
                <div>
                  <label
                    for="requestLabelingContent"
                    style={{
                      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                      fontSize: "16px",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    상세 요청 내용 입력
                  </label>
                  <textarea
                    autoFocus
                    value={requestLabelingContent}
                    onChange={changeRequestLabelingContent}
                    placeholder={t(
                      "ex.신청한 라벨클래스 중 car, pannel은 각각 자동차와 보행자를 의미합니다.\n라벨링을 할 때 잘리는 부분이나 겹치는 부분이 있다면 다른 물체와 겹치더라도 풀 샷으로 라벨링 부탁드립니다."
                    )}
                    id="requestLabelingContent"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100px",
                      padding: "4px 8px",
                      border: "1px solid #999999",
                      overflow: "scroll",
                      color: "var(--textWhite87)",
                      wordBreak: "keep-all",
                      resize: "none",
                      background: "transparent",
                      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                      fontSize: "15px",
                      marginBottom: "24px",
                    }}
                  />
                </div>
                <div>
                  <label
                    for="requestPhoneNumber"
                    style={{
                      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                      fontSize: "16px",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    휴대폰 번호 입력*
                  </label>
                  <InputBase
                    autoFocus
                    label={t("Enter your phone number*")}
                    value={requestPhoneNumber}
                    onChange={changeRequestPhoneNumber}
                    placeholder={t("")}
                    id="requestPhoneNumber"
                    fullWidth
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #999999",
                      color: "var(--textWhite87)",
                    }}
                  />
                </div>
                <>
                  <Grid container direction="column">
                    <Grid item xs={12}>
                      <h4
                        style={{
                          paddingTop: "18px",
                          borderTop: "1px solid var(--textWhite87)",
                        }}
                      >
                        결제금액(월별 서비스 이용금액에 합산 청구)
                      </h4>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        direction="column"
                        style={{
                          height: "80px",
                          overflow: "scroll",
                          padding: "5px 10px",
                          border: "1px solid #999999",
                        }}
                      >
                        <Grid item>
                          {resData &&
                            Object.keys(resData).map((key) => (
                              <Grid
                                key={labelingTypes[key].name}
                                container
                                justify="space-between"
                              >
                                <Grid item>
                                  {labelingTypes[key].name} 라벨링 금액 (
                                  {resData[key].count.toLocaleString()}건):
                                </Grid>
                                <Grid item>
                                  {(
                                    resData[key].price * resData[key].count
                                  ).toLocaleString()}
                                  원 (건당 {resData[key].price}원)
                                </Grid>
                              </Grid>
                            ))}
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        style={{
                          marginTop: "18px",
                        }}
                      >
                        <Grid item xs={12}>
                          <Grid container justify="space-between">
                            <Grid item>총 결제예상금액:</Grid>
                            {/* <Grid item>{10 * selectedClassesCnt * 100}원</Grid> */}
                            <Grid item>{totalPrice.toLocaleString()}원</Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <b
                            style={{
                              fontWeight: "normal",
                              fontSize: "14px",
                            }}
                          >
                            *예상금액은 참고용 가격으로 컨설팅 이후 변경될 수
                            있습니다.
                          </b>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              </>
            )}
          </main>
          <footer style={{ marginTop: "24px" }}>
            <Grid container justify="flex-end" alignItems="center" spacing={1}>
              <Grid item>
                <Button
                  onClick={cancelRequestInspecting}
                  className={classes.defaultGreyOutlineButton}
                >
                  취소
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={requestNextStep}
                  className={classes.defaultGreyOutlineButton}
                >
                  검수요청
                </Button>
              </Grid>
            </Grid>
          </footer>
        </div>
      ) : (
        <Grid
          container
          className={classes.defaultModalContent}
          justify="space-between"
          alignItems="center"
          direction="column"
        >
          <Grid item style={{ padding: "80px 0" }}>
            라벨링 검수 의뢰가 완료되었습니다. 확인 후 빠르게 연락드리겠습니다.{" "}
          </Grid>
          <Grid item style={{ alignSelf: "flex-end" }}>
            <Button
              onClick={cancelRequestInspecting}
              className={classes.defaultGreyOutlineButton}
            >
              닫기
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default React.memo(RequestInspecting);
