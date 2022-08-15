import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import { NavLink } from "react-router-dom";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { fileurl } from "controller/api";
const Start = () => {
  const classes = currentTheme();

  return (
    <Container component="main" maxWidth="false" className={classes.mainCard}>
      <GridContainer>
        <GridItem xs={12}>
          <div>CLICKAI 기본 동작에 관한 사용법을 확인 할 수 있습니다.</div>
        </GridItem>
        {/*<Divider className={classes.titleDivider} />*/}
        <GridItem xs={12} style={{ marginBottom: "20px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "20px" }}>
            <BorderColorIcon fontSize="lg" style={{ marginRight: "10px" }} />
            시작하기 - CLICK AI에 관한 기본적인 동작방법에 대해 안내합니다. 아래
            순서대로 보시는걸 추천합니다.
          </div>
          <div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              1. <a href="#makeAccount">계정 생성 및 이용플랜 등록</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              2. <a href="#startProject">프로젝트 시작</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              3. <a href="#projectDetail">프로젝트 상세</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              4. <a href="#modelDetail">모델 상세</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              5. <a href="#predict">예측하기</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              6. <a href="#file">파일 업로드</a>
            </div>
            <div style={{ marginLeft: "20px", marginBottom: "20px" }}>
              7. <a href="#sample">샘플데이터</a>
            </div>
            <br />
          </div>
          <h4 id="1-계정-생성-및-이용플랜-등록">
            1. 계정 생성 및 이용플랜 등록
          </h4>
          <div id="makeAccount" style={{ margin: "0 20px" }}>
            <div>
              1-1. 회원가입 후 이용약관에 동의하셔야 로그인이 가능합니다.
            </div>
            <br />
            <div>
              1-2. 처음 로그인시, 이용플랜을 반드시 등록하셔야 서비스 이용이
              가능합니다. 이용플랜에 대한 자세한 설명은 홈페이지에서 확인
              가능합니다.{" "}
              <a href="https://clickai.ai/pricing.html" target="_blank">
                (자세한 설명 보기)
              </a>
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/payment.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 첫 로그인시 나오는 이용플랜 선택 화면 ]
              </p>
            </div>
          </div>
          <p>
            <br />
          </p>
          <h4 id="2-프로젝트-시작">2. 프로젝트 시작</h4>
          <div id="startProject" style={{ margin: "0 20px" }}>
            <div>
              2-1. 계정 생성과 이용플랜 등록까지 진행했다면, 프로젝트 탭에서
              개발시작하기를 눌러 프로젝트를 시작하실 수 있습니다.{" "}
            </div>
            <div style={{ marginLeft: "20px" }}>
              (이용플랜별 생성할 수 있는 프로젝트 수는 제한되어 있으며,
              누적프로젝트 한도 초과시 이용플랜 업그레이드가 필요합니다.)
            </div>
            <br />
            <div>
              2-2. 데이터를 업로드 하는 방법에는 1)PC에 있는 파일을 직접 업로드
              2)파일목록에서 가져오기 3)샘플데이터 사용 3가지가 있습니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              1) PC에 있는 파일을 직접 업로드하는 경우에는, zip 혹은 csv 파일만
              업로드 가능합니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              2) 파일목록에서 파일을 선택하여 프로젝트를 시작할수도 있습니다.
              이미지예측과 관련하여 보다 편히 이용할수 있는 기능을 제공합니다.
              <a href="#file">(자세한 설명 보기)</a>
            </div>
            <div style={{ marginLeft: "20px" }}>
              3) 보유하고 계신 데이터셋이 없다면 샘플데이터를 이용하여 모델을
              생성하고 예측해볼 수 있습니다.{" "}
              <a href="#sample">(자세한 설명 보기)</a>
            </div>
            <br />
            <div>
              2-3. 프로젝트를 진행하기 전에 올바른 데이터 파일을 업로드했는지
              다시 한번 확인해주세요. (데이터에 따라 생성된 모델 결과가 크게
              달라집니다.)
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/startproject.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 개발시작하기 버튼 클릭시 나오는 프로젝트 생성 화면 ]
              </p>
            </div>
            <br />
            <div>
              2-4. 파일을 업로드하고 다음 버튼을 누르면 프로젝트가 생성됩니다.
              로딩 중에는 서비스 이용에 도움이 되는 여러 TIP들을 확인하실 수
              있습니다.
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/loading.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다음 버튼을 클릭한 뒤 프로젝트 생성이 시작되면 나오는 로딩
                화면 ]
              </p>
            </div>
            <br />
            <div>
              2-5. 프로젝트가 생성된 후, 옵션값을 선택하고 START 버튼을 클릭하면
              모델이 생성됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              1) 분석/예측하고 싶은 값 : 최종적으로 분석/예측하고 싶은
              값(변수)를 선택하시면 됩니다. 예측하고싶은 값의 유일값(Unique)은
              250개를 초과할 수 없으며, 학습데이터 사용에서 제외됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              2) 선호하는 방식 : '정확도가 높게', '학습속도가 빠르게' 총 2가지의
              방식을 제공하며, 원하는 방식에 맞게 선택하시면 됩니다.
            </div>
            <div style={{ marginLeft: "40px" }}>
              ** 정확도가 높게 : 총 120개의 모델 생성
            </div>
            <div style={{ marginLeft: "40px" }}>
              ** 학습속도가 빠르게 : 총 16개의 모델 생성
            </div>
            <div style={{ marginLeft: "20px" }}>
              3) 학습형태 : 모델을 생성하는 7가지의 학습을 제공합니다. (정형
              데이터분류 / 정형 데이터 카테고리분류 / 정형 데이터 연속값분류 /
              자연어처리 / 이미지분류 / 물체인식 / GAN)
            </div>
            <div style={{ marginLeft: "40px" }}>
              자세한 설명을 각 학습형태별 사용법에서 확인하실 수 있습니다.{" "}
              <a href="./"> (자세한 설명 보기)</a>
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/optionselect.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 프로젝트 생성 후 옵션값을 선택하는 화면 ]
              </p>
            </div>
            <br />
            <div>
              2-6. 모델 생성이 시작된 후, 프로젝트 중단을 원할시 오른쪽 상단에
              위치한 프로젝트 중단하기 버튼을 클릭하시면 프로젝트가 중단됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              (모델이 생성되기 전이라면 누적 프로젝트수는 증가하지 않습니다.)
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/modelprocessing.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모델 생성이 시작된 후 화면 ]
              </p>
            </div>
            <br />
          </div>
          <p>
            <br />
          </p>
          <h4 id="3-프로젝트-상세">3. 프로젝트 상세</h4>
          <div id="projectDetail" style={{ margin: "0 20px" }}>
            <div>
              프로젝트에 관련된 상세내용은 데이터, 요약, 모델 탭에서 확인하실 수
              있습니다. 모델탭은 모델생성이 시작되고 1개 이상의 모델이 생성된
              경우에만 활성화됩니다.{" "}
            </div>
            <br />
            <div>3-1. 데이터 : 원본데이터 파일 </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/rowdata.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 데이터 탭 화면 ]
              </p>
            </div>
            <br />
            <div>3-2. 요약 : 원본데이터를 분석한 파일 </div>
            <div style={{ marginLeft: "20px" }}>
              1) 유실값 : 채워지지 않은 데이터
            </div>
            <div style={{ marginLeft: "20px" }}>2) 유일키 : 고유한 값</div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/summary.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 요약 탭 화면 ]
              </p>
            </div>
            <br />
            <div>
              3-3. 모델 : 생성된 모델리스트. 상태, 정확도 등 원하는 지표값으로
              정렬가능하며, 상태가 '완료'인 경우 모델의 상세보기와 예측하기가
              가능합니다.{" "}
            </div>
            <div style={{ marginLeft: "20px" }}>
              <a href="#modelDetail"> 1) 상세보기 바로가기 </a>
            </div>
            <div style={{ marginLeft: "20px" }}>
              <a href="#predict"> 2) 예측하기 바로가기</a>
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/modellist.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모델 탭 화면 ]
              </p>
            </div>
            <br />
          </div>
          <p>
            <br />
          </p>
          <h4 id="4-모델-상세">4. 모델 상세</h4>
          <div id="modelDetail" style={{ margin: "0 20px" }}>
            <div>
              4-1. 모델 생성이 완료가 된 모델리스트 중 상세보기를 클릭하여
              자세한 정보를 확인하실 수 있습니다.{" "}
            </div>
            <div>
              <br />
              <div>
                <div style={{ width: " 100%", display: "flex" }}>
                  <img
                    src="classification/상세보기.png"
                    style={{ width: "80%", margin: "0 auto" }}
                  />
                </div>
                <p style={{ textAlign: "center", fontWeight: "bold" }}>
                  [ 모델 우측에 있는 상세보기 ]
                </p>
              </div>
            </div>
            <br />
            <div>
              4-2. 상세보기는 도표와 그래프 등 시각적으로 한눈에 볼 수있게
              정리되어 있어, 최고의 성능을 가진 모델을 선택하는데 많은 도움이
              됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              학습형태별 지표가 다르므로, 자세한 상세 내용은 학습형태별 사용법을
              확인해주세요.
              <a href="./"> (자세한 설명 보기)</a>
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/modeldetail.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 모델 상세보기 화면 ]
              </p>
            </div>
            <br />
          </div>
          <p>
            <br />
          </p>
          <h4 id="5-예측하기">5. 예측하기</h4>
          <div id="predict" style={{ margin: "0 20px" }}>
            <div>
              예측하기는 생성된 모델을 사용하여 결과값을 예측하는 기능입니다.
              단일의 케이스만 예측하는 개별예측과 다수의 케이스를 예측하는
              일괄예측으로 분류됩니다.
            </div>
            <div>
              (이미지분류, 물체인식, GAN인 경우는 개별예측만 가능하며, 현재는
              일괄예측 기능을 이용하실 수 없습니다.){" "}
            </div>
            <br />
            <div>
              <div>
                <div style={{ width: " 100%", display: "flex" }}>
                  <img
                    src={fileurl+"asset/front/image/start/예측.png"}
                    style={{ width: "80%", margin: "0 auto" }}
                  />
                </div>
                <p style={{ textAlign: "center", fontWeight: "bold" }}>
                  [ 모델 우측에 있는 개별예측 / 일괄예측 ]
                </p>
              </div>
            </div>
            <br />
            <div>
              5-1. 개별예측 : 예측하고 싶은 데이터를 입력하거나 이미지/영상을
              업로드하여 결과값을 빠르게 확인할 수 있습니다.
            </div>
            <div style={{ marginLeft: "40px" }}>
              a. 데이터 입력 : 정형데이터분류, 일반카테고리분류, 일반연속값분류,
              자연어처리에 해당합니다. 직접 데이터를 입력하시거나, 랜덤채우기
              기능을 이용하여 랜덤의 데이터를 채웁니다.
            </div>
            <div style={{ marginLeft: "40px" }}>
              b. 이미지/영상 업로드 : 이미지분류, 물체인식, GAN에 해당합니다.
              이미지(jpg,jpeg,png), 영상(mp4) 파일을 업로드 합니다. (영상은
              물체인식과 GAN에서만 지원합니다.)
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/classification/랜덤채우기결과.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ a. 데이터 입력 실행 결과 ]
              </p>
            </div>
            <br />
            <div>
              <div style={{ width: " 100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/object/개별예측결과.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ b. 이미지 업로드 실행 결과 ]
              </p>
            </div>
            <br />
            <div>
              5-2. 일괄예측 : 다수의 데이터를 예측하고 싶을 때, 개별적으로
              여러번 입력할 필요없이 예측하고 싶은 데이터가 담긴 csv 파일을
              업로드하여 결과값 파일을 다운받을 수 있습니다.
            </div>
            <br />
            <div>
              <div>
                <div style={{ width: " 100%", display: "flex" }}>
                  <img
                    src={fileurl+"asset/front/image/classification/일괄예측업로드.png"}
                    style={{ width: "80%", margin: "0 auto" }}
                  />
                </div>
                <p style={{ textAlign: "center", fontWeight: "bold" }}>
                  [ csv 파일 업로드 화면 ]
                </p>
              </div>
            </div>
            <br />
            <div>
              <br />
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/classification/일괄예측결과.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 다운로드 된 결과값 csv 파일 화면 ]
              </p>
            </div>
            <br />
          </div>
          <p>
            <br />
          </p>
          <h4 id="6-파일-업로드">6. 파일 업로드</h4>
          <div id="file" style={{ margin: "0 20px" }}>
            <div>
              프로젝트 생성시 매번 파일을 업로드해야되는 번거로움을 해소하기
              위해 파일탭에서 파일 관리 및 프로젝트 시작할 수 있는 기능을
              제공합니다.
            </div>
            <div>
              (이용플랜별 생성할 수 있는 누적 파일수와 용량은 제한되어 있으며,
              누적 파일수 및 용량 초과시 이용플랜 업그레이드가 필요합니다.)
            </div>
            <br />
            <div>6-1. 파일업로드 방법 </div>
            <div style={{ marginLeft: "20px" }}>
              1) 폴더를 생성해서 파일을 업로드하는 방식
            </div>
            <div style={{ marginLeft: "40px" }}>
              a. 추가 -&gt; 폴더 추가 버튼을 클릭 후 폴더를 생성합니다.
            </div>
            <div style={{ marginLeft: "40px" }}>
              b. 추가된 폴더를 클릭하여 해당 폴더로 위치한다음, 추가 -&gt;
              파일업로드를 클릭하여 파일을 업로드합니다. (다수의 파일을 한번에
              등록가능하며, 한번에 최대 업로드 가능한 용량은 **GB입니다.)
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/addfolder.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 폴더 등록 화면 ]
              </p>
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/addfile.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 파일 등록 화면 ]
              </p>
            </div>
            <br />
            <div style={{ marginLeft: "20px" }}>
              2) 폴더 자체를 업로드하는 방식
            </div>
            <div style={{ marginLeft: "40px" }}>
              a. 폴더가 추가될 위치로 이동합니다. (현재 위치하고 있는 폴더의
              하위 폴더로 생성되므로 위치를 다시한번 확인해주세요.)
            </div>
            <div style={{ marginLeft: "40px" }}>
              b. 추가 -&gt; 폴더업로드를 클릭하여 폴더를 업로드합니다. (한번에
              하나의 폴더만 업로드 가능하며, 한번에 최대 업로드 가능한 용량은
              **GB입니다.)
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/onefolderupload.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 폴더 자체 업로드 화면 ]
              </p>
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/fileresult.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 결과 화면 ]
              </p>
            </div>
            <br />
            <div>
              6-2. 파일 관리 : 이름바꾸기, 삭제, 다운로드 기능을 제공합니다.
              파일을 체크한 후 더보기 버튼을 클릭하면, 삭제/이름바꾸기/다운로드
              버튼이 활성화 됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              1) 이름바꾸기 : 단일의 파일/폴더를 선택한 경우에만 이름바꾸기
              기능이 활성화됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              2) 삭제 : 1개 이상의 파일/폴더 선택시 삭제 기능이 활성화됩니다.
            </div>
            <div style={{ marginLeft: "20px" }}>
              3) 다운로드 : 단일의 파일을 선택한 경우에만 다운로드 기능이
              활성화됩니다.
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/filefunction.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 파일 관리 화면 ]
              </p>
            </div>
            <br />
            <div>
              6-3. 파일에서 시작하기 : 매번 파일을 업로드 할 필요없이, 파일
              목록에서 선택하여 바로 프로젝트를 시작할 수 있습니다.{" "}
            </div>
            <div style={{ marginLeft: "20px" }}>
              프로젝트명은 Generated From Folders로 임의로 생성되며,
              프로젝트명은 변경 가능합니다.{" "}
            </div>
            <br />
            <div style={{ marginLeft: "20px" }}>
              1) csv/zip 파일로 시작하기 : 단일 csv/zip 파일을 선택시에만
              프로젝트를 시작하실 수 있습니다. (2개 이상의 파일 선택시 프로젝트
              시작 불가)
            </div>
            <div style={{ marginLeft: "40px" }}></div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/csvstart.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ zip파일로 프로젝트 시작하기 ]
              </p>
            </div>
            <br />
            <div style={{ marginLeft: "20px" }}>
              2) 다중 폴더 선택하여 시작하기 : 2개 이상의 폴더를 선택시에만
              프로젝트를 시작하실 수 있습니다. (단일의 폴더 선택시 프로젝트 시작
              불가)
            </div>
            <div style={{ marginLeft: "40px" }}>
              a. 선택한 폴더의 이름으로 라벨링이 되기때문에, 폴더명을
              확인해주세요.
            </div>
            <div style={{ marginLeft: "40px" }}>
              b. 선택한 폴더의 하위폴더 또한 데이터로 사용되기 때문에, 폴더를
              다시한번 확인해주세요.
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/folderstart.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 폴더로 프로젝트 시작하기 ]
              </p>
            </div>
            <br />
          </div>
          <p>
            <br />
          </p>
          <h4 id="7-샘플데이터">7. 샘플데이터</h4>
          <div id="sample" style={{ margin: "0 20px" }}>
            <div>
              샘플데이터는 직접 AI 개발을 하고 싶지만, 보유하고 있는
              샘플데이터셋이 없는 분들을 위해 제공하는 기능입니다.{" "}
            </div>
            <br />
            <div>
              7-1. 산업군을 선택하면 해당하는 데이터셋을 확인하실 수 있으며,
              이용해보고 싶은 샘플데이터셋을 선택한 후 다음버튼을 누르면
              프로젝트 상세화면으로 넘어갑니다.{" "}
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/sample.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 샘플데이터로 시작하는 화면 ]
              </p>
            </div>
            <br />
            <div>
              7-2. 샘플데이터셋을 이용한 경우에는 옵션값(예측하고싶은값,
              선호하는방식, 학습방법)을 선택하실 수 없습니다.{" "}
            </div>
            <br />
            <div>
              <div style={{ width: "100%", display: "flex" }}>
                <img
                  src={fileurl+"asset/front/image/start/samplewarning.png"}
                  style={{ width: "80%", margin: "0 auto" }}
                />
              </div>
              <p style={{ textAlign: "center", fontWeight: "bold" }}>
                [ 샘플데이터 상세 화면 ]
              </p>
            </div>
            <br />
            <div>
              7-3. START 버튼을 누르면 샘플데이터를 이용한 모델이 생성되며, 모델
              상세보기 및 예측하기 방식은 위에서 설명한 것과 동일합니다.{" "}
            </div>
            <div style={{ marginLeft: "20px" }}>
              <a href="#modelDetail"> 1) 상세보기 바로가기 </a>
            </div>
            <div style={{ marginLeft: "20px" }}>
              <a href="#predict"> 2) 예측하기 </a>
            </div>
            <br />
          </div>
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
          <NavLink to="/admin/instruction/gan" className={classes.link}>
            7. GAN - 생성적 적대 신경망
          </NavLink>
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default React.memo(Start);
