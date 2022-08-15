import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

import styles from "assets/jss/material-dashboard-react/components/sidebarStyle.js";
import { setPlanModalOpenRequestAction } from "redux/reducers/messages.js";
import { IS_ENTERPRISE } from "variables/common";

import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import OndemandVideoIcon from "@material-ui/icons/OndemandVideo";
import Modal from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";

const videoDummy = [
  {
    name: "VIDEO1",
    description: "프로젝트 생성에 대한 안내입니다.",
    video: "https://www.youtube.com/watch?v=6w0im3LHazY",
  },
  {
    name: "VIDEO2",
    description: "모델 생성에 대한 안내입니다.",
    video: "https://www.youtube.com/watch?v=6w0im3LHazY",
  },
  {
    name: "VIDEO3",
    description: "결제관련에 대한 안내입니다.",
    video: "https://www.youtube.com/watch?v=6w0im3LHazY",
  },
];

const useStyles = makeStyles(styles);

const Sidebar = React.memo((props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, projects } = useSelector(
    (state) => ({ user: state.user, projects: state.projects }),
    []
  );
  const [isListOpen, setIsListOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [chosenVideo, setChosenVideo] = useState(0);
  const [openSubMenu, setOpenSubMenu] = useState({ init: true });
  const [selectedSubMenu, setSelectedSubMenu] = useState("");
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const [docsUrl, setDocsUrl] = useState("");
  const [promotionUrl, setPromotionUrl] = useState("");

  useEffect(() => {
    window.addEventListener("resize", resizeFunction);
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);

  useEffect(() => {
    if (user.language === "ko") {
      setDocsUrl("https://krdocs.ds2.ai/");
      setPromotionUrl("https://ko.ds2.ai//");
    } else {
      setDocsUrl("https://docs.ds2.ai/");
      setPromotionUrl("https://ds2.ai/");
    }
  }, [user.language]);

  const resizeFunction = () => {
    const url = window.location.href;
    if (
      (url.indexOf("/project") !== -1 ||
        url.indexOf("/dataconnector") !== -1) &&
      window.innerHeight < 740
    ) {
      setIsSmallWindow(true);
    } else if (url.indexOf("/modellists") !== -1 && window.innerHeight < 640) {
      setIsSmallWindow(true);
    } else if (window.innerHeight < 560) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { color, logo, image, logoText, routes } = props;

  // useEffect(()=>{
  //   if(!Cookies.getCookie('jwt')){
  //     return;
  //   }
  //   dispatch(getRecentProjectsRequestAction({sorting: 'created_at', count: 5, start: 0, tab: 'all', isDesc: true}));
  // }, [])

  useEffect(() => {
    const url = window.location.href;
    const tempOpenMenu = {};
    if (url.indexOf("/dataconnector") !== -1) {
      // setSelectedSubMenu("dataconnector");
      // tempOpenMenu["/project"] = true;
    } else if (url.indexOf("/project") !== -1) {
      tempOpenMenu["/project"] = true;
    } else if (url.indexOf("/favorite") !== -1) {
      setSelectedSubMenu("favorite");
      tempOpenMenu["/project"] = true;
    } else if (url.indexOf("/jupyterproject") !== -1) {
      setSelectedSubMenu("jupyterproject");
      tempOpenMenu["/project"] = true;
    } else if (url.indexOf("/automlproject") !== -1) {
      setSelectedSubMenu("automlproject");
      tempOpenMenu["/project"] = true;
    }
    if (url.indexOf("?tab=") !== -1) {
      const sideMenu = url.split("?tab=");
      setSelectedSubMenu(sideMenu[1]);
    }

    setOpenSubMenu(tempOpenMenu);
  }, [window.location.href]);

  const showVideoList = () => {
    setIsListOpen(true);
  };
  const closeList = () => {
    setIsListOpen(false);
  };
  const openVideo = (idx) => {
    isVideoItemOpen(idx);
  };
  const isVideoItemOpen = (idx) => {
    setIsVideoOpen(true);
    setChosenVideo(idx);
  };
  const closeVideo = () => {
    setIsVideoOpen(false);
    setIsListOpen(false);
  };
  const handleClick = (path) => {
    let tempOpenMenu = {};
    if (openSubMenu[path] == true) {
      tempOpenMenu = {};
    } else {
      tempOpenMenu[path] = true;
    }
    setOpenSubMenu(tempOpenMenu);
    setSelectedSubMenu("");
  };

  const sidebarGroupInfo = [
    {
      realPath: "/dataconnector",
      targetPath: "/dataset",
      isExactMatch: true,
    },
    {
      realPath: "/dataconnector?new=true",
      targetPath: "/project",
      isExactMatch: true,
    },
    {
      realPath: "/process",
      targetPath: "/project",
      isExactMatch: true,
    },
    {
      realPath: "/model/",
      targetPath: "/project",
      isExactMatch: false,
    },
    {
      realPath: "/file",
      targetPath: "/dataset",
      isExactMatch: true,
    },
  ];

  const onSetGoToPage = (path, id) => {
    setSelectedSubMenu(id);
    if (id === "dataconnector") {
      props.history.push("/admin/dataconnector");
    } else if (id === "favorite") {
      props.history.push(`/admin/favorite`);
    } else if (id === "jupyterproject") {
      props.history.push(`/admin/jupyterproject`);
    } else if (id === "automlproject") {
      props.history.push(`/admin/automlproject`);
    } else {
      props.history.push(`${path}/?tab=${id}`);
    }
  };

  const onOpenAlertModal = () => {
    dispatch(setPlanModalOpenRequestAction());
  };

  var links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
        var activePro = " ";
        var listItemClasses;
        var whiteFontClasses;

        var path =
          prop.name === "Setting"
            ? prop.layout + prop.path + "/userinfo"
            : prop.layout + prop.path;
        var pathName = prop.layout + prop.path;
        var isGroupMatched = false;
        sidebarGroupInfo.map((sidebarGroup) => {
          if (sidebarGroup.isExactMatch) {
            if (
              "/" +
                window.location.href.split("/")[
                  window.location.href.split("/").length - 1
                ] ===
                sidebarGroup.realPath &&
              prop.path === sidebarGroup.targetPath
            ) {
              isGroupMatched = true;
            }
          } else {
            if (
              window.location.href.indexOf(sidebarGroup.realPath) > -1 &&
              prop.path === sidebarGroup.targetPath
            ) {
              isGroupMatched = true;
            }
          }
        });

        listItemClasses = classNames({
          [" " + classes[color]]: isGroupMatched ? true : activeRoute(pathName),
        });
        whiteFontClasses = classNames({
          [" " + classes.whiteFont]: isGroupMatched
            ? true
            : activeRoute(pathName),
        });

        if (
          prop.name === "Setting" &&
          props.userInfo &&
          props.userInfo.isBetaUser
        ) {
          return;
        }
        if (
          prop.name === "SignOut" ||
          prop.name === "Instruction" ||
          prop.name === "Setting"
        ) {
          return;
        }
        if (
          prop.name === "File" ||
          prop.name === "Dataconnector" ||
          prop.name === "Favorite"
        ) {
          return;
        }

        if (prop.subMenu) {
          let isHighlighted = false;
          try {
            if (
              prop.name === "Project" &&
              props.history.location.pathname.includes("dataconnector")
            ) {
              // isHighlighted = true;
              isHighlighted = false;
            }
          } catch {
            isHighlighted = false;
          }

          return (
            <>
              {prop.name === "Studio" || prop.name === "AI Market" ? (
                <div className={classes.itemGroup}>{prop.name}</div>
              ) : (
                <NavLink
                  to={path}
                  className={activePro + classes.item}
                  activeClassName="active"
                  key={key}
                >
                  <ListItem
                    button
                    onClick={() => handleClick(prop.path)}
                    style={{ display: "flex" }}
                    className={classes.itemLink + listItemClasses}
                    id={`menu${prop.name}`}
                  >
                    {typeof prop.icon === "string"
                      ? null
                      : // <Icon
                        //   className={classNames(
                        //     classes.itemIcon,
                        //     whiteFontClasses,
                        //     {
                        //       [classes.itemIconRTL]: props.rtlActive,
                        //     }
                        //   )}
                        // >
                        //   {prop.icon}
                        // </Icon>
                        null
                    // <prop.icon
                    //   className={classNames(
                    //     classes.itemIcon,
                    //     whiteFontClasses,
                    //     {
                    //       [classes.itemIconRTL]: props.rtlActive,
                    //     }
                    //   )}
                    // />
                    }
                    <ListItemText
                      primary={`${t(prop.nickName)}`}
                      className={classNames(
                        classes.itemText,
                        whiteFontClasses,
                        {
                          [classes.itemTextRTL]: props.rtlActive,
                        }
                      )}
                      disableTypography={true}
                    />
                    {openSubMenu[prop.path] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                </NavLink>
              )}
              <Collapse
                in={openSubMenu[prop.path]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {prop.subMenu.map((sub) => {
                    return (
                      <ListItem
                        id="sidebarListItem"
                        button
                        style={{
                          backgroundColor:
                            sub.id === selectedSubMenu ? "#4f4f4f" : "#363636",
                          color:
                            sub.id === selectedSubMenu ? "#F8F8F8" : "#D0D0D0",
                        }}
                        onClick={() => {
                          onSetGoToPage(path, sub.id);
                        }}
                      >
                        {sub.id === "ready" ||
                        sub.id === "jupyterproject" ||
                        sub.id === "automlproject" ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 0 0 25px",
                            }}
                          >
                            <ListItemText
                              primary={`${t(sub.nickName)}`}
                              className={
                                sub.id === selectedSubMenu
                                  ? "sideSubMenu selectedSideSubMenu"
                                  : "sideSubMenu"
                              }
                              id={`sideSubMenu${sub.id}`}
                              style={
                                sub.id === selectedSubMenu
                                  ? { color: "#F8F8F8" }
                                  : { color: "#D0D0D0" }
                              }
                            />
                          </div>
                        ) : (
                          <ListItemText
                            primary={`- ${t(sub.nickName)}`}
                            className={
                              sub.id === selectedSubMenu
                                ? "sideSubMenu selectedSideSubMenu"
                                : "sideSubMenu"
                            }
                            id={`sideSubMenu${sub.id}`}
                            style={
                              sub.id === selectedSubMenu
                                ? { paddingLeft: "30px", color: "white" }
                                : { paddingLeft: "30px", color: "gray" }
                            }
                          />
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </>
          );
        } else {
          return (
            <>
              {prop.name === "Studio" || prop.name === "AI Market" ? (
                <div className={classes.itemGroup} style={{}}>
                  {prop.name}
                </div>
              ) : (
                <NavLink
                  to={path}
                  className={activePro + classes.item}
                  activeClassName="active"
                  key={key}
                >
                  <ListItem
                    button
                    onClick={() => handleClick(prop.path)}
                    className={classes.itemLink + listItemClasses}
                    id={`menu${prop.name}`}
                  >
                    {typeof prop.icon === "string"
                      ? null
                      : // <Icon
                        //   className={classNames(classes.itemIcon, whiteFontClasses, {
                        //     [classes.itemIconRTL]: props.rtlActive,
                        //   })}
                        // >
                        //   {prop.icon}
                        // </Icon>
                        null
                    // <prop.icon
                    //   className={classNames(classes.itemIcon, whiteFontClasses, {
                    //     [classes.itemIconRTL]: props.rtlActive,
                    //   })}
                    // />
                    }
                    <ListItemText
                      style={{
                        fontSize:
                          user.language === "en" &&
                          prop.name === "Labelling" &&
                          "12px",
                      }}
                      primary={`${t(prop.nickName)}`}
                      className={classNames(
                        classes.itemText,
                        whiteFontClasses,
                        {
                          [classes.itemTextRTL]: props.rtlActive,
                        }
                      )}
                      disableTypography={true}
                    />
                  </ListItem>
                </NavLink>
              )}
            </>
          );
        }
      })}
      {/* <div style={{margin: '30px 10px', minHeight: '260px'}} id="recentProjects">
        <p style={{marginLeft: '10px'}}><b style={{color: 'rgba(255, 255, 255, 0.9)'}}>{t('List of recent projects')}</b></p>
        {projects.recentProjects && projects.recentProjects.map((project, idx)=>{
            if (!project.projectName){
              project.projectName = "No Name";
            }
            return(
              <NavLink
              key={project.projectName+project.id}
              to={`/admin/process/${project.id}`}
              >
                <ListItem button className={classes.recentProject} >
                  {
                  project.projectName.length > 20 ?
                  project.projectName.substring(0,20)+' ...'
                  : project.projectName
                  }
                </ListItem>
              </NavLink>
            )
        })}
      </div> */}
      {/* {
      isSmallWindow ?
      <div >
        <a
          href="https://clickai.ai/datavoucher.html"
          target="_blank"
          className={classes.freeLink}
          id="tryFreeLink"
        >
          <img src={freetrial} style={{width: '24px', marginRight: '15px'}} /> {t('Free Trial')}
        </a>
        <div
          onClick={()=>{ props.history.push('/signout/');}}
          className={classes.freeLink}
          style={{marginBottom: '40px'}}
          id="logoutLink"
        >
          <ExitToAppIcon style={{marginRight: '15px'}} /> {t('Log out')}
        </div>
      </div>
      :
      <div style={{position: 'absolute', bottom: '20px'}}>
      <a
        href="https://clickai.ai/partner/partner_datavoucher.html"
        target="_blank"
        className={classes.freeLink}
        id="tryFreeLink"
      >
        <img src={freetrial} style={{width: '24px', marginRight: '15px'}} /> {t('Free Trial')}
      </a>
      <div
        onClick={()=>{ props.history.push('/signout/');}}
        className={classes.freeLink}
        style={{marginBottom: '40px'}}
        id="logoutLink"
      >
        <ExitToAppIcon style={{marginRight: '15px'}} /> {t('Log out')}
      </div>
    </div>
    } */}
    </List>
  );

  var brand = (
    <div
      id="logoToAdmin"
      className={classes.logo}
      onClick={() => {
        props.history.push("/admin");
      }}
      style={{ marginTop: "10px", cursor: "pointer" }}
    >
      {/* <NavLink
        to="/admin"
        className={classNames(classes.logoLink, {
          [classes.logoLinkRTL]: props.rtlActive,
        })}
      > */}
      <img src={logo} alt="logo" className={classes.img} />
      {/* </NavLink> */}
    </div>
  );

  var shortcuts = (
    <>
      <hr style={{ borderColor: "#4F4F4F", margin: "15px 0" }} />
      {/* <ListItem
        button
        onClick={() => window.open(docsUrl, "_blank")}
        className={classes.itemLink}
      >
        <ListItemText
          newUrl={`${docsUrl}`}
          id="goToGuide"
          style={{
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          primary={t("Go to guides")}
          className={classes.itemText}
          disableTypography={true}
        />
      </ListItem> */}
      <ListItem
        button
        onClick={() => window.open(promotionUrl, "_blank")}
        className={classes.itemLink}
      >
        <ListItemText
          newurl={`${promotionUrl}`}
          id="goToDS2"
          style={{
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          primary="DS2.ai"
          className={classes.itemText}
          disableTypography={true}
        />
      </ListItem>
      <ListItem
        button
        onClick={() =>
          window.open(
            user.language == "en"
              ? "https://ds2.ai/pricing_detail.html"
              : "https://ko.ds2.ai//pricing_detail.html",
            "_blank"
          )
        }
        className={classes.itemLink}
      >
        <ListItemText
          id="goToPriceGuide"
          style={{
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
          }}
          primary={t("Price Guide")}
          className={classes.itemText}
          disableTypography={true}
        />
      </ListItem>
    </>
  );

  return (
    <>
      <div>
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={props.rtlActive ? "left" : "right"}
            open={props.open}
            classes={{
              paper: classNames(classes.drawerPaper, {
                [classes.drawerPaperRTL]: props.rtlActive,
              }),
            }}
            onClose={props.handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {brand}
            <div
              className={classes.sidebarWrapper}
              style={{ position: "relative" }}
            >
              {links}
              {!IS_ENTERPRISE && shortcuts}
            </div>

            <div className={classes.background} />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            anchor={props.rtlActive ? "right" : "left"}
            variant="permanent"
            open
            classes={{
              paper: classNames(classes.drawerPaper, {
                [classes.drawerPaperRTL]: props.rtlActive,
              }),
            }}
          >
            {brand}
            <div
              className={classes.sidebarWrapper}
              style={{ position: "relative" }}
            >
              {links}
              {!IS_ENTERPRISE && shortcuts}
            </div>

            <div className={classes.background} />
          </Drawer>
        </Hidden>
      </div>
      <div className={classes.videoContainer}>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isListOpen}
          onClose={closeList}
          className={classes.videoModal}
          style={props.open ? { marginRight: "30px" } : { marginLeft: "30px" }}
        >
          <div
            className={classes.videoList}
            style={props.open ? null : { left: 0 }}
          >
            {videoDummy.map((video, idx) => {
              return (
                <div
                  className={classes.videoItem}
                  onClick={() => openVideo(idx)}
                  key={video.name + idx}
                >
                  <OndemandVideoIcon style={{ marginRight: "10px" }} />
                  <b>{video.name}</b>
                </div>
              );
            })}
          </div>
        </Modal>
      </div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={isVideoOpen}
        onClose={closeVideo}
        className={classes.modalContainer}
      >
        <div className={classes.modalContent}>
          <CloseIcon className={classes.closeImg} onClick={closeVideo} />
          <h3 id="simple-modal-title">{videoDummy[chosenVideo].name}</h3>
          <p>{videoDummy[chosenVideo].description}</p>
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <video style={{ width: "80%" }} controls>
              <source src={videoDummy[chosenVideo].video} type="video/mp4" />
            </video>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default Sidebar;

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
