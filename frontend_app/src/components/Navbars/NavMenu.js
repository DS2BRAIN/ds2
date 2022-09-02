import React from "react";
import { Grid } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NavMenu = () => {
  const { t } = useTranslation();
  const localPath = window.location.pathname;

  const routes = [
    {
      id: "train",
      path: "/train",
      name: "Train",
      layout: "/admin",
      condition: true,
    },
    {
      id: "verify",
      path: "/verifyproject",
      name: "Verify",
      layout: "/admin",
      condition: true,
    },
    {
      id: "skyhub",
      path: "/skyhubai",
      name: "Deploy",
      layout: "/admin",
      condition: true,
    },
    {
      id: "label",
      path: "/labelling",
      name: "Labeling",
      layout: "/admin",
      condition: true,
    },
    {
      id: "market",
      path: "/marketList",
      name: "AI Market",
      layout: "/admin",
      condition: true,
    },
    {
      id: "jupyter",
      path: "/jupyterproject",
      name: "Jupyter",
      layout: "/admin",
      condition: true,
    },
  ];

  const navLinkClassName =
    "navLinkDefault hoverTextColorSubPoint focusTextColorLightGray";
  const navLinkActiveClassName = "navLinkActive";

  return (
    <Grid className="flex fullHeight" style={{ height: "60px", ml: 3 }}>
      {routes.map((route) => {
        let defaultClassName = navLinkClassName;
        const path = route.layout ? route.layout + route.path : route.path;

        if (route.condition)
          return (
            <a
              key={route.id}
              id={`${route.id}_link`}
              href={path}
              className={
                ["/admin", "/setting/userinfo", "/setting/notilist"].indexOf(
                  localPath
                ) === -1 && localPath.includes(path.split("?")[0])
                  ? defaultClassName + " " + navLinkActiveClassName
                  : defaultClassName
              }
            >
              {t(route.name)}
            </a>
            // <NavLink
            //   key={route.id}
            //   id={`${route.id}_link`}
            //   to={route.layout ? route.layout + route.path : route.path}
            //   className={defaultClassName}
            //   activeClassName={navLinkActiveClassName}
            // >
            //   {t(route.name)}
            // </NavLink>
          );
      })}
    </Grid>
  );
};
export default React.memo(NavMenu);
