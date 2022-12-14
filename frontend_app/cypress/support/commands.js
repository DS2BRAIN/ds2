// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "cypress-file-upload";
import axios from "axios";

export const backendurl = "https://dslabaa.ds2.ai/";
//const backendurl = 'http://dslabaa.clickai.ai:13002/';
export const labelurl = "https://staginglabelapp.ds2ai.ai";

export const userInfo = {
  email: Cypress.env("email"),
  password: Cypress.env("password"),
};

Cypress.Commands.add("backendUrl", () => {
  return backendurl;
});

Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

Cypress.Commands.add("postTrialUserToDb", (email, password, name) => {
  axios
    .post(backendurl + "register/", {
      email: email,
      password: password,
      name: name,
      isBetaUser: 1,
      isTest: 1,
    })
    .catch((err) => {
      console.log(err);
    });
});

Cypress.Commands.add("postBusinessUserToDb", (email, password, name) => {
  axios
    .post(backendurl + "register/", {
      email: email,
      password: password,
      name: name,
      isBetaUser: 0,
      isTest: 1,
    })
    .catch((err) => {
      console.log(err);
    });
});

Cypress.Commands.add("putUsagePlanToDb", () => {
  cy.exec("python3 cypress/support/userSetting.py setUsagePlan");
});

Cypress.Commands.add("setIsComfirmed", () => {
  cy.exec("python3 cypress/support/userSetting.py setIsComfirmed");
});

Cypress.Commands.add("deleteUser", () => {
  const user = document.cookie.match("(^|;) ?" + "user" + "=([^;]*)(;|$)")[2];
  const userId = JSON.parse(user).id;
  cy.exec(`python3 cypress/support/delete.py ${userId}`, {
    failOnNonZeroExit: false,
  });
});

Cypress.Commands.add("setProjectStatus", () => {
  const token = document.cookie.match("(^|;) ?" + "jwt" + "=([^;]*)(;|$)")[2];
  axios.get(backendurl.concat(`projects/?token=` + token)).then((res) => {
    const projects = res.data;
    projects.forEach((project) => {
      if (project.status === 1) cy.exec(`python3 cypress/support/projectSetting.py ${token} ${project.id}`);
    });
  });
});

Cypress.Commands.add("closeChennalTalk", () => {
  cy.get("#ch-plugin-script-iframe").then(($iframe) => {
    //????????? ??????
    const $body = $iframe.contents().find("body");
    cy.wrap($body)
      .find('[data-ch-testid="close-icon"]')
      .click();
  });
});

Cypress.Commands.add("en", () => {
  //?????? ??????
  cy.get("#language_en_btn").click({ force: true });
});

Cypress.Commands.add("ko", () => {
  //?????? ??????
  cy.get("#language_ko_btn").click({ force: true });
});

Cypress.Commands.add("login", () => {
  cy.visit("/signout");

  cy.clearCookies();

  expect(userInfo.email, "set email").to.be.a("string").and.not.be.empty;

  if (typeof userInfo.password !== "string" || !userInfo.password) {
    throw new Error("Missing password value, set using CYPRESS_password=...");
  }

  cy.request({
    method: "POST",
    url: backendurl + "login/",
    body: {
      identifier: userInfo.email,
      password: userInfo.password,
    },
  }).then((res) => {
    cy.setCookie("jwt", res.body.jwt);
    cy.setCookie("user", JSON.stringify(res.body.user));
    cy.setCookie("apptoken", JSON.stringify(res.body.user.appTokenCode));

    cy.visit("/admin");
    cy.ko();
    cy.wait(1000);
  });
});

Cypress.Commands.add("loginAsync", () => {
  cy.visit("/signout");
  cy.clearCookies();
  cy.get("form").within(() => {
    cy.get("#email")
      .type(userInfo.email)
      .should("have.value", userInfo.email);
    cy.get("#password")
      .type(userInfo.password)
      .should("have.value", userInfo.password);
    cy.get("#signInBtn").click();
  });
});

