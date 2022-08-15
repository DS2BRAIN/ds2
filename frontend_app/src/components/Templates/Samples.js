import React, { useEffect, useState } from "react";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";

const Samples = ({ closeTemplateModal, history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [isCategoryOpen, setIscategoryOpen] = useState({});
  const [isCategoryClicked, setIsCategoryClicked] = useState(false);
  const [categories, setCategories] = React.useState(null);

  useEffect(() => {
    if (user.category) {
      setCategories(user.category);
      const tempObj = {};
      for (let idx = 0; idx < user.category.length; idx++) {
        const name = user.category[idx].categoryName;
        tempObj[name] = false;
      }
      setIscategoryOpen(tempObj);
      const tempProjects = [];
      user.category.forEach((each, idx) => {
        each.projects.forEach((eachProject, idx) => {
          tempProjects.push(eachProject);
        });
      });
      setProjects(tempProjects);
      setIsLoading(false);
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

  const goSamplePage = (id) => {
    history.push(`/admin/sample/${id}`);
  };

  const renderProjectByIndustry = (categories) => {
    return categories.map((category) => {
      if (!category.projects || category.projects.length === 0) return;
      return (
        <>
          <ListItem
            id={category.categoryName + "_sampleCategory"}
            button
            onClick={() => handleListItemClick(category.categoryName)}
            key={category.categoryName + category.id}
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
            {projects.map((project) => {
              if (project.isSample) {
                if (project.projectcategory === category.id) {
                  return (
                    <ListItem
                      id={project.projectName + "_sampleProject"}
                      button
                      className={classes.projectItem}
                      key={t(project.projectName + project.id)}
                    >
                      <ListItemText
                        component="h1"
                        className={classes.projectItem}
                        primary={t(`${project.projectName}`)}
                      />
                      <Button
                        style={{ color: currentThemeColor.textWhite87 }}
                        className={classes.hoverBtn}
                        id={project.id}
                        onClick={() => goSamplePage(project.id)}
                      >
                        {t("Start")}
                      </Button>
                    </ListItem>
                  );
                }
              }
            })}
          </Collapse>
        </>
      );
    });
  };

  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <div className={classes.modalContent}>
      <div
        style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
      >
        <CloseIcon
          className={classes.cancelNextPlan}
          onClick={closeTemplateModal}
        />
      </div>
      <GridContainer>
        <GridItem
          xs={12}
          style={{
            margin: "10px 0",
            alignSelf: "flex-start",
            height: "400px",
            overflowY: "auto",
          }}
        >
          {categories && renderProjectByIndustry(categories)}
        </GridItem>
      </GridContainer>
    </div>
  );
};

export default React.memo(Samples);
