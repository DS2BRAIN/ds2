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

const Auto = () => {
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
            정형 데이터 분류 사용 해보기
          </div>
          <h4 id="일반-자동-분류란">정형 데이터 분류란?</h4>
          <div style={{ padding: "0 20px" }}>
            <p>
              정형 데이터 분류는 카테고리 분류(Classifiication), 연속값
              분류(Regression)을 자동으로 분류합니다.
            </p>
            <p>
              * 카테고리 분류(Classifiication) : 카테고리와 같은 비연속적인 값을
              예측{" "}
            </p>
            <p>* 연속값 분류(Regression) : 연속적인 숫자 값을 예측 </p>
            <p>
              데이터가 카테고리 분류인지 연속값 분류인지 모르는 경우, 해당
              학습형태를 선택하시면 자동으로 분류됩니다.{" "}
            </p>
            <p>
              프로젝트가 진행되는 자세한 설명은 카테고리 분류와 연속값 분류에서
              확인하실 수 있습니다.{" "}
            </p>
            <br />
            <br />
            <div class="video-container" style={{ textAlign: "center" }}></div>
            <object
              type="text/html"
              width="100%"
              height="800"
              data="//www.youtube.com/embed/_mlGH9Oi1BA"
              allowfullscreen=""
            ></object>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h5>
              <SendIcon fontSize="lg" style={{ marginRight: "10px" }} />
              바로가기
            </h5>
            <NavLink
              key="project"
              to="/admin/instruction/classification"
              className={classes.link}
            >
              1. 정형 카테고리 분류
            </NavLink>
            <NavLink
              key="project"
              to="/admin/instruction/regression"
              className={classes.link}
            >
              2. 정형 연속값 분류
            </NavLink>
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
          {/* <NavLink
                to='/admin/instruction/gan'
                className={classes.link}
                > 
                    7. GAN - 생성적 적대 신경망
                </NavLink> */}
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default React.memo(Auto);
