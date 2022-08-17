import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import { ChromePicker } from "react-color";

import { askModalRequestAction } from "redux/reducers/messages.js";
import { stopLabelProjectsLoadingRequestAction, putLabelClassRequestAction, postLabelClassRequestAction, setIsProjectRefreshed } from "redux/reducers/labelprojects.js";
import { askDeleteLabelClassRequestAction, openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import * as api from "controller/labelApi.js";
import currentTheme from "assets/jss/custom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";

import { Box, Checkbox, Grid, InputBase, Modal, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { CircularProgress } from "@mui/material";

const NoClassText = ({ text }) => {
  const { t } = useTranslation();

  return (
    <TableRow id="noClassInformText">
      <TableCell
        colSpan={6}
        style={{
          fontSize: 16,
          color: "inherit",
          height: 360,
          borderBottom: "0.75px solid #3A3B3C",
        }}
        align="center"
      >
        {t(`${text}`)}
      </TableCell>
    </TableRow>
  );
};

const LabelClass = ({ history, isMarketProject }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const { t } = useTranslation();

  const TABLE_HEADS = [{ value: "No", width: "5%" }, { value: "색상", width: "10%" }, { value: isMarketProject ? "구역 클래스 이름" : "클래스명", width: "45%" }, { value: isMarketProject ? "구역 개수" : "라벨링 개수", width: "20%" }, { value: "", width: "10%" }];

  const [isLoading, setIsLoading] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [labelClasses, setLabelClasses] = useState([]);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState({ id: 0, name: "" });
  const [inputClassChangeValue, setInputClassChangeValue] = useState("");
  const [color, setColor] = useState("#fff");
  const [totalLength, setTotalLength] = useState(0);
  const [page, setPage] = useState(1);
  const [searchedVal, setSearchedVal] = useState("");
  const [isDeleteLabelClasses, setIsDeleteLabelClasses] = useState(false);
  const [isUpdateLabelClasses, setIsUpdateLabelClasses] = useState(false);
  const [selectedDeleteDict, setSelectedDeleteDict] = useState({});
  const [selectedUpdateDict, setSelectedUpdateDict] = useState([]);

  const listCnt = 10;

  const onSetProjectCheckedValue = (value) => {
    Object.values(projectCheckedValue);
    setProjectCheckedValue((prevState) => {
      return { ...prevState, all: false, [value]: !projectCheckedValue[value] };
    });
  };

  const onSetProjectCheckedValueAll = () => {
    const result = projectCheckedValue["all"] ? false : true;
    const tmpObject = { all: result };
    for (let i = 0; i < labelClasses.length; i++) {
      const id = labelClasses[i].id;
      tmpObject[id] = result;
    }
    setProjectCheckedValue(tmpObject);
  };

  const onSetNewClass = () => {
    setSelectedClass({ id: -1, name: "" });
    setColor(generateRandomHexColor());
    setInputClassChangeValue("");
    setIsClassModalOpen(true);
  };

  const changeInputNameChangeValue = (e) => {
    setInputClassChangeValue(e.target.value);
  };

  const onChangeColor = (obj) => {
    if (obj.hex) {
      setColor(obj.hex);
    }
  };

  const onChangePage = (e, page) => {
    setPage(page);
  };

  const deleteLabelClasses = () => {
    let list = [];
    for (let prop in projectCheckedValue) {
      if (projectCheckedValue[prop] && prop !== "all") {
        list.push(Number(prop));
      }
    }
    if (list.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please select at least one class.")));
      return;
    }
    setIsDeleteLabelClasses(false);

    const id = labelprojects.projectDetail.id;

    dispatch(
      askDeleteLabelClassRequestAction({
        id: id,
        arr: list,
        language: user.language,
      })
    );
  };

  const updateLabelClasses = () => {
    dispatch(
      putLabelClassRequestAction({
        labelClass: selectedUpdateDict,
        labelProjectId: labelprojects.projectDetail.id,
      })
    );
  };

  const onChangeClasses = (label) => {
    setSelectedClass(label);
    setColor(label.color);
    setInputClassChangeValue(label.name);
    setIsClassModalOpen(true);
  };

  const startUpdateLabelClasses = () => {
    setIsUpdateLabelClasses(true);
  };

  const onSetChangeClassName = () => {
    if (inputClassChangeValue.match(/[/~!@#$%^&*()+=|<>?:{}\-]/g)) {
      let a = dispatch(openErrorSnackbarRequestAction(t("Class names can contain only letters, numbers, and letters starting with Korean. (You can include _)")));
      return;
    }

    let hasSameClassName = false;

    labelClasses.forEach((each) => {
      if (each.id !== selectedClass.id && inputClassChangeValue === each.name) {
        dispatch(openErrorSnackbarRequestAction(t("Class name already exists")));
        hasSameClassName = true;
        return;
      }
    });

    if (hasSameClassName) return;

    setIsClassModalOpen(false);

    if (selectedClass && selectedClass.id === -1) {
      const labelClass = {
        name: inputClassChangeValue,
        color: color,
        labelproject: labelprojects.projectDetail.id,
        isMarketProject,
      };
      dispatch(postLabelClassRequestAction(labelClass));
    } else {
      setSelectedUpdateDict([
        ...selectedUpdateDict,
        {
          labelclassId: selectedClass.id,
          name: inputClassChangeValue,
          color: color,
        },
      ]);
    }
  };

  const setProjectSettings = () => {
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < labelClasses.length; i++) {
      const value = labelClasses[i].id;
      setProjectCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
  };

  const generateRandomHexColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const getLabelClassesPerPage = (labelClassesInfo) => {
    setIsLoading(true);

    api
      .getLabelClassesPerPage(labelClassesInfo)
      .then((res) => {
        setLabelClasses(res.data.labelclass);
        setTotalLength(res.data.total_labelclass_count);
        setIsFirst(false);
      })
      .catch((e) => {
        dispatch(openErrorSnackbarRequestAction(t("Failed to load class")));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsClassModalOpen(false);
      dispatch(stopLabelProjectsLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (selectedUpdateDict.length !== 0) {
      updateLabelClasses();
    }
  }, [selectedUpdateDict]);

  useEffect(() => {
    // objectLists 바뀔때마다 초기값 세팅
    (async () => {
      if (labelClasses) {
        await setProjectSettings();
      }
    })();
  }, [labelClasses]);

  useEffect(() => {
    if (labelprojects.projectDetail) {
      const labelClassesInfo = {
        id: labelprojects.projectDetail.id,
        page,
        count: listCnt,
      };

      getLabelClassesPerPage(labelClassesInfo);
    }
  }, [labelprojects.projectDetail, page]);

  useEffect(() => {
    if (labelprojects.isProjectRefreshed) {
      const labelClassesInfo = {
        id: labelprojects.projectDetail.id,
        page: 1,
        count: 10,
      };

      getLabelClassesPerPage(labelClassesInfo);

      dispatch(setIsProjectRefreshed(false));
    }
  }, [labelprojects.isProjectRefreshed]);

  useEffect(() => {
    const qs = history.location.search;

    if (qs.includes("class_required=true")) onSetNewClass();
  }, [history.location]);

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      {labelprojects == undefined || labelprojects.isLabelClassDeleteLoading || (labelprojects.projectDetail.chart.ready === 0 && isLoading && isFirst) ? (
        // { false ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Grid container style={{ marginBottom: "16px" }}>
            <Grid item>
              {user.me && !user.me.isAiTrainer && labelprojects.projectDetail && !labelprojects.projectDetail.isShared && (
                <>
                  <Button
                    id="add_class_btn"
                    aria-controls="customized-menu"
                    aria-haspopup="true"
                    shape="greenOutlined"
                    onClick={onSetNewClass}
                    // startIcon={<AddIcon />}
                  >
                    {isMarketProject ? t("Add zone class") : t("Create Class")}
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHead} align="center" style={{ width: "5%" }}>
                  {user.me && !user.me.isAiTrainer && labelprojects.projectDetail && !labelprojects.projectDetail.isShared && <Checkbox value="all" checked={projectCheckedValue["all"]} onChange={onSetProjectCheckedValueAll} />}
                </TableCell>
                {TABLE_HEADS.map((tableHead, idx) => {
                  return (
                    <TableCell id="mainHeader" key={idx} className={classes.tableHead} align="center" width={tableHead.width}>
                      <b>{t(tableHead.value)}</b>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {user.me &&
                !user.me.isAiTrainer &&
                !labelprojects.projectDetail.isShared &&
                (totalLength === 0 ? (
                  <NoClassText text={t(isLoading ? "클래스 정보를 불러오는 중입니다. 잠시만 기다려주세요." : "등록된 클래스가 없습니다. 클래스를 추가해주세요.")} />
                ) : (
                  labelClasses &&
                  labelClasses.map((labelClass, idx) => (
                    <TableRow
                      key={idx}
                      className={classes.tableRow}
                      style={{
                        background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                        cursor: "default",
                      }}
                    >
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {user.me && !user.me.isAiTrainer && labelprojects.projectDetail && !labelprojects.projectDetail.isShared && (
                          <Checkbox value={labelClass.id} checked={projectCheckedValue[labelClass.id] ? true : false} id="deleteClasses" name="deleteClasses" onChange={() => onSetProjectCheckedValue(labelClass.id)} />
                        )}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {totalLength - (listCnt * (page - 1) + idx)}
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        <Box
                          component="div"
                          style={{
                            width: "100%",
                            height: 30,
                            backgroundColor: `${labelClass.color}`,
                            textAlign: "center",
                            lineHeight: "30px",
                          }}
                        >
                          {!labelClass.color && "no color"}
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        <div className={classes.defaultContainer}>
                          <div
                            style={{
                              wordBreak: "break-all",
                              marginLeft: "10px",
                            }}
                          >
                            {t(`${labelClass.name}`)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        <div className={classes.wordBreakDiv}>{labelClass.completedLabelCount}</div>
                      </TableCell>
                      <TableCell className={classes.tableRowCell} align="center" style={{ cursor: "default" }}>
                        {user.me && !user.me.isAiTrainer && labelprojects.projectDetail && !labelprojects.projectDetail.isShared && (
                          <Grid container className={classes.wordBreakDiv} justify="space-evenly" spacing={2}>
                            <Grid item>
                              <Button
                                shape="blue"
                                size="sm"
                                onClick={() => {
                                  startUpdateLabelClasses();
                                  onChangeClasses(labelClass);
                                }}
                                id="labelClass_modyfy_class_btn"
                              >
                                {t("Edit")}
                              </Button>
                            </Grid>
                          </Grid>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ))}
            </TableBody>
          </Table>

          {totalLength !== 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <Button id="delete_class_btn" aria-controls="customized-menu" aria-haspopup="true" shape="redOutlined" size="sm" disabled={!Object.values(projectCheckedValue).includes(true)} style={{ marginRight: "auto" }} onClick={deleteLabelClasses}>
                {t("Delete selection")}
              </Button>
              <Pagination count={totalLength ? Math.ceil(totalLength / listCnt) : 0} page={page} onChange={onChangePage} classes={{ ul: classes.paginationNum }} style={{ marginRight: "auto" }} />
            </div>
          )}

          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isClassModalOpen}
            onClose={() => {
              dispatch(askModalRequestAction());

              history.push(`/admin/labelling/${labelprojects.projectDetail.id}`);
            }}
            className={classes.modalContainer}
            id="labelClass_modify_class_modal"
          >
            <div className={classes.defaultModalContent} style={{ width: "30%", minWidth: "500px" }}>
              <Grid container direction="colomn" justify="center" alignItems="center">
                <GridItem xs={7} style={{ marginBottom: "10px" }}>
                  <b>{isMarketProject ? t("Zone class name") : t("클래스명")} : </b>

                  <InputBase
                    className={classes.input}
                    autoFocus
                    value={inputClassChangeValue}
                    onChange={changeInputNameChangeValue}
                    placeholder={isMarketProject ? t("Please enter the zone name.") : t("Please enter the class name")}
                    multiline={true}
                    maxRows={5}
                    id="labelclass_name_input"
                    style={{ fontSize: "15px" }}
                  />
                </GridItem>
                <GridItem
                  xs={7}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "30px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "20px",
                      alignItems: "center",
                    }}
                  >
                    <b>{isMarketProject ? t("Zone class color") : t("Class color")}</b>
                    <div
                      id="class_color_block"
                      style={{
                        width: "60px",
                        height: "20px",
                        marginLeft: "10px",
                        background: `${color}`,
                      }}
                    ></div>
                  </div>
                  <div style={{ height: "250px" }} id="labelClass_color_picker">
                    <ChromePicker color={color} onChangeComplete={onChangeColor} disableAlpha={true} />
                  </div>
                </GridItem>
                <GridItem xs={12}>
                  <GridContainer>
                    <GridItem xs={6}>
                      <Button
                        id="close_classsettingmodal_btn"
                        shape="whiteOutlined"
                        style={{ width: "100%" }}
                        onClick={() => {
                          dispatch(askModalRequestAction());
                          history.push(`/admin/labelling/${labelprojects.projectDetail.id}`);
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    </GridItem>
                    <GridItem xs={6}>
                      <Button
                        id="change_class_btn"
                        shape="greenOutlined"
                        disabled={!inputClassChangeValue}
                        style={{ width: "100%" }}
                        onClick={() => {
                          onSetChangeClassName();
                          history.push(`/admin/labelling/${labelprojects.projectDetail.id}`);
                        }}
                      >
                        {t("Enter")}
                      </Button>
                    </GridItem>
                  </GridContainer>
                </GridItem>
              </Grid>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default React.memo(LabelClass);
