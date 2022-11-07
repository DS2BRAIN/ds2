import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import { setIsProjectRefreshed } from "redux/reducers/labelprojects";
import * as labelApi from "controller/labelApi.js";
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { Grid, CircularProgress } from "@mui/material";

const LabelMember = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { labelprojects } = useSelector(
    (state) => ({
      labelprojects: state.labelprojects,
    }),
    []
  );
  const { t } = useTranslation();

  const ROLE = [
    // { value: "Admin", name: "관리자" },
    // { value: "Contributor", name: "관리자" },
    { value: "member", name: "멤버" },
  ];
  const TABLE_HEADS = [
    { value: "No.", width: "10%" },
    { value: "Group Name", width: "25%" },
    { value: "Email", width: "30%" },
    { value: "Role", width: "20%" },
    {
      value: !labelprojects.projectDetail?.isShared ? "Delete" : "",
      width: "10%",
    },
  ];
  const TABLE_BODYS = ["groupname", "useremail", "role"];

  const [isLoading, setIsLoading] = useState(false);
  const [parentsGroup, setParentsGroup] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [teams, setTeams] = useState([]);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalLength, setTotalLength] = useState(0);

  const handleChangeTarget = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleChangeRole = (e) => {
    setSelectedRole(e.target.value);
  };

  const postUpdateShareGroup = () => {
    if (!selectedTeamId) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please select a group to share"))
      );
      return;
    }
    if (!selectedRole) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Please select a group role to share.")
        )
      );
      return;
    }
    const data = {
      projectId: labelprojects.projectDetail.id,
      isUpdate: true,
      groupId: [selectedTeamId],
    };

    labelApi
      .updateShareGroup(data)
      .then((res) => {
        setSelectedTeamId(null);
        setShouldUpdate(true);
      })
      .catch((e) => {
        console.log(e, "e");
      });
  };

  const deleteTeamMember = (id) => {
    const data = {
      projectId: labelprojects.projectDetail.id,
      isUpdate: false,
      groupId: [id],
    };

    labelApi
      .updateShareGroup(data)
      .then((res) => {
        setShouldUpdate(true);
      })
      .catch((e) => {
        console.log(e, "e");
      });
    return;
  };

  const renderUpdateShareGroup = () => {
    let teamIdArray = [];
    teams.map((team) => {
      teamIdArray = [...teamIdArray, team.groupInfo.id];
    });
    return (
      <>
        <GridContainer>
          <GridItem
            xs={12}
            lg={12}
            style={{ display: "flex", alignItems: "center" }}
          >
            <select
              id="group_select_box"
              name="selectedTeamName"
              onChange={handleChangeTarget}
              label="selectedTeam"
              className={classes.select}
              style={{ width: "60%" }}
            >
              <option value="" selected className={classes.option}>
                {t("Group")}
              </option>
              {parentsGroup.map((parents) => {
                return (
                  <>
                    {teamIdArray.indexOf(parents.id) === -1 && (
                      <option value={parents.id} className={classes.option}>
                        {parents.groupname}
                      </option>
                    )}
                  </>
                );
              })}
            </select>
            <select
              name="selectedRole"
              onChange={handleChangeRole}
              label="selectedRole"
              className={classes.select}
              style={{ width: "28%" }}
            >
              <option value="" selected className={classes.option}>
                {t("Role")}
              </option>
              {ROLE.map((role) => {
                return (
                  <option value={role.value} className={classes.option}>
                    {role.value}
                  </option>
                );
              })}
            </select>
            <Button
              aria-controls="customized-menu"
              aria-haspopup="true"
              id="share_member_btn"
              shape="greenOutlined"
              onClick={postUpdateShareGroup}
            >
              {t("Share")}
            </Button>
          </GridItem>
        </GridContainer>
      </>
    );
  };

  const renderSharedMember = () => {
    return (
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            {TABLE_HEADS.map((tableHead, idx) => {
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
          {teams.length == 0 ? (
            <TableRow style={{ height: 360 }}>
              <TableCell
                className={classes.tableRowCell}
                align="center"
                colSpan={5}
                style={{ cursor: "default", fontSize: 16 }}
              >
                {t("No groups or members have shared the project.")}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {teams.map((team, idx) => (
                <TableRow key={team.groupInfo.id} className={classes.tableRow}>
                  <TableCell
                    key={team.groupInfo.id}
                    className={classes.tableRowCell}
                    align="center"
                  >
                    <div className={classes.wordBreakDiv}>
                      {totalLength - (idx + 5 * (historyPage - 1))}
                    </div>
                  </TableCell>
                  {TABLE_BODYS.map((tableBody, idx) => {
                    return (
                      <TableCell
                        key={team.groupInfo.id}
                        className={classes.tableRowCell}
                        align="center"
                      >
                        <div className={classes.wordBreakDiv}>
                          {tableBody === "useremail" || tableBody === "role" ? (
                            <>
                              {team.member.map((member) => {
                                if (member.acceptcode !== 2) {
                                  return (
                                    <div>
                                      {member[tableBody]}
                                      {tableBody === "useremail" &&
                                        member.acceptcode == 0 &&
                                        " (요청중)"}
                                    </div>
                                  );
                                }
                              })}
                            </>
                          ) : (
                            <>{team.groupInfo[tableBody]}</>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    key={idx}
                    className={classes.tableRowCell}
                    align="center"
                  >
                    {!labelprojects.projectDetail?.isShared && (
                      <div className={classes.wordBreakDiv}>
                        <Button
                          aria-controls="customized-menu"
                          aria-haspopup="true"
                          id="delete_member_btn"
                          shape="greenOutlined"
                          size="sm"
                          onClick={() => deleteTeamMember(team.groupInfo.id)}
                        >
                          {t("Delete")}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    );
  };

  const getGroups = () => {
    setIsLoading(true);

    api
      .getGroups()
      .then((res) => {
        setParentsGroup(res.data.parentsGroup);
      })
      .catch((e) => {
        console.log(e, "e");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getGroupsByLabelProject = () => {
    setIsLoading(true);

    api
      .getGroupsByLabelProject(labelprojects.projectDetail.id)
      .then((res) => {
        setTeams(res.data);
        setTotalLength(res.data.length);
        setShouldUpdate(false);
      })
      .catch((e) => {
        console.log(e, "e");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getGroupsByLabelProject();
    getGroups();
  }, []);

  useEffect(() => {
    if (shouldUpdate) getGroupsByLabelProject();
  }, [shouldUpdate]);

  useEffect(() => {
    if (labelprojects.isProjectRefreshed) {
      getGroups();
      getGroupsByLabelProject();

      dispatch(setIsProjectRefreshed(false));
    }
  }, [labelprojects.isProjectRefreshed]);

  return (
    <>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {!labelprojects.projectDetail?.isShared && (
            <div>{renderUpdateShareGroup()}</div>
          )}
          <div style={{ margin: "30px 0" }}>{renderSharedMember()}</div>
        </>
      )}
    </>
  );
};

export default React.memo(LabelMember);
