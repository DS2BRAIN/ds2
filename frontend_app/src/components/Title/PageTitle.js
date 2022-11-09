import React from "react";
import { useTranslation } from "react-i18next";

import styled from "styled-components";
import { Grid } from "@mui/material";

const TopTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #f0f0f0;
  margin-bottom: 16px;
`;

const SubTitle = styled.div`
  color: #f0f0f0;
  font-size: 16px;
`;

const PageTitle = ({ topTitleText, subTitleText }) => {
  const { t } = useTranslation();

  return (
    <Grid sx={{ my: 4 }}>
      <TopTitle>{t(topTitleText)}</TopTitle>
      <SubTitle>{t(subTitleText)}</SubTitle>
    </Grid>
  );
};

export default PageTitle;
