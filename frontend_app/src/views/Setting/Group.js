import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  getGroupsRequestAction,
  postGroupRequestAction,
  postMemberRequestAction,
  putGroupRequestAction,
} from "redux/reducers/groups.js";
import {
  askModalRequestAction,
  askAcceptGroupRequestAction,
  askRefuseGroupRequestAction,
  askDeleteMemberFromGroup,
  askDeleteGroupRequestAction,
  askLeaveGroupRequestAction,
} from "redux/reducers/messages.js";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { checkIsValidKey } from "components/Function/globalFunc";
import LicenseRegisterModal from "components/Modal/LicenseRegisterModal";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";

import {
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import {
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputBase,
  Popover,
  Tooltip,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CreateIcon from "@mui/icons-material/Create";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import CloseIcon from "@material-ui/icons/Close";

const Group = () => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, groups, messages } = useSelector(
    (state) => ({
      user: state.user,
      groups: state.groups,
      messages: state.messages,
    }),
    []
  );
  const [isGroupAddModalOpen, setIsGroupAddModalOpen] = useState(false);
  const [isMemberAddModalOpen, setIsMemberAddModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [userEmailForAdd, setUserEmailForAdd] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [groupNameForChange, setGroupNameForChange] = useState("");
  const [anchorElForGroupName, setAnchorElForGroupName] = useState(null);

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(getGroupsRequestAction());
  }, []);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setGroupName("");
      setIsMemberAddModalOpen(false);
      setIsGroupAddModalOpen(false);
    }
  }, [messages.shouldCloseModal]);

  const onAddGroup = () => {
    setIsGroupAddModalOpen(true);
  };

  const closeModalOpen = () => {
    dispatch(askModalRequestAction());
  };

  const onChangeGroupName = (e) => {
    e.preventDefault();
    setGroupName(e.target.value);
  };

  const onChangeMemberEmail = (e) => {
    e.preventDefault();
    setUserEmailForAdd(e.target.value);
  };

  const handleClickForChangeGroupName = (event, groupId) => {
    setSelectedGroupId(groupId);
    setAnchorElForGroupName(event.currentTarget);
  };

  const handleClickForAddMember = (event, groupId) => {
    if (user.isValidUser === false) return;

    setSelectedGroupId(groupId);
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (user.isValidUser === false) onCloseAddMemberMenu();
  }, [user.isValidUser]);

  const onCloseAddMemberMenu = () => {
    setAnchorEl(null);
  };

  const onAddGroupMemberAction = () => {
    setAnchorEl(null);
    dispatch(
      postMemberRequestAction({
        memberEmail: userEmailForAdd,
        groupId: selectedGroupId,
        lang: user.language ? user.language : "ko",
      })
    );
    setUserEmailForAdd("");
  };

  const onCloseGroupNameMenu = () => {
    setAnchorElForGroupName(null);
  };

  const onChangeNextGroupName = (e) => {
    e.preventDefault();
    setGroupNameForChange(e.target.value);
  };

  const onChangeGroupAction = () => {
    setAnchorElForGroupName(null);
    dispatch(
      putGroupRequestAction({
        groupName: groupNameForChange,
        groupId: selectedGroupId,
      })
    );
    setGroupNameForChange("");
  };

  const renderGroupList = () => {
    let grouoplistNum = 0;
    return (
      <TableBody id="groupTableBody">
        {groups.parentsGroup &&
          groups.parentsGroup.map((group, idx) => {
            const groupId = group.id;
            let groupHostNum = 0;
            grouoplistNum++;

            return (
              <TableRow
                key={`tableBodyRow_${idx}`}
                className={classes.tableRow}
              >
                <TableCell className={classes.tableRowCell} align="center">
                  {grouoplistNum}
                </TableCell>
                <TableCell className={classes.tableRowCell} align="left">
                  <div
                    className={classes.mapContent}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Grid sx={{ width: "90%" }}>
                      <span style={{ wordBreak: "break-all" }}>
                        {group.groupname}
                      </span>
                    </Grid>
                    <Grid sx={{ width: "10%" }}>
                      <Tooltip title={t("Change name")}>
                        <IconButton
                          id="change_group_name_btn"
                          onClick={(e) => {
                            handleClickForChangeGroupName(e, groupId);
                          }}
                        >
                          <CreateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>

                    <Popover
                      id="change_group_name_popover"
                      open={Boolean(anchorElForGroupName)}
                      anchorEl={anchorElForGroupName}
                      onClose={onCloseGroupNameMenu}
                      anchorOrigin={{
                        vertical: "center",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "center",
                        horizontal: "left",
                      }}
                    >
                      <GridContainer
                        justifyContent="center"
                        alignItems="center"
                        style={{
                          width: "480px",
                          padding: "16px",
                          backgroundColor: `${currentThemeColor.background2}`,
                        }}
                      >
                        <GridItem xs={9}>
                          <TextField
                            id="change_group_name_input"
                            placeholder={t(
                              "Please enter the group name to change."
                            )}
                            onChange={onChangeNextGroupName}
                            value={groupNameForChange}
                            className={classes.textField}
                            style={{ paddingLeft: "0", margin: "4px" }}
                          />
                        </GridItem>
                        <GridItem
                          xs={3}
                          style={{ height: "50px", lineHeight: "50px" }}
                        >
                          <Button
                            id="submit_group_name_btn"
                            shape="greenOutlined"
                            size="sm"
                            onClick={onChangeGroupAction}
                          >
                            {t("Submit")}
                          </Button>
                        </GridItem>
                      </GridContainer>
                    </Popover>
                  </div>
                </TableCell>
                <TableCell className={classes.tableRowCell} align="center">
                  {user.me?.email ? user.me.email : "-"}
                </TableCell>
                <TableCell className={classes.tableRowCell} align="center">
                  {group.member && group.member.length > 1
                    ? group.member.map((member, idx) => {
                        if (member.acceptcode === 2) return;
                        if (member.role === "admin") return;
                        return (
                          <div
                            key={`member_${idx}`}
                            className={classes.mapContent}
                          >
                            <div>
                              {member.useremail}
                              {member.acceptcode === 0 && t("(Requesting)")}
                            </div>
                            <CancelIcon
                              className={`${classes.communityIcon} deleteMemberIcon`}
                              fontSize="small"
                              onClick={() => {
                                dispatch(
                                  askDeleteMemberFromGroup({
                                    banUserId: member.user,
                                    groupId: groupId,
                                  })
                                );
                              }}
                            />
                          </div>
                        );
                      })
                    : "-"}
                </TableCell>
                <TableCell align="center" className={classes.tableRowCell}>
                  <IconButton
                    id="add_member_to_group_btn"
                    onClick={(e) => {
                      checkIsValidKey(user, dispatch, t);
                      handleClickForAddMember(e, groupId);
                    }}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                  <Popover
                    id="add_member_to_group_modal"
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={onCloseAddMemberMenu}
                    anchorOrigin={{
                      vertical: "center",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "center",
                      horizontal: "center",
                    }}
                  >
                    <GridContainer
                      justifyContent="center"
                      alignItems="center"
                      style={{
                        width: "480px",
                        padding: "16px 0",
                        backgroundColor: `${currentThemeColor.background2}`,
                        border: "2px solid var(--surface2)",
                      }}
                    >
                      <GridItem xs={9}>
                        <TextField
                          id="member_email_input"
                          placeholder={t(
                            "Please enter e-mail address correctly."
                          )}
                          onChange={onChangeMemberEmail}
                          value={userEmailForAdd}
                          className={classes.textField}
                          style={{ paddingLeft: "0", margin: "4px" }}
                        />
                      </GridItem>
                      <GridItem
                        xs={3}
                        style={{ height: "50px", lineHeight: "50px" }}
                      >
                        <Button
                          id="submit_btn"
                          shape="greenOutlined"
                          size="sm"
                          disabled={userEmailForAdd === "" ? true : false}
                          onClick={onAddGroupMemberAction}
                        >
                          {t("Add")}
                        </Button>
                      </GridItem>
                    </GridContainer>
                  </Popover>
                </TableCell>
                <TableCell align="center" className={classes.tableRowCell}>
                  <Button
                    id="delete_group_btn"
                    shape="whiteOutlined"
                    size="sm"
                    onClick={() => {
                      dispatch(askDeleteGroupRequestAction(groupId));
                    }}
                    startIcon={<CloseIcon />}
                  >
                    {t("Delete")}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        {groups.childrenGroup &&
          groups.childrenGroup.map((group, idx) => {
            if (group.acceptcode === 1) {
              grouoplistNum++;
              return (
                <TableRow className={classes.tableRow}>
                  <TableCell className={classes.tableRowCell} align="center">
                    {groups.parentsGroup.length + idx + 1}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="left">
                    {group.groupname}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    {group.hostuserList && (
                      <div>{group.hostuserList.useremail}</div>
                    )}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="left">
                    {group.member &&
                      group.member.map((member, idx) => {
                        if (member.role === "admin") return;
                        return <div>{member.useremail}</div>;
                      })}
                  </TableCell>
                  <TableCell className={classes.tableRowCell}></TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <Button
                      id="withdraw_group_btn"
                      shape="greenOutlined"
                      size="sm"
                      onClick={() => {
                        dispatch(askLeaveGroupRequestAction(group.id));
                      }}
                    >
                      {t("Leave Group")}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }
          })}
        {grouoplistNum === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              align="center"
              className={classes.tableRowCell}
              id="lastTableCell"
            >
              {t("No Groups")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    );
  };

  const renderInviteLists = () => {
    let invitelistNum = 0;
    return (
      <TableBody id="groupTableBody">
        {groups.childrenGroup &&
          groups.childrenGroup.map((group, idx) => {
            if (group.acceptcode === 0) {
              invitelistNum++;
              return (
                <TableRow className={classes.tableRow}>
                  <TableCell className={classes.tableRowCell} align="center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    {group.groupname}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    {group.hostuserList && (
                      <div>{group.hostuserList.useremail}</div>
                    )}
                  </TableCell>
                  <TableCell className={classes.tableRowCell} align="center">
                    <div style={{ display: "flex" }}>
                      <Button
                        id="accept_invitation_btn"
                        shape="greenOutlined"
                        size="sm"
                        style={{ marginRight: "10px" }}
                        onClick={() => {
                          dispatch(
                            askAcceptGroupRequestAction({
                              groupId: group.id,
                              accept: true,
                            })
                          );
                        }}
                      >
                        {t("Accept")}
                      </Button>
                      <Button
                        id="decline_invitation_btn"
                        shape="whiteOutlined"
                        size="sm"
                        onClick={() => {
                          dispatch(
                            askRefuseGroupRequestAction({
                              groupId: group.id,
                              accept: false,
                            })
                          );
                        }}
                      >
                        {t("Decline")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }
          })}
        {invitelistNum === 0 && (
          <TableRow className={classes.tableRow}>
            <TableCell
              id="lastTableCell"
              className={classes.tableRowCell}
              colSpan={5}
              align="center"
              height={80}
            >
              {t("No invitations")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    );
  };
  return groups.isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <Container
      component="main"
      maxWidth="false"
      disableGutters
      className={classes.mainCard}
    >
      <div
        className={classes.settingTitle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>{t("Groups")}</div>
        <Button id="add_group_btn" shape="greenOutlined" onClick={onAddGroup}>
          {t("Add Group")}
        </Button>
      </div>
      <div>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "5%" }}
                align="center"
              >
                <b>No</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "20%" }}
                align="center"
              >
                <b>{t("Group Name")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "25%" }}
                align="center"
              >
                <b>{t("Group Leader")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "25%" }}
                align="center"
              >
                <b>{t("Members")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "10%" }}
                align="center"
              >
                <b>{t("Add members")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "15%" }}
                align="center"
              >
                {t("Delete Group")}
              </TableCell>
            </TableRow>
          </TableHead>
          {renderGroupList()}
        </Table>
      </div>
      <div className={classes.settingTitle}></div>
      {/*
        <div className={classes.settingTitle} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginTop: '60px'}}>
            <div>{t('')}</div>
        </div>
        <div>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow className={classes.tableRow} >
                        <TableCell className={classes.tableRowCell} style={{width: "5%"}} align="center"><b>No</b></TableCell>
                        <TableCell className={classes.tableRowCell} style={{width: "25%"}} align="center"><b>{t('Project name')}</b></TableCell>
                        <TableCell className={classes.tableRowCell} style={{width: "25%"}} align="center"><b>{t('')}</b></TableCell>
                        <TableCell className={classes.tableRowCell} style={{width: "25%"}} align="center"><b>{t('')}</b></TableCell>
                        <TableCell className={classes.tableRowCell} style={{width: "20%"}} align="center"></TableCell>
                    </TableRow>
                </TableHead>
                {renderLabelTrainingGroup()}
            </Table>
        </div>
        <div className={classes.settingTitle} >
        </div> */}

      <div className={classes.settingTitle} style={{ marginTop: "60px" }}>
        {t("")}
      </div>
      <div>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "10%" }}
                align="center"
              >
                <b>No</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "30%" }}
                align="center"
              >
                <b>{t("Group Name")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "30%" }}
                align="center"
              >
                <b>{t("Group Leader")}</b>
              </TableCell>
              <TableCell
                className={classes.tableRowCell}
                style={{ width: "30%" }}
                align="center"
              >
                <b>{t("Actions")}</b>
              </TableCell>
            </TableRow>
          </TableHead>
          {renderInviteLists()}
        </Table>
      </div>
      <div className={classes.settingTitle}></div>
      <Modal
        id="add_group_modal"
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isGroupAddModalOpen}
        onClose={closeModalOpen}
        className={classes.modalContainer}
      >
        <div className={classes.modalContent}>
          <GridContainer>
            <GridItem xs={12}>
              <div className={classes.title}>{t("Add Group")}</div>
            </GridItem>
            {groups.isLoading ? (
              <div className={classes.loadingModal}>
                <CircularProgress size={20} style={{ mb: 2 }} />
                <p>{t("Adding group. Please wait.")}</p>
              </div>
            ) : (
              <>
                <GridItem
                  xs={12}
                  style={{ padding: "0 30px !important", marginTop: "20px" }}
                >
                  <GridContainer style={{ alignItems: "center" }}>
                    <GridItem xs={2} style={{ padding: 0 }}>
                      <span style={{ fontWeight: 500 }}>{t("Group Name")}</span>
                    </GridItem>
                    <GridItem xs={10} style={{ padding: 0 }}>
                      <TextField
                        id="add_group_input"
                        placeholder={t("Please enter the group name.") + "*"}
                        onChange={onChangeGroupName}
                        value={groupName}
                        className={classes.textField}
                        margin="normal"
                      />
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "20px",
                    }}
                  >
                    <Button
                      id="close_addgroupmodal_btn"
                      shape="whiteOutlined"
                      style={{ marginRight: "10px" }}
                      onClick={closeModalOpen}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      id="submit_addgroupmodal_btn"
                      shape="greenOutlined"
                      disabled={groupName === "" ? true : false}
                      onClick={() => {
                        dispatch(postGroupRequestAction(groupName));
                      }}
                    >
                      {t("Next")}
                    </Button>
                  </div>
                </GridItem>
              </>
            )}
          </GridContainer>
        </div>
      </Modal>

      <LicenseRegisterModal />
    </Container>
  );
};

export default React.memo(Group);
