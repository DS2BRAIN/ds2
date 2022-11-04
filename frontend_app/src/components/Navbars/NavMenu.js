import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { Grid } from "@mui/material";

const NavMenu = () => {
  const { t } = useTranslation();

  const routes = [
    {
      id: "data",
      path: "/dataconnector",
      name: "Dataset",
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
      id: "train",
      path: "/train",
      name: "Train",
      layout: "/admin",
      condition: true,
    },
    // {
    //   id: "verify",
    //   path: "/verifyproject",
    //   name: "Verify",
    //   layout: "/admin",
    //   condition: true,
    // },
    // {
    //   id: "skyhub",
    //   path: "/skyhubai",
    //   name: "Deploy",
    //   layout: "/admin",
    //   condition: true,
    // },
    // {
    //   id: "market",
    //   path: "/marketList",
    //   name: "AI Market",
    //   layout: "/admin",
    //   condition: true,
    // },
    // {
    //   id: "jupyter",
    //   path: "/jupyterproject",
    //   name: "Jupyter",
    //   layout: "/admin",
    //   condition: true,
    // },
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
            <NavLink
              key={route.id}
              id={`${route.id}_link`}
              to={route.layout ? route.layout + route.path : route.path}
              className={defaultClassName}
              activeClassName={navLinkActiveClassName}
              onClick={() => {
                window.location.href = path;
              }}
            >
              {t(route.name)}
            </NavLink>
          );
      })}
    </Grid>
  );
};
export default React.memo(NavMenu);