Cypress.Commands.add("checkSampleData", () => {
  cy.get("#demo-simple-select-outlined").click();
  cy.get("#client-snackbar").should("contain", "?????????????????? ?????? ????????? ??? ????????????.");
  cy.contains("START").click();
  cy.get("#client-snackbar").should("contain", "?????????????????? ???????????? AI ???????????? ???????????????.");
  cy.wait(10000);

  cy.get(".detailBtn")
    .eq(0)
    .click();
  cy.url().should("include", "&page=detail");
  cy.contains("???????????? ????????????")
    .scrollIntoView()
    .should("be.visible");
  cy.get("svg").should("be.visible");
  cy.contains("featureImportance").click();
  cy.get("svg").should("be.visible");

  cy.get("#apiTab").click({ force: true });
  cy.contains("https://api.clickai.ai/").should("be.visible");
  cy.get("#javaScriptTab").click({ force: true });
  cy.contains('"apptoken"').should("be.visible");
  cy.contains("xhr.send(data);").should("be.visible");
  cy.get("#pythonTab").click({ force: true });
  cy.contains('response = requests.request("POST", url, data=json.dumps(payload), headers=headers)').should("be.visible");
  cy.get("#wgetTab").click({ force: true });
  cy.contains("O predict_result.txt").should("be.visible");
  cy.get("#javaTab").click({ force: true });
  cy.contains("client.newCall(request).execute();").should("be.visible");

  cy.get("#shareAIApp").click();
  cy.get("#close_modal_btn").click();

  cy.get("#model").click();
  cy.contains("????????????")
    .eq(0)
    .click();
  cy.wait(1000);
  cy.contains("?????? ????????? AI??? ????????? ???????????? ?????? ?????? Top 5")
    .scrollIntoView()
    .should("be.visible");
  cy.contains("????????? ????????????").click({ force: true });
  cy.wait(1000);
  cy.contains("???????????????").click({ force: true });
  cy.get("#sendApiBtn").click();
  cy.wait(5000);
});

Cypress.Commands.add("getLabelUrl", () => {
  const token = document.cookie.match("(^|;) ?" + "jwt" + "=([^;]*)(;|$)")[2];
  const user = document.cookie.match("(^|;) ?" + "user" + "=([^;]*)(;|$)")[2];
  const userId = JSON.parse(user).id;

  let labelProjectId;
  let folderName;
  let labelFileId;

  axios
    .get(backendurl.concat(`labelprojects/?token=${token}`))
    .then((res) => {
      const data = res.data.projects;
      labelProjectId = data[0].id;
      folderName = data[0].folderName;
    })
    .then(() => {
      axios
        .get(backendurl.concat(`listobjects/?token=${token}&sorting=create_at&tab=prepare&count=10&start=1&labelprojectId=${labelProjectId}`))
        .then((res) => {
          const file = res.data.file;
          labelFileId = file[0].id;
        })
        .then(() => {
          const labelUrl = `${labelurl}/${labelProjectId}/${labelFileId}/?token=${token}`;
          cy.visit(labelUrl);
        });
    });
});

Cypress.Commands.add("enterMyItem", () => {
  if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
    //??????
    cy.login();
    cy.get("#menuMarketPurchaseList").click({
      multiple: true,
      force: true,
    });
  } else {
    cy.login();
    cy.get("#menuMarketPurchaseList").click({
      multiple: true,
      force: true,
    });
  }
});

Cypress.Commands.add("enterDataset", () => {
  if (cy.url().userInvocationStack.indexOf("https://console.ds2.ai") == -1) {
    //??????
    cy.login();
    cy.get('a[href*="/admin/dataconnector"]').click({
      multiple: true,
      force: true,
    });
    cy.url().should("include", "/admin/dataconnector");
  } else {
    cy.login();
    cy.get('a[href*="/admin/dataconnector"]').click({
      multiple: true,
      force: true,
    });
    cy.url().should("include", "/admin/dataconnector");
  }
});

Cypress.Commands.add("enterClickAi", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/project");
  } else {
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/project");
  }
});

Cypress.Commands.add("enterSkyhubAi", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get('a[href*="/admin/skyhubai"]').click({ multiple: true, force: true });
    cy.url().should("include", "/admin/skyhubai");

    //??? ????????? ?????? ????????? ????????????
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  } else {
    cy.login();
    cy.get('a[href*="/admin/skyhubai"]').click({ multiple: true, force: true });
    cy.url().should("include", "/admin/skyhubai");

    //??? ????????? ?????? ????????? ????????????
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  }
});

