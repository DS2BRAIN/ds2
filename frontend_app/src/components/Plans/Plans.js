import React, { useState, useEffect } from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";
import currentTheme from "assets/jss/custom.js";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { fileurl } from "controller/api";
const Plans = ({ onOpenChatbot }) => {
  const classes = currentTheme();
  const { t } = useTranslation();

  return (
    <div className={classes.defaultContainer}>
      <div className={classes.freePlanContainer}>
        <div className={classes.eachPlanContent}>
          <img
            src={fileurl + "asset/front/img/mainIcon/freeplan.svg"}
            className={classes.planIcon}
          />
          <div className={classes.planNameFont}>FREE PLAN</div>
          <Button
            id="usageplanBtn"
            className={classes.defaultDisabledButton}
            style={{ width: "132px" }}
          >
            {t("")}
          </Button>
        </div>
        <GridContainer style={{ padding: "0 20px 20px 20px" }}>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>
              {t("AI solution consulting")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              <b>{t("1 type of")}</b> {t("형태 데이터 분류")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("Auto data linkage")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>
              {t("Data auto labeling")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("Data Analysis/prediction")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("Service app auto development")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("DL auto-development code generation")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("AI store")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("1,000 prediction capacity")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>
              {t("No projects provided")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>
              {t("No shared users")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>
              {t("No image labeling")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="uncheckedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.uncheckedFont}>{t("No technical support")}</span>
          </GridItem>
        </GridContainer>
      </div>
      <div className={classes.enterprisePlanContainer}>
        <div className={classes.eachPlanContent}>
          <img
            src={fileurl + "asset/front/img/mainIcon/enterpriseplan.svg"}
            className={classes.planIcon}
          />
          <div className={classes.planNameFont}>ENTERPRISE PLAN</div>
          <Button
            onClick={onOpenChatbot}
            id="usageplanBtn"
            className={classes.defaultHighlightButton}
          >
            {t("Contact us")}
          </Button>
        </div>
        <GridContainer style={{ padding: "0 20px 20px 20px" }}>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              <b>{t("AI solution consulting")}</b>
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              <b>{t("5 types of")}</b> {t("형태 데이터 분류")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("Auto data linkage")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("Data auto labeling")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("Data Analysis/prediction")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("Service app auto development")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("DL auto-development code generation")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>{t("AI store")}</span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("5TB 10 unit/month capacity")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("5,000 projects / month")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("Up to 200 shared users")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              {t("Labeling of 1 mln images per unit")}
            </span>
          </GridItem>
          <GridItem
            xs={2}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <CheckCircleIcon
              id="checkedPlan"
              size="xs"
              style={{ width: "16px" }}
            />
          </GridItem>
          <GridItem
            xs={10}
            style={{ display: "flex", alignItems: "center", height: "20px" }}
          >
            <span className={classes.checkedFont}>
              <b>{t("Full technical support")}</b>
            </span>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
};

export default React.memo(Plans);
