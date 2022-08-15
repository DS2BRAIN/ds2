import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Divider from "@material-ui/core/Divider";
import GridItem from "../../components/Grid/GridItem.js";
import GridContainer from "../../components/Grid/GridContainer.js";
import { NavLink } from "react-router-dom";
import Container from "@material-ui/core/Container";
import currentTheme from "assets/jss/custom.js";

const Instruction = () => {
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
          CLICK AI를 통해 원하는 기능으로 인공지능 모델을 만들어 볼 수 있습니다.
        </GridItem>
        <GridItem xs={12} style={{ marginBottom: "20px" }}>
          최적의 인공지능 모델을 생성하기 위해서는 다른 학습형태가 적용됩니다.
          각 학습형태에 맞는 사용법을 숙지한 뒤, 프로젝트를 시작하시길
          추천드립니다.
        </GridItem>
        <GridItem xs={12} style={{ marginBottom: "60px" }}>
          기본적인 동작방법이 궁금하시면 시작하기에서 자세한 설명을 보실 수
          있습니다.
        </GridItem>
        <GridItem style={{ display: "flex", flexDirection: "column" }}>
          <NavLink
            key="project"
            to="/admin/instruction/start"
            className={classes.link}
          >
            1. 시작하기
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/auto"
            className={classes.link}
          >
            2. 정형 데이터 분류
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/classification"
            className={classes.link}
          >
            3. 정형 카테고리 분류
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/regression"
            className={classes.link}
          >
            4. 정형 연속값 분류
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/naturallanguage"
            className={classes.link}
          >
            5. 자연어 처리
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/image"
            className={classes.link}
          >
            6. 이미지 분류
          </NavLink>
          <NavLink
            key="project"
            to="/admin/instruction/objectdetection"
            className={classes.link}
          >
            7. 물체 인식
          </NavLink>
          {/* <NavLink
                key='project'
                to='/admin/instruction/gan'
                className={classes.link}
                > 
                    8. GAN - 생성적 적대 신경망
                </NavLink> */}
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default React.memo(Instruction);