Cypress.Commands.add("enterCustomTraning", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");

    cy.login();

    cy.wait("@getCardData", { timeout: 100000 }).then(() => {
      cy.get("#menuProject").click({ multiple: true, force: true });
      cy.get("#sideSubMenujupyterproject").click({
        multiple: true,
        force: true,
      });
      cy.url().should("include", "/admin/jupyterproject");
      cy.get("body").then(($body) => {
        if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
          cy.get("#serviceStart").click();
        }
      });
    });

    //??? ????????? ?????? ????????? ????????????
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  } else {
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");
    cy.login();

    cy.wait("@getCardData", { timeout: 100000 }).then(() => {
      cy.get("#menuProject").click({ multiple: true, force: true });
      cy.get("#sideSubMenujupyterproject").click({
        multiple: true,
        force: true,
      });
      cy.url().should("include", "/admin/jupyterproject");
      cy.get("body").then(($body) => {
        if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
          cy.get("#serviceStart").click();
        }
      });
    });
  }
});

Cypress.Commands.add("enterAutoML", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.get("#sideSubMenuautomlproject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/automlproject");

    //??? ????????? ?????? ????????? ????????????
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  } else {
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.get("#sideSubMenuautomlproject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/automlproject");

    //??? ????????? ?????? ????????? ????????????
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("????????? ????????????") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  }
});

Cypress.Commands.add("enterUserInfo", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get("#setting_link").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/setting/userinfo");
  } else {
    cy.login(userInfo.email, userInfo.password);
    cy.get("#setting_link").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/setting/userinfo");
  }
});

Cypress.Commands.add("enterMenuMarketList", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get("#menuMarketList").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/marketList");
  } else {
    cy.login(userInfo.email, userInfo.password);
    cy.get("#menuMarketList").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/marketList");
  }
});

Cypress.Commands.add("login_Card", (innerFucntuon) => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");
    cy.loginAsync();
    cy.wait("@getCardData", { timeout: 10000 }).then(() => {
      innerFucntuon();
    });
  } else {
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");
    cy.loginAsync();
    cy.wait("@getCardData", { timeout: 10000 }).then(() => {
      innerFucntuon();
    });
  }
});

Cypress.Commands.add("enterMenuMarketList_Card", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");
    cy.loginAsync();
    cy.wait("@getCardData", { timeout: 10000 }).then(() => {
      cy.get("#menuMarketList").click({ multiple: true, force: true });
      cy.url().should("include", "/admin/marketList");
    });
  } else {
    cy.intercept(`${backendurl}main-page/*`, (req) => {
      req.continue((res) => {
        res.body.pgregistration = {
          CardNo: "5464-****-****-2560",
          CardType: "payple",
          CreatedAt: "2021-08-05T09:43:35",
        };
      });
    }).as("getCardData");
    cy.loginAsync();
    cy.wait("@getCardData", { timeout: 10000 }).then(() => {
      cy.get("#menuMarketList").click({ multiple: true, force: true });
      cy.url().should("include", "/admin/marketList");
    });
  }
});

Cypress.Commands.add("enterMenuMarketList_2Weeks", () => {
  cy.intercept(`${backendurl}main-page/*`, (req) => {
    req.continue((res) => {
      res.body.me = {
        ...res.body.me,
        first_dance_training_expiration_date: null,
        first_offline_ad_expiration_date: null,
        first_offline_shop_expiration_date: null,
        first_recovery_training_expiration_date: null,
        first_sport_training_expiration_date: null,
      };
    });
  }).as("get2WeeksData");

  cy.loginAsync();

  cy.wait("@get2WeeksData", { timeout: 10000 }).then(() => {
    if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
      cy.get("#menuMarketList").click({ multiple: true, force: true });
      cy.url().should("include", "/admin/marketList");
    } else {
      cy.get("#menuMarketList").click({ multiple: true, force: true });
      cy.url().should("include", "/admin/marketList");
    }
  });
});

