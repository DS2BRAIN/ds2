import React, { useEffect, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import Dropzone from "react-dropzone";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Tip from "components/Loading/Tip.js";
import CloseIcon from "@material-ui/icons/Close";
import InputBase from "@material-ui/core/InputBase";
import { useDispatch, useSelector } from "react-redux";
import {
  postLabelProjectRequestAction,
  setLabelProjectStarted,
} from "redux/reducers/labelprojects.js";
import {
  askModalRequestAction,
  openErrorSnackbarRequestAction,
  askStartLabelProjectReqeustAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";
import CircularProgress from "@mui/material/CircularProgress";
import { LinearProgress } from "@mui/material";
import Button from "components/CustomButtons/Button";

const StartProject = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/*, zip/*",
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [projectNameValue, setProjectNameValue] = useState("");

  useEffect(() => {
    if (labelprojects.isProjectStarted && labelprojects.selectedProject) {
      dispatch(setLabelProjectStarted());
      history.push(`/admin/labelling/${labelprojects.selectedProject.id}`);
    }
  }, [labelprojects.isProjectStarted]);

  useEffect(() => {
    if (isUploadFileChanged) setIsUploadFileChanged(false);
  }, [isUploadFileChanged]);

  useEffect(() => {
    setIsUploadLoading(false);
  }, [uploadFile]);

  const dropFiles = (files) => {
    setIsUploadLoading(true);
    const tmpFiles = [];
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].size > user.maximumFileSize) {
        dispatch(
          openErrorSnackbarRequestAction(
            t(
              `${user.maximumFileSize /
                1073741824}GB 크기이상의 파일은 업로드 불가합니다.`
            )
          )
        );
      } else {
        const name = files[idx].name;
        if (idx < 100 && /\.(jpg|jpeg|png|zip)$/g.test(name.toLowerCase())) {
          tmpFiles.push(files[idx]);
        }
      }
    }
    if (tmpFiles.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please upload file again")));
      setIsUploadLoading(false);
      return;
    }
    setUploadFile(tmpFiles);
    setIsUploadLoading(false);
  };

  const deleteUploadedFile = (files) => {
    const tempFiles = uploadFile;
    for (let idx = 0; idx < uploadFile.length; idx++) {
      if (uploadFile[idx].path === files) {
        tempFiles.splice(idx, 90);
      }
    }
    setUploadFile(tempFiles);
    setIsUploadFileChanged(true);
  };

  const changeInputNameChangeValue = (e) => {
    setProjectNameValue(e.target.value);
  };

  return labelprojects.isLoading ? (
    <div className={classes.modalLoading}>
      {/* <Tip /> */}
      <LinearProgress />
      <b style={{ alignSelf: "center" }}>
        {t("Creating project. Please wait")}
      </b>
    </div>
  ) : (
    <>
      <div className={classes.modalContent} id="projectModal">
        <div id="projectDropzoneContainer">
          {isUploadLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
              }}
            >
              <CircularProgress size={20} sx={{ mb: 2 }} />
              <b className={classes.settingFontWhite6}>
                {t("Uploading. Please wait a moment")}
              </b>
            </div>
          ) : (
            <GridContainer>
              <GridItem
                xs={9}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span
                  style={{
                    marginRight: "10px",
                    color: currentThemeColor.textWhite87,
                  }}
                >
                  {t("Project name")}:
                </span>
                <InputBase
                  style={{ borderBottom: "2px solid #999999" }}
                  className={classes.input}
                  autoFocus
                  value={projectNameValue}
                  onChange={changeInputNameChangeValue}
                  placeholder={t("Enter the project name")}
                  id="projectNameInput"
                />
              </GridItem>
              <GridItem xs={3}></GridItem>
              <GridItem xs={12}>
                <Dropzone onDrop={dropFiles}>
                  {({ getRootProps, getInputProps }) => (
                    <div className="container">
                      {(!uploadFile || uploadFile.length === 0) && (
                        <div {...getRootProps({ className: "dropzoneArea" })}>
                          <input {...getInputProps()} />
                          <p className={classes.settingFontWhite6}>
                            {t("Drag the file or click the box to upload it!")}
                            <br />
                            {t(
                              "Only image files (png/jpg/jpeg) or image compression files (zip) can be uploaded"
                            )}
                            <br />
                            {t(
                              "You are able to upload up to 100 image files. Please compress your files if you need to upload more than that"
                            )}
                            <br />
                            {t(
                              "Uploading large-size files may take more than 5 minutes"
                            )}
                          </p>
                          <CloudUploadIcon fontSize="large" />
                        </div>
                      )}
                      <aside>
                        {!isUploadLoading &&
                          (uploadFile && uploadFile.length > 0 && (
                            <>
                              <p
                                style={{
                                  marginTop: "20px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <span>
                                  {t("Upload file")} : {t("총")}{" "}
                                  {uploadFile.length}
                                  {t("")}
                                </span>
                              </p>
                              <ul>
                                {uploadFile.map((file, idx) => {
                                  if (idx === 10) {
                                    return (
                                      <li style={{ listStyle: "none" }}>
                                        .......
                                      </li>
                                    );
                                  }
                                  if (idx >= 10) {
                                    return null;
                                  }
                                  return (
                                    <li key={file.name}>
                                      <div className={classes.alignCenterDiv}>
                                        <div
                                          style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {file.name}
                                        </div>
                                        <CloseIcon
                                          style={{
                                            marginLeft: "10px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            deleteUploadedFile(file.path);
                                          }}
                                        />
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                              <span
                                className={classes.startProjectUploadBtn}
                                onClick={() => {
                                  setUploadFile(null);
                                }}
                              >
                                {t("Re-upload")}
                              </span>
                            </>
                          ))}
                      </aside>
                    </div>
                  )}
                </Dropzone>
              </GridItem>
            </GridContainer>
          )}
        </div>
        <GridContainer>
          <GridItem xs={6}>
            <Button
              id="close_modal_btn"
              style={{ width: "100%" }}
              className={classes.defaultOutlineButton}
              onClick={() => {
                dispatch(askModalRequestAction());
              }}
            >
              {t("Cancel")}
            </Button>
          </GridItem>
          {projectNameValue && uploadFile ? (
            <GridItem xs={6}>
              <Button
                id="clickNext"
                style={{ width: "100%" }}
                className={classes.defaultHighlightButton}
                onClick={() => {
                  dispatch(
                    postLabelProjectRequestAction({
                      projectName: projectNameValue,
                      files: uploadFile,
                    })
                  );
                }}
              >
                {t("Next")}
              </Button>
            </GridItem>
          ) : (
            <GridItem xs={6}>
              <Button
                id="clickNext"
                style={{ width: "100%" }}
                className={classes.defaultDisabledButton}
                disabled
              >
                {t("Next")}
              </Button>
            </GridItem>
          )}
        </GridContainer>
      </div>
    </>
  );
};

export default React.memo(StartProject);
