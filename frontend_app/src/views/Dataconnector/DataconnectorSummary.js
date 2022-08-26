import React, { useState } from "react";

import currentTheme from "assets/jss/custom";
import { useTranslation } from "react-i18next";
import { fileurl } from "controller/api";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";

const DataconnectorSummary = ({ connectorInfo }) => {
  const { t } = useTranslation();
  const classes = currentTheme();

  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [selectedClsInfo, setSelectedClsInfo] = useState(null);

  const handleImgModalOpen = () => {
    setImgModalOpen(true);
  };

  const handleImgModalClose = () => {
    setImgModalOpen(false);
  };

  const onClickMoreBtn = (id) => {
    const tmpInfo = connectorInfo.label_info.filter((v) => v.labelclass_id === id);
    setSelectedClsInfo(tmpInfo[0]);
    handleImgModalOpen();
  };

  let TABLE_HEADS = [
    { value: "no", name: "No", width: "5%" },
    { value: "color", name: t("Color"), width: "10%" },
    { value: "class", name: t("Class"), width: "25%" },
    { value: "box", name: t("Number of boxes"), width: "12%" },
    { value: "polyline", name: t("Number of polylines"), width: "12%" },
    { value: "polygon", name: t("Number of polygons"), width: "12%" },
    { value: "label_count", name: t("Number of Labeling"), width: "12%" },
    { value: "ratio", name: t("Ratio"), width: "12%" },
  ];

  if (connectorInfo.trainingMethod === "image") {
    TABLE_HEADS = TABLE_HEADS.filter((v) => !["color", "box", "polyline", "polygon"].includes(v.value));
    TABLE_HEADS.push({
      value: "sample_img",
      name: t("Labeling image"),
      width: "30%",
    });
  } else {
    if (connectorInfo.dataconnectortype.dataconnectortypeName === "CSV") {
      TABLE_HEADS = [
        { value: "no", name: "No", width: "5%" },
        { value: "column_name", name: t("Column name"), width: "23%" },
        { value: "count", name: t("Number of data"), width: "8%" },
        { value: "miss", name: t("Missing value"), width: "8%" },
        { value: "unique_count", name: t("Unique key"), width: "8%" },
        { value: "type", name: t("Type"), width: "8%" },
        { value: "min", name: t("Minimum value"), width: "8%" },
        { value: "max", name: t("Maximum value"), width: "8%" },
        { value: "median", name: t("Median value"), width: "8%" },
        { value: "std", name: t("Standard value"), width: "8%" },
        { value: "mean", name: t("Average value"), width: "8%" },
      ];
    }
  }

  let TABLE_BODYS = [
    { name: "no", type: "numb" },
    { name: "color", type: "color" },
    { name: "labelclass", type: "string" },
    { name: "box", type: "numb" },
    { name: "polyline", type: "numb" },
    { name: "polygon", type: "numb" },
    { name: "count", type: "numb" },
    { name: "ratio", type: "numb", isFixed: true, unit: "%" },
  ];

  if (connectorInfo.trainingMethod === "image") {
    TABLE_BODYS = TABLE_BODYS.filter((v) => !["color", "box", "polyline", "polygon"].includes(v.name));
    TABLE_BODYS.push({ name: "images", type: "array" });
  } else {
    if (connectorInfo.dataconnectortype.dataconnectortypeName === "CSV") {
      TABLE_BODYS = [
        { name: "no", type: "numb" },
        { name: "column_name", type: "string" },
        { name: "count", type: "numb" },
        { name: "miss", type: "numb", isFixed: true },
        { name: "unique_count", type: "numb" },
        { name: "type", type: "string" },
        { name: "min", type: "numb", isFixed: true },
        { name: "max", type: "numb", isFixed: true },
        { name: "median", type: "numb", isFixed: true },
        { name: "std", type: "numb", isFixed: true },
        { name: "mean", type: "numb", isFixed: true },
      ];
    }
  }

  const renderTableBody = () => {
    const isCsv =
      connectorInfo.dataconnectortype.dataconnectortypeName === "CSV";
    const info = isCsv
      ? [...connectorInfo.data_indicator]
      : [...connectorInfo.label_info];
    let cellValue = "";
    let totalValue = {};

    return info.map((v, i) => {
      return (
        <>
          <TableRow
            className={classes.tableRow}
            key={isCsv ? v.column_name : i}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            {TABLE_BODYS.map((val, idx) => {
              cellValue = info[i][val.name];
              totalValue[val.name] = totalValue[val.name]
                ? totalValue[val.name]
                : 0;

              if (cellValue) {
                if (val.isFixed) cellValue = Number(cellValue).toFixed(3);
                if (val.type === "numb") {
                  totalValue[val.name] += Number(cellValue);
                  cellValue = Number(cellValue).toLocaleString();
                }
                if (val.unit) cellValue += val.unit;
              } else {
                if (val.type === "numb") cellValue = 0;
                else cellValue = "-";
              }

              if (idx === 0) cellValue = i + 1;

              return (
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  sx={{ cursor: "default" }}
                >
                  {val.type === "color" ? (
                    <span
                      style={{
                        display: "inline-block",
                        width: 60,
                        height: 20,
                        backgroundColor: connectorInfo.label_class
                          ? connectorInfo.label_class.filter(
                              (cls) => cls.id === v.labelclass_id
                            )[0].color
                          : "#FFF",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : val.type === "array" ? (
                    <>
                      {cellValue.map(
                        (img, index) =>
                          index < 5 && (
                            <span
                              style={{
                                display: "inline-block",
                                width: 50,
                                height: 50,
                                marginRight: 8,
                                background: `url("${
                                  process.env.REACT_APP_ENTERPRISE === "true"
                                    ? fileurl + "static" + img.s3_key
                                    : img.s3_key
                                }") center no-repeat`,
                                backgroundSize: "cover",
                                verticalAlign: "middle",
                              }}
                            ></span>
                          )
                      )}
                      {cellValue && cellValue.length > 0 && (
                        <Box
                          component="div"
                          onClick={() => onClickMoreBtn(v.labelclass_id)}
                          sx={{
                            display: "inline-block",
                            padding: "2px 4px",
                            borderRadius: "2px",
                            color: "var(--secondary1)",
                            fontSize: 14,
                            cursor: "pointer",
                            ml: 0.5,
                            "&:hover": {
                              fontWeight: 600,
                            },
                          }}
                        >
                          more +
                        </Box>
                      )}
                    </>
                  ) : (
                    <span>{cellValue}</span>
                  )}
                </TableCell>
              );
            })}
          </TableRow>

          {!isCsv && i === info.length - 1 && (
            <TableRow
              className={classes.tableRow}
              key={isCsv ? v.column_name : i}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                backgroundColor: "var(--background2)",
              }}
            >
              {TABLE_BODYS.map((val, idx) => {
                if (val.type === "numb") {
                  cellValue = Number(totalValue[val.name]).toLocaleString();
                } else {
                  cellValue = "-";
                }

                if (idx === 0) cellValue = t("All");
                if (val.name === "ratio") cellValue = "100%";

                return (
                  <TableCell
                    className={classes.tableRowCell}
                    align="center"
                    sx={{
                      fontWeight: 500,
                      cursor: "default",
                    }}
                  >
                    <span>{cellValue}</span>
                  </TableCell>
                );
              })}
            </TableRow>
          )}
        </>
      );
    });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table className={classes.table} sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ borderBottom: "2px solid var(--textWhite38)" }}>
              {TABLE_HEADS.map((v) => {
                return (
                  <TableCell className={classes.tableHead} width={v.width} align="center" sx={{ color: "var(--textMediumGrey)" }}>
                    {v.name}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </TableContainer>

      {selectedClsInfo && (
        <Dialog maxWidth="md" open={imgModalOpen} onClose={handleImgModalClose}>
          <DialogTitle
            sx={{
              color: "var(--textWhite)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
              <Grid item>
                <span
                  style={{
                    display: "inline-block",
                    borderRadius: "40px",
                    padding: "0 24px",
                    border: "2px solid var(--secondary1)",
                    fontSize: 20,
                    fontWeight: 500,
                    color: "var(--textWhite87)",
                    marginBottom: 8,
                  }}
                >
                  {selectedClsInfo.labelclass}
                </span>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--textWhite6)",
                    marginBottom: 0,
                  }}
                >
                  <span>
                    {t("Number of Labeling")} : {selectedClsInfo.count && selectedClsInfo.count.toLocaleString()}
                  </span>
                  <span style={{ margin: "0 4px" }}>/</span>
                  <span>
                    {t("Ratio of Total Labeling")} : {selectedClsInfo.ratio && Number(selectedClsInfo.ratio).toFixed(2)}%
                  </span>
                </p>
              </Grid>
              <Grid item>
                <CloseIcon
                  onClick={handleImgModalClose}
                  sx={{
                    fontSize: 30,
                    fill: "var(--textWhite87)",
                    cursor: "pointer",
                  }}
                />
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container justifyContent="center" sx={{ overflowY: "auto" }}>
              {selectedClsInfo.images &&
                selectedClsInfo.images.map((v, i) => {
                  return (
                    <Grid item sx={{ mr: 2 }}>
                      <figure
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                      >
                        <Box
                          component="figcaption"
                          sx={{
                            position: "absolute",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            zIndex: 10,
                            backgroundColor: "rgba(0,0,0,0.4)",
                            opacity: 0,
                            fontSize: 17,
                            fontWeight: 500,
                            cursor: "default",
                            color: "var(--textWhite87)",
                            transition: "all 0.2s",
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          {v.file_name}
                        </Box>
                        <img
                          alt={`image_${i}`}
                          src={
                            process.env.REACT_APP_ENTERPRISE === "true"
                              ? fileurl + "static" + v.s3_key
                              : v.s3_key
                          }
                          style={{ height: 200 }}
                        />
                      </figure>
                    </Grid>
                  );
                })}
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DataconnectorSummary;
