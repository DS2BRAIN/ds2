import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import { putUserRequestActionWithoutMessage } from "redux/reducers/user";
import { askDeleteProjectsReqeustAction } from "redux/reducers/messages";
import { getProjectsRequestAction } from "redux/reducers/projects";
import currentTheme from "assets/jss/custom.js";
import { TRAINING_METHOD, PREFERRED_OPTION } from "variables/train";

import { Checkbox, LinearProgress, Modal, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Tooltip } from "@material-ui/core";
import { Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import ProjectIntro from "components/Guide/ProjectIntro";
import Samples from "components/Templates/Samples.js";
import ProjectListStepper from "components/Stepper/ProjectListStepper";
import SearchInputBox from "components/Table/SearchInputBox";
import Button from "components/CustomButtons/Button";

function getSteps() {
  return ["데이터 준비", "준비 완료", "인공지능 학습 중", "데이터 분석 / 예측"];
}

const AutoMLProject = ({ history, route }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects, messages } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
      messages: state.messages,
    }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [searchedProjectValue, setSearchedProjectValue] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [selectedPage, setSelectedPage] = useState("myproject");
  const [isShared, setIsShared] = useState(false);
  const steps = getSteps();
  const url = window.location.href;
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [isProjectRequested, setIsProjectRequested] = useState(false);
  const [isVerify, setIsVerify] = useState(false);

  useEffect(() => {
    const state = history.location.state;
    if (state && state.projectModalOpen) {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (route === "verifyproject") setIsVerify(true);
    else setIsVerify(false);
  }, [route]);

  useEffect(() => {
    if (user.me && !user.me.intro3Checked) {
      setIntroOn(true);
    } else {
      setIntroOn(false);
    }
  }, [user]);

  useEffect(() => {
    if (introOffClicked) {
      setIntroOn(false);
      user.me.intro3Checked = true;
      dispatch(
        putUserRequestActionWithoutMessage({
          intro3Checked: true,
        })
      );
    }
  }, [introOffClicked]);

  useEffect(() => {
    if (url && projects.projects) {
      (async () => {
        setProjectSettings();
        setIsLoading(false);
      })();
    }
  }, [projects.projects]);

  useEffect(() => {
    if (url) {
      (async () => {
        setIsLoading(true);
        setSearchedProjectValue("");
        setSortingValue("created_at");
        setIsSortDesc(true);
        const projectTab = url.split("?tab=")[1]; // tab이 바뀜에 따라 projectRequest 해주기
        if (projectTab) {
          setActiveStep(projectTab);
          setProjectPage(0);
          setIsProjectRequested(true);
        } else {
          setActiveStep("all");
          setIsProjectRequested(true);
        }
      })();
    }
  }, [url]);

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  useEffect(() => {
    setProjectPage(0);
    setIsProjectRequested(true);
  }, [searchedProjectValue]);

  useEffect(() => {
    if (isProjectRequested) {
      getProjectByDispatch();
      setIsProjectRequested(false);
    }
  }, [isProjectRequested]);

  const getProjectByDispatch = () => {
    let payloadJson = {
      sorting: sortingValue,
      count: projectRowsPerPage,
      page: projectPage,
      tab: activeStep,
      isDesc: isSortDesc,
      searching: searchedProjectValue,
    };
    if (isVerify) payloadJson["isVerify"] = true;
    dispatch(getProjectsRequestAction(payloadJson));
  };

  const setProjectSettings = () => {
    //프로젝트 체크박스 value 세팅
    setProjectCheckedValue({ all: false });
    for (let i = 0; i < projects.projects.length; i++) {
      const value = projects.projects[i].id;
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

  const deleteProject = async () => {
    const deleteProjectsArr = [];
    for (let project in projectCheckedValue) {
      if (project !== "all" && projectCheckedValue[project]) {
        deleteProjectsArr.push(project);
      }
    }
    let sortInfoJson = {
      sorting: sortingValue,
      count: projectRowsPerPage,
      page: projectPage,
      tab: activeStep,
      isDesc: isSortDesc,
    };
    if (isVerify) sortInfoJson["isVerify"] = true;
    dispatch(
      askDeleteProjectsReqeustAction({
        projects: deleteProjectsArr,
        sortInfo: sortInfoJson,
      })
    );
    setSearchedProjectValue("");
  };

  const handleProjectChangePage = (event, newPage) => {
    setProjectPage(newPage);
    setIsProjectRequested(true);
  };

  const handleChangeProjectRowsPerPage = (event) => {
    setProjectRowsPerPage(+event.target.value);
    setProjectPage(0);
    setIsProjectRequested(true);
  };

  const showMyProject = (projectArr) => {
    const tableHeads = [
      { value: "No", width: "5%", name: "" },
      { value: "프로젝트명", width: "30%", name: "projectName" },
      { value: "역할", width: "10%", name: "role" },
      { value: "옵션", width: "7.5%", name: "option" },
      { value: "학습방법", width: "17.5%", name: "trainingMethod" },
      { value: "생성일", width: "15%", name: "created_at" },
      { value: "진행상태", width: "15%", name: "status" },
    ];

    const tableBodys = ["id", "no", tableHeads[1].name, tableHeads[2].name, tableHeads[3].name, tableHeads[4].name, tableHeads[5].name, tableHeads[6].name];

    const projectTableHead = () => {
      const onSetProjectCheckedValueAll = () => {
        const result = projectCheckedValue["all"] ? false : true;
        const tmpObject = { all: result };
        for (let i = 0; i < projects.projects.length; i++) {
          const id = projects.projects[i].id;
          tmpObject[id] = result;
        }
        setProjectCheckedValue(tmpObject);
      };

      const onSetSortValue = async (value) => {
        if (value === sortingValue) {
          let tempIsSortDesc = isSortDesc;
          setSortingValue(value);
          setProjectPage(0);
          setIsSortDesc(!tempIsSortDesc);
          setIsProjectRequested(true);
        } else {
          setIsSortDesc(true);
          setSortingValue(value);
          setProjectPage(0);
          setIsProjectRequested(true);
        }
      };

      return (
        <TableRow>
          {!isShared && (
            <TableCell className={classes.tableHead} align="left" style={{ width: "5%" }}>
              <Checkbox value="all" checked={projectCheckedValue["all"]} onChange={onSetProjectCheckedValueAll} />
            </TableCell>
          )}
          {tableHeads.map((tableHead, idx) => (
            <TableCell
              id={tableHead.value + "mainHeader"}
              key={idx}
              className={classes.tableHead}
              align="center"
              width={tableHead.width}
              style={{
                cursor: tableHead.value !== "no" ? "pointer" : "default",
              }}
              onClick={() => tableHead.value !== "no" && onSetSortValue(tableHead.name)}
            >
              <div className={classes.tableHeader}>
                {sortingValue === tableHead.name && (!isSortDesc ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                <b>{t(tableHead.value)}</b>
              </div>
            </TableCell>
          ))}
        </TableRow>
      );
    };

    const projectTableBody = (prjArr) => {
      let datas = [];
      for (let i = 0; prjArr && i < prjArr.length; i++) {
        const prj = prjArr[i];

        let status = "";
        if (prj.status === 0) {
          status = "준비완료";
        } else if (prj.status === 100) {
          status = "학습완료";
        } else if (prj.status === 99 || prj.status === 9 || prj.status < 0) {
          status = "에러";
        } else {
          status = "학습 중";
        }

        const project = [prj.id, projects.totalLength - (projectRowsPerPage * projectPage + i), prj.projectName, prj.role, t(PREFERRED_OPTION[prj.option]), t(TRAINING_METHOD[prj.trainingMethod]), prj.created_at ? prj.created_at.substring(0, 10) : "", status];

        datas.push(project);
      }

      const onSetColor = (d) => {
        switch (d) {
          case "준비완료":
            return "#6B6B6B";
          case "학습 중":
            return "#1BC6B4";
          case "에러":
            return "#BD2020";
          case "학습완료":
            return "#0A84FF";
        }
      };

      const goProjectDetail = (id) => {
        if (route === "train") history.push(`/admin/train/${id}`);
        if (route === "verifyproject") history.push(`/admin/verifyproject/${id}`);
      };

      return datas.map((data, idx) => (
        <TableRow
          id={"tr_" + data[0]}
          key={idx}
          className={classes.tableRow}
          style={{
            background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
          }}
        >
          {!isShared && (
            <TableCell align="left" className={classes.tableRowCell}>
              <Checkbox value={data[0]} checked={projectCheckedValue[data[0]] ? true : false} onChange={() => onSetProjectCheckedValue(data[0])} className={classes.tableCheckBox} />
            </TableCell>
          )}
          {data.map((d, i) => {
            if (i > 0) {
              let statusColor = currentTheme.text1;
              let isStatus = false;
              if (tableBodys[i] === "status" && typeof d === "string") {
                statusColor = onSetColor(d);
                isStatus = true;
              }

              return (
                <TableCell key={`tableCell_${i}_${d}`} className={classes.tableRowCell} align="center" onClick={() => goProjectDetail(data[0])}>
                  <div
                    style={{
                      wordBreak: "break-all",
                      color: statusColor,
                    }}
                  >
                    <div
                      style={{
                        display: isStatus ? "inline" : "none",
                      }}
                    >
                      {isStatus ? "⦁" : ""}
                    </div>{" "}
                    {d || isStatus ? t(d) : "-"}
                  </div>
                </TableCell>
              );
            }
          })}
        </TableRow>
      ));
    };

    return (
      <div>
        {isLoading ? (
          <div className={classes.loading} style={{ marginTop: "-29px" }}>
            <CircularProgress />
          </div>
        ) : !projectArr || projectArr.length === 0 ? (
          <div className="emptyListTable">
            {searchedProjectValue
              ? user.language === "ko"
                ? `"${searchedProjectValue}" ` + "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
                : `There were no results found for "${searchedProjectValue}"`
              : t(`진행중인 ${isVerify ? "검증" : "학습"} 프로젝트가 없습니다. 새로운 프로젝트를 생성해주세요.`)}
          </div>
        ) : (
          <Table className={classes.table} aria-label="simple table">
            <TableHead>{projectTableHead()}</TableHead>
            <TableBody>{projectTableBody(projectArr)}</TableBody>
          </Table>
        )}
        <Grid container justifyContent="space-between" alignItems="center">
          <Button id="deleteProject" shape="redOutlined" size="sm" disabled={!Object.values(projectCheckedValue).includes(true)} onClick={deleteProject}>
            {t("Delete selection")}
          </Button>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={projects.totalLength ? projects.totalLength : 0}
            rowsPerPage={projectRowsPerPage}
            page={projectPage}
            backIconButtonProps={{
              "aria-label": "previous projectPage",
            }}
            nextIconButtonProps={{
              "aria-label": "next projectPage",
            }}
            onPageChange={handleProjectChangePage}
            onRowsPerPageChange={handleChangeProjectRowsPerPage}
          />
        </Grid>
      </div>
    );
  };

  const closeTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const partStartBtns = () => {
    const openStartProject = () => {
      history.push("/admin/dataconnector");
    };

    const openTemplate = () => {
      setIsTemplateModalOpen(true);
    };

    return (
      <Grid container alignItems="center" columnSpacing={1}>
        <Grid item>
          <Button id="startProjectBtn" shape="greenContained" onClick={openStartProject}>
            {t("New Project")}
          </Button>
        </Grid>
        {process.env.REACT_APP_ENTERPRISE !== "true" && (
          <Grid item>
            <Tooltip title={<span style={{ fontSize: "11px" }}>{t("For those who are new to Train, We have sample datasets for each industry to help you experience and learn more about our AI developing services")}</span>} placement="top">
              <div>
                <Button id="sampleDataBtn" shape="whiteOutlined" onClick={openTemplate}>
                  {t("Sample Data")}
                </Button>
              </div>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div>
      {introOn ? (
        <ProjectIntro
          setIntroOn={setIntroOn}
          setIntroOffClicked={setIntroOffClicked}
          useTranslation={useTranslation}
        />
      ) : (
        <>
          <ReactTitle title={"DS2.ai - " + t(isVerify ? "검증" : "학습")} />
          <Grid>
            <div className={classes.topTitle}>
              {t(`인공지능 ${isVerify ? "검증" : "개발"}하기`)}
            </div>
            <div className={classes.subTitleText}>
              {t(
                `새로운 프로젝트를 생성하여 AI모델을 통한 데이터 ${
                  isVerify ? "검증" : "예측"
                }을 할 수 있습니다.`
              )}
            </div>
          </Grid>
          <Grid sx={{ my: 8 }}>
            <ProjectListStepper
              history={history}
              step={activeStep}
              page={route}
            />
          </Grid>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid item>{partStartBtns()}</Grid>
            <Grid item>
              <SearchInputBox
                tooltipText="프로젝트명을 입력해주세요."
                setSearchedValue={setSearchedProjectValue}
              />
            </Grid>
          </Grid>
          <Grid>{showMyProject(projects.projects)}</Grid>
        </>
      )}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isTemplateModalOpen}
        onClose={closeTemplateModal}
        className={classes.modalContainer}
      >
        <Samples
          className={classes.predictModalContent}
          closeTemplateModal={closeTemplateModal}
          history={history}
        />
      </Modal>
    </div>
  );
};

export default React.memo(AutoMLProject);