Cypress.Commands.add("enterMenuMarketPurchaseList", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //??????
    cy.login();
    cy.get("#menuMarketPurchaseList").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/marketPurchaseList");
  } else {
    cy.login(userInfo.email, userInfo.password);
    cy.get("#menuMarketPurchaseList").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/marketPurchaseList");
  }
});

Cypress.Commands.add("matchClassInfo", (name, color) => {
  // ????????????, color?????? ?????? ????????? ?????? ?????????????
  cy.get("#labelclass_name_input").contains(name);
  cy.get(`input[value="${color}"]`).should("exist");
});

Cypress.Commands.add("modifyClassInfo", () => {
  // ???????????? input??? ?????? ????????????????
  cy.get("#labelclass_name_input").clear();
  cy.get("#labelclass_name_input")
    .type(`test class${new Date().getDate()}`)
    .contains(`test class${new Date().getDate()}`);

  // color picker??? color??? ?????? ?????????????
  cy.get(".saturation-black").click("topLeft", {
    multiple: true,
    force: true,
  });
  cy.get('input[value="#FFFFFF"]').should("exist");
});

Cypress.Commands.add("deleteAllClassLists", () => {
  cy.get("[type='checkbox']")
    .first()
    .check();
  cy.get("#delete_class_btn").click();
  cy.get("#yesBtn").click();
});

Cypress.Commands.add("checkENMode", () => {
  cy.en().then(() => {
    // ???????????? ?????? ?????? ?????? ?????? ?????? ?????? ??????????????? ??????
    cy.contains(/[???-???|???-???|???-???]/).and(($el) => {
      expect($el).to.contain("?????????");
    });
  });

  cy.ko();
});

Cypress.Commands.add("deleteAllRemainingClasses", () => {
  cy.url().then((url) => {
    let jwt = "";
    let labelClasses = [];
    let projectId = "";

    const urlArr = url.split("/");
    projectId = urlArr[urlArr.length - 1];

    cy.getCookie("jwt")
      .should("exist")
      .then((c) => {
        jwt = c.value;
        cy.intercept("GET", `/labelclasses/?token=${jwt}&labelproject_Id=${projectId}&page=1&count=10`).as("getLabelclasses");

        // '?????????'??? ??????
        cy.get("#class_tab").click();

        // ?????? response ??????????????? ?????? ????????? ??????
        cy.wait("@getLabelclasses", { timeout: 10000 })
          .then((interception) => {
            labelClasses = interception.response.body.labelclass;
          })
          .and(() => {
            // ????????? ???????????? ????????? ?????? ??????
            if (labelClasses.length > 0) {
              cy.get('th [type="checkbox"]').check();
              cy.contains("?????? ??????").click();
              cy.contains("???").click();
            }
          });
      });
  });
});

Cypress.Commands.add("checkLabelListByCondition", (type, value, expected) => {
  let optionText = "";
  const selector = type === "asignee" ? "#work_asignee_select_box" : "#status_select_box";

  switch (value) {
    case "null":
      optionText = "??????";
      break;
    case "all":
      optionText = "??????";

      break;
    case "prepare":
      optionText = "?????????";

      break;
    case "working":
      optionText = "?????????";

      break;
    case "ready":
      optionText = "???????????????";

      break;
    case "review":
      optionText = "?????????";

      break;
    case "reject":
      optionText = "??????";

      break;
    case "done":
      optionText = "??????";

      break;

    default:
      break;
  }

  cy.get(selector).select(optionText);
  cy.get(selector).should("have.value", value);

  cy.contains("????????? ???????????? ????????????.").should(expected ? "not.exist" : "exist");
});

Cypress.Commands.add("resetLabelprojectInfo", (sampleProjectName, sampleProjectDesc) => {
  cy.get("#label_project_name")
    .clear({ force: true })
    .type(sampleProjectName, { force: true });
  cy.get("#change_name_btn").click({ force: true });
  cy.get("#change_name_confirm_btn").click({ force: true });
  cy.get("#yes_btn").click({ force: true });

  cy.get("#label_project_detail")
    .clear({ force: true })
    .type(sampleProjectDesc, { force: true });
  cy.get("#change_detail_btn").click({ force: true });
  cy.get("#change_detail_confirm_btn").click({ force: true });
  cy.get("#yes_btn").click({ force: true });
});
