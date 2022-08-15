import React, { useEffect, useState } from "react";

import { DETAIL_DATA, SERVER_DATA } from "../../TestJSON";
import DetailBox from "./DetailBox";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const defaultStyles = {
  Grid_mainDetail: {
    color: "#E2E2E2",
    marginTop: "10px",
    marginBottom: "5px",
    marginLeft: "25px",
    fontSize: "15px",
  },
  Grid_subTitle: {
    color: "#E2E2E2",
    fontSize: "15px",
    marginBottom: "20px",
    marginLeft: "25px",
  },
  Grid_tableHead: {
    height: "40px",
    color: "#E2E2E2",
    borderTop: "1px solid #FFFFFF",
    borderBottom: "1px solid #FFFFFF",
    paddingRight: "45px",
    fontSize: "20px",
  },
};

const Section_2 = ({
  cloudDetail,
  cloudRegion,
  cloudContinents,
  cloudContinentsDetail,
  setWarning
}) => {
  const { t } = useTranslation();
  const matches = useMediaQuery("(min-width:1200px)");
  return (
    <Grid container item xs={12} justify="flex-start">
      {/* <Grid item container xs={12} style={defaultStyles.Grid_mainDetail}>
        {t("")}
      </Grid>
      <Grid item container xs={12} style={defaultStyles.Grid_subTitle}>
        {t("")}
      </Grid> */}
      <Grid container item xs={12} justify="center">
        <Grid container item xs={10} alignItems="flex-end" justify="center">
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell align="right">
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    Status
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    Instance
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div
                    style={{
                      width: "90px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    Cost
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div
                    style={{
                      width: "40px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    vCPU
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div
                    style={{
                      width: "60px",
                      textAlign: "right",
                      height: "35px",
                      color: "#FFFFFF",
                    }}
                  >
                    Memory
                  </div>
                </TableCell>
                <TableCell align="right">
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
                    Storage
                  </div>
                </TableCell>
                <TableCell align="right">
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
                    Network
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={12}
        justify="center"
        style={{ marginBottom: "20px" }}
      >
        {cloudRegion[0].cluster !== undefined &&
          cloudRegion[0].cluster
            .sort((a, b) => a?.originPricePerHour - b?.originPricePerHour)
            .map((detail, i) => (
              <>
                <DetailBox
                  setWarning={setWarning}
                  permissionPrice={
                    cloudRegion[0].cluster
                      .filter((c) => c.serverType.split(".")[1] == "4xlarge")
                      .sort(
                        (a, b) => a?.originPricePerHour - b?.originPricePerHour
                      )[0].originPricePerHour
                  }
                  detail={detail}
                  key={i + "detail_Key"}
                  cloudDetail={cloudDetail}
                />
              </>
            ))}
      </Grid>
    </Grid>
  );
};
export default Section_2;
