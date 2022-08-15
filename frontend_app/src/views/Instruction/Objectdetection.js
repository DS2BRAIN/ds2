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
const Objectdetection = () => {
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
            물체 인식 사용 해보기
          </div>
          <h4 id="물체-인식">물체 인식이란?</h4>
          <div style={{ padding: "0 20px" }}>
            <p>
              물체인식 (Object Detection)이란 여러 물체에 대해 어떤 물체인지
              분류와 물체의 위치를 영역 구분을 통해 정보를 나타내는
              인공지능입니다.
            </p>
            <p>
              얼굴 검출, 보행자 검출, 무인 자동차, 불량품 검사, 공항 검색대 등
              여러 분야에 이용되고 있습니다.
            </p>
            <br />
            <br />
            <div class="video-container" style={{ textAlign: "center" }}></div>
            <object
              type="text/html"
              style={{ display: "flex", margin: "0 auto" }}
              width="80%"
              height="800"
              data="//www.youtube.com/embed/5wUUN1G3QUo"
              allowfullscreen=""
            ></object>
          </div>
          <div style={{ marginTop: "40px" }}>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/object/example.PNG"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 최종 결과물 - 어떤 차량인지 분류하는 물체인식 ]
            </p>
            <br />
          </div>
          <h4 id="직접-사용해보기"> ** 직접 사용해보기</h4>
          <h6 id="학습--목표-차량을-분류하는-모델-만들기">
            학습 목표 : 차량을 분류하는 모델 만들기.
          </h6>
          <h4 id="1-데이터-확인하기">1. 데이터 확인하기</h4>
          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/1_zip내부.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ 이미지가 들어간 폴더와 json파일 ]
            </p>
            <br />
          </div>

          <div>
            <br />
            <div style={{ width: " 100%", display: "flex" }}>
              <img
                src={fileurl + "asset/front/image/2_이미지데이터.png"}
                style={{ width: "80%", margin: "0 auto" }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              [ images 폴더 내부 물체 인식용 사진들 ]
            </p>
            <br />
          </div>

          <div style={{ padding: "0 20px" }}>
            <p>
              물체인식은 사진이 들어있는 폴더와 사진에 대한 이미지 라벨링 정보가
              들어있는 JSON파일로 구성됩니다.
            </p>
            <p>
              업로드 파일에는 2가지의 폴더를 ZIP로 압축하여 올려 주시면 됩니다.
            </p>
            <p>
              ( 혹은 폴더를 기준으로 라벨링을 하여 파일탭에 업로드 한 다음,
              폴더를 다중으로 선택하여 프로젝트를 시작하실 수도 있습니다. 이
              방식은 아래에서 더 자세히 설명하도록 하겠습니다. )
            </p>
            <br />
            <p>차량인식.zip</p>
            <p>|</p>
            <p>|ㅡㅡㅡ images</p>
            <p>| |</p>
            <p>| |ㅡㅡㅡ 차량 사진 모음.jpg</p>
            <p>| |ㅡㅡㅡ ...</p>
            <p>|</p>
            <p>|ㅡㅡㅡ trainval.json</p>
            <br />
          </div>

          <h5 id="11-json파일-작성하기">1.1 물체인식용 라벨링 데이터 만들기</h5>
          <div style={{ padding: "0 20px" }}>
            <p>
              물체인식 JSON파일은 COCO dataset 형식을 사용합니다. 데이터 특징은
              이미지와 라벨 2가지가 있습니다. 20개의 이미지와 3가지 Class의
              label로 이루어져있습니다.
            </p>
            <p>[label]</p>
            <p>bus : 버스</p>
            <p>car : 소형자동차</p>
            <p>truck : 트럭</p>
          </div>

          <div style={{ padding: "0 20px" }}>
            <p>
              물체인식을 위한 라벨링 데이터는 클릭AI에 자체적으로 내장하고 있는
              강력하고 간편한 툴을 이용하여 빠르게 만들 수 있습니다.{" "}
            </p>
          </div>

          <br />
          <h4 id="2-모델-만들기">2. 모델 만들기</h4>
          <h6 id="개발하기에서-직접-업로드">개발하기에서 직접 업로드</h6>

          {/* 추가됐어요! -> 다운로드 버튼을 이용해서 사용법에 소개된 데이터 다운로드 : 차량인식.csv  */}

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
                  src={fileurl + "asset/front/image/object/3_데이터업로드.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운받은 차량인식.zip 파일을 업로드하고 다음을 클릭합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/object/4_데이터선택.png"}
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
                  src={fileurl + "asset/front/image/object/5_학습형태.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 학습형태는 '물체인식'을 선택합니다. ]
              </p>
              <br />
            </div>
          </div>

          <div>
            <br />
            <div style={{ marginBottom: "40px" }}>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl + "asset/front/image/object/6_선호하는방식.png"}
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
                  src={fileurl + "asset/front/image/object/7_데이터요약.png"}
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
                  src={fileurl + "asset/front/image/object/8_데이터확인.png"}
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
                  src={fileurl + "asset/front/image/object/9_시작.png"}
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
                  src={fileurl + "asset/front/image/object/10_모델생성중.PNG"}
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
                            <img src=fileurl+"asset/front/image/object/모델결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ Accuracy Training Model 19 의 정확도가 93.4% 가 나오는 것을 확인할 수 있습니다. ]</p><br />
                    </div> 
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>*TIP!*</p>
                    <p>모델은 총 136개로 구성되어 있으며, '학습속도가 빠르게' 방식으로 학습하면 전체 모델 중 빠른 속도를 가진 16개의 모델을 생성하며, 정확도가 높은 순으로 정렬이 됩니다.</p>
                    <p>'정확도가 높게' 방식으로 학습하면 전체 모델을 생성하며, 정확도가 높은 순으로 정렬이 됩니다.</p>
                </div>
                <br />
                <h5 id="31-개별예측-사용하기">3.1 이미지예측 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>물체인식은 랜덤채우기 기능이 없습니다. 이미지를 직접 업로드하여 사용할 수 있습니다. </p>
                </div>
                <br />
                <div style={{marginBottom: '60px'}}>
                    <div style={{width :" 100%", display: "flex"}}>
                        <img src=fileurl+"asset/front/image/object/이미지예측예제.PNG" style={{width : "80%", margin: "0 auto"}} />
                    </div>
                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 이미지예측 예제사진.png ]</p>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/이미지예측.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 이미지예측을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/개별예측업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 이미지를 업로드를 한 뒤 실행을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div >
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/개별예측결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 개별 예측 결과 ]</p>
                    </div>
                </div>
                <br />
                <div style={{padding: '0 20px'}}>
                    <p>결과에서 보시다시피, 트럭과 자동차들을 구분하였고 그 확률을 나타내는 것을 확일하실 수 있습니다.</p>
                </div>
                <br />
                <h5 id="32-영상예측-사용하기">3.2 영상예측 사용하기</h5>
                <div style={{padding: '0 20px'}}>
                    <p>영상을 직접 업로드하여 사용할 수 있습니다.  </p>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <video src=fileurl+"asset/front/image/object/영상예측예제.mp4" style={{width : "80%", margin: "0 auto"}} autoplay="autoplay" controls muted loop></video>
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 영상예측예제.mp4 ]</p>
                    </div>
                </div>
                <br />
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/영상예측.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 모델 우측에 있는 영상예측을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/영상업로드.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 동영상을 업로드 한 뒤 실행을 클릭합니다. ]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div style={{marginBottom: '60px'}}>
                        <div style={{width :" 100%", display: "flex"}}>
                            <img src=fileurl+"asset/front/image/object/영상예측결과.png" style={{width : "80%", margin: "0 auto"}} />
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 영상의 물체들을 예측하여 구분하냅니다.]</p>
                    </div>
                </div>
                <div>
                    <br />
                    <div>
                        <div style={{width :" 100%", display: "flex"}}>
                            <video src=fileurl+"asset/front/image/object/영상예측결과.mp4" style={{width : "80%", margin: "0 auto"}} autoplay="autoplay" controls muted loop></video>
                        </div>
                        <p style={{textAlign: 'center', fontWeight: 'bold'}}>[ 영상예측결과 ]</p>
                    </div>
                </div>
                <div style={{padding: '0 20px'}}>
                    <p>결과에서 보시다시피, 차량들을 구분하였고 그 확률을 나타내는 것을 확일하실 수 있습니다. </p>
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

export default React.memo(Objectdetection);
