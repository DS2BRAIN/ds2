import React, { useState, useEffect } from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import currentTheme from "assets/jss/custom.js";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "components/CustomButtons/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Modal from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { postOpsProjectSellPriceRequestAction } from "redux/reducers/projects.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import axios from "axios";

const SalesModal = (props) => {
  const classes = currentTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, messages, projects } = useSelector(
    (state) => ({
      user: state.user,
      messages: state.messages,
      projects: state.projects,
    }),
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isApiChecked, setIsApiChecked] = useState(false);
  const [isModelChecked, setIsModelChecked] = useState(false);
  const [isChipsetChecked, setIsChipsetChecked] = useState(false);
  const [apiMinPrice, seApiMinPrice] = useState(0.02);
  const [apiPrice, setApiPrice] = useState(null);
  const [modelMinPrice, setModelMinPrice] = useState(5000);
  const [modelPrice, setModelPrice] = useState(null);
  const [chipsetMinPrice, setChipsetMinPrice] = useState(1);
  const [chipsetPrice, setChipsetPrice] = useState(null);
  const onColor = currentThemeColor.textWhite87;
  const offColor = currentThemeColor.textWhite38;
  const [apiCellColor, setApiCellColor] = useState(offColor);
  const [modelCellColor, setModelCellColor] = useState(offColor);
  const [chipsetCellColor, setChipsetCellColor] = useState(offColor);
  const [currency, setCurrency] = useState("ko");

  // const openSalesModal = () => {
  //   setIsSalesModalOpen(true);
  // };

  useEffect(() => {
    if (props) {
      // getIpClient();
      onSetCurrency();
    }
  }, [props]);

  useEffect(() => {
    if (projects.isOpsProjectSellPricePosted) {
      setIsLoading(false);
      if (messages.category === "success") {
        closeSalesModal();
      }
    }
  }, [projects.isOpsProjectSellPricePosted, messages.category]);

  // async function getIpClient() {
  //   try {
  //     const response = await axios.get("https://extreme-ip-lookup.com/json");
  //     const country = response.data.countryCode;
  //     if (country === "KR") {
  //       setCurrency("krw");
  //     } else {
  //       setCurrency("usd");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const onSetCurrency = () => {
    if (user.language === "ko") {
      setCurrency("krw");
    } else {
      setCurrency("usd");
    }
  };

  const closeSalesModal = () => {
    props.setIsSalesModalOpen(false);
    resetSalesRequestSettings();
  };

  const onChangeIsApiChecked = () => {
    setIsApiChecked(!isApiChecked);
    if (isApiChecked) {
      setApiCellColor(offColor);
    } else {
      setApiCellColor(onColor);
    }
  };

  const onChangeIsModelChecked = () => {
    if (isChipsetChecked) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("In case of offering chipset sales, model download has to be included.")
        )
      );
      return;
    } else {
      setIsModelChecked(!isModelChecked);
    }
    if (isModelChecked) {
      setModelCellColor(offColor);
    } else {
      setModelCellColor(onColor);
    }
  };

  const onChangeIsChipsetChecked = () => {
    setIsChipsetChecked(!isChipsetChecked);
    if (isChipsetChecked) {
      setChipsetCellColor(offColor);
    } else if (isModelChecked) {
      setChipsetCellColor(onColor);
    } else {
      setChipsetCellColor(onColor);
      setIsModelChecked(false);
      onChangeIsModelChecked();
    }
  };

  const apiPriceChange = (e) => {
    let aprice = e.target.value;
    if (isFinite(aprice)) {
      if (aprice < 0) {
        setApiPrice(0);
      } else {
        setApiPrice(aprice);
      }
    } else {
      if (currency === "krw") {
        setApiPrice(apiMinPrice * 1200);
      } else {
        setApiPrice(apiMinPrice);
      }
    }
  };

  const modelPriceChange = (e) => {
    let mprice = e.target.value;
    if (isFinite(mprice)) {
      if (mprice < 0) {
        setModelPrice(0);
      } else {
        setModelPrice(mprice);
      }
    } else {
      if (currency === "krw") {
        setModelPrice(modelMinPrice * 1200);
      } else {
        setModelPrice(modelMinPrice);
      }
    }
  };

  const chipsetPriceChange = (e) => {
    let cprice = e.target.value;
    if (isFinite(cprice)) {
      if (cprice < 0) {
        setChipsetPrice(0);
      } else {
        setChipsetPrice(cprice);
      }
    } else {
      if (currency === "krw") {
        setChipsetPrice(chipsetMinPrice * 1200);
      } else {
        setChipsetPrice(chipsetMinPrice);
      }
    }
  };

  const salesRequest = () => {
    if (isLoading) {
      dispatch(
        openErrorSnackbarRequestAction(
          t("Sending a sales request. Please wait.")
        )
      );
      return;
    }
    if (currency === "krw") {
      if (
        (isApiChecked && apiPrice < apiMinPrice * 1200) ||
        (isModelChecked && modelPrice < modelMinPrice * 1200) ||
        (isChipsetChecked && chipsetPrice < chipsetMinPrice * 1200)
      ) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Please set the desired price not less than minimum price.")
          )
        );
        return;
      }
    } else {
      if (
        (isApiChecked && apiPrice < apiMinPrice) ||
        (isModelChecked && modelPrice < modelMinPrice) ||
        (isChipsetChecked && chipsetPrice < chipsetMinPrice)
      ) {
        dispatch(
          openErrorSnackbarRequestAction(
            t("Please set the desired price not less than minimum price.")
          )
        );
        return;
      }
    }
    setIsLoading(true);
    dispatch(
      postOpsProjectSellPriceRequestAction({
        api_type: props.api_type,
        model_id: props.model_id,
        api_price: isApiChecked ? apiPrice : 0,
        model_price: isModelChecked ? modelPrice : 0,
        chipset_price: isChipsetChecked ? chipsetPrice : 0,
        currency: currency,
      })
    );
  };

  const resetSalesRequestSettings = () => {
    setIsLoading(false);
    setIsApiChecked(false);
    setIsModelChecked(false);
    setIsChipsetChecked(false);
    setApiPrice(null);
    setModelPrice(null);
    setChipsetPrice(null);
    setApiCellColor(offColor);
    setModelCellColor(offColor);
    setChipsetCellColor(offColor);
  };

  return (
    <>
      {/* sales modal */}
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={props.isSalesModalOpen}
        onClose={closeSalesModal}
        className={classes.modalContainer}
        style={{ wordBreak: "keep-all" }}
      >
        <div className={classes.modalDataconnectorContent} id="projectModal">
          <div className={classes.gridRoot} style={{ height: "100%" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <GridItem xs={11}>
                <div className={classes.highlightText}>
                  <b style={{ fontSize: "1rem" }}>
                    {props.api_type === "AI"
                      ? t("AI sales")
                      : t("API sales")}
                  </b>
                </div>
              </GridItem>
              <CloseIcon
                xs={1}
                id="deleteLabelIcon"
                onClick={closeSalesModal}
                style={{ cursor: "pointer" }}
              />
            </div>
            <>
              <div style={{ width: "100%", textAlign: "center" }}>
                <GridContainer
                  style={{
                    width: "100%",
                    height: "50%",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <>
                    <Table
                      aria-label="sales table"
                      style={{
                        marginTop: "5%",
                        width: "80%",
                        wordBreak: "keep-all",
                      }}
                    >
                      <TableBody>
                        {/* API 제공 */}
                        <TableRow>
                          <TableCell
                            style={{
                              color: apiCellColor,
                              borderBottom: "transparent",
                            }}
                          >
                            <Checkbox
                              className={classes.tableCheckBox}
                              value="isApiChecked"
                              checked={isApiChecked}
                              style={{ margin: "0 .5rem .6rem .5rem" }}
                              onChange={onChangeIsApiChecked}
                            />
                            <b style={{ fontSize: "1rem" }}>{t("API provision")}</b>
                          </TableCell>
                          <TableCell
                            style={{
                              color: apiCellColor,
                              borderBottom: "transparent",
                              float: "right",
                            }}
                          >
                            <TableRow>
                              <TableCell
                                style={{
                                  color: apiCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {t("Desired price")}
                                {currency === "krw" ? null : " $"}
                              </TableCell>
                              <TableCell style={{ color: apiCellColor }}>
                                <input
                                  disabled={!isApiChecked}
                                  type="text"
                                  value={apiPrice && apiPrice.toLocaleString()}
                                  placeholder={
                                    currency === "krw"
                                      ? `${t("minimum price")} ${apiMinPrice *
                                          1200}`
                                      : `${t("minimum price")} $ ${apiMinPrice}`
                                  }
                                  onChange={apiPriceChange}
                                  style={{
                                    color: apiCellColor,
                                    textAlign: "right",
                                    fontSize: "1rem",
                                    background: "transparent",
                                    border: "transparent",
                                  }}
                                ></input>
                              </TableCell>
                              <TableCell
                                style={{
                                  color: apiCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {currency === "krw" ? t("KRW") : null}
                              </TableCell>
                            </TableRow>
                            <tr>
                              <td></td>
                              <td>
                                <div style={{ paddingTop: ".5rem" }}>
                                  <tr
                                    style={{
                                      color: apiCellColor,
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "left",
                                      }}
                                    >
                                      {t("Brokerage fee")}
                                    </td>
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {currency === "krw"
                                        ? `${(apiPrice * 0.1).toFixed(1)} ${t(
                                            "원"
                                          )}`
                                        : `$ ${(apiPrice * 0.1).toFixed(1)}`}
                                    </td>
                                  </tr>
                                </div>
                              </td>
                              <td></td>
                            </tr>
                          </TableCell>
                        </TableRow>
                        {/* 모델 다운로드 제공 */}
                        <TableRow>
                          <TableCell
                            style={{
                              color: modelCellColor,
                              borderBottom: "transparent",
                            }}
                          >
                            <Checkbox
                              className={classes.tableCheckBox}
                              value="isModelChecked"
                              checked={isModelChecked}
                              style={{ margin: "0 .5rem .6rem .5rem" }}
                              onChange={onChangeIsModelChecked}
                            />
                            <b style={{ fontSize: "1rem" }}>
                              {t("Model download available")}
                            </b>
                          </TableCell>
                          <TableCell
                            style={{
                              color: modelCellColor,
                              borderBottom: "transparent",
                              float: "right",
                            }}
                          >
                            <TableRow>
                              <TableCell
                                style={{
                                  color: modelCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {t("Desired price")}
                                {currency === "krw" ? null : " $"}
                              </TableCell>
                              <TableCell style={{ color: modelCellColor }}>
                                <input
                                  disabled={!isModelChecked}
                                  type="text"
                                  value={
                                    modelPrice && modelPrice.toLocaleString()
                                  }
                                  placeholder={
                                    currency === "krw"
                                      ? `${t("minimum price")} ${(
                                          modelMinPrice * 1200
                                        ).toLocaleString()}`
                                      : `${t(
                                          "최소 금액"
                                        )} $ ${modelMinPrice.toLocaleString()}`
                                  }
                                  onChange={modelPriceChange}
                                  style={{
                                    color: modelCellColor,
                                    textAlign: "right",
                                    fontSize: "1rem",
                                    background: "transparent",
                                    border: "transparent",
                                  }}
                                ></input>
                              </TableCell>
                              <TableCell
                                style={{
                                  color: modelCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {currency === "krw" ? t("KRW") : null}
                              </TableCell>
                            </TableRow>
                            <tr>
                              <td></td>
                              <td>
                                <div style={{ paddingTop: ".5rem" }}>
                                  <tr
                                    style={{
                                      color: modelCellColor,
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "left",
                                      }}
                                    >
                                      {t("Brokerage fee")}
                                    </td>
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {currency === "krw"
                                        ? `${(modelPrice * 0.1).toFixed(1)} ${t(
                                            "원"
                                          )}`
                                        : `$ ${(modelPrice * 0.1).toFixed(1)}`}
                                    </td>
                                  </tr>
                                </div>
                              </td>
                              <td></td>
                            </tr>
                          </TableCell>
                        </TableRow>
                        {/* 칩셋 판매 제공 */}
                        <TableRow>
                          <TableCell
                            style={{
                              color: chipsetCellColor,
                              borderBottom: "transparent",
                            }}
                          >
                            <Checkbox
                              className={classes.tableCheckBox}
                              value="isChipsetChecked"
                              checked={isChipsetChecked}
                              style={{ margin: "0 .5rem .6rem .5rem" }}
                              onChange={onChangeIsChipsetChecked}
                            />
                            <b style={{ fontSize: "1rem" }}>
                              {t("Chipset sales offer")}
                            </b>
                          </TableCell>
                          <TableCell
                            style={{
                              color: chipsetCellColor,
                              borderBottom: "transparent",
                              float: "right",
                            }}
                          >
                            <TableRow>
                              <TableCell
                                style={{
                                  color: chipsetCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {t("Desired price")}
                                {currency === "krw" ? null : " $"}
                              </TableCell>
                              <TableCell style={{ color: chipsetCellColor }}>
                                <input
                                  disabled={!isChipsetChecked}
                                  type="text"
                                  value={
                                    chipsetPrice &&
                                    chipsetPrice.toLocaleString()
                                  }
                                  placeholder={
                                    currency === "krw"
                                      ? `${t("minimum price")} ${(
                                          chipsetMinPrice * 1200
                                        ).toLocaleString()}`
                                      : `${t("minimum price")} $ ${chipsetMinPrice}`
                                  }
                                  onChange={chipsetPriceChange}
                                  style={{
                                    color: chipsetCellColor,
                                    textAlign: "right",
                                    fontSize: "1rem",
                                    background: "transparent",
                                    border: "transparent",
                                  }}
                                ></input>
                              </TableCell>
                              <TableCell
                                style={{
                                  color: chipsetCellColor,
                                  borderBottom: "transparent",
                                }}
                              >
                                {currency === "krw" ? t("KRW") : null}
                              </TableCell>
                            </TableRow>
                            <tr>
                              <td></td>
                              <td>
                                <div style={{ paddingTop: ".5rem" }}>
                                  <tr
                                    style={{
                                      color: chipsetCellColor,
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "left",
                                      }}
                                    >
                                      {t("Brokerage fee")}
                                    </td>
                                    <td
                                      style={{
                                        fontSize: ".5rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {currency === "krw"
                                        ? `${(chipsetPrice * 0.1).toFixed(
                                            1
                                          )} ${t("KRW")}`
                                        : `$ ${(chipsetPrice * 0.1).toFixed(
                                            1
                                          )}`}
                                    </td>
                                  </tr>
                                </div>
                              </td>
                              <td></td>
                            </tr>
                          </TableCell>
                        </TableRow>
                        {/* 취소, 판매요청 버튼 */}
                        <TableRow>
                          <TableCell
                            style={{ borderBottom: "transparent" }}
                          ></TableCell>
                          <TableCell
                            style={{
                              marginTop: "10%",
                              display: "flex",
                              borderBottom: "transparent",
                            }}
                          >
                            <Button
                              id="cancelAiSales"
                              style={{
                                marginLeft: "20%",
                                width: "30%",
                                height: "2.5rem",
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                              }}
                              className={classes.defaultF0F0OutlineButton}
                              onClick={closeSalesModal}
                            >
                              {t("Cancel")}
                            </Button>
                            {isApiChecked ||
                            isModelChecked ||
                            isChipsetChecked ? (
                              <Button
                                id="requestSales"
                                style={{
                                  marginLeft: "5%",
                                  width: "40%",
                                  height: "2.5rem",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                className={
                                  isLoading
                                    ? classes.defaultDisabledButton
                                    : classes.defaultGreenOutlineButton
                                }
                                onClick={salesRequest}
                              >
                                {t("Sales request")}
                              </Button>
                            ) : (
                              <Button
                                id="requestSales"
                                style={{
                                  marginLeft: "5%",
                                  width: "40%",
                                  height: "2.5rem",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                  cursor: "default",
                                }}
                                className={classes.defaultDisabledButton}
                              >
                                {t("Sales request")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </>
                </GridContainer>
              </div>
            </>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SalesModal;
