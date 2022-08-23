import React, { useEffect, useState } from "react";
import currentTheme from "assets/jss/custom.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import TablePagination from "@material-ui/core/TablePagination";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Modal from "@material-ui/core/Modal";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import StartProject from "./StartProject.js";
import { useDispatch, useSelector } from "react-redux";
import {
  getLabelProjectsRequestAction,
  stopLabelProjectsLoadingRequestAction,
  getAiTrainerLabelprojectRequestAction,
  labelprojectResetRequestAction,
  setObjectlistsSearchedValue,
} from "redux/reducers/labelprojects.js";
import {
  askModalRequestAction,
  askDeleteLabelProjectReqeustAction,
} from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import Plans from "components/Plans/Plans.js";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import Tooltip from "@material-ui/core/Tooltip";
import { currentThemeColor } from "assets/jss/custom.js";
import { ReactTitle } from "react-meta-tags";
import LabelIntro from "components/Guide/LabelIntro";
import { putUserRequestActionWithoutMessage } from "../../redux/reducers/user";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import { fileurl } from "controller/api";
import { CircularProgress } from "@mui/material";

const Labelling = ({ history }) => {
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
  let currentUrl = window.location.href;
  const initialPage = parseInt(currentUrl.split("?page=")[1].split("&")[0]) - 1;
  const initialSortingValue = currentUrl.split("&sorting=")[1].split("&")[0];
  const initialDescValue =
    currentUrl.split("&desc=")[1].split("&")[0] === "true" ? true : false;
  const initialRowsValue = currentUrl.split("&rows=")[1].split("&")[0];
  const [isLoading, setIsLoading] = useState(true);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [projectPage, setProjectPage] = useState(initialPage);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(
    initialRowsValue
  );
  const [searchedValue, setSearchedValue] = useState("");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [sortingValue, setSortingValue] = useState(initialSortingValue);
  const [isSortDesc, setIsSortDesc] = useState(initialDescValue);
  const [isPagingChanged, setIsPagingChanged] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedImagePage, setSelectedImagePage] = useState("labelapp");
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [isSearchValSubmitted, setIsSearchValSubmitted] = useState(false);

  const logoBlue = fileurl + "asset/front/img/logo_title.png";
  const labelApp = fileurl + "asset/front/img/labelling/Labelingtool.png";
  const autoLabeling = fileurl + "asset/front/img/labelling/AutoLabeling.svg";
  const smartcrowdsourcing =
    fileurl + "asset/front/img/labelling/Smartcrowdsourcing.svg";
  const twopointbounding =
    fileurl + "asset/front/img/labelling/2-pointbounding.svg";
  const labelExport = fileurl + "asset/front/img/labelling/LabelingExport.png";

  useEffect(() => {
    const selectedPage =
      parseInt(currentUrl.split("?page=")[1].split("&")[0]) - 1;
    const selectedSortingValue = currentUrl.split("&sorting=")[1].split("&")[0];
    const selectedDescValue =
      currentUrl.split("&desc=")[1].split("&")[0] === "true" ? true : false;
    const selectedRowsValue = currentUrl.split("&rows=")[1].split("&")[0];

    setProjectPage(selectedPage);
    setSortingValue(selectedSortingValue);
    setIsSortDesc(selectedDescValue);
    setProjectRowsPerPage(selectedRowsValue);

    if (selectedPage === 0 && selectedPage !== projectPage) {
      setIsLoading(true);
      onGetDefaultProject();
    }
  }, [currentUrl]);

  useEffect(() => {
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: projectPage,
        isDesc: isSortDesc,
        isshared: isShared,
      })
    );
  }, []);

  // useEffect(() => {
  //   if (user.me?.usageplan) {
  //     setIsUpgradePlanModalOpen(false);
  //     if (user.me?.isAiTrainer && !isShared) {
  //       //aiTrainer 일때랑 일반유저일때랑 프로젝트 다르게 요청
  //       dispatch(
  //         getAiTrainerLabelprojectRequestAction({
  //           sorting: sortingValue,
  //           count: projectRowsPerPage,
  //           start: projectPage,
  //           isDesc: isSortDesc,
  //         })
  //       );
  //     } else if (user.me.usageplan.planName === "trial") {
  //       //setIsShared(true);
  //       setIsBannerOpen(true);
  //       dispatch(
  //         getLabelProjectsRequestAction({
  //           sorting: sortingValue,
  //           count: projectRowsPerPage,
  //           start: projectPage,
  //           isDesc: isSortDesc,
  //           isshared: true,
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         getLabelProjectsRequestAction({
  //           sorting: sortingValue,
  //           count: projectRowsPerPage,
  //           start: projectPage,
  //           isDesc: isSortDesc,
  //           isshared: isShared,
  //         })
  //       );
  //     }
  //     dispatch(labelprojectResetRequestAction());
  //   }
  // }, [user.me?.usageplan]);

  useEffect(() => {
    if (user.me && !user.me.intro2Checked) {
      setIntroOn(true);
    } else {
      setIntroOn(false);
    }
  }, [user]);

  useEffect(() => {
    if (introOffClicked) {
      setIntroOn(false);
      user.me.intro2Checked = true;
      dispatch(
        putUserRequestActionWithoutMessage({
          intro2Checked: true,
        })
      );
    }
  }, [introOffClicked]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsProjectModalOpen(false);
      dispatch(stopLabelProjectsLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (labelprojects.projects) {
      setProjectSettings();
      // setIsLoading(false);
    }
  }, [labelprojects.projects]);

  useEffect(() => {
    if (!labelprojects.isLoading) {
      setIsLoading(false);
    }
  }, [labelprojects.isLoading]);

  useEffect(() => {
    if (isPagingChanged) setIsPagingChanged(false);
  }, [isPagingChanged]);

  const onOpenChatbot = () => {
    setIsUpgradePlanModalOpen(false);
    window.ChannelIO("show");
  };

  const onOpenBannerChatbot = () => {
    setIsBannerOpen(false);
    window.ChannelIO("show");
  };

  const setProjectSettings = () => {
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < labelprojects.projects.length; i++) {
      const value = labelprojects.projects[i].id;
      setProjectCheckedValue((prevState) => {
        return { ...prevState, [value]: false };
      });
    }
  };
  const onSetProjectCheckedValue = (value) => {
    setProjectCheckedValue((prevState) => {
      return { ...prevState, all: false, [value]: !projectCheckedValue[value] };
    });
  };
  const onSetProjectCheckedValueAll = () => {
    const result = projectCheckedValue["all"] ? false : true;
    const tmpObject = { all: result };
    for (let i = 0; i < labelprojects.projects.length; i++) {
      const id = labelprojects.projects[i].id;
      tmpObject[id] = result;
    }
    setProjectCheckedValue(tmpObject);
  };

  const onSetSortValue = async (value) => {
    let tempIsSortDesc = value === sortingValue ? !isSortDesc : true;
    const changedUrl =
      value === sortingValue
        ? `labelling?page=${projectPage +
            1}&sorting=${value}&desc=${tempIsSortDesc}&rows=${projectRowsPerPage}`
        : `labelling?page=1&sorting=${value}&desc=${tempIsSortDesc}&rows=${projectRowsPerPage}`;

    await setIsLoading(true);

    if (value === sortingValue) {
      setIsSortDesc(tempIsSortDesc);
      setProjectPage(0);
      dispatch(
        getLabelProjectsRequestAction({
          sorting: value,
          count: projectRowsPerPage,
          start: projectPage,
          isDesc: tempIsSortDesc,
          searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
          isshared: isShared,
        })
      );
    } else {
      setIsSortDesc(true);
      setProjectPage(0);
      setSortingValue(value);
      dispatch(
        getLabelProjectsRequestAction({
          sorting: value,
          count: projectRowsPerPage,
          start: 0,
          isDesc: true,
          searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
          isshared: isShared,
        })
      );
    }
    await setIsPagingChanged(true);
    await history.push(changedUrl);
  };

  const handleProjectChangePage = (event, newPage) => {
    setIsLoading(true);
    history.push(
      `?page=${newPage +
        1}&sorting=${sortingValue}&desc=${isSortDesc}&rows=${projectRowsPerPage}`
    );
    currentUrl = window.location.href;
    setProjectPage(newPage);
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: newPage,
        isDesc: isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        isshared: isShared,
      })
    );
  };

  const handleChangeProjectRowsPerPage = (event) => {
    const changedUrl = `labelling?page=1&sorting=${sortingValue}&desc=${isSortDesc}&rows=${+event
      .target.value}`;

    setIsLoading(true);
    setProjectRowsPerPage(+event.target.value);
    setProjectPage(0);
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: event.target.value,
        start: 0,
        isDesc: isSortDesc,
        searching: isSearchValSubmitted ? labelprojects.searchedValue : null,
        isshared: isShared,
      })
    );

    history.push(changedUrl);
  };

  const goProjectDetail = async (project) => {
    if (project.status === 100) {
      await history.push(`/admin/labelling/${project.id}`);
      return;
    } else {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Only projects in the completed status can be viewed.")
        )
      );
      return;
    }
  };

  const onSearchProject = async (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchedValue(value);
  };

  const onAskDeleteProjects = () => {
    const deleteFilesArr = [];
    for (let file in projectCheckedValue) {
      if (file !== "all" && projectCheckedValue[file])
        deleteFilesArr.push(file);
    }
    dispatch(
      askDeleteLabelProjectReqeustAction({
        labelProjects: deleteFilesArr,
        sortInfo: {
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: projectPage,
          isDesc: isSortDesc,
        },
      })
    );
    setSearchedValue("");
  };

  const onSetSelectedPage = (value) => {
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: projectPage,
        isDesc: isSortDesc,
        isshared: value,
      })
    );
    setIsShared(value);
    setSearchedValue("");
  };

  const onSetSelectedPageForAiTrainer = (value) => {
    dispatch(
      getAiTrainerLabelprojectRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: projectPage,
        isDesc: isSortDesc,
      })
    );
    setIsShared(value);
    setSearchedValue("");
  };

  const tableHeads = [
    { value: "No", width: "10%", name: "" },
    { value: "프로젝트명", width: "25%", name: "name" },
    { value: "상태", width: "10%", name: "status" },
    { value: "역할", width: "10%", name: "role" },
    { value: "종류", width: "15%", name: "workapp" },
    { value: "생성일", width: "15%", name: "created_at" },
    { value: "업데이트일", width: "15%", name: "updated_at" },
  ];

  const tableBodys = [
    "name",
    "status",
    "role",
    "workapp",
    "created_at",
    "updated_at",
  ];

  const statusText = {
    1: "생성중",
    99: "에러",
    100: "완료",
  };

  const renderProjectTable = () => {
    return (
      <>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {user.me && !user.me?.isAiTrainer && !isShared && (
                <TableCell
                  className={classes.tableHead}
                  align="center"
                  style={{ width: "10" }}
                >
                  <Checkbox
                    value="all"
                    checked={projectCheckedValue["all"]}
                    onChange={onSetProjectCheckedValueAll}
                  />
                </TableCell>
              )}
              {tableHeads.map((tableHead, idx) => {
                return (
                  <TableCell
                    id="mainHeader"
                    key={idx}
                    className={classes.tableHead}
                    align="center"
                    width={tableHead.width}
                    style={{
                      cursor: tableHead.value !== "No" ? "pointer" : "default",
                    }}
                    onClick={() =>
                      tableHead.value !== "No" && onSetSortValue(tableHead.name)
                    }
                  >
                    <div className={classes.tableHeader}>
                      {sortingValue === tableHead.name &&
                        (!isSortDesc ? (
                          <ArrowUpwardIcon fontSize="small" />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" />
                        ))}
                      <b>{t(tableHead.value)}</b>
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {labelprojects.projects.map((project, idx) => (
              <TableRow
                key={idx}
                className={classes.tableRow}
                style={{
                  background:
                    idx % 2 === 0
                      ? currentTheme.tableRow1
                      : currentTheme.tableRow2,
                }}
              >
                {user.me && !user.me?.isAiTrainer && !isShared && (
                  <TableCell className={classes.tableRowCell} align="center">
                    <Checkbox
                      value={project.id}
                      checked={projectCheckedValue[project.id] ? true : false}
                      onChange={() => onSetProjectCheckedValue(project.id)}
                    />
                  </TableCell>
                )}
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  {idx + projectRowsPerPage * projectPage + 1}
                </TableCell>
                {tableBodys.map((tableBody, idx) => {
                  return (
                    <TableCell
                      key={idx}
                      className={classes.tableRowCell}
                      align="center"
                      onClick={() => goProjectDetail(project)}
                    >
                      <div
                        style={{ wordBreak: "break-all" }}
                        id="labeling_project_list"
                      >
                        {tableBody === "created_at" ||
                        tableBody === "updated_at" ? (
                          <>{project[tableBody]?.substring(0, 10)}</>
                        ) : (
                          <>
                            {tableBody === "status" ? (
                              <>{t(statusText[project[tableBody]])}</>
                            ) : (
                              <>{t(project[tableBody])}</>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div
          xs={12}
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {user.me && !user.me?.isAiTrainer && (
            <Button
              id="deleteProject"
              disabled={!Object.values(projectCheckedValue).includes(true)}
              className={
                Object.values(projectCheckedValue).includes(true)
                  ? classes.defaultDeleteButton
                  : classes.defaultDisabledButton
              }
              style={{
                width: user.language === "ko" ? "5rem" : "10rem",
                marginTop: ".2rem",
                zIndex: "5",
              }}
              onClick={onAskDeleteProjects}
            >
              {t("Delete selection")}
            </Button>
          )}
          <TablePagination
            className={classes.tablePagination}
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={labelprojects.totalLength ? labelprojects.totalLength : 0}
            rowsPerPage={projectRowsPerPage}
            page={projectPage}
            backIconButtonProps={{
              "aria-label": "previous projectPage",
            }}
            nextIconButtonProps={{
              "aria-label": "next projectPage",
            }}
            style={{ margin: "-.7rem -.7rem" }}
            onChangePage={handleProjectChangePage}
            onChangeRowsPerPage={handleChangeProjectRowsPerPage}
          />
        </div>
      </>
    );
  };

  const onGetSearchedProject = (e) => {
    e.preventDefault();

    if (searchedValue && searchedValue.length > 0) {
      setProjectPage(0);
      setIsSearchValSubmitted(true);

      dispatch(setObjectlistsSearchedValue(searchedValue));
      dispatch(
        getLabelProjectsRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: 0,
          isDesc: isSortDesc,
          searching: searchedValue,
          isshared: isShared,
        })
      );
    } else {
      dispatch(
        openErrorSnackbarRequestAction(t("Please enter a search term."))
      );
      return;
    }
  };

  const onGetDefaultProject = () => {
    setSearchedValue("");
    setProjectPage(0);
    setIsSearchValSubmitted(false);

    dispatch(setObjectlistsSearchedValue(""));
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: 0,
        isDesc: isSortDesc,
        isshared: isShared,
      })
    );
  };

  const onStartLabelProject = () => {
    // if (!user.me?.isAiTrainer && user.me.usageplan.planName !== "trial") {
    //   setIsProjectModalOpen(true);
    // } else {
    //   setIsUpgradePlanModalOpen(true);
    // }
    // history.push(`/admin/newProject`);
    history.push(`/admin/dataconnector`);
  };

  return (
    <>
      <ReactTitle title={"DS2.ai - " + t("Labeling")} />
      {introOn ? (
        <LabelIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
          userLang={user.language}
        />
      ) : (
        <>
          {isBannerOpen && (
            <div
              style={{
                zIndex: "999999",
                width: "100%",
                height: "150px",
                position: "absolute",
                top: "20px",
                left: 0,
                padding: "46px 62px",
                background:
                  "linear-gradient(90deg, #2F3236 0%, #566376 48.72%, #2F3236 100%)",
              }}
            >
              <CloseIcon
                style={{ position: "absolute", top: "18px", right: "20px" }}
                onClick={() => {
                  setIsBannerOpen(false);
                }}
                className={classes.pointerCursor}
              />
              <div className={classes.bannerTitleText}>
                CLICK AI AUTO LABELING
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className={classes.bannerSubText}>
                  {t(
                    "딥러닝 기반의 데이터 라벨링 자동화를 통해 시간과 비용을 절약해보세요."
                  )}
                </div>
                <Button
                  className={classes.bannerButton}
                  onClick={onOpenBannerChatbot}
                >
                  {t("Contact us")}
                </Button>
              </div>
            </div>
          )}
          <GridItem xs={12}>
            <div className={classes.topTitle}>
              {t("Training Data Labeling")}
            </div>
            <div
              className={classes.subTitleText}
              style={{ marginBottom: "20px" }}
            >
              {t("Labeling tool for deep learning-based AI training.")}
            </div>
          </GridItem>
          <div>
            {isLoading || labelprojects.isLoading ? (
              <div className={classes.loading} style={{ marginTop: "-29px" }}>
                <CircularProgress
                  size={40}
                  style={{
                    color: "var(--main)",
                  }}
                />
              </div>
            ) : (
              <GridContainer style={{ paddingTop: "24px" }}>
                <GridItem
                  xs={7}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    id="addProjcetBtn"
                    className={`${classes.defaultGreenOutlineButton} ${classes.neoBtnH35}`}
                    onClick={onStartLabelProject}
                  >
                    {t("Start labeling")}
                  </Button>
                  {/* {user.me &&
                        !user.me?.isAiTrainer &&
                        user.me.usageplan.planName !== "trial" && (
                          <Button
                            id="askLabellingBtn"
                            className={
                              classes.defaultOutlineButton +
                              " " +
                              classes.startLabellingBtn
                            }
                            style={{
                              fontSize: user.language === "en" && "10px",
                            }}
                            onClick={() => {
                              window.ChannelIO("show");
                            }}
                          >
                            <AddIcon id="askLabelIcon" />
                            {t("Labeling request")}
                          </Button>
                        )} */}
                </GridItem>
                <GridItem xs={5}>
                  <Tooltip
                    title={
                      <text style={{ fontSize: "12px" }}>
                        {t("Enter the project name")}
                      </text>
                    }
                    placement="top"
                  >
                    <form
                      onSubmit={(e) => onGetSearchedProject(e)}
                      className={classes.form}
                      style={{ justifyContent: "flex-end" }}
                      noValidate
                      id="labeling_search_form"
                    >
                      <Paper
                        component="form"
                        className={classes.searchBox}
                        style={{ height: "40px", width: "15vw" }}
                      >
                        <InputBase
                          className={classes.input}
                          placeholder={t("Search")}
                          value={searchedValue}
                          onChange={onSearchProject}
                          multiline={false}
                          id="searchInput"
                          style={{ fontSize: "16px", paddingLeft: "10px" }}
                        />
                        {searchedValue && searchedValue.length > 0 && (
                          <CloseIcon
                            id="searchIcon"
                            onClick={onGetDefaultProject}
                            className={classes.pointerCursor}
                          />
                        )}
                      </Paper>
                      {searchedValue && searchedValue.length > 0 && (
                        <SearchIcon
                          onClick={(e) => onGetSearchedProject(e)}
                          className={classes.pointerCursor}
                        />
                      )}
                    </form>
                  </Tooltip>
                </GridItem>
                <GridItem xs={12} sm={12} md={12} style={{ marginTop: "26px" }}>
                  {labelprojects.totalLength &&
                  labelprojects.totalLength !== 0 ? (
                    renderProjectTable()
                  ) : (
                    <div
                      id="labeling_no_project_text"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "20vh",
                      }}
                    >
                      {isShared
                        ? t("No Shared Label projects")
                        : user.me?.isAiTrainer
                        ? t("의뢰중인 라벨링 프로젝트가 없습니다.")
                        : t(
                            "진행중인 라벨링 프로젝트가 없습니다. 새로운 프로젝트를 생성해주세요."
                          )}
                    </div>
                  )}
                </GridItem>
              </GridContainer>
            )}
          </div>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isPlanModalOpen}
            onClose={() => {
              setIsPlanModalOpen(false);
            }}
            className={classes.modalContainer}
          >
            <div className={classes.planModalContent}>
              <CloseIcon
                className={classes.closeImg}
                style={{ margin: "8px" }}
                onClick={() => {
                  setIsPlanModalOpen(false);
                }}
              />
              <div className={classes.planModalTitle}>
                <div id="gradientTitle" className={classes.planModalTitleFont}>
                  {t("Upgrade your plan!")}
                </div>
              </div>
              <Plans onOpenChatbot={onOpenChatbot} />
            </div>
          </Modal>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isProjectModalOpen}
            onClose={() => {
              dispatch(askModalRequestAction());
            }}
            className={classes.modalContainer}
          >
            <StartProject history={history} />
          </Modal>
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={isUpgradePlanModalOpen}
            onClose={() => {
              setIsUpgradePlanModalOpen(false);
            }}
            className={classes.modalContainer}
          >
            <div className={classes.planAlertModalContent}>
              <div style={{ padding: "26px 30px 12px 40px", width: "60%" }}>
                <img
                  style={{ width: "124px" }}
                  src={logoBlue}
                  alt={"logo"}
                  className={classes.logo}
                />
                <div style={{ padding: "30px 0" }}>
                  <div className={classes.upgradePlanModalTitle}>
                    <div style={{ marginBottom: "10px" }}>
                      {t("Experience object recognition automatic labeling.")}
                    </div>
                    <div>{t("경험해보세요.")}</div>
                  </div>
                  <div className={classes.upgradePlanModalContent}>
                    <div style={{ marginBottom: "-8px" }}>
                      {t(
                        "Active Learning이 접목된 자동 라벨링 기능을 활용하여"
                      )}
                    </div>
                    <div>
                      {t(
                        "물체인식에 소요되는 시간과 비용을 절약할 수 있습니다."
                      )}
                    </div>
                  </div>
                  <div className={classes.upgradePlanSubTitle}>
                    {t("This option is only available on the Enterprise plan.")}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    style={{ width: "220px", height: "36px" }}
                    className={classes.defaultHighlightButton}
                    onClick={onOpenChatbot}
                  >
                    {t("Enterprise plan inquiry")}
                  </Button>
                  <a
                    href="https://clickai.ai/pricing.html"
                    target="_blank"
                    className={classes.planPolicyBtn}
                  >
                    {t("CLICK AI Pricing")}
                  </a>
                </div>
              </div>
              <div>
                <div style={{ height: "10%" }}>
                  <CloseIcon
                    className={classes.closeImg}
                    id="planModalCloseBtn"
                    style={{ margin: "8px" }}
                    onClick={() => {
                      setIsUpgradePlanModalOpen(false);
                    }}
                  />
                </div>
                <div style={{ display: "flex", height: "80%" }}>
                  <video
                    style={{ width: "380px", borderRadius: "10px" }}
                    autoPlay
                    loop
                  >
                    <source
                      src={fileurl + "asset/ecosystem/etc.mov"}
                      type="video/mp4"
                    />
                  </video>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default React.memo(Labelling);
