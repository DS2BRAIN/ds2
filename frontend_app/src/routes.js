/*!

=========================================================
* Material Dashboard React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import DataconnectorPage from "views/Dataconnector/Dataconnector.js";
import SettingPage from "views/Setting/Setting.js";
import SignOut from "layouts/SignOut.js";
import FavoriteLists from "views/AILists/FavoriteLists";
import OpsProjectList from "./views/SkyhubAI/OpsProjectList";
import MarketList from "views/Market/MarketList";
import LabelprojectList from "views/Labelling/LabelprojectList";
import MarketPurchaseList from "views/Market/MarketPurchaseList";
import { IS_ENTERPRISE } from "variables/common";

import Person from "@material-ui/icons/Person";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import LabelIcon from "@material-ui/icons/Label";

const dashboardRoutes = !IS_ENTERPRISE
  ? [
      {
        name: "Studio",
      },
      {
        path: "/dataconnector",
        nickName: "DS2 DATASET | Dataset",
        name: "dataconnector",
        icon: LabelIcon,
        component: DataconnectorPage,
        layout: "/admin",
      },
      // {
      //   path: "/jupyterproject",
      //   nickName: "학습서버 임대",
      //   name: "jupyterproject",
      //   icon: AttachFileIcon,
      //   component: JupyterProject,
      //   layout: "/admin",
      // },
      {
        path: "/labelling?page=1&sorting=created_at&desc=true&rows=10",
        nickName: "LABELING AI | Annotation",
        name: "라벨링",
        icon: LabelIcon,
        component: LabelprojectList,
        layout: "/admin",
      },
      // {
      //   path: "/project",
      //   nickName: "CLICK AI | Model",
      //   name: "Project",
      //   icon: AndroidIcon,
      //   component: ProjectPage,
      //   layout: "/admin",
      //   subMenu: [
      //     {
      //       id: "jupyterproject",
      //       name: "jupyterproject",
      //       nickName: "커스텀 학습",
      //     },
      //     {
      //       id: "automlproject",
      //       name: "automlproject",
      //       nickName: "AutoML",
      //     },
      //     // { id: "favorite", name: "favorite", nickName: "즐겨찾는 인공지능" },
      //     // {
      //     //   id: "dataconnector",
      //     //   name: "dataconnector",
      //     //   nickName: "데이터 준비",
      //     // },
      //     // { id: "ready", name: "ready", nickName: "준비 완료" },
      //     // {
      //     //   id: "developing",
      //     //   name: "developing",
      //     //   nickName: "인공지능 학습 중",
      //     // },
      //     // { id: "done", name: "done", nickName: "데이터 분석 / 예측" },
      //   ],
      // },
      {
        path: "/dataconnector",
        nickName: "데이터 저장소",
        name: "Dataconnector",
        icon: AttachFileIcon,
        component: DataconnectorPage,
        layout: "/admin",
      },
      // {
      //   path: "/favorite",
      //   nickName: "즐겨찾는 인공지능",
      //   name: "Favorite",
      //   icon: AttachFileIcon,
      //   component: FavoriteLists,
      //   layout: "/admin",
      // },
      // {
      //   path: "/jupyterproject",
      //   nickName: "학습서버 임대",
      //   name: "jupyterproject",
      //   icon: AttachFileIcon,
      //   component: JupyterProject,
      //   layout: "/admin",
      // },
      {
        path: "/skyhubai",
        nickName: "SKYHUB AI | Deploy",
        name: "SkyhubAI",
        icon: AttachFileIcon,
        component: OpsProjectList,
        layout: "/admin",
      },
      {
        name: "AI Market",
      },
      {
        path: "/marketList",
        nickName: "상품 리스트",
        name: "MarketList",
        icon: AttachFileIcon,
        component: MarketList,
        layout: "/admin",
      },
      {
        path: "/marketPurchaseList",
        nickName: "내 상품",
        name: "MarketPurchaseList",
        icon: AttachFileIcon,
        component: MarketPurchaseList,
        layout: "/admin",
      },
      // {
      //   path: "/lv",
      //   nickName: "음성 라벨링",
      //   name: "VoiceLabeling",
      //   icon: LabelIcon,
      //   component: LabelVoicePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ls",
      //   nickName: "정형화 라벨링",
      //   name: "StructureLabeling",
      //   icon: LabelIcon,
      //   component: LabelStructurePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ln",
      //   nickName: "자연어 라벨링",
      //   name: "NaturalLabeling",
      //   icon: LabelIcon,
      //   component: LabelNaturalPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/li",
      //   nickName: "단일 이미지 라벨링",
      //   name: "ImageLabeling",
      //   icon: LabelIcon,
      //   component: LabelImagePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/preparedai",
      //   nickName: "준비된 인공지능",
      //   name: "Preparedai",
      //   icon: ListIcon,
      //   component: ModelListsPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/engineai",
      //   nickName: "Engine AI",
      //   name: "EngineAI",
      //   icon: ListIcon,
      //   component: EngineAIListPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ecosystem",
      //   nickName: "에코시스템",
      //   name: "Ecosystem",
      //   icon: DnsIcon,
      //   component: EcosystemPage,
      //   layout: "/admin"
      // },
      // {
      //   path: "/instruction",
      //   nickName: "사용법",
      //   name: "Instruction",
      //   icon: LabelIcon,
      //   component: InstructionPage,
      //   layout: "/admin",
      // },
      {
        path: "/setting",
        nickName: "세팅",
        name: "Setting",
        icon: Person,
        rtlName: "",
        component: SettingPage,
        layout: "/admin",
      },
      {
        path: "/signout",
        nickName: "로그아웃",
        name: "SignOut",
        rtlName: "",
        icon: ExitToAppIcon,
        component: SignOut,
        layout: "/admin",
      },
    ]
  : [
      {
        name: "Studio",
      },
      {
        path: "/dataconnector",
        nickName: "DS2 DATASET | Dataset",
        name: "dataconnector",
        icon: LabelIcon,
        component: DataconnectorPage,
        layout: "/admin",
      },
      // {
      //   path: "/jupyterproject",
      //   nickName: "학습서버 임대",
      //   name: "jupyterproject",
      //   icon: AttachFileIcon,
      //   component: JupyterProject,
      //   layout: "/admin",
      // },
      {
        path: "/labelling?page=1&sorting=created_at&desc=true&rows=10",
        nickName: "LABELING AI | Annotation",
        name: "라벨링",
        icon: LabelIcon,
        component: LabelprojectList,
        layout: "/admin",
      },
      // {
      //   path: "/project",
      //   nickName: "CLICK AI | Model",
      //   name: "Project",
      //   icon: AndroidIcon,
      //   component: ProjectPage,
      //   layout: "/admin",
      //   subMenu: [
      //     {
      //       id: "jupyterproject",
      //       name: "jupyterproject",
      //       nickName: "커스텀 학습",
      //     },
      //     {
      //       id: "automlproject",
      //       name: "automlproject",
      //       nickName: "AutoML",
      //     },
      //     // { id: "favorite", name: "favorite", nickName: "즐겨찾는 인공지능" },
      //     // {
      //     //   id: "dataconnector",
      //     //   name: "dataconnector",
      //     //   nickName: "데이터 준비",
      //     // },
      //     // { id: "ready", name: "ready", nickName: "준비 완료" },
      //     // {
      //     //   id: "developing",
      //     //   name: "developing",
      //     //   nickName: "인공지능 학습 중",
      //     // },
      //     // { id: "done", name: "done", nickName: "데이터 분석 / 예측" },
      //   ],
      // },
      {
        path: "/dataconnector",
        nickName: "데이터 저장소",
        name: "Dataconnector",
        icon: AttachFileIcon,
        component: DataconnectorPage,
        layout: "/admin",
      },
      {
        path: "/favorite",
        nickName: "즐겨찾는 인공지능",
        name: "Favorite",
        icon: AttachFileIcon,
        component: FavoriteLists,
        layout: "/admin",
      },
      // {
      //   path: "/jupyterproject",
      //   nickName: "학습서버 임대",
      //   name: "jupyterproject",
      //   icon: AttachFileIcon,
      //   component: JupyterProject,
      //   layout: "/admin",
      // },
      {
        path: "/skyhubai",
        nickName: "SKYHUB AI | Deploy",
        name: "SkyhubAI",
        icon: AttachFileIcon,
        component: OpsProjectList,
        layout: "/admin",
      },
      // {
      //   name: "AI Market",
      // },
      // {
      //   path: "/marketList",
      //   nickName: "상품 리스트",
      //   name: "MarketList",
      //   icon: AttachFileIcon,
      //   component: MarketList,
      //   layout: "/admin",
      // },
      // {
      //   path: "/marketPurchaseList",
      //   nickName: "내 상품",
      //   name: "MarketPurchaseList",
      //   icon: AttachFileIcon,
      //   component: MarketPurchaseList,
      //   layout: "/admin",
      // },
      // {
      //   path: "/lv",
      //   nickName: "음성 라벨링",
      //   name: "VoiceLabeling",
      //   icon: LabelIcon,
      //   component: LabelVoicePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ls",
      //   nickName: "정형화 라벨링",
      //   name: "StructureLabeling",
      //   icon: LabelIcon,
      //   component: LabelStructurePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ln",
      //   nickName: "자연어 라벨링",
      //   name: "NaturalLabeling",
      //   icon: LabelIcon,
      //   component: LabelNaturalPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/li",
      //   nickName: "단일 이미지 라벨링",
      //   name: "ImageLabeling",
      //   icon: LabelIcon,
      //   component: LabelImagePage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/preparedai",
      //   nickName: "준비된 인공지능",
      //   name: "Preparedai",
      //   icon: ListIcon,
      //   component: ModelListsPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/engineai",
      //   nickName: "Engine AI",
      //   name: "EngineAI",
      //   icon: ListIcon,
      //   component: EngineAIListPage,
      //   layout: "/admin",
      // },
      // {
      //   path: "/ecosystem",
      //   nickName: "에코시스템",
      //   name: "Ecosystem",
      //   icon: DnsIcon,
      //   component: EcosystemPage,
      //   layout: "/admin"
      // },
      // {
      //   path: "/instruction",
      //   nickName: "사용법",
      //   name: "Instruction",
      //   icon: LabelIcon,
      //   component: InstructionPage,
      //   layout: "/admin",
      // },
      {
        path: "/setting",
        nickName: "세팅",
        name: "Setting",
        icon: Person,
        rtlName: "",
        component: SettingPage,
        layout: "/admin",
      },
      {
        path: "/signout",
        nickName: "로그아웃",
        name: "SignOut",
        rtlName: "",
        icon: ExitToAppIcon,
        component: SignOut,
        layout: "/admin",
      },
    ];
// : [
//     {
//       path: "/project",
//       nickName: "CLICK AI | Model",
//       name: "Project",
//       icon: AndroidIcon,
//       component: ProjectPage,
//       layout: "/admin",
//       subMenu: [
//         { id: "favorite", name: "favorite", nickName: "즐겨찾는 인공지능" },
//         // {
//         //   id: "dataconnector",
//         //   name: "dataconnector",
//         //   nickName: "데이터 준비",
//         // },
//         { id: "ready", name: "ready", nickName: "준비 완료" },
//         {
//           id: "developing",
//           name: "developing",
//           nickName: "인공지능 학습 중",
//         },
//         { id: "done", name: "done", nickName: "데이터 분석 / 예측" },
//       ],
//     },
//     {
//       path: "/dataconnector",
//       nickName: "데이터 저장소",
//       name: "Dataconnector",
//       icon: AttachFileIcon,
//       component: DataconnectorPage,
//       layout: "/admin",
//     },
//     {
//       path: "/favorite",
//       nickName: "즐겨찾는 인공지능",
//       name: "Favorite",
//       icon: AttachFileIcon,
//       component: FavoriteLists,
//       layout: "/admin",
//     },
//     // {
//     //   path: "/labelling",
//     //   nickName: "라벨링",
//     //   name: "Labelling",
//     //   icon: LabelIcon,
//     //   component: Labelling,
//     //   layout: "/admin",
//     // },
//     // {
//     //   path: "/preparedai",
//     //   nickName: "준비된 인공지능",
//     //   name: "Preparedai",
//     //   icon: ListIcon,
//     //   component: ModelListsPage,
//     //   layout: "/admin",
//     // },
//     // {
//     //   path: "/engineai",
//     //   nickName: "Engine AI",
//     //   name: "EngineAI",
//     //   icon: ListIcon,
//     //   component: EngineAIListPage,
//     //   layout: "/admin",
//     // },
//     {
//       path: "/instruction",
//       nickName: "사용법",
//       name: "Instruction",
//       icon: LabelIcon,
//       component: InstructionPage,
//       layout: "/admin",
//     },
//     {
//       path: "/setting",
//       nickName: "세팅",
//       name: "Setting",
//       icon: Person,
//       rtlName: "",
//       component: SettingPage,
//       layout: "/admin",
//     },
//     {
//       path: "/signout",
//       nickName: "로그아웃",
//       name: "SignOut",
//       rtlName: "",
//       icon: ExitToAppIcon,
//       component: SignOut,
//       layout: "/admin",
//     },
//   ];

export default dashboardRoutes;
