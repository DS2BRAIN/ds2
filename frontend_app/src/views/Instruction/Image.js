import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import SendIcon from "@material-ui/icons/Send";
import { NavLink } from "react-router-dom";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { fileurl } from "controller/api";
const Image = () => {
  const classes = currentTheme();

  return (
    <Container component="main" maxWidth="false" className={classes.mainCard}>
      <GridContainer>
        <GridItem xs={12}>
          <div className={classes.subTitleText}>
            CLICKAI 기본 동작에 관한 사용법을 확인 할 수 있습니다.
          </div>
        </GridItem>
        {/*<Divider className={classes.titleDivider} />*/}
        <GridItem xs={12} style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
            <BorderColorIcon fontSize="lg" style={{ marginRight: "10px" }} />
            이미지 분류 사용 해보기
          </div>
          <h4 id="이미지-분류">이미지 분류(Image Classification)란?</h4>
          <div style={{ padding: "0 20px" }}>
            <p>
              이미지 분류란 카테고리(Class) 별 분류된 이미지를 가지고 모델을
              훈련시켜 어떤 이미지가 어느 카테고리의 속하는지 예측하는
              모델입니다.
            </p>
            <p>
              물체 인식과 다르게 하나의 이미지의 여러 카테고리(Class)를 예측하는
              것이 아닌 하나의 이미지의 하나의 카테고리(Class)를 예측할 수
              있습니다.
            </p>
            <br />
            <br />
            <div class="video-container" style={{ textAlign: "center" }}></div>
            <object
              style={{ display: "flex", margin: "0 auto" }}
              type="text/html"
              width="80%"
              height="800"
              data="//www.youtube.com/embed/_mlGH9Oi1BA"
              allowfullscreen=""
            ></object>
          </div>
          <h4 id="직접-사용해보기"> ** 직접 사용해보기</h4>
          <h6 id="학습--목표-이미지를-통해-선박의 종류를-구분하는-AI-모델-만들기">
            학습 목표 : 이미지를 통해 선박의 종류를 구분하는 AI 모델 만들기
          </h6>

          {/* 추가됐어요! -> 다운로드 버튼을 이용해서 사용법에 소개된 데이터 다운로드 : ship.zip  */}

          <h4 id="1-데이터-확인하기">1. 데이터 확인하기</h4>
          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/1_카테고리확인.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 카테고리별로 분류된 이미지 ]
            </p>
            <br />
          </div>
          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/2_수집된사진들.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 각 카테고리별 수집된 사진들 ]
            </p>
            <br />
          </div>
          <br />
          <h4 id="2-모델-만들기">2. 모델 만들기</h4>
          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/개발시작하기.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 개발 시작하기를 클릭합니다 ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/데이터추가.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 인공지능 개발을 위한 데이터를 추가하기 위해서 데이터
                추가하기를 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/zip선택.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운 받은 데이터는 .zip파일 이기 때문에 ZIP을 클릭하고 다음을
                누릅니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/3_데이터업로드.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운받은 ship.zip 파일을 업로드하고 다음을 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/4_데이터선택.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 목록 가장 최상단에 추가된 데이터를 확인하실 수 있습니다. 이제
                이 데이터를 클릭 후 AI 개발 시작하기를 클릭하여 인공지능을
                개발하실 수 있습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/5_학습형태.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습형태는 '이미지 분류'를 선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/6_선호하는방식.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 선호하는 방식은 2가지로 나뉘어져 있으며, '정확도가 높게'
                방식을 선택하겠습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/7_데이터요약.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 하단을 보면 데이터 요약을 확인 할 수 있습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/8_데이터확인.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 데이터를 클릭하시면 사용하신 ZIP파일의 데이터를 확인하실 수
                있습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/9_시작.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모든 작업이 완료 된 후, 오른쪽 상단의 시작버튼을 클릭하여
                인공지능을 생성합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/10_모델생성중.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 시작 버튼 클릭 후 모델 생성이 시작되며, 모델생성의 진행사항을
                확인할 수 있습니다. ]
              </p>
              <br />
            </div>
          </div>
          <br />
          <h4 id="3-모델-활용하기">3. 모델 활용하기</h4>
          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/모델 생성.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [Accuracy Model 13 의 정확도가 98.37% 가 나오는 것을 확인할 수
                있습니다. ]
              </p>
              <br />
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>*TIP!*</p>
            <p>
              모델은 총 136개로 구성되어 있으며, '학습속도가 빠르게' 방식으로
              학습하면 전체 모델 중 빠른 속도를 가진 16개의 모델을 생성하며,
              정확도가 높은 순으로 정렬이 됩니다.
            </p>
            <p>
              '정확도가 높게' 방식으로 학습하면 전체 모델을 생성하며, 정확도가
              높은 순으로 정렬이 됩니다.
            </p>
          </div>
          <br />
          <h5 id="31-개별예측-사용하기">3.1 개별예측 사용하기</h5>
          <div style={{ padding: "0 20px" }}>
            <p>
              이미지분류는 랜덤채우기 기능이 없습니다. 이미지를 직접 업로드하여
              사용할 수 있습니다.{" "}
            </p>
          </div>
          <br />
          <div style={{ marginBottom: "60px" }}>
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/image/개별예측.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 모델 우측에 있는 개별예측을 클릭합니다. ]
            </p>
          </div>
          <div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/개별예측업로드.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 이미지를 업로드를 한 뒤 실행을 클릭합니다. ]
              </p>
            </div>
          </div>
          <div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/개별예측결과.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 개별 예측 결과 ]
              </p>
            </div>
          </div>
          <br />
          <div style={{ padding: "0 20px" }}>
            <p>사용된 사진의 예측 결과와 그 확률을 확인할 수 있습니다.</p>
          </div>
          <br />
          <h5 id="31-개별예측-사용하기">3.2 일괄예측 사용하기</h5>
          <div style={{ padding: "0 20px" }}>
            <p>이미지분류는 현재는 일괄예측 기능이 없습니다. </p>
          </div>
          <br />
          <h5 id="33-상세보기-사용하기">3.3 상세보기 사용하기</h5>
          <div style={{ padding: "0 20px" }}>
            상세보기는 총 9개의 단계로 확인하실 수 있습니다.
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>1. Detail</p>
            <div style={{ padding: "0 20px" }}>
              <p>- Accuracy (정확도)</p>
              <p>- ErrorRate (에러비율)</p>
              <p>- Dice (유사성 측정을 위해 사용되는 샘플 계수)</p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>2. 정밀분석</p>
            <div style={{ padding: "0 20px" }}>
              <p>- Overall_Statistics : 전체 통계를 나타냅니다.</p>
              <p>- Class_Statistics : Class 별 통계를 나타냅니다.</p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>3. Confusion Matrix</p>
            <div style={{ padding: "0 20px" }}>
              <p>
                모델이 얼마나 정밀한지, 실용적인 분류를 했는지, 정확한 분류를
                했는지 확인하실 수 있습니다.
              </p>
              <p>
                - 왼쪽상단에 있는 값은 정확하게 관심범주를 분류한 값을
                나타냅니다.
              </p>
              <p>
                - 오른쪽하단에 있는 값은 정확하게 관심범주가 아닌것을 정확하게
                분류한 값을 나타냅니다.
              </p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>4. Loss</p>
            <div style={{ padding: "0 20px" }}>
              <p>딥러닝 학습에 사용되는 손실 함수를 확인 하실 수 있습니다.</p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>5. Precision-Recall</p>
            <div style={{ padding: "0 20px" }}>
              <p>- Precision : 예측 값이 참일 때 실제 값이 참인 비율입니다.</p>
              <p>- Recall : 실제 값이 참일 때 예측 값이 참인 비율입니다. </p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>6. Kappa-Coeff</p>
            <div style={{ padding: "0 20px" }}>
              <p>
                - Kappa_score : 모델 신뢰도를 측정하는데 사용되는 통계량입니다.
              </p>
              <p>
                - Matthews_corrcoef : 모델 신뢰도를 측정하는데 사용되는
                통계량입니다.{" "}
              </p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>7. Auroc-FBeta</p>
            <div style={{ padding: "0 20px" }}>
              <p>
                - AUROC : FPR (False Positive Rate)에 대한 TPR (True Positive
                Rate) 을 플로팅하여 생성된 곡선의 면적 값을 계산합니다.
              </p>
              <p>- F_beta : 모델 신뢰도를 측정하는데 사용되는 통계량입니다. </p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>8. Records</p>
            <div style={{ padding: "0 20px" }}>
              <p>예측된 결과값을 확인하실 수 있습니다.</p>
            </div>
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>9. API</p>
            <div style={{ padding: "0 20px" }}>
              <p>각 프로그래밍 언어별 API를 제공해줍니다.</p>
            </div>
          </div>
          <br />
          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/상세보기.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모델 우측에 있는 상세보기를 클릭합니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/detail.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모델의 Accuracy{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Accuracy_and_precision"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                , ErrorRate
                <a
                  href="https://en.wikipedia.org/wiki/Generalization_error"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                , Dice
                <a
                  href="https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/정밀분석.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 정밀 분석값을 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/confusionmatrix.PNG"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 컨퓨전 메트릭스
                <a
                  href="https://en.wikipedia.org/wiki/Confusion_matrix"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인 하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/Loss.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 손실 함수
                <a
                  href="https://en.wikipedia.org/wiki/Loss_function"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인 하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/recall.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ Precision
                <a
                  href="https://en.wikipedia.org/wiki/Precision_and_recall#Precision"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                , Recall
                <a
                  href="https://en.wikipedia.org/wiki/Precision_and_recall#Recall"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/kappa.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ Kappa_score
                <a
                  href="https://en.wikipedia.org/wiki/Cohen%27s_kappa"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                , Matthews_corrcoef
                <a
                  href="https://en.wikipedia.org/wiki/Matthews_correlation_coefficient"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/fbeta.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ AUROC
                <a
                  href="https://en.wikipedia.org/wiki/Receiver_operating_characteristic"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                , FBeta
                <a
                  href="https://en.wikipedia.org/wiki/F1_score"
                  target="_blank"
                  style={{ fontSize: "80%" }}
                >
                  (자세히 알아보기)
                </a>
                를 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/records.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ TEST 데이터의 예측값을 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/image/api.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 프로그래밍 언어별 API 사용법을 확인하실 수 있습니다. ]
              </p>
            </div>
          </div>
          <br />
        </GridItem>
        {/*<Divider className={classes.titleDivider} />*/}
        <GridItem style={{ display: "flex", flexDirection: "column" }}>
          <NavLink to="/admin/instruction/start">
            <div style={{ marginBottom: "20px" }}>
              <BorderColorIcon fontSize="lg" style={{ marginRight: "10px" }} />
              시작하기 돌아가기
            </div>
          </NavLink>
          <h5 id="학습형태별-사용법-알아보기" style={{ marginBottom: "20px" }}>
            학습형태별 사용법 알아보기
          </h5>
          <NavLink to="/admin/instruction/auto" className={classes.link}>
            1. 정형 데이터 분류
          </NavLink>
          <NavLink
            to="/admin/instruction/classification"
            className={classes.link}
          >
            2. 정형 카테고리 분류
          </NavLink>
          <NavLink to="/admin/instruction/regression" className={classes.link}>
            3. 정형 연속값 분류
          </NavLink>
          <NavLink
            to="/admin/instruction/naturallanguage"
            className={classes.link}
          >
            4. 자연어 처리
          </NavLink>
          <NavLink to="/admin/instruction/image" className={classes.link}>
            5. 이미지 분류
          </NavLink>
          <NavLink
            to="/admin/instruction/objectdetection"
            className={classes.link}
          >
            6. 물체 인식
          </NavLink>
          {/* <NavLink to="/admin/instruction/gan" className={classes.link}>
            7. GAN - 생성적 적대 신경망
          </NavLink> */}
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default React.memo(Image);
