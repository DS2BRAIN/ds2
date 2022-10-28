import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

import { putUserRequestActionWithoutMessage } from "redux/reducers/user";
import { askDeleteProjectsReqeustAction } from "redux/reducers/messages";
import { getProjectsRequestAction } from "redux/reducers/projects";
import currentTheme from "assets/jss/custom.js";
import { TRAINING_METHOD, PREFERRED_OPTION } from "variables/train";
import { listPagination } from "components/Function/globalFunc";
import ProjectIntro from "components/Guide/ProjectIntro";
import Samples from "components/Templates/Samples.js";
import ProjectListStepper from "components/Stepper/ProjectListStepper";
import SearchInputBox from "components/Table/SearchInputBox";
import Button from "components/CustomButtons/Button";

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
import { Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

const AutoMLProject = ({ history, route }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects } = useSelector(
    (state) => ({
      user: state.user,
      projects: state.projects,
    }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [introOn, setIntroOn] = useState(false);
  const [introOffClicked, setIntroOffClicked] = useState(false);
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isVerify, setIsVerify] = useState(false);

  const [activeStep, setActiveStep] = useState("all");
  const [projectPage, setProjectPage] = useState(0);
  const [projectRowsPerPage, setProjectRowsPerPage] = useState(10);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [isSortDesc, setIsSortDesc] = useState(true);
  const [searchedProjectValue, setSearchedProjectValue] = useState("");
  const [isShared, setIsShared] = useState(false);

  const [projectCheckedValue, setProjectCheckedValue] = useState({
    all: false,
  });
  const [isProjectRequested, setIsProjectRequested] = useState(false);

  const url = window.location.href;
  const urlLoc = window.location;
  const urlPath = urlLoc.pathname;
  const urlSearch = urlLoc.search;
  const urlSearchParams = new URLSearchParams(urlSearch);

  useEffect(() => {
    if (route === "verifyproject") setIsVerify(true);
    else setIsVerify(false);
  }, [route]);

  useEffect(() => {
    if (!urlPath.includes("/train") && route !== "verifyproject")
      history.push("/admin/train");
  });

  useEffect(() => {
    if (user.me && !user.me.intro3Checked) {
      setIntroOn(true);
    } else {
      setIntroOn(false);
    }
  }, [user]);

  useEffect(() => {
    const pagiInfoDict = listPagination(urlLoc);
    setActiveStep(pagiInfoDict.tab);
    setProjectPage(pagiInfoDict.page);
    setProjectRowsPerPage(pagiInfoDict.rows);
    setSortingValue(pagiInfoDict.sorting);
    setIsSortDesc(pagiInfoDict.desc);
    setSearchedProjectValue(pagiInfoDict.search);

    setIsProjectRequested(true);
  }, [urlSearch]);

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
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  useEffect(() => {
    let urlSP = urlSearchParams;
    let searchVal = searchedProjectValue;
    if (searchVal) {
      if (urlSP.has("page")) urlSP.delete("page");
      urlSP.set("search", searchVal);
    }
    handleSearchParams(urlSP);
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

  const handleSearchParams = (searchPar) => {
    history.push(urlPath + "?" + searchPar);
  };

  const setProjectSettings = () => {
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
  };

  const handleProjectChangePage = (event, newPage) => {
    urlSearchParams.set("page", newPage + 1);
    handleSearchParams(urlSearchParams);
  };

  const handleChangeProjectRowsPerPage = (event) => {
    urlSearchParams.delete("page");
    urlSearchParams.set("rows", event.target.value);
    handleSearchParams(urlSearchParams);
  };

  const showMyProject = (projectArr) => {
    const tableHeads = [
      // { label: "No.", width: "5%", name: "" },
      { label: "Project name", width: "30%", type: "projectName" },
      { label: "Role", width: "10%", type: "role" },
      { label: "Option", width: "7.5%", type: "option" },
      { label: "Training method", width: "17.5%", type: "trainingMethod" },
      { label: "Date created", width: "15%", type: "created_at" },
      { label: "Training status", width: "15%", type: "status" },
    ];

    const tableBodys = [
      "id",
      "no",
      tableHeads[1].type,
      tableHeads[2].type,
      tableHeads[3].type,
      tableHeads[4].type,
      tableHeads[5].type,
      // tableHeads[6].type,
    ];

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
        let urlSP = urlSearchParams;
        if (value === sortingValue) {
          urlSP.set("desc", !isSortDesc);
        } else {
          urlSP.set("sorting", value);
          urlSP.delete("desc");
        }
        if (urlSP.has("page")) urlSP.delete("page");
        handleSearchParams(urlSP);
      };

      return (
        <TableRow>
          {!isShared && (
            <TableCell
              className={classes.tableHead}
              align="left"
              style={{ width: "5%" }}
            >
              <Checkbox
                value="all"
                checked={projectCheckedValue["all"]}
                onChange={onSetProjectCheckedValueAll}
              />
            </TableCell>
          )}
          {tableHeads.map((tableHead, idx) => (
            <TableCell
              id={tableHead.label + "mainHeader"}
              key={`tableHead_${idx}`}
              className={classes.tableHead}
              align="center"
              width={tableHead.width}
              style={{
                cursor: !(
                  tableHead.label === "No." || tableHead.label === "Role"
                )
                  ? "pointer"
                  : "default",
              }}
              onClick={() =>
                !(tableHead.label === "No." || tableHead.label === "Role") &&
                onSetSortValue(tableHead.type)
              }
            >
              <div className={classes.tableHeader}>
                {sortingValue === tableHead.type &&
                  (!isSortDesc ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  ))}
                <b>{t(tableHead.label)}</b>
              </div>
            </TableCell>
          ))}
        </TableRow>
      );
    };

    const projectTableBody = (prjArr) => {
      const goProjectDetail = (id) => {
        if (route === "train") history.push(`/admin/train/${id}`);
        if (route === "verifyproject")
          history.push(`/admin/verifyproject/${id}`);
      };

      const onRenderContents = (type, value) => {
        let cont = value;

        const onSetStatusDisplay = (stat) => {
          let statText = "";
          let statColor = "";
          if (stat === 0) {
            statText = "Ready";
            statColor = "#6B6B6B";
          } else if (stat === 100) {
            statText = "Completed";
            statColor = "#0A84FF";
          } else if (stat === 99 || stat === 9 || stat < 0) {
            statText = "Error";
            statColor = "#BD2020";
          } else {
            statText = "In progress";
            statColor = "#1BC6B4";
          }
          return [statText, statColor];
        };

        if (type === "option") cont = t(PREFERRED_OPTION[cont]);
        else if (type === "trainingMethod") cont = t(TRAINING_METHOD[cont]);
        else if (type === "created_at")
          cont = cont ? cont.substring(0, 10) : "";
        else if (type === "status") {
          let [text, color] = onSetStatusDisplay(cont);
          cont = <span style={{ color: color }}>{`⦁ ${text}`}</span>;
        }

        if (!cont) cont = "-";

        return cont;
      };

      return prjArr.map((prj, idx) => {
        let projectId = prj.id;
        return (
          <TableRow
            id={`tableRow_${idx}_${projectId}`}
            key={idx}
            className={classes.tableRow}
          >
            {!isShared && (
              <TableCell align="left" className={classes.tableRowCell}>
                <Checkbox
                  value={projectId}
                  checked={projectCheckedValue[projectId] ? true : false}
                  onChange={() => onSetProjectCheckedValue(projectId)}
                  className={classes.tableCheckBox}
                />
              </TableCell>
            )}
            {tableHeads.map((head) => {
              let hType = head.type;
              let content = onRenderContents(hType, prj[hType]);

              return (
                <TableCell
                  key={`tableCell_${projectId}_${hType}`}
                  className={classes.tableRowCell}
                  align="center"
                  onClick={() => goProjectDetail(projectId)}
                >
                  {content}
                </TableCell>
              );
            })}
          </TableRow>
        );
      });
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
                ? `"${searchedProjectValue}" ` +
                  "에 대한 검색 결과가 없습니다. 다시 검색해주세요."
                : `There were no results found for "${searchedProjectValue}"`
              : t(
                  `There is no ${
                    isVerify ? "verification" : "train"
                  } project in process. Please create a new project`
                )}
          </div>
        ) : (
          <Table className={classes.table} aria-label="simple table">
            <TableHead>{projectTableHead()}</TableHead>
            <TableBody>{projectTableBody(projectArr)}</TableBody>
          </Table>
        )}
        <Grid container justifyContent="space-between" alignItems="center">
          <Button
            id="deleteProject"
            shape="redOutlined"
            size="sm"
            disabled={!Object.values(projectCheckedValue).includes(true)}
            onClick={deleteProject}
          >
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
          <Button
            id="startProjectBtn"
            shape="greenContained"
            onClick={openStartProject}
          >
            {t("New Project")}
          </Button>
        </Grid>
        {process.env.REACT_APP_ENTERPRISE !== "true" && (
          <Grid item>
            <Tooltip
              title={
                <span style={{ fontSize: "11px" }}>
                  {t(
                    "For those who are new to Train, We have sample datasets for each industry to help you experience and learn more about our AI developing services"
                  )}
                </span>
              }
              placement="top"
            >
              <div>
                <Button
                  id="sampleDataBtn"
                  shape="whiteOutlined"
                  onClick={openTemplate}
                >
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
          <ReactTitle title={"DS2.ai - " + t(isVerify ? "Verify" : "Train")} />
          <Grid>
            <div className={classes.topTitle}>
              {t(`AI ${isVerify ? "verification" : "development"}`)}
            </div>
            <div className={classes.subTitleText}>
              {t(
                `Create new projects and ${
                  isVerify ? "verify" : "develop"
                } your own AI models. Analyze your data and make ${
                  isVerify ? "verifications" : "predictions"
                }.`
              )}
            </div>
          </Grid>
          <Grid sx={{ my: 8 }}>
            <ProjectListStepper step={activeStep} page={route} />
          </Grid>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid item>{partStartBtns()}</Grid>
            <Grid item>
              <SearchInputBox />
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
