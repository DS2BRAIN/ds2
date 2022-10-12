import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { deleteIdListForLabelProjectRequestAction } from "redux/reducers/projects.js";
import {
  postLabelProjectRequestAction,
  setLabelProjectStarted,
} from "redux/reducers/labelprojects.js";

import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import InputBase from "@material-ui/core/InputBase";
import InputLabel from "@material-ui/core/InputLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Dropzone from "react-dropzone";
import { useDropzone } from "react-dropzone";
import CloseIcon from "@material-ui/icons/Close";
import { Container, Grid } from "@material-ui/core";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "components/CustomButtons/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  backButton: {
    marginRight: theme.spacing(1),
    backgroundColor: "pink",
  },
  startProjectUploadBtn: {
    cursor: "pointer",
  },
  modalLoading: {
    width: "50%",
    minWidth: "560px",
    height: "30%",
    minHeight: "450px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "16px 32px 24px",
  },
  alignCenterDiv: {
    position: "relative",
    "& svg": {
      position: "absolute",
      right: "10px",
    },
  },
  step: {
    "& $alternativeLabel": {
      color: "var(--textWhite38)",
    },
    "& $active": {
      color: "var(--textWhite)",
    },
  },
  active: {},
  alternativeLabel: {},
}));

export default function NewProject({ history }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, labelprojects, messages, projects } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
      projects: state.projects,
    }),
    []
  );

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/*, zip/*, video/*, csv/*",
  });

  const [projectNameValue, setProjectNameValue] = useState("");
  const [projectDescriptionValue, setProjectDescriptionValue] = useState("");
  const [dataCategory, setDataCategory] = useState("");
  const [uploadFile, setUploadFile] = useState([]);
  const [shouldUpdateFrame, setShouldUpdateFrame] = useState(false);
  const [frameValue, setFrameValue] = useState(null);
  const [isUploadFileChanged, setIsUploadFileChanged] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [newProjectId, setNewProjectId] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [skipStepper, setSkipStepper] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isFromDataconnectorDetail, setIsFromDataconnetorDetail] = useState(
    false
  );

  let workapp = {
    object_detection: t("Object Detection"),
    // voice: "음성",
    normal_classification: t("Classification"),
    normal_regression: t("Regression"),
    text: t("Text"),
    image: t("Image"),
  };

  useEffect(() => {
    if (!projects.idListForLabelProject.length) {
      dispatch(
        openSuccessSnackbarRequestAction(t("Please select project data again."))
      );
      history.push("/admin/dataconnector");
    }

    setShouldUpdateFrame(false);

    const url = window.location.href;
    if (url.indexOf("&detail=true") !== -1) setIsFromDataconnetorDetail(true);
    if (
      url.indexOf("?file=ready") !== -1 &&
      projects.idListForLabelProject &&
      projects.categoryForLabelProject
    ) {
      const type = projects.categoryForLabelProject;
      setUploadFile(projects.idListForLabelProject);
      if (type === "ZIP" || type === "Video") {
        delete workapp["normal_classification"];
        delete workapp["normal_regression"];
        delete workapp["text"];
      } else {
        delete workapp["object_detection"];
        delete workapp["image"];
        if (projects.categoryRestrict === "normal_regression") {
          delete workapp["text"];
          delete workapp["normal_classification"];
        }
      }
      setSkipStepper(true);
      dispatch(deleteIdListForLabelProjectRequestAction());
    }
    setCategories(Object.keys(workapp));
  }, []);

  useEffect(() => {
    if (activeStep === 1 && messages.category === "success") {
      setIsLoading(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [messages]);

  useEffect(() => {
    setIsUploadLoading(false);
    if (!uploadFile || uploadFile.length === 0) {
      setShouldUpdateFrame(false);
    }
  }, [uploadFile]);

  useEffect(() => {
    if (labelprojects.isProjectStarted && labelprojects.selectedProject) {
      setNewProjectId(labelprojects.selectedProject.id);
      dispatch(setLabelProjectStarted());
    }
  }, [labelprojects.isProjectStarted]);

  useEffect(() => {
    if (isUploadFileChanged) setIsUploadFileChanged(false);
  }, [isUploadFileChanged]);

  useEffect(() => {
    const url = window.location.href;
    if (url.indexOf("?file=ready") === -1 && activeStep === 0) {
      setUploadFile([]);
    }
  }, [activeStep]);

  const goLabelProjectDetail = (id) => {
    history.push(`/admin/labelling/${id}`);
  };

  const changeProjectNameValue = (e) => {
    setProjectNameValue(e.target.value);
  };

  const changeProjectDescriptionValue = (e) => {
    setProjectDescriptionValue(e.target.value);
  };

  const changeDataCategory = (event) => {
    setDataCategory(event.target.value);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (projectNameValue && dataCategory) {
        if (skipStepper) {
          dispatch(
            postLabelProjectRequestAction({
              name: projectNameValue,
              description: projectDescriptionValue,
              workapp: dataCategory,
              files: uploadFile,
              filesForLabelProject: skipStepper,
            })
          );
          setIsLoading(true);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Project name and category are required.")
          )
        );
      }
    } else if (activeStep === 1) {
      if (uploadFile && uploadFile.length > 0) {
        if (shouldUpdateFrame && !frameValue) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("You must enter frames per minute to upload a video file.")
            )
          );
          return;
        }
        if (frameValue !== null && (frameValue < 1 || frameValue > 60)) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("The number of frames must be between 1 and 600")
            )
          );
          return;
        }

        dispatch(
          postLabelProjectRequestAction({
            name: projectNameValue,
            description: projectDescriptionValue,
            workapp: dataCategory,
            files: uploadFile,
            frame_value: frameValue ? frameValue : 60,
          })
        );
        setIsLoading(true);
      } else {
        dispatch(openErrorSnackbarRequestAction(t("Upload file")));
      }
    } else {
      history.push(`/admin/labelling`);
      // history.push(`/admin/labelling/${newProjectId}`);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      if (isFromDataconnectorDetail) history.goBack();
      else history.push(`/admin/dataconnector`);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const dataTypeText = (type) => {
    if (type === "object_detection" || type === "image") {
      return (
        <>
          {t(
            "Only image files (png/jpg/jpeg), compressed image files (zip), and video files (mp4) can be uploaded."
          )}
          <br />
          {t(
            "You are able to upload up to 100 image files. Please compress your files if you need to upload more than that"
          )}
        </>
      );
    } else {
      return t(
        "Only CSV files of 2GB or less are supported. (Only 1 upload is allowed)"
      );
    }
  };

  const dropFiles = (files) => {
    setIsUploadLoading(true);
    const tmpFiles = [];
    let maximum = user.maximumFileSize;
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].size > maximum) {
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
        if (dataCategory === "object_detection" || dataCategory === "image") {
          if (
            idx < 100 &&
            /\.(jpg|jpeg|png|zip|mp4|quicktime|mov)$/g.test(name.toLowerCase())
          ) {
            tmpFiles.push(files[idx]);
          } else {
            dispatch(
              openErrorSnackbarRequestAction(t("Please upload file again"))
            );
          }
          if (
            files[idx].type === "video/mp4" ||
            files[idx].type === "video/quicktime" ||
            files[idx].type === "video/mov"
          ) {
            setShouldUpdateFrame(true);
            maximum = 5000000000;
          }
        } else {
          if (idx < 1 && /\.(csv)$/g.test(name.toLowerCase())) {
            tmpFiles.push(files[idx]);
          } else {
            dispatch(
              openErrorSnackbarRequestAction(t("Please upload file again"))
            );
          }
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
        tempFiles.splice(idx, 1);
      }
    }
    setUploadFile(tempFiles);
    setIsUploadFileChanged(true);
    let flag = true;
    tempFiles.map((tempFile) => {
      const name = tempFile.name;
      if (/\.(mp4|quicktime|mov)$/g.test(name.toLowerCase())) {
        flag = false;
      }
    });
    if (tempFiles.length === 0 || flag) {
      setShouldUpdateFrame(false);
    }
  };

  function getSteps() {
    return ["Project Information", "Upload Data", "Create Project"];
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="stretch"
            style={{ marginTop: "20px" }}
          >
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} style={{ marginBottom: "20px" }}>
                  <InputBase
                    style={{
                      borderBottom: "2px solid #999999",
                      color: "var(--textWhite)",
                      width: "100%",
                    }}
                    className={classes.input}
                    autoFocus
                    value={projectNameValue}
                    onChange={changeProjectNameValue}
                    placeholder={t("Please enter a project name.*")}
                    id="projectNameInput"
                  />
                </Grid>
                <Grid item xs={12} style={{ marginBottom: "30px" }}>
                  <InputBase
                    style={{
                      borderBottom: "2px solid #999999",
                      color: "var(--textWhite)",
                      width: "100%",
                    }}
                    className={classes.input}
                    value={projectDescriptionValue}
                    onChange={changeProjectDescriptionValue}
                    placeholder={t("Please enter a project description.")}
                    id="projectDescInput"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                padding: "22px 24px",
                marginBottom: "25px",
                border: "2px solid #999999",
                borderRadius: "8px",
              }}
            >
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <span style={{ fontWeight: 600 }}>
                    {t("Select Data Category")} &#42;
                  </span>
                </FormLabel>
                <RadioGroup
                  aria-label="dataCategory"
                  name="dataCategory"
                  value={dataCategory}
                  onChange={changeDataCategory}
                  row
                >
                  {categories.map((category) => {
                    return (
                      <FormControlLabel
                        value={category}
                        label={t(workapp[category])}
                        control={<Radio color="primary" />}
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return isLoading ? (
          <div
            style={{
              width: "100%",
              margin: "80px 0 60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress style={{ marginBottom: "20px" }} />
            <b style={{ display: "inline-block", marginBottom: 60 }}>
              {t("Creating project. Please wait")}
            </b>
          </div>
        ) : (
          <>
            <div id="projectDropzoneContainer">
              {isUploadLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "20px",
                  }}
                >
                  <CircularProgress sx={{ mb: 2 }} />
                  <b className={classes.settingFontWhite6}>
                    {t("Uploading. Please wait a moment")}
                  </b>
                </div>
              ) : (
                <Dropzone onDrop={dropFiles}>
                  {({ getRootProps, getInputProps }) => (
                    <div>
                      {(!uploadFile || uploadFile.length === 0) && (
                        <div
                          {...getRootProps({
                            className: "container fileUploadArea dropzoneArea",
                          })}
                          style={{ borderRadius: "20px" }}
                        >
                          <input {...getInputProps()} />
                          <Button shape="whiteOutlined">
                            {/* fileUploadButton */}
                            {t("Import file")}
                          </Button>
                          <div
                            className={classes.settingFontWhite6}
                            style={{ wordBreak: "keep-all", marginTop: "16px" }}
                          >
                            {dataTypeText(dataCategory)}
                            {/* {t(
                            "파일을 드래그하거나 박스를 클릭해서 업로드해주세요!"
                          )}
                          <br /> */}
                            <br />
                            {t(
                              "Uploading large-size files may take more than 5 minutes"
                            )}
                          </div>
                        </div>
                      )}
                      {!isUploadLoading &&
                        (uploadFile && uploadFile.length > 0 && (
                          <>
                            <div
                              style={{
                                width: "100%",
                              }}
                            >
                              <ul
                                style={{
                                  borderBottom: "1px solid #fff",
                                  paddingLeft: "30px",
                                }}
                              >
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
                                    <li
                                      key={file.name}
                                      style={{ paddingBottom: "12px" }}
                                    >
                                      <div className={classes.alignCenterDiv}>
                                        <div
                                          style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {file.name}
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
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                              {/* <span
                          className={classes.startProjectUploadBtn}
                          onClick={() => {
                            setUploadFile(null);
                          }}
                        >
                          {t("Re-upload")}
                        </span> */}

                              <span
                                className="totalFile"
                                style={{ borderTop: "none" }}
                              >
                                {t("Total")} {uploadFile.length}
                                {t("")}
                              </span>
                            </div>
                          </>
                        ))}
                    </div>
                  )}
                </Dropzone>
              )}
            </div>
            {shouldUpdateFrame && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <InputLabel id="demo-simple-select-label">
                  {t("Enter frames per minute")}
                </InputLabel>
                <InputBase
                  variant="outlined"
                  required
                  id="frameValue"
                  placeholder={t("Enter only numbers from 1 to 600")}
                  label={t("Enter frames per minute")}
                  name="frameValue"
                  autoComplete="frameValue"
                  autoFocus
                  type="frameValue"
                  onChange={handleFrameValue}
                  value={frameValue}
                  style={{
                    width: "70%",
                    border: "1px solid white",
                    color: "white",
                  }}
                />
              </div>
            )}
          </>
        );
      case 2:
        return (
          <div
            style={{ height: "160px", padding: "50px 0", textAlign: "center" }}
          >
            {t("The project has been created!")}
            <br />
            {t("Proceed with manual labeling for automatic labeling.")}
          </div>
        );
      default:
        return "Unknown stepIndex";
    }
  }

  const handleFrameValue = (e) => {
    const frame = e.target.value;
    setFrameValue(frame);
  };

  return (
    <div className={classes.root} style={{ padding: "36px 0" }}>
      {categories.length > 0 && (
        <>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  classes={{
                    root: classes.step,
                    active: classes.active,
                    alternativeLabel: classes.alternativeLabel,
                  }}
                >
                  {t(label)}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <div style={{ marginTop: "24px" }}>
            {activeStep === steps.length ? null : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "stretch",
                }}
              >
                <Container maxWidth="sm">
                  {getStepContent(activeStep)}

                  {activeStep !== 1 && (
                    <Grid container justify="flex-end" spacing={2}>
                      <Grid item>
                        {activeStep < 2 && (
                          <Button
                            id={activeStep === 0 ? "cancel_btn" : "go_back_btn"}
                            shape="greenOutlined"
                            style={{ minWidth: 130 }}
                            onClick={handleBack}
                          >
                            {activeStep === 0 ? t("Cancel") : t("뒤로가기")}
                          </Button>
                        )}
                      </Grid>
                      <Grid item>
                        <Button
                          id={
                            activeStep === steps.length - 1
                              ? "go_to_project_lists_btn"
                              : "next_btn"
                          }
                          shape="greenContained"
                          style={{ minWidth: 130 }}
                          onClick={handleNext}
                        >
                          {activeStep === steps.length - 1
                            ? t("Go to project list")
                            : t("Next")}
                        </Button>
                      </Grid>
                    </Grid>
                  )}
                </Container>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
