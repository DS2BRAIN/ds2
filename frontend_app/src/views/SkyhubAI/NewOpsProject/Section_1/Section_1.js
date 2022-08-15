import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { openSuccessSnackbarRequestAction } from "../../../../redux/reducers/messages";
import { fileurl } from "controller/api";
import { IS_ENTERPRISE } from "variables/common";
import ContinentBox from "./ContinentBox";

//@material-ui
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Button from "components/CustomButtons/Button";
import StarIcon from "@material-ui/icons/Star";
import HelpIcon from "@material-ui/icons/Help";
import TextField from "@material-ui/core/TextField";
import { useTranslation } from "react-i18next";
import { openChat } from "components/Function/globalFunc";

const useStyles = makeStyles({
  btn_flatForm: {
    justifyItems: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginRight: "10px",
    marginLeft: "10px",
    border: "1px solid black",
    width: "150px",
    height: "70px",
    "&:hover": {
      backgroundColor: "#FFFFFF",
    },
  },
  btn_flatForm_focused: {
    justifyItems: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginRight: "10px",
    marginLeft: "10px",
    border: "3px solid #4FA75C",
    width: "150px",
    height: "70px",
    "&:hover": {
      backgroundColor: "#FFFFFF",
    },
  },
  btn_flatForm_disabled: {
    justifyItems: "center",
    alignItems: "center",
    backgroundColor: "#7A7A7A",
    marginRight: "10px",
    marginLeft: "10px",
    border: "1px solid black",
    width: "150px",
    height: "70px",
    "&:hover": {
      backgroundColor: "#7A7A7A",
    },
  },
  text_projectName: {
    marginLeft: "10px",
    marginBottom: "20px",
    width: "40%",
  },
});

const defaultStyles = {
  img_flatform: {
    height: "35px",
  },
  img_flatform_disabled: {
    height: "25px",
    opacity: "0.8",
    display: "block",
    marginBottom: "0px",
  },
  Grid_smallText: {
    color: "#E2E2E2",
    marginBottom: "6px",
  },
  Grid_ContinentBox: {
    marginBottom: "10px",
  },
  div_sales: {
    fontSize: "13px",
  },
};

