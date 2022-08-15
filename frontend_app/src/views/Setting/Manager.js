import React, { useState, useEffect } from "react";

import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
  askModalRequestAction,
} from "redux/reducers/messages.js";
import { checkIsValidKey } from "components/Function/globalFunc";
import Button from "components/CustomButtons/Button";

import {
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Modal,
  InputBase,
} from "@mui/material";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import CachedIcon from "@material-ui/icons/Cached";
import LiscenseRegisterModal from "components/Modal/LiscenseRegisterModal";

const Manager = ({ history }) => {
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userAdd, setUserAdd] = useState("");
  const [emailAdd, setEmailAdd] = useState("");
  const [passwordAdd, setPasswordAdd] = useState("");
  const [passwordVerifyAdd, setPasswordVerifyAdd] = useState("");
  const [passwordChange, setPasswordChange] = useState("");
  const [passwordVerifyChange, setPasswordVerifyChange] = useState("");
  const [isDesc, setIsDesc] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUserNum, setTotalUserNum] = useState(0);
  const [sortingValue, setSortingValue] = useState("created_at");
  const [searchingValue, setSearchingValue] = useState("");
  const [searchValueToPost, setSearchValueToPost] = useState("");
  const [isSelectedUserModalOpen, setIsSelectedUserModalOpen] = useState(false);
  const [isSelectedUserDelete, setIsSelectedUserDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [sendKeyLoading, setSendKeyLoading] = useState(false);
  const [isKeyError, setIsKeyError] = useState(false);
  const [keyInfo, setKeyInfo] = useState(null);
  const [keyValue, setKeyValue] = useState(null);

  const tableHeads = [
    { name: "No", value: "No", width: "5%", align: "center", sorting: false },
    {
      name: "유저명",
      value: "name",
      width: "25%",
      align: "left",
      sorting: true,
    },
    {
      name: "이메일",
      value: "email",
      width: "40%",
      align: "left",
      sorting: true,
    },
    {
      name: "비밀번호 재설정",
      value: "changePasswordBtn",
      width: "15%",
      align: "center",
      sorting: false,
    },
    {
      name: "유저 삭제",
      value: "deleteBtn",
      width: "15%",
      align: "center",
      sorting: false,
    },
  ];

  let addUserInfo = [
    {
      id: "addUserNameInput",
      value: userAdd,
      type: "text",
      autoComplete: "name",
      func: setUserAdd,
      label: "추가할 유저명을 입력해주세요.",
    },
    {
      id: "addUserEmailInput",
      value: emailAdd,
      type: "text",
      autoComplete: "email",
      func: setEmailAdd,
      label: "추가할 유저 이메일을 입력해주세요.",
    },
    {
      id: "addUserPasswordInput",
      value: passwordAdd,
      type: "password",
      autoComplete: "new-password",
      func: setPasswordAdd,
      label: "추가할 유저 비밀번호을 설정해주세요.",
    },
    {
      id: "addUserPasswordConfirmInput",
      value: passwordVerifyAdd,
      type: "password",
      autoComplete: "new-password",
      func: setPasswordVerifyAdd,
      label: "설정한 유저 비밀번호를 한번 더 입력해주세요.",
    },
  ];

  let changePasswordInfo = [
    {
      id: "changeUserPasswordInput",
      value: passwordChange,
      type: "password",
      autoComplete: "new-password",
      func: setPasswordChange,
      label: "변경할 비밀번호을 입력해주세요.",
    },
    {
      id: "changeUserPasswordConfirmInput",
      value: passwordVerifyChange,
      type: "password",
      autoComplete: "new-password",
      func: setPasswordVerifyChange,
      label: "변경할 비밀번호를 한번 더 입력해주세요.",
    },
  ];

  const { t } = useTranslation();

  useEffect(() => {
    getUserAction();
  }, []);

  useEffect(() => {
    if (user.me && !user.me.is_admin) history.push("/admin/setting/userinfo");
  }, [user.me?.is_admin]);

  useEffect(() => {
    getUserAction();
  }, [isDesc, pageNum, rowsPerPage, sortingValue, searchValueToPost]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsAddModalOpen(false);
      setUserAdd("");
      setEmailAdd("");
      setPasswordAdd("");
      setPasswordVerifyAdd("");
    }
  }, [messages.shouldCloseModal]);

  const onAddUser = () => {
    if (totalUserNum >= 1) {
      checkIsValidKey(user, dispatch, t).then(() => {
        setIsAddModalOpen(user.isValidUser);
      });
    } else setIsAddModalOpen(true);
  };

  const closeModalOpen = () => {
    dispatch(askModalRequestAction());
  };

  const getUserAction = () => {
    let tempUserRequest = {
      sorting: sortingValue,
      page: pageNum + 1,
      count: rowsPerPage,
      desc: isDesc,
      searching: searchingValue,
    };
    setIsLoading(true);
    api
      .getUserInfo(tempUserRequest)
      .then((res) => {
        setTotalUserNum(res.data?.user_count);
        setUserList(res.data?.users);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
      });
  };

  const onAddUserAction = () => {
    if (passwordAdd !== passwordVerifyAdd) {
      dispatch(
        openErrorSnackbarRequestAction(
          "입력하신 비밀번호와 비밀번호 확인이 일치하지 않습니다."
        )
      );
      return;
    }

    let tempAddUserRequest = {
      name: userAdd,
      email: emailAdd,
      password: passwordAdd,
    };

    api
      .postUserInfo(tempAddUserRequest)
      .then((res) => {
        dispatch(
          openSuccessSnackbarRequestAction(t("User addition is complete."))
        );
        getUserAction();
        setIsAddModalOpen(false);
      })
      .catch((e) => {
        let resData = e.response.data;
        if (user.language === "en" && resData.message_en)
          dispatch(openErrorSnackbarRequestAction(resData.message_en));
        else dispatch(openErrorSnackbarRequestAction(t(resData.message)));
      });
  };

  const onChangePasswordAction = () => {
    if (passwordChange !== passwordVerifyChange) {
      dispatch(
        openErrorSnackbarRequestAction(
          "입력하신 비밀번호와 비밀번호 확인이 일치하지 않습니다."
        )
      );
      return;
    }

    let tempChangePasswordRequest = {
      user_id: selectedUser.id,
      password: passwordChange,
      password_confirm: passwordVerifyChange,
    };

    api
      .resetPassword(tempChangePasswordRequest)
      .then((res) => {
        const isMyAccount = selectedUser.id === user.me.id;
        let text = isMyAccount
          ? "비밀번호 변경이 완료되었습니다. 다시 로그인 해주세요."
          : "비밀번호 변경이 완료되었습니다.";

        dispatch(openSuccessSnackbarRequestAction(t(text)));

        closeSelectedUserModal();

        if (isMyAccount) history.push("/signout?passwordChange=true");
      })
      .catch((e) => {
        let resData = e.response.data;
        if (user.language === "en" && resData.message_en)
          dispatch(openErrorSnackbarRequestAction(resData.message_en));
        else dispatch(openErrorSnackbarRequestAction(t(resData.message)));
      });
  };

  const onSearchUser = (e) => {
    let tempSearched = e.target.value;
    setSearchingValue(tempSearched);
  };

  const onGetSearchedUser = (e) => {
    e.preventDefault();
    setSearchValueToPost(searchingValue);
  };

  const onGetDefaultUser = () => {
    setSearchingValue("");
    setSearchValueToPost("");
  };

  const closeSelectedUserModal = () => {
    setIsSelectedUserModalOpen(false);
    if (isSelectedUserDelete) setIsSelectedUserDelete(false);
    else {
      setPasswordChange("");
      setPasswordVerifyChange("");
    }
    setSelectedUser({});
  };

  const deleteManageUser = (id) => {
    api
      .deleteUserInfo(id)
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
  };

  const renderUserList = () => {
    let userlistNum = rowsPerPage * pageNum;
    let mapArr = userList;

    const handlePageChange = (e, newPage) => {
      setPageNum(newPage);
    };

    const handleRowsPerPageChange = (e) => {
      e.preventDefault();
      let tempRows = e.target.value;
      setRowsPerPage(tempRows);
    };

    return (
      <>
        <TableBody id="groupTableBody">
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                className="tableRowCellCustom"
                id="lastTableCell"
              >
                <Grid sx={{ py: 20 }}>
                  {t("Loading user list")}
                </Grid>
              </TableCell>
            </TableRow>
          ) : mapArr.length ? (
            <>
              {mapArr.map((managedUser, idx) => {
                userlistNum++;
                return (
                  <TableRow
                    className={classes.tableRow}
                    key={`user_${managedUser.id}`}
                  >
                    {tableHeads.map((tableHead) => {
                      if (tableHead.value === "No")
                        return (
                          <TableCell
                            key={`No_${userlistNum}`}
                            className="tableRowCellCustom"
                            align={tableHead.align}
                          >
                            {userlistNum}
                          </TableCell>
                        );
                      else if (tableHead.value?.includes("Btn")) {
                        let headVal = tableHead.value;
                        let isDelete = headVal === "deleteBtn";
                        return (
                          <TableCell
                            key={`${headVal}_${managedUser.id}`}
                            className="tableRowCellCustom"
                            align={tableHead.align}
                          >
                            {user.me?.is_admin &&
                            user.me?.id === managedUser.id &&
                            isDelete ? (
                              <span>-</span>
                            ) : (
                              <Button
                                id={`${isDelete ? "delete" : "reset"}_user${
                                  managedUser.id
                                }_btn`}
                                shape="whiteOutlined"
                                size="sm"
                                onClick={() => {
                                  if (isDelete) setIsSelectedUserDelete(true);
                                  else setIsSelectedUserDelete(false);
                                  setSelectedUser(managedUser);
                                  setIsSelectedUserModalOpen(true);
                                }}
                                startIcon={
                                  isDelete ? (
                                    <CloseIcon fontSize="small" />
                                  ) : null
                                }
                              >
                                {isDelete ? t("Delete") : t("재설정")}
                              </Button>
                            )}
                          </TableCell>
                        );
                      } else
                        return (
                          <TableCell
                            key={`${managedUser[tableHead.value]}_${
                              managedUser.id
                            }`}
                            className="tableRowCellCustom"
                            align={tableHead.align}
                          >
                            {managedUser[tableHead.value]
                              ? managedUser[tableHead.value]
                              : "-"}

                            {tableHead.value === "email" &&
                              user.me?.is_admin &&
                              user.me?.id === managedUser.id && (
                                <span
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: 12,
                                    color: "var(--secondary1)",
                                    border: "1px solid var(--secondary1)",
                                    borderRadius: 20,
                                    marginLeft: 16,
                                  }}
                                >
                                  Admin
                                </span>
                              )}
                          </TableCell>
                        );
                    })}
                  </TableRow>
                );
              })}
              {mapArr.length ? (
                <TableRow>
                  <TablePagination
                    className="paginationCustom"
                    count={totalUserNum}
                    onPageChange={handlePageChange}
                    page={pageNum}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 20, 50]}
                    sx={{ paddingTop: "0 !important" }}
                  />
                </TableRow>
              ) : null}
            </>
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                className="tableRowCellCustom"
                id="lastTableCell"
              >
                <Grid sx={{ py: 20 }}>
                  {searchValueToPost
                    ? t("No user found containing the keyword you have searched for.")
                    : t("No user to manage.")}
                </Grid>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </>
    );
  };

  return (
    <Container component="main" maxWidth={false} className={classes.mainCard}>
      <div
        className={classes.settingTitle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>{t("")}</div>
        <Button
          id="addUserBtn"
          shape="greenOutlined"
          onClick={() => {
            onAddUser();
          }}
        >
          {t("add user")}
        </Button>
      </div>
      {(totalUserNum || (!totalUserNum && searchValueToPost)) && (
        <Grid
          sx={{ mt: 4.5, mb: 3 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (sortingValue === "created_at") setIsDesc(!isDesc);
              else setSortingValue("created_at");
            }}
          >
            <span style={{ margin: 0, fontSize: "14px" }}>
              {t("sort by creation date")}
            </span>
            {sortingValue === "created_at" ? (
              <>{isDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}</>
            ) : null}
          </Grid>
          <Grid>
            <form
              onSubmit={(e) => onGetSearchedUser(e)}
              style={{
                display: "flex",
                alignItems: "center",
              }}
              noValidate
            >
              <Paper className={classes.searchBox}>
                <InputBase
                  className={classes.input}
                  placeholder={t("search e-mail")}
                  value={searchingValue}
                  onChange={onSearchUser}
                  multiline={false}
                  id="searchEmailInput"
                  style={{
                    fontSize: "15px",
                    color: "var(--textWhite87)",
                  }}
                />
                {searchingValue && searchingValue.length > 0 && (
                  <CloseIcon
                    onClick={onGetDefaultUser}
                    className={classes.pointerCursor}
                  />
                )}
              </Paper>
              {searchingValue && searchingValue.length > 0 && (
                <SearchIcon
                  id="searchIcon"
                  onClick={(e) => onGetSearchedUser(e)}
                  className={classes.pointerCursor}
                />
              )}
            </form>
          </Grid>
        </Grid>
      )}
      <Table className={classes.table} aria-label="simple table" sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            {tableHeads.map((tableHead) => (
              <TableCell
                className="tableRowCellCustom"
                key={tableHead.value}
                style={{
                  width: tableHead.width,
                  cursor: tableHead.sorting ? "pointer" : "default",
                  textTransform: "capitalize",
                }}
                onClick={() => {
                  if (sortingValue === tableHead.value) setIsDesc(!isDesc);
                  else setSortingValue(tableHead.value);
                }}
              >
                <Grid
                  style={{
                    display: "flex",
                    justifyContent: tableHead.align,
                  }}
                >
                  <b>{t(tableHead.name)}</b>
                  {tableHead.sorting && sortingValue === tableHead.value && (
                    <>{isDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}</>
                  )}
                </Grid>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        {renderUserList()}
      </Table>
      <div className={classes.settingTitle}></div>
      <Modal
        open={isAddModalOpen && user.isValidUser}
        onClose={closeModalOpen}
        className={classes.modalContainer}
      >
        <Grid
          style={{
            minWidth: "300px",
            width: "30%",
            borderRadius: "4px",
            background: "var(--background2)",
          }}
        >
          <CloseIcon
            style={{
              fill: "var(--textWhite6)",
              float: "right",
              margin: "20px",
            }}
            onClick={closeModalOpen}
          />
          <Grid sx={{ p: 4 }}>
            <p
              style={{
                fontSize: "22px",
                color: "var(--textWhite87)",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {t("new user")}
            </p>
          </Grid>
          <Grid sx={{ pl: 5, pr: 5 }}>
            {addUserInfo.map((user) => (
              <TextField
                id={user.id}
                key={user.id}
                placeholder={t(user.label)}
                value={user.value}
                type={user.type}
                autoComplete={user.autoComplete}
                className={classes.textField}
                style={{ marginBottom: "16px" }}
                onChange={(e) => user.func(e.target.value)}
              />
            ))}
          </Grid>
          <Grid
            sx={{ pt: 3, pb: 5, display: "flex", justifyContent: "center" }}
          >
            <Button
              id="add_newusermodal_btn"
              shape="greenOutlinedSquare"
              size="lg"
              onClick={onAddUserAction}
            >
              {t("add user")}
            </Button>
          </Grid>
        </Grid>
      </Modal>
      <Modal
        open={isSelectedUserModalOpen}
        onClose={closeSelectedUserModal}
        className={classes.modalContainer}
      >
        <Grid
          sx={{
            p: 5,
            minWidth: "250px",
            width: "30%",
            borderRadius: "4px",
            background: "var(--background2)",
          }}
        >
          {selectedUser ? (
            <>
              {selectedUser.email ? (
                <Grid sx={{ mb: 1 }}>
                  {selectedUser.email}{" "}
                  {selectedUser.name ? `(${selectedUser.name})` : null}
                </Grid>
              ) : null}
              {isSelectedUserDelete ? (
                <>
                  <Grid sx={{ mb: 3 }}>{t("Do you want to delete?")}</Grid>
                  <Grid
                    sx={{ display: "flex", justifyContent: "space-evenly" }}
                  >
                    <Button
                      id="submit_userdelete_btn"
                      shape="greenOutlinedSquare"
                      size="lg"
                      sx={{ minWidth: "120px" }}
                      onClick={() => {
                        deleteManageUser(selectedUser.id);
                      }}
                    >
                      {t("Yes")}
                    </Button>
                    <Button
                      id="close_userdeletemodal_btn"
                      shape="whiteOutlinedSquare"
                      size="lg"
                      sx={{ minWidth: "120px" }}
                      onClick={closeSelectedUserModal}
                    >
                      {t("No")}
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid sx={{ py: 3 }}>
                    {changePasswordInfo.map((user) => (
                      <TextField
                        id={user.id}
                        key={user.id}
                        placeholder={t(user.label)}
                        value={user.value}
                        type={user.type}
                        autoComplete={user.autoComplete}
                        className={classes.textField}
                        style={{ marginBottom: "16px" }}
                        onChange={(e) => user.func(e.target.value)}
                      />
                    ))}
                  </Grid>
                  <Grid
                    sx={{
                      px: 3,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      id="reset_userpassword_btn"
                      shape="greenOutlinedSquare"
                      size="lg"
                      onClick={onChangePasswordAction}
                    >
                      {t("Change password")}
                    </Button>
                  </Grid>
                </>
              )}
            </>
          ) : (
            <Grid>{t("")}</Grid>
          )}
        </Grid>
      </Modal>

      <LiscenseRegisterModal />
    </Container>
  );
};

export default React.memo(Manager);
