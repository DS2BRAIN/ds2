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

export const backendurl = "https://dslabaa.ds2ai.ai/";
//const backendurl = 'http://dslabaa.clickai.ai:13002/';
export const labelurl = "https://staginglabelapp.ds2ai.ai";

export const userInfo = {
  email: "front_test@dslab.global",
  password: "",
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
    //채널톡 닫기
    const $body = $iframe.contents().find("body");
    cy.wrap($body)
      .find('[data-ch-testid="close-icon"]')
      .click();
  });
});

Cypress.Commands.add("en", () => {
  //영문 변환
  cy.get("#language_en_btn").click({ force: true });
});

Cypress.Commands.add("ko", () => {
  //한글 변환
  cy.get("#language_ko_btn").click({ force: true });
});

// Cypress.Commands.add("login", (id, password) => {
//   cy.visit("/signin");
//   cy.get("#email").type(id);
//   cy.get("#password").type(password);
//   cy.get("#signInBtn").click();
//   cy.wait(3000);
//   cy.url().should("include", "/admin");
//   cy.get("#language_select_form").click({ force: true });
//   cy.get('li[data-value="en"]').click({ force: true });
// });

Cypress.Commands.add("login", () => {
  cy.visit("/signout");
  //cy.visit("/signin");
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
  //   cy.wait(3000);
  cy.url().should("include", "/admin");
  cy.ko();
  cy.wait(1000);
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
  cy.get("#client-snackbar").should("contain", "샘플데이터는 값을 변경할 수 없습니다.");
  cy.contains("START").click();
  cy.get("#client-snackbar").should("contain", "샘플데이터를 사용하여 AI 모델링을 불러옵니다.");
  cy.wait(10000);

  cy.get(".detailBtn")
    .eq(0)
    .click();
  cy.url().should("include", "&page=detail");
  cy.contains("서비스앱 공유하기")
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
  cy.contains("분석하기")
    .eq(0)
    .click();
  cy.wait(1000);
  cy.contains("설명 가능한 AI로 찾아낸 연관성이 높은 칼럼 Top 5")
    .scrollIntoView()
    .should("be.visible");
  cy.contains("실시간 예측하기").click({ force: true });
  cy.wait(1000);
  cy.contains("랜덤채우기").click({ force: true });
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
    //로컬
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
    //로컬
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
    //로컬
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
    //로컬
    cy.login();
    cy.get('a[href*="/admin/skyhubai"]').click({ multiple: true, force: true });
    cy.url().should("include", "/admin/skyhubai");

    //첫 방문시 랜더 페이지 넘어가기
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  } else {
    cy.login();
    cy.get('a[href*="/admin/skyhubai"]').click({ multiple: true, force: true });
    cy.url().should("include", "/admin/skyhubai");

    //첫 방문시 랜더 페이지 넘어가기
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  }
});

Cypress.Commands.add("enterCustomTraning", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //로컬
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
        if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
          cy.get("#serviceStart").click();
        }
      });
    });

    //첫 방문시 랜더 페이지 넘어가기
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
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
        if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
          cy.get("#serviceStart").click();
        }
      });
    });
  }
});

Cypress.Commands.add("enterAutoML", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //로컬
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.get("#sideSubMenuautomlproject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/automlproject");

    //첫 방문시 랜더 페이지 넘어가기
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  } else {
    cy.login();
    cy.get("#menuProject").click({ multiple: true, force: true });
    cy.get("#sideSubMenuautomlproject").click({ multiple: true, force: true });
    cy.url().should("include", "/admin/automlproject");

    //첫 방문시 랜더 페이지 넘어가기
    cy.get("body").then(($body) => {
      if ($body[0].innerHTML.indexOf("서비스 시작하기") != -1) {
        cy.get("#serviceStart").click();
      }
    });
  }
});

Cypress.Commands.add("enterUserInfo", () => {
  if (cy.url().userInvocationStack.indexOf("http://localhost:3000") != -1) {
    //로컬
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
    //로컬
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
    //로컬
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
  // 클래스명, color값이 해당 정보의 값과 동일한가?
  cy.get("#labelclass_name_input").contains(name);
  cy.get(`input[value="${color}"]`).should("exist");
});

Cypress.Commands.add("modifyClassInfo", () => {
  // 클래스명 input에 값이 변경되는가?
  cy.get("#labelclass_name_input").clear();
  cy.get("#labelclass_name_input")
    .type(`test class${new Date().getDate()}`)
    .contains(`test class${new Date().getDate()}`);

  // color picker로 color값 변경 가능한가?
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
    // 한국어로 되어 있는 것이 언어 설정 토글 버튼만인지 판별
    cy.contains(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/).and(($el) => {
      expect($el).to.contain("한국어");
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

        // '클래스'탭 선택
        cy.get("#class_tab").click();

        // 요청 response 기다렸다가 라벨 클래스 저장
        cy.wait("@getLabelclasses", { timeout: 10000 })
          .then((interception) => {
            labelClasses = interception.response.body.labelclass;
          })
          .and(() => {
            // 등록된 클래스가 있으면 전체 삭제
            if (labelClasses.length > 0) {
              cy.get('th [type="checkbox"]').check();
              cy.contains("선택 삭제").click();
              cy.contains("예").click();
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
      optionText = "없음";
      break;
    case "all":
      optionText = "전체";

      break;
    case "prepare":
      optionText = "시작전";

      break;
    case "working":
      optionText = "진행중";

      break;
    case "ready":
      optionText = "오토라벨링";

      break;
    case "review":
      optionText = "검수중";

      break;
    case "reject":
      optionText = "반려";

      break;
    case "done":
      optionText = "완료";

      break;

    default:
      break;
  }

  cy.get(selector).select(optionText);
  cy.get(selector).should("have.value", value);

  cy.contains("라벨링 데이터가 없습니다.").should(expected ? "not.exist" : "exist");
});
