import React, { useState, useEffect, useRef } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";
import Loading from "components/Loading/Loading.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem.js";
import Button from "@material-ui/core/Button";
import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import InputBase from "@material-ui/core/InputBase";
import GridFullContainer from "components/Grid/GridFullContainer";
import { useDispatch, useSelector } from "react-redux";
import { askModalRequestAction, openErrorSnackbarRequestAction, openSuccessSnackbarRequestAction } from "redux/reducers/messages.js";
import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import { openChat } from "components/Function/globalFunc";

let sortObj = { name: "up", displayName: "up", projectName: "up" };

const FavoriteLists = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector((state) => ({ user: state.user, messages: state.messages }), []);
  const { t } = useTranslation();

  const [favoriteModels, setFavoriteModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modelPage, setModelPage] = useState(0);
  const [rowsPerModelPage, setRowsPerModelPage] = useState(10);

  const [sortValue, setSortValue] = useState("name");
  const [isSortObjChanged, setIsSortObjChanged] = useState(false);
  const [apiLoading, setApiLoading] = useState("");
  const [completed, setCompleted] = useState(0);

  const url = window.location.href;
  let ref = useRef();

  useEffect(() => {
    (async () => {
      if (user.me) {
        await setIsLoading(true);
        await getFavoriteModelData();
        await setIsLoading(false);
      }
    })();
  }, [user.me && url]);

  useEffect(() => {
    if (isSortObjChanged) setIsSortObjChanged(false);
  }, [isSortObjChanged]);

  useEffect(() => {
    if (completed && apiLoading === "loading") {
      const tempCompleted = completed + 5;
      if (completed >= 95) {
        return;
      }
      if (completed < 80) {
        setTimeout(() => {
          setCompleted(tempCompleted);
        }, 5000);
      } else {
        setTimeout(() => {
          setCompleted(tempCompleted);
        }, 10000);
      }
    }
  }, [completed]);

  const getFavoriteModelData = () => {
    api
      .getFavoriteModels()
      .then((res) => {
        const data = res.data;
        data.sort((prev, next) => {
          let n = next["name"] ? next["name"] : "";
          let p = prev["name"] ? prev["name"] : "";
          return n.localeCompare(p, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        });
        setFavoriteModels(data);
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(openErrorSnackbarRequestAction(sendErrorMessage(e.response.data.message, e.response.data.message_en, user.language)));
        } else {
          dispatch(openErrorSnackbarRequestAction(t("죄송합니다, 즐겨찾기 목록을 가져오는데 실패했습니다. 잠시후 다시 시도해주세요.")));
        }
      });
  };

  const onClickForFavorite = (isTrue, id) => {
    api
      .setFavoriteModel(isTrue, id)
      .then((res) => {
        setFavoriteModels(favoriteModels.filter((model, i) => model.id !== parseInt(res.data.modelId)));
      })
      .catch((e) => {
        if (e.response && e.response.data.message) {
          dispatch(openErrorSnackbarRequestAction(sendErrorMessage(e.response.data.message, e.response.data.message_en, user.language)));
        } else {
          dispatch(openErrorSnackbarRequestAction(t("죄송합니다, 즐겨찾기 추가에 실패했습니다. 잠시후 다시 시도해주세요.")));
        }
      });
  };

  const openModal = async (model, item) => {
    history.push({
      pathname: `/admin/process/${model.project}?model=${model.id}&page=${item}`,
      state: { modelid: model.id, page: item },
    });
  };

  const changeModelPage = (event, newPage) => {
    setModelPage(newPage);
  };

  const changeRowsPerModelPage = (event) => {
    setRowsPerModelPage(+event.target.value);
    setModelPage(0);
  };

  const onSetSortValue = async (value) => {
    await setIsLoading(true);
    await onSortObjChange(value);
    await setIsSortObjChanged(true);
    await setIsLoading(false);
  };

  const onSortObjChange = (value) => {
    const sortedModels = favoriteModels;
    if (sortObj[value] === "up") {
      for (let index in sortObj) {
        sortObj[index] = "down";
      }
      sortedModels.sort((prev, next) => {
        let n = next[value] ? next[value] : "";
        let p = prev[value] ? prev[value] : "";
        return p.localeCompare(n, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    } else {
      for (let index in sortObj) {
        if (index === value) {
          sortObj[index] = "up";
        } else {
          sortObj[index] = "down";
        }
      }
      sortedModels.sort((prev, next) => {
        let n = next[value] ? next[value] : "";
        let p = prev[value] ? prev[value] : "";
        return n.localeCompare(p, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    }
    setFavoriteModels(sortedModels);
    setSortValue(value);
  };

  const showFavoriteTable = () => {
    return (
      <>
        {favoriteModels && favoriteModels.length > 0 ? (
          <>
            <Table className={classes.table} stickyheader="true" aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableHead} align="center" style={{ width: "10%", padding: "16px 40px 16px 16px" }}></TableCell>
                  <TableCell className={classes.tableHead} align="center" style={{ width: "45%", cursor: "pointer" }} onClick={() => onSetSortValue("projectName")}>
                    <div className={classes.tableHeader}>
                      {sortValue === "projectName" && (sortObj[sortValue] === "down" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      <b>{t("Project name")}</b>
                    </div>
                  </TableCell>
                  <TableCell className={classes.tableHead} align="center" style={{ width: "45%", cursor: "pointer" }} onClick={() => onSetSortValue("name")}>
                    <div className={classes.tableHeader}>
                      {sortValue === "name" && (sortObj[sortValue] === "down" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      <b>{t("Model name")}</b>
                    </div>
                  </TableCell>
                  {/* <TableCell className={classes.tableHead} style={{width: '30%'}}></TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {favoriteModels.slice(modelPage * rowsPerModelPage, modelPage * rowsPerModelPage + rowsPerModelPage).map((model, idx) => {
                  const id = model.id;
                  return (
                    <TableRow
                      className={classes.tableRow}
                      key={model.name + idx}
                      style={{
                        background: idx % 2 === 0 ? currentTheme.tableRow1 : currentTheme.tableRow2,
                      }}
                    >
                      <TableCell className={classes.tableRowCell}>
                        <IconButton aria-label="add to favorites">{model.isFavorite ? <StarIcon id="modelStarIcon" className="favoriteIcon" onClick={() => onClickForFavorite(false, id)} /> : <StarBorderIcon className="favoriteIcon" onClick={() => onClickForFavorite(true, id)} />}</IconButton>
                      </TableCell>
                      <TableCell onClick={() => openModal(model, "detail")} className={classes.defaultOutlineButton} className={classes.tableRowCell} align="center">
                        {model.projectName}{" "}
                      </TableCell>
                      <TableCell onClick={() => openModal(model, "detail")} className={classes.defaultOutlineButton} className={classes.tableRowCell} align="center">
                        {model.name}
                      </TableCell>
                      {/* <TableCell onClick={() => openModal(model, 'detail')} className={classes.defaultOutlineButton} className={classes.tableRowCell} align="center" >
                                {
                                model.status === 100 &&
                                <div className={classes.defaultContainer} >
                                    <Button onClick={() => openModal(model, 'detail')} className={classes.defaultOutlineButton}>
                                    {t('Model details')}
                                    </Button>
                                </div>
                                }
                            </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={favoriteModels.length}
              rowsPerPage={rowsPerModelPage}
              page={modelPage}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={changeModelPage}
              onChangeRowsPerPage={changeRowsPerModelPage}
            />
          </>
        ) : (
          <div className={classes.pageList}>{t("There is no model on the Favorites list.")}</div>
        )}
      </>
    );
  };

  return (
    <div>
      <ReactTitle title={"DS2.ai - " + t("Favorites")} />
      <div style={{ marginBottom: "0px" }} className={classes.topTitle}>
        {t("Favorites")}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className={classes.subTitleText}>{t("즐겨찾는 인공지능에서 즐겨찾기한 모델리스트를 확인할 수 있습니다.")}</div>
        <div>
          <Button id="sellAIModelBtn" className={classes.defaultOutlineButton} style={{ fontSize: user.language === "en" && "10px" }} onClick={() => openChat()}>
            {t("Sell AI (Contact Us)")}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className={classes.loading}>
          <Loading size={400} />
        </div>
      ) : (
        <div className={classes.tableWrapper} style={{ marginTop: "80px" }}>
          <Container component="main" maxWidth="false" className={classes.mainCard}>
            <GridContainer>{showFavoriteTable()}</GridContainer>
          </Container>
        </div>
      )}
    </div>
  );
};

export default React.memo(FavoriteLists);
