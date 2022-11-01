import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";

import { Collapse, List, ListItem, ListItemText } from "@material-ui/core";
import { CircularProgress, Grid, Tooltip } from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import currentTheme from "assets/jss/custom.js";
import Button from "components/CustomButtons/Button";
import { sendErrorMessage } from "components/Function/globalFunc.js";
import { linkDownloadUrl } from "components/Function/globalFunc";

const Templates = ({ closeTemplateModal }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [templateMethod, setTemplateMethod] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTab, setSelectedTab] = useState("method");
  const [isCategoryOpen, setIscategoryOpen] = useState({});
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [templateDescription, setTemplateDescription] = useState("");
  const [isKor, setIsKor] = useState(false);

  useEffect(() => {
    if (i18n?.language) {
      if (i18n.language === "ko") setIsKor(true);
      else if (i18n.language === "en") setIsKor(false);
    }
  }, [i18n?.language]);

  useEffect(() => {
    if (user.category) {
      const tempObj = {};
      for (let idx = 0; idx < user.category.length; idx++) {
        const name = user.category[idx].categoryName;
        tempObj[name] = false;
      }
      api
        .getTemplates()
        .then((res) => {
          const data = res.data;
          const tempMethod = [];
          const tempTemplates = [];
          data.forEach((each, idx) => {
            if (each.isTrainingMethod) {
              tempMethod.push(each);
            } else {
              tempTemplates.push(each);
            }
          });
          setTemplateMethod(tempMethod);
          setTemplates(tempTemplates);
        })
        .catch((e) => {
          if (e.response && e.response.data.message) {
            dispatch(
              openErrorSnackbarRequestAction(
                sendErrorMessage(
                  e.response.data.message,
                  e.response.data.message_en,
                  i18n?.language
                )
              )
            );
          } else {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Template import failed due to a temporary error")
              )
            );
          }
        })
        .finally(() => {
          setIscategoryOpen(tempObj);
          setIsLoading(false);
        });
    }
  }, [user.category]);

  useEffect(() => {
    if (isCategoryClicked) setIsCategoryClicked(false);
  }, [isCategoryClicked]);

  const handleListItemClick = (name) => {
    const tempObj = isCategoryOpen;
    tempObj[name] = !isCategoryOpen[name];
    setIscategoryOpen(tempObj);
    setIsCategoryClicked(true);
  };

  const handleMethodListItemClick = (name, description, descriptionEn) => {
    setSelectedMethod(name);
    setTemplateDescription(isKor ? description : descriptionEn);
  };

  const handleChangeTab = (value) => {
    setSelectedTab(value);
  };

  const downloadTemplateButton = (template) => {
    let fileName = "";
    if (template.s3url) {
      let urlSplitedArr = template.s3url.split("/");
      fileName = urlSplitedArr[urlSplitedArr.length - 1];
    }

    return (
      <Tooltip title={fileName} placement="right">
        <div>
          <Button
            id={`${template.templateCategory + template.id}_download_btn`}
            shape="greenOutlined"
            size="sm"
            onClick={() => {
              // linkDownloadUrl(template.s3url);
              const link = document.createElement("a");
              link.href = template.s3url;
              link.download = "download";
              link.click();
            }}
          >
            DownLoad
          </Button>
        </div>
      </Tooltip>
    );
  };

  const renderTemplateByMethod = () => {
    const listTemplateMethod = templateMethod.map((method) => (
      <ListItem
        button
        id={method.templateCategory + method.id}
        key={method.templateCategory + method.id}
        style={
          method.templateCategory === selectedMethod
            ? { color: "white" }
            : { color: "#D0D0D0" }
        }
        onClick={() =>
          handleMethodListItemClick(
            method.templateCategory,
            method.templateDescription,
            method.templateDescriptionEn
          )
        }
      >
        <ListItemText primary={t(method.templateName)} />
      </ListItem>
    ));

    let selectedExampleList = [];
    if (selectedMethod) {
      templates.forEach((template) => {
        if (template.templateCategory === selectedMethod) {
          selectedExampleList.push(template);
        }
      });
    }

    const listTemplateExample = selectedExampleList.map((template) => (
      <ListItem
        button
        className={classes.templateItem}
        key={template.templateName + template.id}
        style={{ cursor: "default" }}
      >
        <ListItemText>
          <span style={{ fontSize: "14px" }}>{t(template.templateName)}</span>
        </ListItemText>
        {downloadTemplateButton(template)}
      </ListItem>
    ));

    return (
      <Grid container columnSpacing={3}>
        <Grid item xs={selectedMethod ? 3 : 11}>
          {listTemplateMethod}
        </Grid>
        <Grid
          item
          xs={selectedMethod ? 9 : 1}
          style={{ height: "400px", overflowY: "auto" }}
        >
          <div
            id="description_div"
            style={{ fontSize: "14px", marginTop: "10px" }}
            dangerouslySetInnerHTML={{ __html: templateDescription }}
          />
          {Boolean(selectedExampleList.length) && (
            <>
              <div style={{ fontWeight: "bold", margin: "30px 0 10px" }}>
                EXAMPLE
              </div>
              {listTemplateExample}
            </>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderTemplateByIndustry = () => {
    const categories = user.category ? user.category : [];

    return categories.map((category) => {
      if (!category.projects || category.projects.length === 0) return;
      return (
        <>
          <ListItem
            button
            id={`listItem_${category.id}`}
            key={category.categoryName + category.id}
            onClick={() => handleListItemClick(category.categoryName)}
          >
            <ListItemText primary={t(category.categoryName)} />
            {isCategoryOpen[category.categoryName] ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )}
          </ListItem>
          <Collapse
            in={isCategoryOpen[category.categoryName]}
            timeout="auto"
            unmountOnExit
          >
            {templates.map((template) => {
              if (template.projectcategory) {
                if (template.templateCategory === "timeSeries") {
                  return;
                }
                if (
                  template.projectcategory.__data__.categoryName ===
                  category.categoryName
                )
                  return (
                    <ListItem
                      button
                      className={classes.templateItem}
                      key={template.templateName + template.id}
                      style={{ paddingLeft: "24px" }}
                    >
                      <ListItemText>
                        <span style={{ fontSize: "14px" }}>
                          {t(template.templateName)}
                        </span>
                      </ListItemText>
                      {downloadTemplateButton(template)}
                    </ListItem>
                  );
              }
            })}
          </Collapse>
        </>
      );
    });
  };

  const sectionTemplateList = (tab) => {
    const isMethodTab = tab === "method";

    const methodTabListStyle = {
      margin: "10px 0",
      alignSelf: "flex-start",
      height: "400px",
      minWidth: "300px",
    };

    const industryTabListStyle = {
      margin: "10px 0",
      alignSelf: "flex-start",
      height: "400px",
      width: "100%",
      overflowY: "auto",
    };

    return (
      <List
        key={`tab_${tab}`}
        style={isMethodTab ? methodTabListStyle : industryTabListStyle}
      >
        {isMethodTab ? renderTemplateByMethod() : renderTemplateByIndustry()}
      </List>
    );
  };

  const tabActiveStyle = {
    color: "#1BC6B4",
    borderBottom: "2px solid #1BC6B4",
    padding: ".3rem",
    wordBreak: "keep-all",
  };
  const tabDeactiveStyle = {
    color: "#D0D0D0",
    borderBottom: "2px solid #D0D0D0",
    padding: ".3rem",
    wordBreak: "keep-all",
  };

  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <div className={classes.modalContent} style={{ minWidth: "600px" }}>
      <Grid sx={{ mb: 3, ml: 2, display: "flex" }}>
        <Grid
          id="methodSampleTab"
          className={
            selectedTab === "method"
              ? classes.selectedListObject
              : classes.listObject
          }
          style={selectedTab === "method" ? tabActiveStyle : tabDeactiveStyle}
          onClick={() => handleChangeTab("method")}
        >
          {t("By training method")}
        </Grid>
        <Grid
          id="businessSampleTab"
          className={
            selectedTab === "business"
              ? classes.selectedListObject
              : classes.listObject
          }
          style={selectedTab === "business" ? tabActiveStyle : tabDeactiveStyle}
          onClick={() => handleChangeTab("business")}
        >
          {t("By industrial group")}
        </Grid>
        <CloseIcon
          id="closeSampleModal"
          className={classes.cancelNextPlan}
          style={{ marginLeft: "auto" }}
          onClick={closeTemplateModal}
        />
      </Grid>
      <Grid sx={{ fontSize: ".85rem", ml: 1 }}>
        <div>
          {"* " +
            t(
              "The sample data is an example template to show only the structure of the file."
            )}
        </div>
        <div style={{ margin: "-3px 0 0 12px" }}>
          {t(
            "When uploading sample data to a dataset, please add data according to the service conditions."
          )}
        </div>
      </Grid>
      {sectionTemplateList(selectedTab)}
    </div>
  );
};

export default React.memo(Templates);
