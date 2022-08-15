import React, { useEffect, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import {
  getLabelProjectsRequestAction,
  stopLabelProjectsLoadingRequestAction,
  getAiTrainerLabelprojectRequestAction,
  labelprojectResetRequestAction,
} from "redux/reducers/labelprojects.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom.js";
import { ReactTitle } from "react-meta-tags";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { Box, Container, Grid } from "@material-ui/core";

import HeadsetIcon from "@material-ui/icons/Headset";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import Button from "components/CustomButtons/Button";

const LabelVoice = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();
  const [isPagingChanged, setIsPagingChanged] = useState(false);
  const [countLabeling, setCountLabeling] = useState(0);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (user.me && user.me.usageplan) {
      // TODO: AI Trainer 가 아닐 시에는 되돌아가게 해야함
      // if(!user.me.isAiTrainer){
      //    history.push('/admin/labelling/');
      // }
    }
  }, [user.me && user.me.usageplan]);

  const submitted = () => {
    setCountLabeling(countLabeling + 1);
  };

  const onChangeText = (e) => {};

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
      <ReactTitle title={"DS2.ai - " + t("Voice Labelling")} />
      <Container maxWidth="lg" style={{ padding: "0px" }}>
        <Grid container item xs={12} justify="center" alignItems="flex-start">
          <Grid container item xs={12} justify="center">
            <Grid
              container
              item
              xs={8}
              justify="space-between"
              style={{ paddingTop: "3px", paddingBottom: "3px" }}
            >
              <Grid container item xs={3} justify="flex-start">
                <div
                  className={classes.subTitleText}
                  style={{ marginTop: "4px" }}
                >
                  {"!파일이름!"}
                </div>
              </Grid>
              <Grid
                container
                item
                xs={9}
                justify="flex-end"
                style={{ marginBottom: "150px" }}
              >
                <Button
                  className={`${classes.defaultOutlineButton} ${classes.labeling_default_button}`}
                >
                  파일리스트
                </Button>
                <Button
                  className={`${classes.defaultOutlineButton} ${classes.labeling_default_button}`}
                  style={{
                    color: "red",
                    border: "2px solid red",
                    backgroundImage: "none",
                  }}
                >
                  {t("Exit")}
                </Button>
                <Button
                  className={`${classes.defaultOutlineButton} ${classes.labeling_default_button}`}
                >
                  {t("Next")}
                </Button>
              </Grid>
            </Grid>
            {/* 개별 파트 */}
            <Grid container item xs={12} justify="center">
              <figure style={{ marginTop: "32px" }}>
                <figcaption className="sr-only">
                  라벨링 할 음성파일입니다.
                </figcaption>
                <HeadsetIcon
                  fontSize="large"
                  style={{ display: "block", margin: "0 auto" }}
                />
                <audio
                  controls
                  style={{ display: "block", margin: "15px auto 30px" }}
                >
                  <source src="" type="audio/mpeg" />
                </audio>
              </figure>
            </Grid>
            <Grid
              container
              item
              xs={8}
              justify="center"
              style={{ marginTop: "0px" }}
            >
              <textarea
                style={{
                  background: currentThemeColor.surface1,
                  width: "100%",
                  height: "300px",
                  marginBottom: "10px",
                  padding: "1em",
                  color: "white",
                }}
                id={"edit"}
                onChange={onChangeText}
                placeholder="들리는 음성에 맞춰서 이 입력폼에 글자를 입력하세요."
              >
                {preview}
              </textarea>
            </Grid>
            <Grid container justify="center" spacing={2}>
              <Grid item xs={12}>
                <Grid container justify="center" spacing={2}>
                  <Button
                    aria-controls="customized-menu"
                    aria-haspopup="true"
                    className={classes.defaultHighlightButton}
                    style={{
                      color: "white",
                      borderColor: "white",
                      position: "relative",
                      marginRight: "0",
                      marginBottom: "20px",
                    }}
                    id="saveCoCoBtn"
                    onClick={() => {
                      submitted();
                    }}
                  >
                    저장
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {/* 개별 파트 */}
          </Grid>
        </Grid>
      </Container>

      {/* <Container maxWidth="md">
            <div className={classes.topTitle}>{t('Voice Labelling')}</div>
            <div className={classes.subTitleText} style={{marginBottom: '20px'}}>{t('It is a speech recognition labeling tool for STT learning.')}</div>
            <Grid container direction="row" justify="flex-start">
                <Grid item>
                    <Button className={classes.labelOutlineButton} style={{color: "white", borderColor: "white"}}>
                        종료
                    </Button>
                </Grid>
                <Grid item>
                    <Button className={classes.labelOutlineButton} style={{color: "white", borderColor: "white", marginRight: "0"}}>
                        다음
                    </Button>
                </Grid>
                
            </Grid> */}
      {/* <Button
                aria-controls="customized-menu"
                aria-haspopup="true"
                className={classes.labelOutlineButton}
                id="saveCoCoBtn"
                style={{color: "white", borderColor: "white"}}
                >
                    <PlayArrowIcon id="PlayArrowIcon" /> 재생하기
            </Button> */}
      {/* <figure style={{marginTop: '32px'}}>
                <figcaption className="sr-only">라벨링 할 음성파일입니다.</figcaption>
                <Box mb={1} style={{textAlign: "center"}}>파일명</Box>
                <HeadsetIcon fontSize="large" style={{display: 'block', margin: '0 auto'}} />
                <audio controls style={{display: 'block', margin: '15px auto 30px'}}>
                    <source src="" type="audio/mpeg" />
                </audio>
            </figure>
            <textarea style={{background: currentThemeColor.surface1, width: '100%', height: '300px', marginBottom: '30px', padding: '1em', color: "white"}} id={"edit"} onChange={onChangeText} placeholder="들리는 음성에 맞춰서 이 입력폼에 글자를 입력하세요.">{preview}</textarea>
            <Grid container justify="center" spacing={2}>
                <Grid item xs={12}>
                    <Grid container justify="center" spacing={2}>
                        <Button
                            aria-controls="customized-menu"
                            aria-haspopup="true"
                            className={classes.defaultOutlineButton}
                            style={{color: "white", borderColor: "white", position: "relative", marginRight: "0"}}
                            id="saveCoCoBtn"
                            onClick={()=>{submitted()}}
                            >
                                제출하기
                                <ArrowForwardIcon id="ArrowForwardIcon" fontSize="small" style={{position: "absolute", right: "10px"}} />
                        </Button>
                    </Grid>
                </Grid>
                <div style={{margin: "0 auto"}}>현재 제출된 음성 라벨링 갯수 : {countLabeling}</div>
            </Grid>
        </Container> */}
    </>
  );
};

export default React.memo(LabelVoice);
