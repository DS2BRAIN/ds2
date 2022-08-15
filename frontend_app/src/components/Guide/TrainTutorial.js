import React, { useState } from "react";
import { useSelector } from "react-redux";
import { fileurl } from "controller/api";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";
import currentTheme from "assets/jss/custom.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

const TrainTutorial = ({ history }) => {
  const classes = currentTheme();
  const { t } = useTranslation();
  const { user } = useSelector((state) => ({ user: state.user }), []);

  const [selectedCategory, setSelectedCategory] = useState("");

  const etcs = fileurl + "asset/front/img/mainIcon/etcs.png";
  const finance = fileurl + "asset/front/img/mainIcon/finance.png";
  const insurance = fileurl + "asset/front/img/mainIcon/insurance.png";
  const manufacture = fileurl + "asset/front/img/mainIcon/manufacture.png";
  const marketing = fileurl + "asset/front/img/mainIcon/marketing.png";

  const renderCategoryItems = () => {
    const goSamplePage = (id) => {
      history.push(`/admin/sample/${id}`);
    };

    return user.category?.map((category, i) => {
      let src;
      switch (category.categoryName) {
        case "금융 및 자산관리":
          src = finance;
          break;
        case "보험":
          src = insurance;
          break;
        case "제조":
          src = manufacture;
          break;
        case "마케팅":
          src = marketing;
          break;
        case "기타":
          src = etcs;
          break;
      }
      return (
        <div
          key={`${category.categoryName}Div`}
          id={`${category.categoryName}Div`}
          className={classes.mainIconDiv}
          style={{
            margin: "0 auto",
            marginLeft: i === 0 ? 0 : "auto",
            marginRight: i === user.category.length - 1 ? 0 : "auto",
          }}
          onMouseEnter={() => {
            setSelectedCategory(category.categoryName);
          }}
          onMouseLeave={() => {
            setSelectedCategory("");
          }}
        >
          <div className={classes.mainIconCard}>
            <img style={{ width: "100%" }} src={src} />
          </div>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <b className={classes.mainCardTitle}>
              {t(`${category.categoryName}`)}
            </b>
          </div>
          {selectedCategory === category.categoryName && (
            <div className={classes.mainIcons}>
              {category.projects.map((project) => {
                if (project.isSample) {
                  return (
                    <>
                      <div
                        className={classes.iconTitles}
                        id={`${category.categoryName}Icon`}
                        onClick={() => goSamplePage(project.id)}
                      >
                        <span
                          className={classes.iconText}
                          style={{
                            fontSize: 14,
                          }}
                        >
                          {t(`${project.projectName}`)}
                        </span>
                        <ArrowForwardIosIcon
                          id="sampleListIcon"
                          size="xs"
                          style={{ fontSize: "14px" }}
                        />
                      </div>
                    </>
                  );
                }
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Grid container sx={{ mt: 6, px: 1.25 }}>
      <Grid item xs={12}>
        <Grid container>
          <Grid item sx={{ mr: 3 }}>
            <b className={classes.mainSubTitle}>{t("Train Tutorial")}</b>
          </Grid>

          <div className={classes.subContent} style={{ fontSize: 16 }}>
            <div style={{ marginBottom: "-4px" }}>
              {t("For those who are new to Train,")}
            </div>
            <div>
              {t(
                "각 산업군별 학습을 통해 만들어진 인공,지능을 체험하고 방법을 익히실 수 있습니다."
              )}
            </div>
          </div>
        </Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {renderCategoryItems()}
        </div>
      </Grid>
    </Grid>
  );
};

export default React.memo(TrainTutorial);
