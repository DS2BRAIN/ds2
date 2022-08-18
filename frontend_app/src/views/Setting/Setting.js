import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import currentTheme from "assets/jss/custom.js";
import { getAllWorkageRequestAction } from "redux/reducers/user.js";
import { IS_ENTERPRISE } from "variables/common";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import NotiList from "components/Notifications/NotiList.js";
import UserInfo from "views/Setting/UserInfo.js";
import Payment from "views/Setting/Payment.js";
import UsageHistory from "views/Setting/UsageHistory.js";
import UsagePlan from "views/Setting/UsagePlan.js";
import MyLabel from "views/Setting/MyLabel.js";
import Group from "views/Setting/Group.js";
import Manager from "views/Setting/Manager.js";

import { useTranslation } from "react-i18next";
import { ReactTitle } from "react-meta-tags";

const Setting = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const path = window.location.pathname;
  const { t } = useTranslation();

  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    const pathArr = path.split("/");
    if (pathArr[pathArr.length - 1] === "") pathArr.pop();
    let setting = pathArr[pathArr.length - 1];
    if (setting === "setting") {
      history.push("/admin/setting/userinfo");
    }
    setSelectedPage(setting);
  }, [path]);

  useEffect(() => {
    if (selectedPage === "mylabel") dispatch(getAllWorkageRequestAction());
  }, [selectedPage]);

  const handleChange = (event) => {
    history.push(`/admin/setting/${event.target.id}`);
  };

  const tabList = [
    { id: "userinfo", name: "Account info", condition: true },
    {
      id: "usagehistory",
      name: "Use history",
      condition: !IS_ENTERPRISE,
    },
    {
      id: "payment",
      name: "Payment management",
      condition: !IS_ENTERPRISE,
    },
    { id: "share", name: "Group management", condition: true },
    { id: "notilist", name: "Notification history", condition: true },
    {
      id: "mylabel",
      name: "Labeling",
      condition: user.me && user.me.isAiTrainer,
    },
    {
      id: "manage",
      name: "User management",
      condition: user.me && user.me.is_admin,
    },
  ];

  return (
    <div>
      <ReactTitle title={"DS2.ai - " + t("Account settings")} />
      {
        <div className={classes.container}>
          <GridContainer>
            <GridItem
              xs={12}
              style={{ color: currentTheme.subText, padding: "0" }}
            >
              <div className={classes.topTitle}>{t("Account settings")}</div>
              {/* <div className={classes.subTitleText}>
                {t("You can view and edit your account information.")}
              </div> */}
            </GridItem>
          </GridContainer>
          <GridContainer style={{ margin: "30px 0", flexWrap: "nowrap" }}>
            {tabList.map((tab) => {
              if (tab.condition)
                return (
                  <div
                    onClick={handleChange}
                    id={tab.id}
                    key={tab.id}
                    className={
                      selectedPage === tab.id
                        ? classes.selectedTabUser
                        : classes.notSelectedTabUser
                    }
                    style={{ textTransform: "capitalize" }}
                  >
                    {t(tab.name)}
                  </div>
                );
            })}
          </GridContainer>
          {selectedPage === "userinfo" && <UserInfo history={history} />}
          {selectedPage === "payment" && <Payment history={history} />}
          {selectedPage === "usagehistory" && (
            <UsageHistory history={history} />
          )}
          {selectedPage === "usageplan" && <UsagePlan />}
          {/* {selectedPage === "usercount" && <UserCount />} */}
          {selectedPage === "notilist" && <NotiList history={history} />}
          {selectedPage === "share" && <Group history={history} />}
          {selectedPage === "mylabel" && <MyLabel history={history} />}
          {selectedPage === "manage" && <Manager history={history} />}
        </div>
      }
    </div>
  );
};

export default React.memo(Setting);
