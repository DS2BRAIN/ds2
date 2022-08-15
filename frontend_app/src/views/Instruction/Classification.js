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
const Classification = () => {
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
            정형 카테고리 분류 사용 해보기
          </div>
          <h4 id="일반-카테고리-분류란">정형 카테고리 분류란?</h4>
          <div style={{ padding: "0 20px" }}>
            <p>카테고리 분류는 범주(Class)를 예측하는 기능입니다.</p>
            <p>
              분류는 크게 2가지 이진 분류(Binary classification), 다중
              분류(Multi-class classification)로 나뉘게 됩니다.
            </p>
            <p>[이진 분류] 예측할 범주(Class)가 두 가지인 경우입니다. </p>
            <p>
              예로 철수가 PASS/FAIL 시험을 볼 때, 철수가 받은 점수가 통과 아니면
              실패와 같이 '예/아니요' 로 구분할 수 있는 문제를 포함합니다.{" "}
            </p>
            <p>
              위와 같은 경우 Class - PASS, FAIL / Feature - 철수의 점수 처럼
              구분 할 수 있습니다.
            </p>
            <p>[다중 분류] 예측할 범주(Class)가 여러 개인 경우입니다. </p>
            <p>
              위의 예제인 'PASS/FAIL' 이 아닌 점수 또는 등수로 학점을 나뉘게
              되면 어떨까요?{" "}
            </p>
            <p>
              Class - A, B, C, D, F / Feature - 철수의 점수 또는 등수 같이 구분
              할 수 있습니다.
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
          <br />
          <div style={{ padding: "0 20px" }}>
            <p>
              일반적으로 카테고리 분류는 정확도(accuracy)나 AUROC으로 성능을
              평가할 수 있습니다.
            </p>
            <p>
              ** AUROC : FPR (False Positive Rate )에 대한 TPR (True Positive
              Rate) 을 플로팅하여 생성된 곡선의 면적 값을 계산합니다. 값이 1에
              근접할 수록 모델의 신뢰도가 높습니다.
            </p>
          </div>
          <h3 id="직접-사용해보기"> ** 직접 사용해보기</h3>
          <h6 id="학습-목표--은행 예금 데이터를 활용하여 은행 고객 예금 예측하기">
            학습 목표 : 은행 예금 데이터를 활용하여 은행 고객 예금 예측하기
          </h6>
          {/* 
                추가됐어요! -> 다운로드 버튼을 이용해서 사용법에 소개된 데이터 다운로드 : 은행 예금 예측.csv */}

          <h4 id="1-데이터-확인하기">1. 데이터 확인하기</h4>
          <div>
            <br />
            <div style={{ width: " 80%", margin: "0 auto" }}>
              <img
                src={
                  fileurl +
                  "asset/front/image/classification/1_은행예금정보.png"
                }
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 은행 예금 정보.csv ]
            </p>
            <br />
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>
              데이터 특징은 고객의 나이,직업과 같은 기본적인 개인정보부터
              시작하여 은행 예금을 예측하는데 주요한 지표가 될 수 있는 금리 등과
              같은 데이터까지 총 19가지의 특징과 결과인 예금결과로
              구성되었습니다.
            </p>
            <p>결과인 예금결과는 'no'와 'yes'로 구분됩니다.</p>
          </div>
          <br />
          <h4 id="2-모델-만들기">2. 모델 만들기</h4>
          <div>
            <br />
            <div style={{ width: "100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/개발시작하기.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 개발 시작하기를 클릭합니다. ]
            </p>
            <br />택
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
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
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/csv선택.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운 받은 데이터는 .csv파일 이기 때문에 CSV를 클릭하고 다음을
                클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/2_데이터업로드.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운받은 은행 예금 예측.csv 파일을 업로드하고 다음을
                클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/3_데이터선택.png"}
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
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl + "asset/front/image/classification/4_학습형태.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습형태는 '정형 데이터 카테고리 분류 (Classification)' 를
                선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl + "asset/front/image/classification/5_선호방식.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ [선호하는 방식은 2가지로 나뉘어져 있으며, '정확도가 높게'
                방식을 선택하겠습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/6_분석 예측하고싶은값.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 분석/예측하고 싶은 값에 '예금결과 - 은행 예금 예측.csv'를
                클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/7_데이터요약.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 하단을 보면 데이터 요약과 더불어 학습데이터 사용여부를 선택할
                수 있습니다. (분석/예측하고 싶은 값은 자동으로 사용여부가
                해제됩니다.)]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/8_데이터확인.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 데이터를 클릭하시면 사용하신 CSV파일의 데이터를 확인하실 수
                있습니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/9_일괄전처리.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모든 데이터의 전처리를 원하신다면 일괄전처리를 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/10_전처리기능.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 원하는 전처리 기능들을 선택하고 완료를 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/11_부분전처리.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 부분적으로 전처리를 원하는 경우, 전처리를 원하는 데이터의
                전처리하기 버튼을 클릭 후 일괄전처리와 똑같은 방식으로 전처리를
                합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/classification/12_시작.png"}
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
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl +
                    "asset/front/image/classification/13_모델생성중.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [시작 버튼 클릭 후 모델 생성이 시작되며, 모델생성의 진행사항을
                확인 할 수 있습니다. ]
              </p>
              <br />
            </div>
          </div>

          <br />
          {/*                 
                <h4 id="3-모델-활용하기">3. 모델 활용하기</h4>
                <div>
                    <br />
                    <div>
                        <div style={{width: "100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/classification/모델 결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Accuracy Model 31의 정확도가 83.68% 나오는 것을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>*TIP!*</p>
                    <p>모델은 총 136개로 구성되어 있으며, '학습속도가 빠르게' 방식으로 학습하면 전체 모델 중 빠른 속도를 가진 16개의 모델을 생성하며, 정확도가 높은 순으로 정렬이 됩니다.</p>
                    <p>'정확도가 높게' 방식으로 학습하면 전체 모델을 생성하며, 정확도가 높은 순으로 정렬이 됩니다.</p>
                </div>
                <br />
                <h5 id="31-개별예측-사용하기">3.1 개별예측 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>개별예측은 2가지의 방법으로 사용하실 수 있습니다.</p>
                    <p> 1. 랜덤채우기 - 각 특징별 값을 랜덤으로 채워주는 방식입니다.</p>
                    <p> 2. 특징값을 직접 채우기 - 
                    각 특징별 값을 직접 채워주는 방식입니다.
                    새로 예측할 값을 알고있을 때, 직접 값을 입력해주는 방식이며
                    주로 API와 연동하여 사용할 수 있습니다.</p>
                </div>
                <br />
                <div>
                    <div style={{width: "100%", display: "flex"}}>
                        <img src=fileurl+"asset/front/image/classification/개별예측.png" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 개별예측을 클릭합니다. ]</p>
                </div>
                <h6 id="랜덤-채우기를-이용하여-예측을-해보겠습니다">랜덤 채우기를 이용하여 예측을 해보겠습니다.</h6>
                <div>
                    <br />
                    <div>
                        <div style={{width: "100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/classification/랜덤채우기.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 랜덤 채우기를 하면 각 특징별 값을 랜덤으로 채워줍니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width: "100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/classification/랜덤채우기결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 실행 결과 ]</p>
                    </div>
                </div>

                <div style={{padding: '0 20px'}}>B.국어 87점 수학87점 영어87점 평균87점의 학점을 예측해보겠습니다.</div>

                <div>
                    <br />
                    <div>
                        <div style={{width: "100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/classification/직접채우기결과.png" style={{width : "80%", margin: "0 auto"}}/>
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 직접 채우기 ]</p>
                    </div>
                </div>

                <div style={{padding: '0 20px'}}>
                    <p>위의 결과를 확인해 보겠습니다.</p>
                    <p>[랜덤 채우기]</p>
                    <p>입력 : 국어 - 72 수학 - 84 영어 - 74 평균 - 76.67</p>
                    <p>예측 값 : B 이며 각 범주(Class)마다 확률을 나타내고 있습니다.</p>
                    <p>[직접 채우기]</p>
                    <p>입력 : 국어 - 87 수학 - 87 영어 - 87 평균 - 87</p>
                    <p>예측 값 : A 이며 각 범주(Class)마다 확률을 나타내고 있습니다.</p>
                    <p>여기서 A 에측값이 (64.211%), B 예측값이 (35.788%) 나온 이유에 대해 알아보겠습니다.</p>
                </div>

                <div>
                <br />
                <div>
                    <div style={{width: "100%", display: "flex"}}>
                        <img src=fileurl+"asset/front/image/classification/B.png" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 학생의 성적 중 ]</p>
                </div>
                </div>

                <div style={{padding: '0 20px'}}>
                    <p>평균이 84.33인 학생이 B학점을 받았고 평균이 87점인 학생은 A학점을 받았습니다. </p>
                    <p>이를 통해 평균이 87점인 학생은 A학점 중 최하위권이며 평균이 낮아지면 B학점 받을 가능성이 높다는 것을 확인 할 수 있습니다.</p>
                </div>
                <br />
                <h5 id="32-일괄예측-사용하기">3.2 일괄예측 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>일괄예측은 예측하고싶은 데이터가 많을 때 사용됩니다.</p>
                    <p>CSV파일을 통해 업로드를 하며, 이때 CSV파일에는 예측하고싶은 값을 제외한 모든 특징들이 있어야합니다.</p>
                    <p>아래와 같이 치석을 제외한 성별코드,연령대코드(5세단위),흡연상태,음주여부,구강검진수검여부,치아우식증유무,결손치유무,치아마모증유무,제3대구치(사랑니)이상의 값이 들어가 있어야합니다.</p>
                </div>
                <div>
                    <br />
                    <div style={{width :" 100%", display: 'flex'}}>
                        <img src=fileurl+"asset/front/image/classification/일괄예측데이터.png" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 건강검진일괄예측.csv ]</p><br />
                </div>
                <div>
                    <br />
                    <div>
                        <div style={{width :" 100%", display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/classification/일괄예측.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 일괄예측을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div>
                        <div style={{width :" 100%", display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/classification/일괄예측업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 파일을 업로드 후 다음버튼을 클릭하면 결과파일이 자동으로 다운로드됩니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div >
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/일괄예측결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 다운로드 된 CSV 파일을 열어 각 항목별 예측값 및 정보를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>
                <h5 id="33-상세보기-사용하기" style={{padding: '0 20px'}}>3.3 상세보기 사용하기</h5>
                <div style={{padding: '0 20px'}}>상세보기는 총 9개의 단계로 확인하실 수 있습니다.</div>
                <div style={{padding: '0 20px'}}>
                    <p>1. Detail</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Accuracy (정확도)</p>
                        <p>- ErrorRate (에러비율)</p>
                        <p>- Dice (유사성 측정을 위해 사용되는 샘플 계수)</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>2. FeatureImportance</p>
                    <div style={{padding: '0 20px'}}>
                        <p>모델을 생성할 때 특징별 중요도를 나타냅니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>3. 정밀분석</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Overall_Statistics : 전체 통계를 나타냅니다.</p>
                        <p>- Class_Statistics : Class 별 통계를 나타냅니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>4. Confusion Matrix</p>
                    <div style={{padding: '0 20px'}}>
                        <p>모델이 얼마나 정밀한지, 실용적인 분류를 했는지, 정확한 분류를 했는지 확인하실 수 있습니다.</p>
                        <p>- 왼쪽상단에 있는 값은 정확하게 관심범주를 분류한 값을 나타냅니다.</p>
                        <p>- 오른쪽하단에 있는 값은 정확하게 관심범주가 아닌것을 정확하게 분류한 값을 나타냅니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>5. Loss</p>
                    <div style={{padding: '0 20px'}}>
                        <p>딥러닝 학습에 사용되는 손실 함수를 확인 하실 수 있습니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>6. Precision-Recall</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Precision : 예측 값이 참일 때 실제 값이 참인 비율입니다.</p>
                        <p>- Recall : 실제 값이 참일 때 예측 값이 참인 비율입니다.' </p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>7. Kappa-Coeff</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Kappa_score : 모델 신뢰도를 측정하는데 사용되는 통계량입니다.</p>
                        <p>- Matthews_corrcoef : 모델 신뢰도를 측정하는데 사용되는 통계량입니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>8. Auroc-FBeta</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- AUROC : FPR (False Positive Rate)에 대한 TPR (True Positive Rate) 을 플로팅하여 생성된 곡선의 면적 값을 계산합니다.</p>
                        <p>- F_beta : 모델 신뢰도를 측정하는데 사용되는 통계량입니다. </p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>9. Records</p>
                    <div style={{padding: '0 20px'}}>
                        <p>예측된 결과값을 확인하실 수 있습니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>10. API</p>
                    <div style={{padding: '0 20px'}}>
                        <p>각 프로그래밍 언어별 API를 제공해줍니다.</p>
                    </div>
                </div>
                <br />
                <div>
                <br />
                    <div>
                        <div style={{width : "100%",display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/상세보기.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 상세보기를 클릭합니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/detail.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델의 Accuracy <a href="https://en.wikipedia.org/wiki/Accuracy_and_precision" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>, ErrorRate<a href="https://en.wikipedia.org/wiki/Generalization_error" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>, Dice<a href="https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/featureImportance.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 생성에서 특징(변수)별 중요도를 나타냅니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/정밀분석.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 정밀 분석값을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/confusionmatrix.PNG" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 컨퓨전 메트릭스<a href="https://en.wikipedia.org/wiki/Confusion_matrix" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인 하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/Loss.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 손실 함수<a href="https://en.wikipedia.org/wiki/Loss_function" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인 하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/recall.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Precision<a href="https://en.wikipedia.org/wiki/Precision_and_recall#Precision" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>, Recall<a href="https://en.wikipedia.org/wiki/Precision_and_recall#Recall" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/kappa.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Kappa_score<a href="https://en.wikipedia.org/wiki/Cohen%27s_kappa" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>, Matthews_corrcoef<a href="https://en.wikipedia.org/wiki/Matthews_correlation_coefficient" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/fbeta.png" style={{width : "80%", margin: "0 auto"}} />     
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ AUROC<a href="https://en.wikipedia.org/wiki/Receiver_operating_characteristic" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>, FBeta<a href="https://en.wikipedia.org/wiki/F1_score" target="_blank" style={{fontSize: "80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/records.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ TEST 데이터의 예측값을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div>
                        <div style={{width : "100%", display: 'flex' }}>
                            <img src=fileurl+"asset/front/image/classification/api.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 프로그래밍 언어별 API 사용법을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>
                <br />
                */}
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

export default React.memo(Classification);