const Section_1 = ({
  regionParam,
  project,
  cloudRegion,
  projectId,
  cloudContinents,
  cloudContinentsDetail,
  onlyInstance,
  setWarning,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const classes = useStyles(); //material-ui
  const [cloudName, setCloudName] = useState("AWS");
  // const [cloudName, setCloudName] = useState("AWS"); //API 제공시 설정 기능 추가
  //Logo image
  const aws_logo = fileurl + "asset/front/img/cloudLogo/aws_logo.png";
  const azure_logo = fileurl + "asset/front/img/cloudLogo/azure_logo.png";
  const gcp_logo = fileurl + "asset/front/img/cloudLogo/gcp_logo.png";

  return (
    <Grid container item xs={12} justify="center" alignItems="flex-start">
      {onlyInstance == "" && (
        <>
          <Grid
            container
            item
            xs={12}
            justify="flex-start"
            alignItems="center"
            style={defaultStyles.Grid_smallText}
          >
            <StarIcon style={{ fontSize: "16px", marginRigth: "2px" }} />
            {t("Project Name")}
          </Grid>
          <Grid container item xs={12} justify="flex-start" alignItems="center">
            <TextField
              className={classes.text_projectName}
              onChange={(e) => project[1](e.target.value)}
              value={project[0]}
              InputProps={{ disableUnderline: true }}
              placeholder="Project Name"
              value={project[0]}
              disabled={onlyInstance == "" ? false : true}
            />
          </Grid>
        </>
      )}
      {!IS_ENTERPRISE ? (
        <>
          <Grid
            container
            item
            xs={12}
            justify="flex-start"
            alignItems="center"
            style={defaultStyles.Grid_smallText}
          >
            <StarIcon style={{ fontSize: "16px", marginRigth: "2px" }} />
            {t("Recommended Cloud")}
          </Grid>
          <Grid
            container
            item
            xs={12}
            justify="flex-start"
            alignItems="center"
            style={{ marginBottom: "10px" }}
          >
            <Button
              onClick={() => {
                // dispatch(
                //   openSuccessSnackbarRequestAction(
                //     t("")
                //   )
                // );
                // window.ChannelIO("show");
                setCloudName("AWS");
              }}
              className={
                cloudName !== "AWS"
                  ? classes.btn_flatForm
                  : classes.btn_flatForm_focused
              }
              // className={classes.btn_flatForm_disabled}
            >
              <Grid
                container
                item
                xs={12}
                direction="column"
                justify="center"
                alignItems="center"
              >
                <img
                  src={aws_logo}
                  style={defaultStyles.img_flatform_disabled}
                />
                {/* <p style={defaultStyles.div_sales}>{t("TALK TO SALES")}</p> */}
              </Grid>
            </Button>
            {/* <img src={aws_logo} style={defaultStyles.img_flatform}/>
          <p style={defaultStyles.div_sales}>{t("TALK TO SALES")}</p> */}
            <Button
              className={classes.btn_flatForm_disabled}
              onClick={() => {
                dispatch(
                  openSuccessSnackbarRequestAction(
                    t("To use the GCP server, please contact the sales team.")
                  )
                );
                openChat();
              }}
            >
              <Grid
                container
                item
                xs={12}
                direction="column"
                justify="center"
                alignItems="center"
              >
                <img
                  src={gcp_logo}
                  style={defaultStyles.img_flatform_disabled}
                />
                <p style={defaultStyles.div_sales}>{t("TALK TO SALES")}</p>
              </Grid>
            </Button>
            <Button
              className={classes.btn_flatForm_disabled}
              onClick={() => {
                dispatch(
                  openSuccessSnackbarRequestAction(
                    t("To use the Azure server, please contact the sales team.")
                  )
                );
                openChat();
              }}
            >
              <Grid
                container
                item
                xs={12}
                direction="column"
                justify="center"
                alignItems="center"
              >
                <img
                  src={azure_logo}
                  style={defaultStyles.img_flatform_disabled}
                />
                <p style={defaultStyles.div_sales}>{t("TALK TO SALES")}</p>
              </Grid>
            </Button>
          </Grid>
          <Grid
            container
            item
            xs={12}
            justify="flex-start"
            alignItems="center"
            style={{ marginBottom: "10px" }}
          ></Grid>
          <Grid
            container
            item
            xs={12}
            justify="flex-start"
            alignItems="center"
            style={defaultStyles.Grid_smallText}
          >
            <StarIcon style={{ fontSize: "16px", marginRigth: "2px" }} />
            {t("Recommended region")}
            <a
              href={
                "https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/using-regions-availability-zones.html"
              }
              style={{ padding: "0px" }}
              target="_blanck"
            >
              <HelpIcon
                style={{
                  fontSize: "20px",
                  marginBottom: "4px",
                  marginLeft: "2px",
                }}
              />
            </a>
          </Grid>
          {cloudName === "AWS" && (
            <Grid
              container
              item
              xs={12}
              justify="flex-start"
              alignItems="flex-start"
            >
              {cloudContinents !== null &&
                cloudContinents[0].map((continent, i) => (
                  <Grid
                    key={i + "_continent_section"}
                    container
                    item
                    xs={4}
                    justify="center"
                    alignItems="flex-start"
                    style={defaultStyles.Grid_ContinentBox}
                  >
                    {cloudContinentsDetail !== undefined &&
                      cloudContinentsDetail[0] !== null && (
                        <ContinentBox
                          setWarning={setWarning}
                          continentName={continent}
                          continentData={cloudContinentsDetail[0][continent]}
                          cloudRegion={cloudRegion}
                        />
                      )}
                  </Grid>
                ))}
            </Grid>
          )}
        </>
      ) : (
        <></>
      )}
    </Grid>
  );
};
export default Section_1;
