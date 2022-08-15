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
const Naturallanguage = () => {
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
            자연어 처리 사용 해보기
          </div>
          <h4 id="자연어-처리란">자연어 처리란?</h4>
          <div style={{ padding: "0 20px" }}>
            <p>
              자연어 처리 (Natural Language Processing)는 인간의 언어 현상을
              컴퓨터가 처리하고
            </p>
            <p>
              이해할 수 있도록 하는 것입니다. 주로 번역, 감정 분석, 악플 판단,
              정보 검색, 질의응답 시스템 등 여러 분야로 활용되고 있습니다.
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
          <h6 id="학습-목표--영화-리뷰-평가-AI모델-만들기">
            학습 목표 : 영화 리뷰 평가 AI모델 만들기.
          </h6>

          {/* 추가됐어요! -> 다운로드 버튼을 이용해서 사용법에 소개된 데이터 다운로드 : 영화리뷰.csv  */}

          <h4 id="1-데이터-확인하기">1. 데이터 확인하기</h4>
          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/nlp/1_영화리뷰.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 영화리뷰.csv ]
            </p>
            <br />
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>데이터 특징은 리뷰와 라벨 2가지가 있습니다.</p>
            <p>
              결과값 라벨은 2가지로 나뉘어져 있으며, 0 - 부정, 1 - 긍정
              리뷰입니다.
            </p>
          </div>
          <br />
          <h4 id="2-모델-만들기">2. 모델 만들기</h4>
          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/개발시작하기.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 개발 시작하기를 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
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
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/2_데이터업로드.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운받은 영화 리뷰.csv 파일을 업로드하고 다음을 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/3_데이터선택.png"}
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
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/4_학습형태.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습형태는 '자연어'를 선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/5_선호하는방식.png"}
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
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={
                    fileurl + "asset/front/image/nlp/6_분석 예측하고싶은값.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 분석/예측하고 싶은값에 'label - 영화 리뷰.csv'을 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/7_데이터요약.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 하단을 보면 데이터 요약과 더불어 학습데이터 사용여부를 선택할
                수 있습니다. (분석/예측하고 싶은 값은 자동으로 사용여부가
                해제됩니다.) ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/8_데이터확인.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습 형태는 자연어를 선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/9_일괄전처리.png"}
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
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/10_전처리기능.png"}
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
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/11_부분전처리.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 부분적으로 전처리를 원하는 경우, 전처리를 원하는 데이터의
                전처리하기 버튼을 클릭 후, 일괄전처리와 똑같은 방식으로 전처리를
                합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/12_시작.png"}
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
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/nlp/13_모델생성중.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [시작 버튼 클릭 후 모델 생성이 시작되며, 모델생성의 진행사항을
                확인할 수 있습니다. ]
              </p>
              <br />
            </div>
          </div>
          <br />
          {/*                 
                <h4 id="3-모델-활용하기">3. 모델 활용하기</h4>
                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/모델 결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Training Model 92 가 정확도가 95.6% 나오는 것을 확인하실 수 있습니다. ]</p>
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
                <div  style={{marginBottom: '60px'}}>
                    <div style={{width: '100%', display: 'flex'}}>
                        <img src=fileurl+"asset/front/image/nlp/개별예측.png" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 개별예측을 클릭합니다. ]</p>
                </div>
                <h6 id="랜덤-채우기를-이용하여-예측을-해보겠습니다">A.랜덤 채우기를 이용하여 예측을 해보겠습니다.</h6>
                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/랜덤채우기.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 랜덤 채우기를 하면 각 특징별 값을 랜덤으로 채워줍니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/랜덤채우기결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 실행 결과 ]</p>
                    </div>
                </div>
                <br />
                <h5 id="32-일괄예측-사용하기">3.2 일괄예측 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>일괄예측은 예측하고싶은 데이터가 많을 때 사용됩니다.</p>
                    <p>CSV파일을 통햬 업로드를 하며 이때 CSV파일에는 예측하고싶은 값을 제외한 모든 특징들이 있어야합니다.</p>
                    <p>아래와 같이 label을 제외한 reviews의 값이 들어가 있어야 합니다. </p>
                </div>
                <div>
                    <br />
                    <div style={{width :" 80%", margin: "0 auto"}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/일괄예측데이터.PNG" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 영화리뷰예측.csv ]</p><br />
                </div>
                <div>
                    <br />
                    <div >
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/일괄예측.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 일괄예측을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/일괄예측업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 파일을 업로드 후 다음버튼을 클릭하면 결과 파일이 다운로드됩니다. ]</p>
                    </div>
                </div>
                <div style={{marginBottom: '60px'}}>
                    <br />
                    <div style={{width : "80%", margin: "0 auto" }}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/일괄예측결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 다운로드 된 CSV열어 각 항목별 예측값 및 정보를 확인하실 수 있습니다. ]</p>
                </div>
                <h5 id="33-상세보기-사용하기" style={{padding: '0 20px'}}>3.3 상세보기 사용하기</h5>
                <div style={{padding: '0 20px'}}>상세보기는 총 9개의 단계로 확인하실 수 있습니다.</div>
                <div style={{padding: '0 20px'}}>
                    <p>1. Detail</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Accuracy (정확도)</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>2. 정밀분석</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Overall_Statistics : 전체 통계를 나타냅니다.</p>
                        <p>- Class_Statistics : Class 별 통계를 나타냅니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>3. Confusion Matrix</p>
                    <div style={{padding: '0 20px'}}>
                        <p>모델이 얼마나 정밀한지, 실용적인 분류를 했는지, 정확한 분류를 했는지 확인하실 수 있습니다.</p>
                        <p>- 왼쪽상단에 있는 값은 정확하게 관심범주를 분류한 값을 나타냅니다.</p>
                        <p>- 오른쪽하단에 있는 값은 정확하게 관심범주가 아닌것을 정확하게 분류한 값을 나타냅니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>4. Loss</p>
                    <div style={{padding: '0 20px'}}>
                        <p>딥러닝 학습에 사용되는 손실 함수를 확인 하실 수 있습니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>5. Precision-Recall</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- Precision : 예측 값이 참일 때 실제 값이 참인 비율입니다.</p>
                        <p>- Recall : 실제 값이 참일 때 예측 값이 참인 비율입니다. </p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>6. Auroc-FBeta</p>
                    <div style={{padding: '0 20px'}}>
                        <p>- AUROC : FPR (False Positive Rate)에 대한 TPR (True Positive Rate) 을 플로팅하여 생성된 곡선의 면적 값을 계산합니다.</p>
                        <p>- F_beta : 모델 신뢰도를 측정하는데 사용되는 통계량입니다. </p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>7. Records</p>
                    <div style={{padding: '0 20px'}}>
                        <p>예측된 결과값을 확인하실 수 있습니다.</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>8. API</p>
                    <div style={{padding: '0 20px'}}>
                        <p>각 프로그래밍 언어별 API를 제공해줍니다.</p>
                    </div>
                </div>
                <br />
                <div>
                <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/상세보기.PNG" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 상세보기를 클릭합니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/detail.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델의 Accuracy <a href="https://en.wikipedia.org/wiki/Accuracy_and_precision" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>, ErrorRate<a href="https://en.wikipedia.org/wiki/Generalization_error" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>, Dice<a href="https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/정밀분석.PNG" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 정밀 분석값을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/confusionmatrix.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 컨퓨전 메트릭스<a href="https://en.wikipedia.org/wiki/Confusion_matrix" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>를 확인 하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/Loss.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 손실 함수<a href="https://en.wikipedia.org/wiki/Loss_function" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>를 확인 하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/recall.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Precision<a href="https://en.wikipedia.org/wiki/Precision_and_recall#Precision" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>, Recall<a href="https://en.wikipedia.org/wiki/Precision_and_recall#Recall" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/fbeta.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ AUROC<a href="https://en.wikipedia.org/wiki/Receiver_operating_characteristic" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>, FBeta<a href="https://en.wikipedia.org/wiki/F1_score" target="_blank" style={{fontSize:"80%"}}>(자세히 알아보기)</a>를 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/records.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ TEST 데이터의 예측값을 확인하실 수 있습니다. ]</p>
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width: '100%', display: 'flex'}}>
                            <img src=fileurl+"asset/front/image/nlp/api.png" style={{width : "80%", margin: "0 auto"}} />
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

export default React.memo(Naturallanguage);
