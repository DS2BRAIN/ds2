import React from "react";
import { Grid } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NavMenu = ({ localPath }) => {
  const { t } = useTranslation();

  const routes = [
    {
      id: "data",
      path: "/dataconnector",
      name: "데이터셋",
      name_en: "Dataset",
      layout: "/admin",
      condition: true,
    },
    {
      id: "label",
      path: "/labelling?page=1&sorting=created_at&desc=true&rows=10",
      name: "라벨링",
      name_en: "Labeling",
      layout: "/admin",
      condition: true,
    },
    {
      id: "train",
      path: "/train",
      name: "학습",
      name_en: "Train",
      layout: "/admin",
      condition: true,
    },
    {
      id: "skyhub",
      path: "/skyhubai",
      name: "배포",
      name_en: "Deploy",
      layout: "/admin",
      condition: true,
    },
    {
      id: "verify",
      path: "/verifyproject",
      name: "검증",
      name_en: "Verify",
      layout: "/admin",
      condition: true,
    },
    {
      id: "market",
      path: "/marketList",
      name: "AI 마켓",
      name_en: "AI Market",
      layout: "/admin",
      condition: true,
    },
    {
      id: "jupyter",
      path: "/jupyterproject",
      name: "주피터",
      name_en: "My Jupyters",
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
