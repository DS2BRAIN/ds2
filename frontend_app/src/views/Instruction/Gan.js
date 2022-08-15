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
const Gan = () => {
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
            GAN - 생성적 적대 신경망 사용 해보기
          </div>
          <h4 id="gan---생성적-적대-신경망이란">
            GAN - 생성적 적대 신경망이란?
          </h4>
          <div style={{ padding: "0 20px" }}>
            <p>
              GAN(Generative Adversarial Network) 생성적 적대 신경망의 뜻을 먼저
              보겠습니다. 'Generative'는 발생, 생성를 뜻하며 Image를 만들어 내는
              것이라고 해석합니다.
            </p>
            <p>
              'Adversarial'는 두 개의 모델을 적대적으로 경쟁시키며 발전시킨다
              라고 해석합니다. 'Network'는 인공신경망을 따와서 붙혀졌습니다.
            </p>
            <p>
              이처럼 위조지폐범(Generator)은 경찰을 최대한 속이려 위조지폐 제조
              능력을 학습하고, GAN(Generative Adversarial Network) 생성적 적대
              신경망의 뜻을 먼저 보겠습니다.
            </p>
            <p>
              경찰은 위조지폐를 감별하려 학습할 것이다. 이 둘을 함께
              학습시키면서 서로의 성능을 점차 개선해 나가는것을 GAN이라고 할 수
              있습니다. GAN을 통해 새로운 이미지를 생성할 수 있습니다.
            </p>
            <br />
            <br />
            <div class="video-container" style={{ textAlign: "center" }}></div>
            <object
              style={{ display: "flex", margin: "0 auto" }}
              type="text/html"
              width="80%"
              height="800"
              data="//www.youtube.com/embed/W6q-Ib0zmQU"
              allowfullscreen=""
            ></object>
          </div>
          <br />
          <h3 id="직접-사용해보기"> ** 직접 사용해보기</h3>
          <h6 id="학습-목표--말을-얼룩말로-바꾸는-모델-만들기">
            학습 목표 : 말을 얼룩말로 바꾸는 모델 만들기.
          </h6>
          <h4 id="1-데이터-확인하기">1. 데이터 확인하기</h4>
          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/gan/1_카테고리이미지.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 첫번째 폴더에는 말 사진, 두번째 폴더에는 얼룩말 사진이 있습니다.
              ]
            </p>
            <br />
          </div>

          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/gan/2_수집이미지.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 각 카테고리별 gan 학습용 사진들 ]
            </p>
            <br />
          </div>

          <div style={{ padding: "0 20px" }}>
            <p>
              GAN은 기존 원본 사진이 들어있는 폴더와, 변화된 사진이 들어있는
              폴더로 구성됩니다. 업로드 파일에는 2가지의 폴더를 ZIP로 압축하여
              올려 주시면 됩니다.
            </p>
            <br />
            <p>GAN.zip</p>
            <p>|</p>
            <p>|ㅡㅡㅡ Horse</p>
            <p>| |</p>
            <p>| |ㅡㅡㅡ 말 사진.jpg</p>
            <p>| |ㅡㅡㅡ ...</p>
            <p>|ㅡㅡㅡ Zebra</p>
            <p> |</p>
            <p> |ㅡㅡㅡ 얼룩말 사진.jpg</p>
            <p> |ㅡㅡㅡ ...</p>
            <br />
          </div>
          <div style={{ padding: "0 20px" }}>
            <p>
              데이터 특징은 말사진과 얼룩말 사진으로 이루어져 있습니다. 결과는
              말 사진을 얼룩말 사진으로 변환시킵니다.
            </p>
          </div>
          <br />

          <h4 id="2-모델-만들기">2. 모델 만들기</h4>
          <h6 id="개발하기에서-직접-업로드">2-1. 개발하기에서 직접 업로드</h6>

          {/* 추가됐어요! -> 다운로드 버튼을 이용해서 사용법에 소개된 데이터 다운로드 : 얼룩말.zip  */}

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
                [ 개발 시작하기를 클릭합니다. ]
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
                클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/gan/3_데이터업로드.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 얼룩말.zip 파일을 업로드 합니다. ]
              </p>
              <br />
            </div>
          </div>

          {/*                 
                <h6 id="2-2-파일탭에-업로드-후-프로젝트-시작">2-2. 파일탭에 업로드 후 프로젝트 시작</h6>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/폴더업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 파일 -&gt; 추가 -&gt; 폴더업로드 를 클릭하여, 이미지파일이 담긴 폴더를 업로드 합니다. ]</p><br />
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/파일탭에서시작하기.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ GAN에 사용하실 폴더 2개를 체크한 뒤, 오른쪽 상단에 위치한 프로젝트 시작하기 버튼을 클릭합니다. ]</p><br />
                    </div>
                </div>

                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/개발하기에서가져오기.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 또한 개발하기 -&gt; 파일목록에서 가져오기 탭을 클릭한 후, 이미지분류에 사용하실 폴더들을 선택하여 진행하실 수도 있습니다. ]</p><br />
                    </div>
                </div>

                <h6 id="이후-과정은-프로젝트-시작-방법과-관계없이-동일">** 이후 과정은 프로젝트 시작 방법과 관계없이 동일</h6>
                */}

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/gan/4_데이터선택.png"}
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
                  src={fileurl + "asset/front/image/gan/5_학습형태.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습형태는 '이미지 생성(GAN)'을 선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/gan/6_선호하는방식.png"}
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
                  src={
                    fileurl + "asset/front/image/gan/7_분석 예측하고 싶은값.png"
                  }
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 분석/예측하고 싶은값에 'Zebra - 얼룩말.zip'을 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/gan/8_데이터요약.png"}
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
                  src={fileurl + "asset/front/image/gan/9_데이터확인.png"}
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
                  src={fileurl + "asset/front/image/gan/10_시작.png"}
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
                  src={fileurl + "asset/front/image/gan/11_모델생성중.png"}
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

          {/*                 
                <h4 id="3-모델-활용하기">3. 모델 활용하기</h4>
                <div>
                    <br />
                    <div style={{marginBottom: '40px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/모델결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 예를들어, Fast Model 5 의 Total_loss 99.5833% 가 나오는 것을 확인할 수 있습니다.  ]</p><br />
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
                    <p>GAN은 랜덤채우기 기능이 없습니다. 이미지를 직접 업로드하여 사용할 수 있습니다. </p>
                </div>
                <br />
                <div style={{marginBottom: '60px'}}>
                    <div style={{width :" 100%", display: "flex"}}>     
                        <img src=fileurl+"asset/front/image/gan/개별예측.png" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 개별예측을 클릭합니다. ]</p>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/개별예측파일업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 이미지를 업로드를 한 뒤 실행을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/개별예측결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 말이 얼룩말이 된 걸 확인하실 수 있습니다. ]</p>
                    </div>
                </div>
                <br />
                <h5 id="32-영상예측-사용하기">3.2 상세보기 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>GAN의 상세보기는 API만 확인하실 수 있습니다.  </p>
                </div>
                <br />
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>     
                            <img src=fileurl+"asset/front/image/gan/api.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 사용 언어별 API 사용법을 확인하실 수 있습니다. ]</p>
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

export default React.memo(Gan);
