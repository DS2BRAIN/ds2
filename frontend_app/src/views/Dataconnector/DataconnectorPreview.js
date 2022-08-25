import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import * as labelApi from "controller/labelApi";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import { convertToLocalDateStr, sendErrorMessage, setMemoryUnit } from "../../components/Function/globalFunc.js";
import currentTheme from "assets/jss/custom.js";
import RawDataTable from "views/Table/RawDataTable.js";

import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import { fileurl } from "controller/api.js";

const DataconnectorPreview = ({ connectorInfo, sampleData, isDataConnectorPage }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const classes = currentTheme();
  const { user } = useSelector((state) => ({ user: state.user }));

  const imageRef = useRef();
  const canvasRef = useRef();

  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgData, setImgData] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [isImgModalLoading, setIsImgModalLoading] = useState(false);
  const [selectedImgId, setSelectedImgId] = useState(null);
  const [classesLabeled, setClassesLabeled] = useState(null);

  const handleImgModalOpen = () => {
    setImgModalOpen(true);
  };

  const handleImgModalClose = () => {
    setImgModalOpen(false);
  };

  const getPreviewData = async (id, labelprojectId, workapp) => {
    setSelectedImgId(id);
    setIsImgModalLoading(true);

    await labelApi
      .getLabelFile(id, labelprojectId, workapp)
      .then(async (res) => {
        setImgData(res.data);
        setLabelData(res.data.labels);
        handleImgModalOpen();
      })
      .catch((err) => {
        dispatch(openErrorSnackbarRequestAction(err.response?.data.message ? sendErrorMessage(err.response?.data.message, err.response?.data.message_en, user.language) : t("A temporary error has occurred.")));
        handleImgModalClose();
      })
      .finally(() => {
        setIsImgModalLoading(false);
      });
  };

  const getPath = () => {
    try {
      if (!imgData || (connectorInfo.label_class && connectorInfo.label_class.length === 0)) return;

      const labels = imgData?.labels;
      const labelClasses = connectorInfo.label_class;
      const width = document.getElementById("previewImage").width ? document.getElementById("previewImage").width : (imgData.height * width) / imgData.height;
      const height = document.getElementById("previewImage").height ? document.getElementById("previewImage").height : (imgData.height * width) / imgData.width;
      let c = canvasRef.current;
      if (c) {
        c.width = width;
        c.height = height;

        let ctx = c.getContext("2d");
        if (labels && labels.length !== 0) {
          for (let idx = 0; idx < labels.length; idx++) {
            try {
              const label = labels[idx];
              let labelName;
              let labelColor;
              labelClasses.forEach((each) => {
                if (label.labelclass === each.id) {
                  labelName = each.name;
                  labelColor = each.color;
                }
              });
              if (label.labeltype === "box") {
                ctx.strokeStyle = labelColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(label.x * width, label.y * height);
                ctx.lineTo((label.x + label.w) * width, label.y * height);
                ctx.lineTo((label.x + label.w) * width, (label.y + label.h) * height);
                ctx.lineTo(label.x * width, (label.y + label.h) * height);
                ctx.lineTo(label.x * width, label.y * height);
                ctx.stroke();
                ctx.closePath();
                ctx.font = "20px Verdana";
                ctx.fillStyle = labelColor;
                ctx.fillText(labelName, label.x * width, label.y * height);
              } else {
                let points = label.points;
                let x = 0;
                let y = 0;
                ctx.strokeStyle = labelColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let jdx = 0; jdx < points.length; jdx++) {
                  if (jdx === 0) {
                    x = points[jdx][0] * width;
                    y = points[jdx][1] * height;
                    ctx.moveTo(x, y);
                  } else {
                    ctx.lineTo(points[jdx][0] * width, points[jdx][1] * height);
                  }
                }
                if (label.labeltype === "polygon") {
                  ctx.lineTo(points[0][0] * width, points[0][1] * height);
                }
                ctx.stroke();
                ctx.closePath();
                ctx.font = "20px Verdana";
                ctx.fillStyle = labelColor;
                ctx.fillText(labelName, x, y);
              }
            } catch (e) {
              if (!process.env.REACT_APP_DEPLOY) console.log(e);
            }
          }
        }
      }
    } catch (e) {
      if (!process.env.REACT_APP_DEPLOY) console.log(e);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", getPath);

    return function cleanup() {
      window.removeEventListener("resize", getPath);
    };
  }, []);

  useEffect(() => {
    if (connectorInfo?.label_class && connectorInfo.label_class.length > 0 && ((imgData?.labels && imgData.labels?.length > 0) || imgData?.labelData)) {
      // object detection: imgData?.labels(labeling info), image classification: imgData?.labelData(class name)
      const tmpSet = new Set();
      const classInfos = [];

      if (imgData?.labelData) {
        classInfos.push({
          name: imgData?.labelData,
          color: "var(--secondary1)",
        });
      } else {
        imgData.labels.map((v, i) => {
          tmpSet.add(v.labelclass);
        });

        const classesIds = Array.from(tmpSet);

        connectorInfo.label_class.map((v, i) => {
          if (classesIds.includes(v.id)) classInfos.push({ name: v.name, color: v.color });
        });
      }

      setClassesLabeled(classInfos);
    }
  }, [connectorInfo, imgData]);

  useEffect(() => {
    (async () => {
      const previewImgEl = document.getElementById("previewImage");

      if (!isImgModalLoading && imgData?.s3key && previewImgEl && connectorInfo) {
        getPath();
      }
    })();
  }, [isImgModalLoading, imgData, connectorInfo]);

  return (
    <>
      {connectorInfo.trainingMethod === "image" || connectorInfo.trainingMethod === "object_detection" ? (
        <>
          {connectorInfo.dataconnectortype.dataconnectortypeName === "Video" && (
            <Grid container sx={{ mb: 3 }}>
              <figure style={{ width: "100%" }}>
                <figcaption style={{ marginBottom: 4, fontSize: 14, fontWeight: 500 }}>{t("Video Preview")}</figcaption>
                <video width="100%" controls autoPlay>
                  <source src={process.env.REACT_APP_ENTERPRISE === "true" ? fileurl + "static" + connectorInfo.filePath : connectorInfo.filePath} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </figure>
            </Grid>
          )}
          <Grid container>
            {connectorInfo.sampleData &&
              connectorInfo.sampleData.map((v, i) => {
                return (
                  v.s3key && (
                    <Grid
                      item
                      key={v.file_name + i}
                      xs={12}
                      sm={5.5}
                      md={3.5}
                      lg={2}
                      minWidth={240}
                      minHeight={240}
                      sx={{
                        position: "relative",
                        borderRadius: 4,
                        mb: 2,
                        mr: 2,
                        cursor: "pointer",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          background: `no-repeat center url("${process.env.REACT_APP_ENTERPRISE === "true" ? fileurl + "static" + v.s3key : v.s3key}")`,
                          backgroundSize: "cover",
                          transition: "all 0.4s",
                        },
                        "&:hover::before": {
                          transform: "scale(1.05)",
                        },
                        "&:hover .img_info": {
                          opacity: 1,
                        },
                      }}
                      onClick={() => {
                        if (!isImgModalLoading) getPreviewData(v.image_id, connectorInfo.originalLabelproject, connectorInfo.trainingMethod);
                      }}
                    >
                      {isImgModalLoading && v.image_id === selectedImgId && (
                        <Grid container width="100%" height="100%" justifyContent="center" alignItems="center">
                          <CircularProgress
                            size={35}
                            thickness={4}
                            color="inherit"
                            sx={{
                              color: "var(--secondary1)",
                            }}
                          />
                        </Grid>
                      )}
                      <Grid
                        container
                        className="img_info"
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                        height="100%"
                        sx={{
                          position: "relative",
                          zIndex: 10,
                          background: "rgba(0,0,0,0.6)",
                          opacity: 0,
                        }}
                      >
                        <Grid item width="100%" sx={{ textAlign: "center" }}>
                          <p
                            style={{
                              padding: "0 16px",
                              fontWeight: 600,
                              color: "var(--textWhite87)",
                              wordBreak: "break-all",
                              lineHeight: 1.2,
                              maxHeight: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {v.file_name && v.file_name.length > 80 ? v.file_name.substring(0, 82) + "..." : v.file_name}
                          </p>
                          <p style={{ color: "var(--textWhite87)" }}>
                            ({v.width} * {v.height})
                          </p>
                        </Grid>
                      </Grid>
                    </Grid>
                  )
                );
              })}
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          {sampleData && <RawDataTable sampleData={sampleData} sampleDataId={connectorInfo.id} isDataConnectorPage />}
        </Grid>
      )}

      {imgData && (
        <Dialog
          maxWidth="md"
          open={imgModalOpen}
          onClose={handleImgModalClose}
          PaperProps={{
            style: { borderRadius: "8px", border: "2px solid var(--surface2)" },
          }}
        >
          <DialogTitle
            sx={{
              color: "var(--textWhite)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Grid container justifyContent="space-between" wrap="nowrap">
              <Grid item>
                <Grid container>
                  {classesLabeled &&
                    classesLabeled.map((v, i) => {
                      return (
                        <Grid item key={v.name} sx={{ mr: 1, mb: 0.5 }}>
                          <Chip
                            variant="outlined"
                            label={v.name ? v.name : "class"}
                            size="small"
                            sx={{
                              color: "var(--textWhite87)",
                              border: `2px solid ${v.color}`,
                              lineHeight: 1,
                            }}
                          />
                        </Grid>
                      );
                    })}
                </Grid>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "var(--textWhite87)",
                    marginBottom: 0,
                  }}
                >
                  {imgData.originalFileName}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--textWhite6)",
                    marginBottom: 0,
                  }}
                >
                  <span>
                    {imgData.width} * {imgData.height}
                  </span>
                  <span style={{ margin: "0 4px" }}>/</span>
                  <span>{setMemoryUnit(imgData.fileSize)}</span>
                  <span style={{ margin: "0 4px" }}>/</span>
                  <span>{convertToLocalDateStr(imgData.created_at)}</span>
                </p>
              </Grid>
              <Grid item>
                <CloseIcon
                  id="close_img_dialog"
                  onClick={handleImgModalClose}
                  sx={{
                    fontSize: 30,
                    fill: "var(--textWhite87)",
                    cursor: "pointer",
                    marginLeft: 1.5,
                  }}
                />
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <figure style={{ position: "relative", textAlign: "center" }}>
              <img
                id="previewImage"
                ref={imageRef}
                alt={imgData.originalFileName}
                src={process.env.REACT_APP_ENTERPRISE === "true" ? fileurl + "static" + imgData.s3key : imgData.s3key}
                style={{
                  maxWidth: "100%",
                  maxHeight: 640,
                  borderRadius: "8px",
                }}
              />
              {imgData.labels && imgData.labels.length > 0 && <canvas ref={canvasRef} className={classes.datasetLabelCanvas} id="labelCanvas" style={{ width: "100%" }}></canvas>}
            </figure>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DataconnectorPreview;
