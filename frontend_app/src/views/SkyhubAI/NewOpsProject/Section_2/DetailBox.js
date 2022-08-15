import React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "../../../../redux/reducers/messages";
import { IS_ENTERPRISE } from "variables/common";

import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { openChat } from "components/Function/globalFunc";

const useStyle = makeStyles({
  default_Button_unSelected: {
    padding: "0px",
    width: "100%",
    "&:hover": {
      transition: "all 0.1s liner",
      transform: "scale(1.1)",
    },
  },
  default_Button_selected: {
    padding: "0px",
  },
  default_TableCell: {
    border: "1px solid yellow",
    padding: "0px",
  },
});

const defaultStyles = {
  Grid_focused: {
    border: "4px solid green",
  },
};

const DetailBox = ({ detail, cloudDetail, permissionPrice, setWarning }) => {
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const { t } = useTranslation();
  const classes = useStyle();
  const dispatch = useDispatch();
  const matches = useMediaQuery("(min-width:1200px)");
  return (
    <Grid
      container
      item
      xs={12}
      justify="center"
      alignItems="center"
      style={cloudDetail[0] == detail ? defaultStyles.Grid_focused : {}}
    >
      <Grid
        container
        item
        xs={12}
        justify="center"
        alignItems="flex-start"
        onClick={() => {
          if (detail.originPricePerHour < permissionPrice) {
            cloudDetail[1](detail);
            setWarning("");
          } else {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Servers larger than 4Xlarge can be used after contacting the sales team.")
              )
            );
            openChat();
          }
        }}
        className={
          cloudDetail[0] == detail
            ? classes.default_Button_selected
            : classes.default_Button_unSelected
        }
        component={Button}
      >
        <Grid container item xs={10} alignItems="flex-end" justify="center">
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell>
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    {cloudDetail[0] == detail ? "Selected" : "Select"}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    {detail.serverType}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    {user.language === "ko"
                      ? `${(detail.pricePerHourSkyhubAi * 1200 - 0.5).toFixed(
                          0
                        )} KRW`
                      : `${(detail.pricePerHourSkyhubAi - 0.005).toFixed(2)}$`}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      width: "40px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    {detail.vCPU}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      width: "60px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    {detail.memory}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={
                      matches
                        ? {
                            width: "160px",
                            textAlign: "right",
                            height: "35px",
                            color: "#FFFFFF",
                          }
                        : {
                            width: "100px",
                            textAlign: "right",
                            height: "35px",
                            color: "#FFFFFF",
                          }
                    }
                  >
                    {detail.storage}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    style={
                      matches
                        ? {
                            width: "160px",
                            textAlign: "right",
                            height: "35px",
                            color: "#FFFFFF",
                          }
                        : {
                            width: "100px",
                            textAlign: "right",
                            height: "35px",
                            color: "#FFFFFF",
                          }
                    }
                  >
                    {detail.networkPerformance}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default DetailBox;
