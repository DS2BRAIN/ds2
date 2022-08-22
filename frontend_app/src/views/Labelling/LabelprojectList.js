import React, { useEffect, useState } from "react";
import { ReactTitle } from "react-meta-tags";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  getLabelProjectsRequestAction,
  stopLabelProjectsLoadingRequestAction,
  setObjectlistsSearchedValue,
} from "redux/reducers/labelprojects";
import { putUserRequestActionWithoutMessage } from "redux/reducers/user";
import {
  askModalRequestAction,
  askDeleteLabelProjectReqeustAction,
  openErrorSnackbarRequestAction,
} from "redux/reducers/messages";
import { fileurl } from "controller/api";
import currentTheme from "assets/jss/custom";
import { openChat } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem";
import GridContainer from "components/Grid/GridContainer";
import SearchInputBox from "components/Table/SearchInputBox";
import Plans from "components/Plans/Plans";
import LabelIntro from "components/Guide/LabelIntro";
import StartProject from "./StartProject";

import {
  Checkbox,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
} from "@material-ui/core";
import { CircularProgress } from "@mui/material";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@material-ui/icons/Close";

const LabelprojectList = ({ history }) => {
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
  let currentUrl = window.location.href;

  const { t } = useTranslation();
  const logoBlue = fileurl + "asset/front/img/logo_title.png";
  const initialPage = parseInt(currentUrl.split("?page=")[1].split("&")[0]) - 1;
  const initialSortingValue = currentUrl.split("&sorting=")[1].split("&")[0];
  const initialDescValue =
    currentUrl.split("&desc=")[1].split("&")[0] === "true" ? true : false;
  const initialRowsValue = parseInt(
    currentUrl.split("&rows=")[1].split("&")[0]
  );

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
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [isProjectRequested, setIsProjectRequested] = useState(false);

  useEffect(() => {
    const selectedPage =
      parseInt(currentUrl.split("?page=")[1].split("&")[0]) - 1;
    const selectedSortingValue = currentUrl.split("&sorting=")[1].split("&")[0];
    const selectedDescValue =
      currentUrl.split("&desc=")[1].split("&")[0] === "true" ? true : false;
    const selectedRowsValue = parseInt(
      currentUrl.split("&rows=")[1].split("&")[0]
    );

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
    getProjectByDispatch();
  }, []);

  useEffect(() => {
    if (isProjectRequested) {
      getProjectByDispatch();
      setIsProjectRequested(false);
    }
  }, [isProjectRequested]);

  useEffect(() => {
    setProjectPage(0);
    setIsProjectRequested(true);
  }, [searchedValue]);

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
    }
  }, [labelprojects.projects]);

  useEffect(() => {
    setIsLoading(labelprojects.isLoading);
  }, [labelprojects.isLoading]);

  useEffect(() => {
    if (isPagingChanged) setIsPagingChanged(false);
  }, [isPagingChanged]);

  const getProjectByDispatch = () => {
    dispatch(
      getLabelProjectsRequestAction({
        sorting: sortingValue,
        count: projectRowsPerPage,
        start: projectPage,
        isDesc: isSortDesc,
        searching: searchedValue,
        isshared: isShared,
      })
    );
  };

  const onOpenChatbot = () => {
    setIsUpgradePlanModalOpen(false);
    openChat();
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
    setIsLoading(true);

    if (value === sortingValue) {
      setIsSortDesc(tempIsSortDesc);
      setProjectPage(0);
      setSortingValue(value);
      setIsProjectRequested(true);
    } else {
      setIsSortDesc(true);
      setProjectPage(0);
      setSortingValue(value);
      setIsProjectRequested(true);
    }
    setIsPagingChanged(true);
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
    setIsProjectRequested(true);
  };

  const handleChangeProjectRowsPerPage = (event) => {
    const changedUrl = `labelling?page=1&sorting=${sortingValue}&desc=${isSortDesc}&rows=${+event
      .target.value}`;
    setIsLoading(true);
    setProjectRowsPerPage(+event.target.value);
    setProjectPage(0);
    setIsProjectRequested(true);
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

  const tableHeads = [
    { value: "No", width: "10%", name: "" },
    { value: "Project name", width: "25%", name: "name" },
    { value: "Role", width: "10%", name: "role" },
    { value: "Type", width: "15%", name: "workapp" },
    { value: "Date created", width: "15%", name: "created_at" },
    { value: "Date updated", width: "15%", name: "updated_at" },
    { value: "Status", width: "10%", name: "status" },
  ];

  const tableBodys = [
    "name",
    "role",
    "workapp",
    "created_at",
    "updated_at",
    "status",
  ];

  const statusText = {
    1: "Creating",
    99: "Error",
    100: "Completed",
  };

  const renderProjectTable = () => {
    return (
      <>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
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
              {tableHeads.map((tableHead, idx) => (
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
              ))}
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
                <TableCell className={classes.tableRowCell} align="center">
                  <Checkbox
                    value={project.id}
                    checked={projectCheckedValue[project.id] ? true : false}
                    onChange={() => onSetProjectCheckedValue(project.id)}
                  />
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  {labelprojects.totalLength -
                    (projectRowsPerPage * projectPage + idx)}
                </TableCell>
                {tableBodys.map((tableBody, idx) => (
                  <TableCell
                    key={idx}
                    className={classes.tableRowCell}
                    align="center"
                    onClick={() => goProjectDetail(project)}
                  >
                    <div
                      id="labeling_project_list"
                      style={{ wordBreak: "break-all" }}
                    >
                      {tableBody === "created_at" ||
                      tableBody === "updated_at" ? (
                        project[tableBody] ? (
                          project[tableBody]?.substring(0, 10)
                        ) : (
                          "-"
                        )
                      ) : tableBody === "status" ? (
                        <span
                          style={
                            project[tableBody] === 1
                              ? { color: "#1BC6B4" }
                              : project[tableBody] === 99
                              ? { color: "#BD2020" }
                              : project[tableBody] === 100
                              ? { color: "#0A84FF" }
                              : null
                          }
                        >
                          {statusText[project[tableBody]]
                            ? "⦁ " + t(statusText[project[tableBody]])
                            : "-"}
                        </span>
                      ) : (
                        t(project[tableBody] ? project[tableBody] : "-")
                      )}
                    </div>
                  </TableCell>
                ))}
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
              shape="redOutlined"
              size="sm"
              disabled={!Object.values(projectCheckedValue).includes(true)}
              style={{
                marginTop: ".2rem",
                zIndex: "5",
              }}
              onClick={onAskDeleteProjects}
            >
              {t("Delete selection")}
            </Button>
          )}
          <TablePagination
            component="div"
            className={classes.tablePagination}
            page={projectPage}
            count={labelprojects.totalLength ? labelprojects.totalLength : 0}
            rowsPerPage={projectRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            backIconButtonProps={{
              "aria-label": "previous projectPage",
            }}
            nextIconButtonProps={{
              "aria-label": "next projectPage",
            }}
            style={{ margin: "-.7rem -.7rem", marginLeft: "auto" }}
            onPageChange={handleProjectChangePage}
            onRowsPerPageChange={handleChangeProjectRowsPerPage}
          />
        </div>
      </>
    );
  };

  const onGetDefaultProject = () => {
    setSearchedValue("");
    setProjectPage(0);
    dispatch(setObjectlistsSearchedValue(""));
    setIsProjectRequested(true);
  };

  const onStartLabelProject = () => {
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
            <GridContainer style={{ paddingTop: "24px", alignItems: "center" }}>
              <GridItem
                xs={7}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Button
                  id="add_project_btn"
                  shape="greenOutlined"
                  style={{ height: 32 }}
                  onClick={onStartLabelProject}
                >
                  {t("Start labeling")}
                </Button>

                <Tooltip
                  title={
                    <div style={{ fontSize: "12px" }}>
                      {user.language === "ko"
                        ? t("Project list") + " " + t("Refresh")
                        : t("Refresh") + " " + t("Project list")}
                    </div>
                  }
                  placement="top"
                >
                  <AutorenewIcon
                    id="label_project_refresh_btn"
                    className={
                      isLoading === false
                        ? classes.refreshIconActive
                        : classes.refreshIconDefault
                    }
                    style={{
                      width: "30px",
                      height: "30px",
                      padding: "4px",
                      borderRadius: "50px",
                      fill: "var(--textWhite87)",
                      marginLeft: 4,
                    }}
                    onClick={() => {
                      if (!isLoading) {
                        getProjectByDispatch();
                      }
                    }}
                  />
                </Tooltip>
              </GridItem>
              <GridItem xs={5}>
                <SearchInputBox
                  tooltipText={t("Enter the project name")}
                  setSearchedValue={setSearchedValue}
                />
              </GridItem>
              {isLoading ? (
                <div className="emptyListTable">
                  <CircularProgress size={40} />
                </div>
              ) : (
                <GridItem xs={12} sm={12} md={12} style={{ marginTop: "26px" }}>
                  {labelprojects.totalLength &&
                  labelprojects.totalLength !== 0 ? (
                    renderProjectTable()
                  ) : (
                    <div
                      id="labeling_no_project_text"
                      className="emptyListTable"
                    >
                      {isShared
                        ? t("No Shared Label projects")
                        : user.me?.isAiTrainer
                        ? t("There is no labeling project under request.")
                        : searchedValue
                        ? user.language === "ko"
                          ? `"${searchedValue}" ` +
                            "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
                          : `There were no results found for "${searchedValue}"`
                        : t(
                            "There is no labeling project in process. Please create a new project"
                          )}
                    </div>
                  )}
                </GridItem>
              )}
            </GridContainer>
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
                    <div>{t("")}</div>
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
                    shape="blueContained"
                    size="lg"
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

export default React.memo(LabelprojectList);
