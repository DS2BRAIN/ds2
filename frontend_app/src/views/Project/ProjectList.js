import React, { useState, useEffect } from "react";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import Checkbox from "@material-ui/core/Checkbox";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import Pagination from "@material-ui/lab/Pagination";
import MySnackbar from "components/MySnackbar/MySnackbar.js";
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import Language from "components/Language/Language";
import Cookies from "helpers/Cookies";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { changeUserLanguageRequestAction } from "redux/reducers/user.js";
import {
  getLabelProjectsRequestAction,
  stopLabelProjectsLoadingRequestAction,
  getAiTrainerLabelprojectRequestAction,
  labelprojectResetRequestAction,
} from "redux/reducers/labelprojects.js";
import {
  askModalRequestAction,
  askDeleteLabelProjectReqeustAction,
} from "redux/reducers/messages.js";
import Grid from "@material-ui/core/Grid";
import InputBase from "@material-ui/core/InputBase";
import { currentThemeColor } from "assets/jss/custom";
import Loading from "components/Loading/Loading.js";
import { ReactTitle } from "react-meta-tags";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import { NavLink } from "react-router-dom";
import Button from "components/CustomButtons/Button";

export default function ProjectList({ history }) {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, labelprojects, messages } = useSelector(
    (state) => ({
      user: state.user,
      labelprojects: state.labelprojects,
      messages: state.messages,
    }),
    []
  );
  const [projectNameValue, setProjectNameValue] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [searchedValue, setSearchedValue] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [isPagingChanged, setIsPagingChanged] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedImagePage, setSelectedImagePage] = useState("labelapp");
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  const tableHeads = [
    { value: "프로젝트명", width: "25%" },
    { value: "역할", width: "20%" },
    { value: "종류", width: "15%" },
    { value: "생성일", width: "20%" },
    { value: "업데이트일", width: "20%" },
  ];

  useEffect(() => {}, [labelprojects]);

  const changePage = (e, page) => {
    setIsLoading(true);
    setProjectPage(page);
    if (user.me?.isAiTrainer && !isShared) {
      dispatch(
        getAiTrainerLabelprojectRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: page - 1,
          isDesc: isSortDesc,
          searching: searchedValue,
        })
      );
    } else {
      dispatch(
        getLabelProjectsRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: page - 1,
          isDesc: isSortDesc,
          searching: searchedValue,
          isshared: isShared,
        })
      );
    }
  };

  const renderLabelProjects = () => {
    return (
      <>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {tableHeads.map((tableHead, idx) => {
                return (
                  <TableCell
                    id="mainHeader"
                    key={idx}
                    className={classes.tableHead}
                    align="center"
                    width={tableHead.width}
                  >
                    <b>{t(tableHead.value)}</b>
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
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goLabelProjectDetail(project.id)}
                >
                  <div className={classes.wordBreakDiv}>{project.name}</div>
                </TableCell>

                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goLabelProjectDetail(project.id)}
                >
                  <div className={classes.wordBreakDiv}>역할</div>
                </TableCell>

                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goLabelProjectDetail(project.id)}
                >
                  <div className={classes.wordBreakDiv}>{project.workapp}</div>
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goLabelProjectDetail(project.id)}
                >
                  <div className={classes.wordBreakDiv}>
                    {project.created_at.substring(0, 10)}
                  </div>
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goLabelProjectDetail(project.id)}
                >
                  <div className={classes.wordBreakDiv}>
                    {project.updated_at.substring(0, 10)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          <Pagination
            count={
              labelprojects.totalLength
                ? Math.floor(labelprojects.totalLength / projectRowsPerPage)
                : 0
            }
            page={projectPage}
            onChange={changePage}
            classes={{ ul: classes.paginationNum }}
          />
        </div>
      </>
    );
  };

  const goLabelProjectDetail = (id) => {
    history.push(`/admin/labelling/${id}`);
  };

  const changeInputNameChangeValue = (e) => {
    setProjectNameValue(e.target.value);
  };

  useEffect(() => {
    if (user.me?.usageplan) {
      setIsUpgradePlanModalOpen(false);
      if (user.me.isAiTrainer && !isShared) {
        //aiTrainer 일때랑 일반유저일때랑 프로젝트 다르게 요청
        dispatch(
          getAiTrainerLabelprojectRequestAction({
            sorting: sortingValue,
            count: projectRowsPerPage,
            start: projectPage,
            isDesc: isSortDesc,
          })
        );
      } else if (user.me.usageplan.planName === "trial") {
        //setIsShared(true);
        setIsBannerOpen(true);
        dispatch(
          getLabelProjectsRequestAction({
            sorting: sortingValue,
            count: projectRowsPerPage,
            start: projectPage,
            isDesc: isSortDesc,
            isshared: true,
          })
        );
      } else {
        dispatch(
          getLabelProjectsRequestAction({
            sorting: sortingValue,
            count: projectRowsPerPage,
            start: projectPage,
            isDesc: isSortDesc,
            isshared: isShared,
          })
        );
      }
      dispatch(labelprojectResetRequestAction());
    }
  }, [user.me?.usageplan]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsProjectModalOpen(false);
      dispatch(stopLabelProjectsLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (labelprojects.projects) {
      setProjectSettings();
      setIsLoading(false);
    }
  }, [labelprojects.projects]);

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
    await setIsLoading(true);
    if (value === sortingValue) {
      let tempIsSortDesc = isSortDesc;
      setIsSortDesc(!tempIsSortDesc);
      setProjectPage(0);
      if (user.me.isAiTrainer && !isShared) {
        dispatch(
          getAiTrainerLabelprojectRequestAction({
            sorting: value,
            count: projectRowsPerPage,
            start: 0,
            isDesc: !tempIsSortDesc,
            searching: searchedValue,
          })
        );
      } else {
        dispatch(
          getLabelProjectsRequestAction({
            sorting: value,
            count: projectRowsPerPage,
            start: 0,
            isDesc: !tempIsSortDesc,
            searching: searchedValue,
            isshared: isShared,
          })
        );
      }
    } else {
      setIsSortDesc(true);
      setProjectPage(0);
      setSortingValue(value);
      if (user.me.isAiTrainer && !isShared) {
        dispatch(
          getAiTrainerLabelprojectRequestAction({
            sorting: value,
            count: projectRowsPerPage,
            start: 0,
            isDesc: true,
            searching: searchedValue,
          })
        );
      } else {
        dispatch(
          getLabelProjectsRequestAction({
            sorting: value,
            count: projectRowsPerPage,
            start: 0,
            isDesc: true,
            searching: searchedValue,
            isshared: isShared,
          })
        );
      }
    }
    await setIsPagingChanged(true);
  };

  const handleProjectChangePage = (event, newPage) => {
    setIsLoading(true);
    setProjectPage(newPage);
    if (user.me?.isAiTrainer && !isShared) {
      dispatch(
        getAiTrainerLabelprojectRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: newPage,
          isDesc: isSortDesc,
          searching: searchedValue,
        })
      );
    } else {
      dispatch(
        getLabelProjectsRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: newPage,
          isDesc: isSortDesc,
          searching: searchedValue,
          isshared: isShared,
        })
      );
    }
  };

  const handleChangeProjectRowsPerPage = (event) => {
    setIsLoading(true);
    setProjectRowsPerPage(+event.target.value);
    setProjectPage(0);
    if (user.me?.isAiTrainer && !isShared) {
      dispatch(
        getAiTrainerLabelprojectRequestAction({
          sorting: sortingValue,
          count: event.target.value,
          start: 0,
          isDesc: isSortDesc,
          searching: searchedValue,
        })
      );
    } else {
      dispatch(
        getLabelProjectsRequestAction({
          sorting: sortingValue,
          count: event.target.value,
          start: 0,
          isDesc: isSortDesc,
          searching: searchedValue,
          isshared: isShared,
        })
      );
    }
  };

  const goProjectDetail = async (project) => {
    await history.push(`/admin/labelling/${project.id}`);
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
    setSearchedValue(null);
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

  const renderProjectTable = () => {
    return (
      <>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {/* {user.me && !user.me.isAiTrainer && !isShared && (
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
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{
                  color: currentThemeColor.textLightGrey,
                  width: "7.5%",
                }}
              >
                <b>No</b>
              </TableCell> */}
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "35%", cursor: "pointer" }}
                onClick={() => onSetSortValue("name")}
              >
                <div className={classes.tableHeader}>
                  {sortingValue === "name" &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Project name")}</b>
                </div>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "15%", cursor: "pointer" }}
                onClick={() => onSetSortValue("workapp")}
              >
                <div className={classes.tableHeader}>
                  {sortingValue === "workapp" &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Type")}</b>
                </div>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "20%", cursor: "pointer" }}
                onClick={() => onSetSortValue("created_at")}
              >
                <div className={classes.tableHeader}>
                  {sortingValue === "created_at" &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Date created")}</b>
                </div>
              </TableCell>
              <TableCell
                className={classes.tableHead}
                align="center"
                style={{ width: "20%", cursor: "pointer" }}
                onClick={() => onSetSortValue("updated_at")}
              >
                <div className={classes.tableHeader}>
                  {sortingValue === "updated_at" &&
                    (!isSortDesc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    ))}
                  <b>{t("Date updated")}</b>
                </div>
              </TableCell>
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
                {user.me && !user.me.isAiTrainer && !isShared && (
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
                  {idx + 1}
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  <div style={{ wordBreak: "break-all" }}>{project.name}</div>
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  <div style={{ wordBreak: "break-all" }}>
                    {project.workapp}
                  </div>
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  <div style={{ wordBreak: "break-all" }}>
                    {project.created_at.substring(0, 10)}
                  </div>
                </TableCell>
                <TableCell
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(project)}
                >
                  <div style={{ wordBreak: "break-all" }}>
                    {project.updated_at.substring(0, 10)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          onChangePage={handleProjectChangePage}
          onChangeRowsPerPage={handleChangeProjectRowsPerPage}
        />
      </>
    );
  };

  const onGetSearchedProject = () => {
    setProjectPage(0);
    if (user.me?.isAiTrainer && !isShared) {
      dispatch(
        getAiTrainerLabelprojectRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: 0,
          isDesc: isSortDesc,
          searching: searchedValue,
        })
      );
    } else {
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
    }
  };

  const onGetDefaultProject = () => {
    setSearchedValue(null);
    setProjectPage(0);
    if (user.me?.isAiTrainer && !isShared) {
      dispatch(
        getAiTrainerLabelprojectRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: 0,
          isDesc: isSortDesc,
        })
      );
    } else {
      dispatch(
        getLabelProjectsRequestAction({
          sorting: sortingValue,
          count: projectRowsPerPage,
          start: 0,
          isDesc: isSortDesc,
          isshared: isShared,
        })
      );
    }
  };

  const onStartLabelProject = () => {
    if (!user.me?.isAiTrainer && user.me.usageplan.planName !== "trial") {
      setIsProjectModalOpen(true);
    } else {
      setIsUpgradePlanModalOpen(true);
    }
  };

  return (
    <div>
      <div className={classes.leftCard}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            <span className={classes.subTitle}>{t("Project list")}</span>
            <NavLink to="/admin/newProject">
              <Button style={{ marginLeft: "20px" }}>+ 새 프로젝트</Button>
            </NavLink>
          </div>
          <div>
            <InputBase
              className={classes.input}
              value={projectNameValue}
              onChange={changeInputNameChangeValue}
              placeholder={t("")}
              id="projectNameInput"
            />
          </div>
        </div>
        {labelprojects.projects && labelprojects.projects.length > 0 ? (
          renderLabelProjects()
        ) : (
          <div> 프로젝트가 없습니다 </div>
        )}
      </div>
    </div>
  );
}
