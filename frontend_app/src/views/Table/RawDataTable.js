import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import { IS_ENTERPRISE } from "variables/common";

import {
  FormControl,
  FormHelperText,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Select from "@material-ui/core/Select/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import InfoIcon from "@material-ui/icons/Info";
import ReportProblem from "@material-ui/icons/ReportProblem";

import currentTheme from "assets/jss/custom.js";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import Button from "components/CustomButtons/Button";
import MetabaseButton from "components/CustomButtons/MetabaseButton";

const RawDataTable = ({ sampleData, sampleDataId, isDataConnectorPage }) => {
  const classes = currentTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, projects } = useSelector(
    (state) => ({ user: state.user, projects: state.projects }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [datas, setDatas] = useState([]);
  const [dataHeader, setDataHeader] = useState([]);
  const [selectedDataName, setSelectedDataName] = useState("");
  const [selectedDataId, setSelectedDataId] = useState(null);
  const [fileErrorMessage, setFileErrorMessage] = useState(null);
  const [isDownloadBtnDisabled, setIsDownloadBtnDisabled] = useState(false);

  useEffect(() => {
    setFileErrorMessage(null);
    if (sampleData && !sampleData[undefined]) {
      try {
        setDatas(sampleData);
        let fileHeader = {};
        let headerArray = [];
        Object.keys(sampleData).map((fileKey) => {
          headerArray = [];
          headerArray = sampleData[fileKey]
            ? Object.keys(sampleData[fileKey][0])
            : [];
          fileHeader[fileKey] = headerArray;
        });
        setDataHeader(fileHeader);
        setSelectedDataName(Object.keys(sampleData)[0]);
        setSelectedDataId(sampleDataId[Object.keys(sampleData)[0]]);
        setIsLoading(false);
      } catch (e) {
        setFileErrorMessage(t("Data is too large or in an invalid format."));
        if (!process.env.REACT_APP_DEPLOY) console.log(e);
        setIsLoading(false);
      }
    } else {
      setFileErrorMessage(t("There is no data."));
      setIsLoading(false);
    }
  }, [sampleData]);

  const valueChange = (e) => {
    setIsLoading(true);
    setSelectedDataName(e.target.value);
    setSelectedDataId(sampleDataId[e.target.value]);
    setIsLoading(false);
  };

  const onDownloadData = () => {
    setIsDownloadBtnDisabled(true);
    if (!selectedDataId) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("No data selected. Please select data.")
        )
      );
      setIsDownloadBtnDisabled(false);
      return;
    }
    api
      .postProjectData(projects.project.id, selectedDataId)
      .then((res) => {
        let url = res.data.dataPath;
        if (IS_ENTERPRISE) {
          url = fileurl + "static" + url;
        }
        const link = document.createElement("a");
        link.href = url;
        link.download = "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(
            openErrorSnackbarRequestAction(
              sendErrorMessage(
                e.response.data.message,
                e.response.data.message_en,
                user.language
              )
            )
          );
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("An error occurred during data conversion. Please try again in a moment")
            )
          );
        }
      })
      .finally(() => {
        setIsDownloadBtnDisabled(false);
      });
  };

  const makeTable = () => (
    <Grid container justifyContent="space-between" style={{ width: "100%" }}>
      <Grid
        item
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {!isDataConnectorPage && selectedDataName && (
          <>
            <FormControl variant="outlined" style={{ minWidth: "180px" }}>
              <Select
                id="valueForDataSelectBox"
                labelid="demo-simple-select-outlined-label"
                className={classes.selectForm}
                value={selectedDataName}
                onChange={valueChange}
              >
                {Object.keys(datas).map((dataKey, idx) => (
                  <MenuItem key={dataKey} value={dataKey}>
                    {dataKey}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                <span style={{ color: "var(--textWhite87)" }}>
                  {t("Please select the data you want to view.")}
                </span>
              </FormHelperText>
            </FormControl>
            <Button
              aria-controls="customized-menu"
              aria-haspopup="true"
              id="download_selecteddata_btn"
              shape="greenOutlined"
              disabled={isDownloadBtnDisabled}
              sx={{ mx: 1 }}
              onClick={onDownloadData}
            >
              DOWNLOAD
            </Button>
            {selectedDataId && (
              <MetabaseButton
                id={selectedDataId}
                type="data"
                isKor={user.language === "ko"}
              />
            )}
          </>
        )}
      </Grid>
      {!isDataConnectorPage && (
        <Grid
          item
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {projects.project?.status < 10 && (
            <div className={classes.alignCenterDiv}>
              <InfoIcon style={{ marginRight: "8px" }} />
              <div style={{ fontSize: "16px" }}>
                {t("This is a sample of your data (up to 120 rows).")}
              </div>
            </div>
          )}
        </Grid>
      )}
      <Grid
        item
        xs={12}
        style={{
          marginTop: isDataConnectorPage ? 0 : 15,
          overflow: "auto",
          maxHeight: 600,
        }}
      >
        <Table stickyHeader className={classes.table}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              {dataHeader[selectedDataName] &&
                dataHeader[selectedDataName].map((r, idx) => {
                  if (idx === 0)
                    return (
                      <React.Fragment key={`tablehead_${idx}`}>
                        <TableCell
                          className={classes.tableHead}
                          align="center"
                          style={{
                            width: "10%",
                            color: "#D0D0D0",
                            background: "var(--surface2)",
                          }}
                        >
                          NO
                        </TableCell>
                        <TableCell
                          className={classes.tableHead}
                          align="center"
                          style={{
                            color: "#F0F0F0",
                            background: "var(--surface2)",
                          }}
                        >
                          <div className={classes.wordKeepAllDiv}>{r}</div>
                        </TableCell>
                      </React.Fragment>
                    );
                  else
                    return (
                      <TableCell
                        key={`tablehead_${r}`}
                        className={classes.tableHead}
                        align="center"
                        style={{ background: "var(--surface2)" }}
                      >
                        <div
                          className={
                            r.length > 30
                              ? classes.breakText
                              : classes.textInLine
                          }
                          style={{
                            wordBreak: "keep-all",
                            color: "#D0D0D0",
                          }}
                        >
                          {r}
                        </div>
                      </TableCell>
                    );
                })}
            </TableRow>
          </TableHead>
          <TableBody>
            {datas[selectedDataName] &&
              datas[selectedDataName].map((record, idx) => (
                <TableRow
                  key={`tablebody_rownum_${idx}`}
                  className={classes.tableRow}
                >
                  <TableCell
                    className={classes.tableRowCellNoPointer}
                    align="center"
                  >
                    {idx + 1}
                  </TableCell>
                  {dataHeader[selectedDataName] &&
                    dataHeader[selectedDataName].map((r, i) => (
                      <TableCell
                        key={`tablebody_rownum_${idx}_rowcell_${i}`}
                        className={classes.tableRowCellNoPointer}
                        align="center"
                      >
                        <div className={classes.breakText}>{record[r]}</div>
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );

  return isLoading ? (
    <div
      style={{
        width: "100%",
        height: "280px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : fileErrorMessage ? (
    <div style={{ marginLeft: "20px" }}>
      <div style={{ marginTop: "40px", display: "flex", alignItems: "center" }}>
        <ReportProblem style={{ marginRight: "8px" }} />
        <b>{fileErrorMessage}</b>
      </div>
    </div>
  ) : (
    datas && (
      <div
        style={{
          display: "flex",
          marginTop: isDataConnectorPage ? 0 : 30,
          width: "100%",
          maxHeight: "80vh",
        }}
      >
        {makeTable()}
      </div>
    )
  );
};

export default React.memo(RawDataTable);
