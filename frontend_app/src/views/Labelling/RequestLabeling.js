import React, { useEffect, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import InputBase from "@material-ui/core/InputBase";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import { useDispatch, useSelector } from "react-redux";
import { getLabelProjectRequestAction } from "redux/reducers/labelprojects.js";
import { askModalRequestAction, openErrorSnackbarRequestAction, askStartLabelProjectReqeustAction } from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import { Grid } from "@material-ui/core";
import CircularProgress from "@mui/material/CircularProgress";
import * as api from "controller/labelApi.js";
import Button from "components/CustomButtons/Button";

const RequestLabeling = (props) => {
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
  const [labelingClasses, setLabelingClasses] = useState([]);
  const [labelingType, setLabelingType] = useState("일반(박스)");
  const [pricePerType, setPricePerType] = useState({});
  const [requestLabelingContent, setRequestLabelingContent] = useState("");
  const [requestPhoneNumber, setRequestPhoneNumber] = useState("");
  const [step, setStep] = useState(0);
  const [selectedClassesCnt, setSelectedClassesCnt] = useState(0);
  const [selectedCard, setSelectedCard] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [acceptPayment, setAcceptPayment] = useState(false);

  const { history, labelClasses, close } = props;
  const regExp = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;

  useEffect(() => {
    setIsLoading(true);
    let tmp = [];

    labelClasses.map((labelClass) => {
      tmp = [...tmp, { id: labelClass.id, name: labelClass.name, selected: false }];
    });
    setLabelingClasses(tmp);
    setIsLoading(false);
  }, [labelClasses]);

  useEffect(() => {
    api.getLabelTypesPrice().then((res) => {
      setPricePerType(res.data);
    });
  }, []);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      close();
    }
  }, [messages.shouldCloseModal]);

  const selectLabelingClasses = (event) => {
    let tmp = [];
    labelingClasses.map((labelingClass) => {
      if (labelingClass.id === Number(event.target.id)) {
        tmp = [
          ...tmp,
          {
            id: labelingClass.id,
            name: labelingClass.name,
            selected: event.target.checked,
          },
        ];
        if (event.target.checked) {
          setSelectedClassesCnt((prevSelectedClassesCnt) => prevSelectedClassesCnt + 1);
        } else {
          setSelectedClassesCnt((prevSelectedClassesCnt) => prevSelectedClassesCnt - 1);
        }
      } else {
        tmp = [
          ...tmp,
          {
            id: labelingClass.id,
            name: labelingClass.name,
            selected: labelingClass.selected,
          },
        ];
      }
    });
    setLabelingClasses(tmp);
  };

  const changeLabelingType = (e) => {
    setLabelingType(e.target.value);
  };

  const labelingTypes = {
    box: { name: "박스" },
    polygon: { name: "폴리곤" },
    audio: { name: "음성" },
    standard: { name: "일반" },
    natural: { name: "자연어" },
    single_image: { name: "이미지 분류" },
  };

  // const labelingTypes = [
  //   { name: "박스" },
  //   { name: "폴리곤" },
  //   { name: "음성" },
  //   { name: "일반" },
  //   { name: "자연어" },
  //   { name: "단일 이미지" },
  // ];

  const changeRequestLabelingContent = (e) => {
    setRequestLabelingContent(e.target.value);
  };

  const changeRequestPhoneNumber = (e) => {
    setRequestPhoneNumber(e.target.value);
  };

  const cancelRequestLabeling = () => {
    switch (step) {
      case 0:
        dispatch(askModalRequestAction());
        break;
      case 1:
        setStep((prevStep) => prevStep - 1);
        break;
      case 2:
        close();
    }
  };

  const requestNextStep = () => {
    switch (step) {
      case 0:
        let flag = false;
        labelingClasses.map((labelingClass) => {
          if (labelingClass.selected) {
            flag = true;
          }
        });
        if (flag === false) {
          dispatch(openErrorSnackbarRequestAction(t("Please select at least one class.")));
          return;
        }
        if (regExp.test(requestPhoneNumber) === false) {
          dispatch(openErrorSnackbarRequestAction(t("Please enter your mobile number.")));
          return;
        }

        setStep((prevStep) => prevStep + 1);
        break;
      case 1:
        // if (selectedCard === "") {
        //   alert("결제방법을 선택해주세요.");
        //   return;
        // }
        // if (acceptPolicy === false) {
        //   alert(t("Please accept the Terms and Conditions if you want to proceed."));
        //   return;
        // }
        // if (acceptPayment === false) {
        //   alert(t("Please agree to payment before proceeding."));
        //   return;
        // }
        setStep((prevStep) => prevStep + 1);
        break;
    }
  };

  const changeSelectedCard = (e) => {
    setSelectedCard(e.target.value);
  };

  const changeAcceptPolicy = (e) => {
    e.preventDefault();
    setAcceptPolicy((prevAcceptPolicy) => !prevAcceptPolicy);
  };

  const changeAcceptPayment = (e) => {
    e.preventDefault();
    setAcceptPayment((prevAcceptPayment) => !prevAcceptPayment);
  };

  return isLoading ? (
    <>
      <CircularProgress size={20} sx={{ mb: 2 }} />
      <b>{t("Getting project information. please wait for a moment.")}</b>
    </>
  ) : (
    <>
      {step < 2 ? (
        <div className={classes.defaultModalContent}>
          <header>
            <h6
              style={{
                margin: "0 0 20px",
                fontWeight: "bold",
                fontSize: "17px",
              }}
            >
              수동 라벨링 의뢰하기(클래스당 100개)
            </h6>
          </header>
          <main>
            {step === 0 && (
              <>
                <div>
                  <FormControl component="fieldset" style={{ width: "100%", marginBottom: "24px" }}>
                    <FormLabel component="legend" style={{ marginBottom: "10px" }}>
                      클래스 선택하기(1개 이상)*
                    </FormLabel>
                    <FormGroup
                      style={{
                        width: "100%",
                        height: "140px",
                        border: "1px solid #999999",
                        overflow: "scroll",
                        flexWrap: "nowrap",
                      }}
                    >
                      {labelingClasses.map((labelingClass) => {
                        return <FormControlLabel control={<Checkbox checked={labelingClass.selected} onChange={selectLabelingClasses} name={labelingClass.name} id={labelingClass.id} style={{ marginRight: "4px" }} />} label={labelingClass.name} style={{ margin: "0", padding: "4px 8px" }} />;
                      })}
                    </FormGroup>
                  </FormControl>
                </div>
                <div>
                  <FormControl component="fieldset" style={{ marginBottom: "10px" }}>
                    <FormLabel component="legend" style={{ marginBottom: "0" }}>
                      수동 라벨링 종류 선택하기*
                    </FormLabel>
                    <RadioGroup aria-label="labelingType" name="labelingType" value={labelingType} onChange={changeLabelingType} row>
                      {Object.keys(labelingTypes).map((key) => (
                        <FormControlLabel value={labelingTypes[key].name} label={labelingTypes[key].name} control={<Radio color="primary" />} />
                      ))}
                    </RadioGroup>
                  </FormControl>
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
                    상세 내용 입력
                  </label>
                  <textarea
                    autoFocus
                    value={requestLabelingContent}
                    onChange={changeRequestLabelingContent}
                    placeholder={t("ex.신청한 라벨클래스 중 car, pannel은 각각 자동차와 보행자를 의미합니다.\n라벨링을 할 때 잘리는 부분이나 겹치는 부분이 있다면 다른 물체와 겹치더라도 풀 샷으로 라벨링 부탁드립니다.")}
                    id="requestLabelingContent"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "140px",
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
              </>
            )}
            {step === 1 && (
              <>
                <Grid container direction="column">
                  <Grid item xs={12}>
                    <h4>결제금액(월별 서비스 이용금액에 합산 청구)</h4>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction="column">
                      <Grid item>
                        <Grid container justify="space-between">
                          <Grid item>클래스:</Grid>
                          <Grid item>{selectedClassesCnt}개</Grid>
                        </Grid>
                        <Grid container justify="space-between">
                          <Grid item>수동 라벨링 종류:</Grid>
                          <Grid item>
                            {labelingType}/{pricePerType[labelingTypes]}
                          </Grid>
                        </Grid>
                        <Grid
                          container
                          justify="space-between"
                          style={{
                            paddingBottom: "18px",
                            borderBottom: "1px solid var(--textWhite87)",
                          }}
                        >
                          <Grid item>라벨링 합계:</Grid>
                          <Grid item>{selectedClassesCnt * 100}개</Grid>
                        </Grid>
                        <Grid container style={{ marginTop: "18px" }}>
                          <Grid item xs={12}>
                            총 결제예상금액: {10 * selectedClassesCnt * 100}원
                          </Grid>
                          <Grid item xs={12}>
                            <b style={{ fontWeight: "normal", fontSize: "14px" }}>*예상금액은 참고용 가격으로 컨설팅 이후 변경될 수 있습니다.</b>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* <FormControl component="fieldset">
                  <FormLabel component="legend">결제 방법</FormLabel>
                  <RadioGroup
                    aria-label="labelingType"
                    name="labelingType"
                    value={selectedCard}
                    onChange={changeSelectedCard}
                    row
                  >
                    <FormControlLabel
                      value={user.cardInfo.cardName}
                      control={<Radio />}
                      label={`카드 ${user.cardInfo.cardName}`}
                      control={<Radio color="primary" />}
                    />
                  </RadioGroup>
                </FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="agreeBtn"
                      value="allowExtraEmails"
                      color="primary"
                      checked={acceptPolicy}
                      onChange={changeAcceptPolicy}
                    />
                  }
                  label={t("Agree to all order product information and terms of service")}
                />
                <span
                  onClick={() => {
                    window.open(
                      user.language === "en"
                        ? "https://www.notion.so/dslabglobal/Guide-to-CLICK-AI-1286524a5302472ebdf2eb546f113462"
                        : "https://www.notion.so/dslabglobal/3939509423664e94b88a3703f5e4e605",
                      "_blank"
                    );
                  }}
                >
                  {t("Check terms and conditions")}
                </span>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="agreeBtn"
                      value="allowExtraEmails"
                      color="primary"
                      checked={acceptPayment}
                      onChange={changeAcceptPayment}
                    />
                  }
                  label={t("I have confirmed the above order and agree to the payment.")}
                /> */}
              </>
            )}
          </main>
          <footer style={{ marginTop: "24px" }}>
            <Grid container justify="flex-end" alignItems="center" spacing={1}>
              <Grid item>
                <Button onClick={cancelRequestLabeling} className={classes.defaultGreyOutlineButton}>
                  {step === 0 ? "취소" : "뒤로가기"}
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={requestNextStep} className={classes.defaultGreyOutlineButton}>
                  {step === 0 ? "다음" : "의뢰요청"}
                </Button>
              </Grid>
            </Grid>
          </footer>
        </div>
      ) : (
        <Grid container className={classes.defaultModalContent} justify="space-between" alignItems="center" direction="column">
          <Grid item style={{ padding: "80px 0" }}>
            수동라벨링 의뢰가 완료되었습니다. 확인 후 빠르게 연락드리겠습니다.{" "}
          </Grid>
          <Grid item style={{ alignSelf: "flex-end" }}>
            <Button onClick={cancelRequestLabeling} className={classes.defaultGreyOutlineButton}>
              닫기
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default React.memo(RequestLabeling);
