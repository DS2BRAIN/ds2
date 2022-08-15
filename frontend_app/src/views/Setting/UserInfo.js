import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import * as api from "controller/api.js";
import currentTheme from "assets/jss/custom.js";
import {
  postResetPasswordRequestAction,
  postWithdrawRequestAction,
  postCompanyLogoRequestAction,
  putUserRequestAction,
  stopUserLoadingRequestAction,
} from "redux/reducers/user.js";
import {
  askModalRequestAction,
  askAppCodeRequestAction,
  askDeleteLogoRequestAction,
} from "redux/reducers/messages.js";
import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { convertToLocalDateStr } from "components/Function/globalFunc.js";
import { fileurl } from "controller/api";
import { IS_ENTERPRISE } from "variables/common";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button";

import { Modal, TextField } from "@material-ui/core";
import { CircularProgress, Container, Grid, IconButton } from "@mui/material";
import CloseIcon from "@material-ui/icons/Close";
import RefreshIcon from "@material-ui/icons/Refresh";

const UserInfo = ({ history }) => {
  const classes = currentTheme();
  const dispatch = useDispatch();
  const { user, messages } = useSelector(
    (state) => ({ user: state.user, messages: state.messages }),
    []
  );
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  const [promotionCode, setPromotionCode] = useState("");
  const [userName, setUserName] = useState("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [externalAiKeys, setExternalAiKeys] = useState({
    google: null,
    amazone: null,
    azure: null,
  });
  const [selectedCompany, setSelectedCompany] = useState("");
  const [amazonId, setAmazonId] = useState("");
  const [amazonKey, setAmazonKey] = useState("");
  const [azureKey, setAzureKey] = useState("");
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [googleFile, setGoogleFile] = useState(null);
  const [googleAiModels, setGoogleAiModels] = useState([]);
  const [amazonAiModels, setAmazonAiModels] = useState([]);
  const [azureAiModels, setAzureAiModels] = useState([]);
  const [addedKeysObj, setAddedKeysObj] = useState(1);
  const [modalLoading, setIsModalLoading] = useState(false);
  const [userCreatedDate, setUserCreatedDate] = useState("");
  const [imgUrl, setImgUrl] = useState({ file: "", url: "" });
  const amazon_color =
    fileurl + "asset/front/img/externalAiLogo/Amazon logo color.png";
  const amazon_gray =
    fileurl + "asset/front/img/externalAiLogo/Amazon logo greyscale.png";
  const azure_color =
    fileurl + "asset/front/img/externalAiLogo/Azure logo colored.png";
  const azure_gray =
    fileurl + "asset/front/img/externalAiLogo/Azure logo greyscale.png";
  const google_color =
    fileurl + "asset/front/img/externalAiLogo/google-logo.png";
  const google_gray =
    fileurl + "asset/front/img/externalAiLogo/google-logo greyscale.png";

  useEffect(() => {
    if (user.me) {
      const convertedDateStr = convertToLocalDateStr(user.me.created_at);

      setUserCreatedDate(user.me.created_at ? `${convertedDateStr}` : "");
      setCompany(user.me.company ? user.me.company : "");
      setCompanyLogoUrl(user.me.companyLogoUrl);
      setImgUrl({ file: "", url: user.me.companyLogoUrl });
      setPromotionCode(user.me.promotionCode ? user.me.promotionCode : "");
      setUserName(user.me.name ? user.me.name : "");
      onSetExternalAiKeyFunc();
      setIsLoading(false);
    }
  }, [user.me]);

  useEffect(() => {
    if (messages.shouldCloseModal) {
      setIsModalLoading(false);
      setIsPasswordModalOpen(false);
      setIsWithdrawModalOpen(false);
      setIsInfoModalOpen(false);
      setCompany(user.me.company ? user.me.company : "");
      setCompanyLogoUrl(user.me.companyLogoUrl);
      setImgUrl({ file: "", url: user.me.companyLogoUrl });
      setPromotionCode(user.me.promotionCode ? user.me.promotionCode : "");
      setUserName(user.me.name ? user.me.name : "");
      dispatch(stopUserLoadingRequestAction());
    }
  }, [messages.shouldCloseModal]);

  useEffect(() => {
    if (user.isWidthDrawDone) {
      setTimeout(() => {
        history.push("/signout/");
      }, 5000);
    }
  }, [user.isWidthDrawDone]);

  useEffect(() => {
    if (user.externalAiModels) {
      onSetExternalAiKeyFunc();
    }
  }, [user.externalAiModels]);

  const onSetExternalAiKeyFunc = () => {
    let aiKeys = {};
    let googleKey = [];
    let amazonKey = [];
    let azureKey = [];
    let googleModels = ["all"];
    let amazonModels = ["all"];
    let azureModels = ["all"];

    user.externalAiModels &&
      user.externalAiModels.forEach((model) => {
        if (
          model.modelpath === "google" &&
          model.apiKey &&
          googleKey.indexOf(model.apiKey) === -1
        ) {
          googleKey.push(model.apiKey);
        }
        if (
          model.modelpath === "amazon" &&
          model.apiKey &&
          amazonKey.indexOf(model.apiKey) === -1
        ) {
          amazonKey.push(model.apiKey);
        }
        if (
          model.modelpath === "azure" &&
          model.apiKey &&
          azureKey.indexOf(model.apiKey) === -1
        ) {
          azureKey.push(model.apiKey);
        }
      });

    if (googleKey.length > 0) aiKeys["google"] = googleKey;
    if (amazonKey.length > 0) aiKeys["amazon"] = amazonKey;
    if (azureKey.length > 0) aiKeys["azure"] = azureKey;
    setExternalAiKeys(aiKeys);
  };
  const openInfoModal = () => {
    setIsInfoModalOpen(true);
  };
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };
  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
  };
  const closeModalOpen = () => {
    if (user.isWidthDrawDone) return;
    setCompany(user.me.company);
    setCompanyLogoUrl(user.me.companyLogoUrl);
    setPromotionCode(user.me.promotionCode);
    dispatch(askModalRequestAction());
  };
  const inputNameChange = (event) => {
    event.preventDefault();
    setUserName(event.target.value);
  };
  const inputNowPasswordChange = (event) => {
    event.preventDefault();
    setPassword(event.target.value);
  };
  const inputCompanyChange = (event) => {
    event.preventDefault();
    setCompany(event.target.value);
  };
  const inputPromotionCode = (event) => {
    event.preventDefault();
    setPromotionCode(event.target.value);
  };

  const onDropFile = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    const file = e.target.files[0];
    reader.onloadend = () => {
      setImgUrl({ file: file, url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const onDropGoogleFile = (e) => {
    const file = e.target.files[0];
    if (file.type.indexOf("json") === -1) {
      dispatch(
        openErrorSnackbarRequestAction(
          t(`올바른 파일 형식이 아닙니다. JSON 파일만 업로드 가능합니다.`)
        )
      );
    }
    setGoogleFile(file);
  };

  const onChangeKeyValue = (type) => {
    setSelectedCompany(type);
  };

  const withdrawSubmit = async (event) => {
    event.preventDefault();
    const data = {
      id: user.me.email,
      password: password,
    };
    dispatch(postWithdrawRequestAction(data));
  };
  const infoChangeSubmit = (event) => {
    event.preventDefault();
    const data = {
      name: userName,
      promotionCode: promotionCode,
      company: company,
    };
    setIsModalLoading(true);
    dispatch(putUserRequestAction(data));
    if (imgUrl.file) {
      dispatch(postCompanyLogoRequestAction(imgUrl.file));
    }
  };

  const inputAmazonIdChange = (event) => {
    event.preventDefault();
    setAmazonId(event.target.value);
  };
  const inputAmazonKeyChange = (event) => {
    event.preventDefault();
    setAmazonKey(event.target.value);
  };
  const inputAzureKeyChange = (event) => {
    event.preventDefault();
    setAzureKey(event.target.value);
  };
  const inputAzureEndpointChange = (event) => {
    event.preventDefault();
    setAzureEndpoint(event.target.value);
  };

  const onOpenChangeExternalKey = () => {
    setIsKeyModalOpen(true);
  };

  const closeKeyModalOpen = () => {
    setIsKeyModalOpen(false);
  };

  const dropFilesReject = (type) => {
    dispatch(
      openErrorSnackbarRequestAction(
        t(`올바른 파일 형식이 아닙니다. ${type}파일만 업로드 가능합니다.`)
      )
    );
  };

  const dropFiles = () => {
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been uploaded")));
  };

  const deleteFiles = () => {
    dispatch(openSuccessSnackbarRequestAction(t("The file(s) has been deleted")));
  };

  const keyChangeSubmit = async () => {
    if (azureKey.length > 0 && azureEndpoint.length === 0) {
      dispatch(
        openErrorSnackbarRequestAction(t("Please enter Azure Endpoint"))
      );
      return;
    }
    if (azureEndpoint.length > 0 && azureKey.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter your Azure Key")));
      return;
    }
    if (amazonId.length > 0 && amazonKey.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter your Amazon Key.")));
      return;
    }
    if (amazonKey.length > 0 && amazonId.length === 0) {
      dispatch(openErrorSnackbarRequestAction(t("Please enter your Amazon Id")));
      return;
    }
    await setIsLoading(true);
    const changedKeyCount = await changeExternalAiKeys();
    await reRenderAfterAiKeys(changedKeyCount);
  };

  const changeExternalAiKeys = async () => {
    let changedKeyCount = 0;
    if (amazonKey.length > 0 && amazonId.length > 0) {
      await api.postAmazonExternalAiKey(amazonKey, amazonId).then((res) => {
        changedKeyCount++;
      });
    }
    if (azureKey.length > 0 && azureEndpoint.length > 0) {
      await api.postAzureExternalAiKey(azureKey, azureEndpoint).then((res) => {
        changedKeyCount++;
      });
    }

    if (googleFile) {
      await api.postGoogleExternalAiKey(googleFile).then((res) => {
        changedKeyCount++;
      });
    }
    return changedKeyCount;
  };

  const reRenderAfterAiKeys = (count) => {
    if (count === 0) {
      setIsLoading(false);
      dispatch(
        openErrorSnackbarRequestAction(t("Please enter at least one key."))
      );
    } else {
      dispatch(
        openSuccessSnackbarRequestAction(t("Key registration completed."))
      );
      window.location.reload();
    }
  };

  // <GridItem xs={6} lg={4} >
  //     {t('제공자')}
  // </GridItem>
  // <GridItem xs={6} lg={8} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
  //     <div onClick={onOpenChangeExternalKey} style={{width: '100%', fontSize: '12px', color: '#2979FF', display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'flex-end'}}>
  //         Key 수정하기
  //         <NavigateNextIcon className="keyArrowIcon" style={{marginBottom: '4px'}} />
  //     </div>
  //     <div id="aiKeyContainer" style={{width: '100%'}}>
  //         <Table className={classes.table} aria-label="simple table">
  //             <TableBody>
  //                 <TableRow >
  //                     <TableCell width = "5%" id="keyValueCell" >
  //                         {
  //                         externalAiKeys.google ?
  //                         <CheckCircleIcon className="checkIcons" />
  //                         :
  //                         <CheckCircleIcon className="unCheckIcons" />
  //                         }
  //                     </TableCell>
  //                     <TableCell width = "20%" id="keyValueCell" >
  //                         {
  //                         externalAiKeys.google ?
  //                         <img src={google_color} style={{display: 'flex', height: '32px'}} />
  //                         :
  //                         <img src={google_gray} style={{display: 'flex', height: '32px'}} />
  //                         }
  //                     </TableCell>
  //                     <TableCell width = "55%" id="keyNameCell" >
  //                         {
  //                         externalAiKeys.google &&
  //                         externalAiKeys.google.map((google)=>{
  //                             return(
  //                                 <div>{google}</div>
  //                             )
  //                         })
  //                         }
  //                     </TableCell>
  //                     <TableCell width = "20%" id="keyNameCell" >
  //                     </TableCell>
  //                 </TableRow>
  //                 <TableRow >
  //                     <TableCell width = "5%" id="keyValueCell" >
  //                         <div style={{display: 'flex', alignItems: 'center'}}>
  //                         {
  //                         externalAiKeys.amazon ?
  //                         <CheckCircleIcon className="checkIcons" />
  //                         :
  //                         <CheckCircleIcon className="unCheckIcons" />
  //                         }
  //                         </div>
  //                     </TableCell>
  //                     <TableCell id="keyValueCell" width = "20%">
  //                         {
  //                         externalAiKeys.amazon ?
  //                         <img src={amazon_color} style={{display: 'flex', height: '24px'}} />
  //                         :
  //                         <img src={amazon_gray} style={{display: 'flex', height: '24px'}} />
  //                         }
  //                     </TableCell>
  //                     <TableCell id="keyNameCell" width = "55%">
  //                     {
  //                         externalAiKeys.amazon &&
  //                         externalAiKeys.amazon.map((amazon)=>{
  //                             return(
  //                                 <div>{amazon}</div>
  //                             )
  //                         })
  //                     }
  //                     </TableCell>
  //                     <TableCell id="keyNameCell" width = "20%">
  //                     </TableCell>
  //                 </TableRow>
  //                 <TableRow >
  //                     <TableCell width = "5%" id="keyValueCell" >
  //                         {
  //                         externalAiKeys.azure ?
  //                         <CheckCircleIcon className="checkIcons" />
  //                         :
  //                         <CheckCircleIcon className="unCheckIcons" />
  //                         }
  //                     </TableCell>
  //                     <TableCell id="keyValueCell" width = "20%">
  //                         {
  //                         externalAiKeys.azure ?
  //                         <img src={azure_color} style={{display: 'flex', height: '30px'}} />
  //                         :
  //                         <img src={azure_gray} style={{display: 'flex', height: '30px'}} />
  //                         }
  //                     </TableCell>
  //                     <TableCell id="keyNameCell" width = "55%">
  //                     {
  //                         externalAiKeys.azure &&
  //                         externalAiKeys.azure.map((azure)=>{
  //                             return(
  //                                 <div>{azure}</div>
  //                             )
  //                         })
  //                     }
  //                     </TableCell>
  //                     <TableCell id="keyNameCell" width = "20%">
  //                     </TableCell>
  //                 </TableRow>
  //             </TableBody>
  //         </Table>
  //     </div>
  // </GridItem>

  // <Modal
  // aria-labelledby="simple-modal-title"
  // aria-describedby="simple-modal-description"
  // open={isKeyModalOpen}
  // onClose={closeKeyModalOpen}
  // className={classes.modalContainer}
  // >
  //     {
  //     isKeyModalOpen &&
  //     (
  //     isLoading ?
  //     <div className={classes.keyModalContent}>
  //         <Loading size={200} />
  //         <p>{t('AI Key is being registered. please wait for a moment.')}</p>
  //     </div>
  //     :
  //     <div className={classes.keyModalContent}>
  //         <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: 'space-between'}}>
  //             <div style={{fontSize: '14px', color: '#2979FF'}}>
  //                 <b>AI Key 값을 입력하세요.</b>
  //             </div>
  //             <CloseIcon className={classes.closeImg} onClick={closeKeyModalOpen}/>
  //         </div>
  //         <div className={classes.formLayout}>
  //             <GridContainer style={{width: '100%', display:'flex', alignItems:'center'}}>
  //                 <GridItem xs={2}>
  //                     <img src={amazon_color} style={{display: 'flex', height: '24px'}} />
  //                 </GridItem>
  //                 <GridItem xs={10} style={{display: 'flex', alignItems: 'center'}} >
  //                     <div style={{background: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '5px', padding: '10px', width: '100%'}}>
  //                         <div id="amazonKeyBtn" onClick={()=>{onChangeKeyValue('amazon')}} style={{fontSize: '14px', color: '#2979FF', display: 'flex', justifyContent: 'flex-end', marginBottom: '5px', cursor: 'pointer'}}>
  //                             KEY 값 변경
  //                         </div>
  //                         <div style={{display: 'flex', alignItems: 'center', border: '1px solid #E7E7E7', borderRadius: '5px', marginBottom: '4px'}}>
  //                             <div style={{width: '160px', padding: '0px 4px', fontSize: '12px', color: '#989898', borderRight: '1px solid #E7E7E7'}}>
  //                                 ACCESS_KEY_ID
  //                             </div>
  //                             <InputBase
  //                                 style={selectedCompany === 'amazon' ? {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)'}
  //                                 : {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)', background: '#E7E7E7'}}
  //                                 value={amazonId}
  //                                 onChange={inputAmazonIdChange}
  //                                 placeholder={'ACCESS_KEY_ID를 입력해주세요.'}
  //                                 onFocus={selectedCompany === 'amazon' ? true : false}
  //                                 disabled={selectedCompany === 'amazon' ? false : true}
  //                                 multiline={false}
  //                                 id="amazonAccessKeyInput"
  //                             />
  //                         </div>
  //                         <div style={{display: 'flex', alignItems: 'center', border: '1px solid #E7E7E7', borderRadius: '5px'}}>
  //                             <div style={{width: '160px', padding: '0px 4px', fontSize: '12px', color: '#989898', borderRight: '1px solid #E7E7E7'}}>
  //                             SECRET_ACCESS_KEY
  //                             </div>
  //                             <InputBase
  //                                 style={selectedCompany === 'amazon' ? {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)'}
  //                                 : {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)', background: '#E7E7E7'}}
  //                                 value={amazonKey}
  //                                 onChange={inputAmazonKeyChange}
  //                                 placeholder={'SECRET_ACCESS_KEY를 입력해주세요.'}
  //                                 disabled={selectedCompany === 'amazon' ? false : true}
  //                                 multiline={false}
  //                                 id="amazonSecretKeyInput"
  //                             />
  //                         </div>
  //                     </div>
  //                 </GridItem>
  //                 <GridItem xs={12} style={{height: '10px'}}></GridItem>
  //                 <GridItem xs={2}>
  //                     <img src={azure_color} style={{display: 'flex', height: '32px'}} />
  //                 </GridItem>
  //                 <GridItem xs={10} style={{display: 'flex', alignItems: 'center'}} >
  //                     <div style={{background: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '5px', padding: '10px', width: '100%'}}>
  //                         <div  id="azureKeyBtn" onClick={()=>{onChangeKeyValue('azure')}} style={{fontSize: '14px', color: '#2979FF', display: 'flex', justifyContent: 'flex-end', marginBottom: '5px', cursor: 'pointer'}}>
  //                             KEY 값 변경
  //                         </div>
  //                         <div style={{display: 'flex', alignItems: 'center', border: '1px solid #E7E7E7', borderRadius: '5px', marginBottom: '4px'}}>
  //                             <div style={{width: '160px', padding: '0px 4px', fontSize: '12px', color: '#989898', borderRight: '1px solid #E7E7E7'}}>
  //                                 SUBSCRIPTION_KEY
  //                             </div>
  //                             <InputBase
  //                                 style={selectedCompany === 'azure' ? {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)'}
  //                                 : {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)', background: '#E7E7E7'}}
  //                                 value={azureKey}
  //                                 onChange={inputAzureKeyChange}
  //                                 placeholder={'SUBSCRIPTION_KEY를 입력해주세요.'}
  //                                 onFocus={selectedCompany === 'azure' ? true : false}
  //                                 disabled={selectedCompany === 'azure' ? false : true}
  //                                 multiline={false}
  //                                 id="azureKeyInput"
  //                             />
  //                         </div>
  //                         <div style={{display: 'flex', alignItems: 'center', border: '1px solid #E7E7E7', borderRadius: '5px'}}>
  //                             <div style={{width: '160px', padding: '0px 4px', fontSize: '12px', color: '#989898', borderRight: '1px solid #E7E7E7'}}>
  //                                 AZURE_ENDPOINT
  //                             </div>
  //                             <InputBase
  //                                 style={selectedCompany === 'azure' ? {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)'}
  //                                 : {fontSize: '12px', paddingLeft : '8px', width: 'calc(100% - 160px)', background: '#E7E7E7'}}
  //                                 value={azureEndpoint}
  //                                 onChange={inputAzureEndpointChange}
  //                                 placeholder={'AZURE_ENDPOINT를 입력해주세요.'}
  //                                 disabled={selectedCompany === 'azure' ? false : true}
  //                                 multiline={false}
  //                                 id="azureEndpointInput"
  //                             />
  //                         </div>
  //                     </div>
  //                 </GridItem>
  //                 <GridItem xs={12} style={{height: '10px'}}></GridItem>
  //                 <GridItem xs={2}>
  //                     <img src={google_color} style={{display: 'flex', height: '32px'}} />
  //                 </GridItem>
  //                 <GridItem xs={10} style={{display: 'flex', alignItems: 'center'}} >
  //                     <div style={{display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', border: '1px solid #E7E7E7', borderRadius: '5px', padding: '2px 10px', width: '100%'}}>
  //                         <div style={{fontSize: '12px'}}>
  //                             {googleFile ? googleFile.name : '파일을 등록해주세요.'}
  //                         </div>
  //                         <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
  //                             <label htmlFor="googleFile" >
  //                                 <AddCircleOutlineIcon id="addGoogleFile" style={{cursor: 'pointer'}} onClick={()=>{onChangeKeyValue('google')}}/>
  //                             </label>
  //                             <input id="googleFile" onChange={onDropGoogleFile} style={{display: 'none'}} type="file" />
  //                         </div>
  //                     </div>
  //                 </GridItem>
  //             </GridContainer>
  //         </div>
  //         <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
  //             <Button
  //                 id='submitBtn'
  //                 style={{width: '216px', position: 'absolute', bottom: '24px', padding: '0px !important', border: '1px solid #2979FF', boxSizing: 'border-box', borderRadius: '3px', color: '#2979FF'}}
  //                 onClick={keyChangeSubmit}>
  //                 {t('Submit')}
  //             </Button>
  //         </div>
  //     </div>
  //     )
  //     }
  // </Modal>
  return isLoading ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    user.me && (
      <Container
        component="main"
        maxWidth="false"
        disableGutters
        className={classes.mainCard}
      >
        <Grid className={classes.settingTitle} sx={{ mt: 7, mb: 3.5 }}>
          Account Info
        </Grid>
        <Grid container rowSpacing={3} sx={{ px: 3, pb: 3 }}>
          {user.me && user.me.name && (
            <Grid
              item
              xs={12}
              id="userName"
              className={classes.accountNameTitle}
            >
              {user.me.name ? user.me.name : t("name")}
            </Grid>
          )}
          <Grid item container xs={10} rowSpacing={2} sx={{ p: 2 }}>
            <Grid item xs={12}>
              <div className={classes.settingFontWhite6}>{t("E-mail")}</div>
              <div className={classes.settingFontWhite87} id="userEmail">
                {user.me.email}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.settingFontWhite6}>{t("Company name")}</div>
              <div className={classes.settingFontWhite87} id="userCompany">
                {user.me.company ? user.me.company : "-"}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.settingFontWhite6}>{t("Company logo")}</div>
              <div className={classes.settingFontWhite87}>
                {user && user.me && user.me.companyLogoUrl ? (
                  <img
                    id="userCompanyLogo"
                    src={
                      (IS_ENTERPRISE ? fileurl + "static" : "") +
                      user.me.companyLogoUrl
                    }
                    style={{ width: "50px", maxHeight: "50px" }}
                  />
                ) : (
                  "-"
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.settingFontWhite6}>{t("Member since …")}</div>
              <div className={classes.settingFontWhite87} id="userCreateDate">
                {userCreatedDate}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={classes.settingFontWhite6}>{t("App code")}</div>
              <div
                className={classes.settingFontWhite87}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div id="userAppCode">{user.me.appTokenCode}</div>
                <RefreshIcon
                  id="resetAppCodeIcon"
                  style={{ marginLeft: "10px", cursor: "pointer" }}
                  onClick={() => {
                    dispatch(askAppCodeRequestAction());
                  }}
                />
              </div>
            </Grid>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {IS_ENTERPRISE ? null : (
              <Button
                id="change_password_btn"
                shape="whiteOutlined"
                sx={{ mb: 2 }}
                onClick={() => {
                  openPasswordModal();
                }}
              >
                {t("Change password")}
              </Button>
            )}
            <Button
              id="change_userinfo_btn"
              shape="whiteOutlined"
              onClick={openInfoModal}
            >
              {t(" Edit info")}
            </Button>
          </Grid>
        </Grid>
        <div className={classes.settingTitle}></div>
        <Grid
          sx={{
            mt: 2,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            id="withdrawUser"
            shape="whiteOutlined"
            size="sm"
            onClick={openWithdrawModal}
          >
            {t("Delete account")}
          </Button>
        </Grid>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isInfoModalOpen}
          onClose={closeModalOpen}
          className={classes.modalContainer}
        >
          <div className={classes.modalContent}>
            <Grid container justifyContent="space-between">
              <div className={classes.title}>{t(" Edit info")}</div>
              <IconButton
                id="close_userinfomodal_btn"
                className={classes.closeImg}
                sx={{ p: 0 }}
                onClick={closeModalOpen}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Grid>
            {modalLoading ? (
              <div className={classes.loadingModal}>
                <CircularProgress size={30} sx={{ mb: 2 }} />
                {t("Account information is being changed. Please wait")}
              </div>
            ) : (
              <Grid sx={{ p: 2 }}>
                <Grid
                  container
                  alignItems="center"
                  rowSpacing={3}
                  sx={{ mt: 0, mb: 4 }}
                >
                  <Grid item xs={4}>
                    {t("Name")}
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      id="userNameInput"
                      placeholder={t("Please enter your name")}
                      onChange={inputNameChange}
                      value={userName}
                      className={classes.textField}
                    />
                  </Grid>
                  {IS_ENTERPRISE ? (
                    <>
                      <Grid item xs={4}>
                        {t("Password")}
                      </Grid>
                      <Grid item xs={8}>
                        <Grid sx={{ pl: 1 }}>
                          {t("Please contact the administrator.")}
                        </Grid>
                      </Grid>
                    </>
                  ) : null}
                  <Grid item xs={4}>
                    {t("Company name")}
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      id="companyInput"
                      placeholder={t("Enter your company name")}
                      onChange={inputCompanyChange}
                      value={company}
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    {t("Company logo")}
                  </Grid>
                  <Grid item xs={8}>
                    <div
                      id="logoContainer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {imgUrl?.url !== null &&
                      imgUrl?.url?.indexOf("user/") == -1 ? (
                        <img
                          className="profile_preview"
                          src={imgUrl.url}
                          style={{
                            width: "50px",
                            maxHeight: "50px",
                            marginLeft: "10px",
                          }}
                        />
                      ) : user && user.me && user.me.companyLogoUrl ? (
                        <img
                          className="profile_preview"
                          src={
                            (IS_ENTERPRISE ? fileurl + "static" : "") +
                            user.me.companyLogoUrl
                          }
                          style={{
                            width: "50px",
                            maxHeight: "50px",
                            marginLeft: "10px",
                          }}
                        />
                      ) : (
                        "-"
                      )}

                      <div style={{ display: "flex" }}>
                        {!companyLogoUrl ? (
                          <label
                            htmlFor="files"
                            className={classes.modelTabHighlightButton}
                          >
                            {t("Upload")}
                          </label>
                        ) : (
                          <>
                            <div
                              htmlFor="files"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "60px",
                                marginRight: "8px",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              <label
                                id="reChangeLogo"
                                htmlFor="files"
                                style={{
                                  marginBottom: 0,
                                  color: "var(--primary1)",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  lineHeight: 1,
                                  cursor: "pointer",
                                }}
                              >
                                {t("Edit")}
                              </label>
                            </div>
                            <Button
                              id="delete_logo_btn"
                              shape="blue"
                              size="sm"
                              onClick={() => {
                                dispatch(askDeleteLogoRequestAction());
                              }}
                            >
                              {t("Delete")}
                            </Button>
                          </>
                        )}
                        <input
                          id="files"
                          name="companyLogo"
                          onChange={onDropFile}
                          style={{ display: "none" }}
                          type="file"
                        />
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    {t("Promotion code")}
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      id="promotionInput"
                      placeholder={t("Please enter the correct promotion code")}
                      className={classes.textField}
                      onChange={inputPromotionCode}
                      value={promotionCode}
                    />
                  </Grid>
                </Grid>
                <Grid container justifyContent="center">
                  <Button
                    id="submitBtn"
                    shape="greenOutlined"
                    sx={{ minWidth: "160px" }}
                    onClick={infoChangeSubmit}
                  >
                    {t("Submit")}
                  </Button>
                </Grid>
              </Grid>
            )}
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isPasswordModalOpen}
          onClose={closeModalOpen}
          className={classes.modalContainer}
        >
          <div className={classes.modalContent}>
            <Grid container justifyContent="space-between">
              <div className={classes.title}>{t("Change password")}</div>
              <IconButton
                id="close_passwordmodal_btn"
                sx={{ p: 0 }}
                onClick={closeModalOpen}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Grid>
            {user.isLoading ? (
              <div className={classes.loadingModal}>
                <CircularProgress size={30} sx={{ mb: 2 }} />
                {t(
                  "고객님의 메일로 링크를 보내드렸습니다. 메일발송까지 5-10분 정도 소요될 수 있습니다."
                )}
              </div>
            ) : (
              <>
                <Grid sx={{ p: 2 }}>
                  <div>
                    {t(
                      "비밀번호 변경은 고객님의 메일로 발송된 링크를 통해 변경하실 수 있습니다."
                    )}
                  </div>
                  <div>
                    {t("If you want to continue, please press the Submit button.")}
                  </div>
                </Grid>
                <Grid container justifyContent="center">
                  <Button
                    id="submitBtn"
                    shape="greenOutlined"
                    sx={{ minWidth: "160px" }}
                    onClick={() => {
                      dispatch(
                        postResetPasswordRequestAction({
                          email: user.me.email,
                          lang: user.language,
                        })
                      );
                    }}
                  >
                    {t("Submit")}
                  </Button>
                </Grid>
              </>
            )}
          </div>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={isWithdrawModalOpen}
          onClose={closeModalOpen}
          className={classes.modalContainer}
        >
          <div className={classes.modalContent}>
            <GridContainer>
              {user.isLoading ? (
                <div className={classes.loading}>
                  <CircularProgress size={20} style={{ mb: 2 }} />
                  <div>{t("Your request to terminate your account has been submitted. Please wait")}</div>
                  <div>{t("You will be automatically logged out once your account is deleted")}</div>
                </div>
              ) : (
                <>
                  <GridItem xs={12}>
                    <CloseIcon
                      id="withdrawModalClose"
                      className={classes.closeImg}
                      onClick={closeModalOpen}
                    />
                  </GridItem>
                  <GridItem xs={12}>
                    <div className={classes.title}>{t("Delete account")}</div>
                  </GridItem>
                  <GridItem xs={12} style={{ padding: "0 30px !important" }}>
                    <div className={classes.formLayout}>
                      <GridContainer
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {user.isWidthDrawDone ? (
                          <GridItem xs={12} style={{ marginBottom: "10px" }}>
                            <div>
                              {t(
                                "개인 정보 방침에 따라 회원 탈퇴 시 모든 데이터는 90일 보관 후 영구적으로 삭제됩니다."
                              )}
                            </div>
                            <div>
                              {t(
                                "10초뒤에 자동로그아웃됩니다. 그동안 서비스를 이용해주셔서 감사합니다."
                              )}
                            </div>
                          </GridItem>
                        ) : (
                          <>
                            <GridItem xs={12} style={{ marginBottom: "10px" }}>
                              <div>
                                {t(
                                  "개인 정보 방침에 따라 회원 탈퇴 시 모든 데이터는 90일 보관 후 영구적으로 삭제됩니다."
                                )}
                              </div>
                              <div>
                                {t(
                                  "회원탈퇴후 계정복구가 불가능합니다. 계속 진행하시려면 비밀번호를 입력해주세요."
                                )}
                              </div>
                            </GridItem>
                            <GridItem xs={4}>{t("Current password")}</GridItem>
                            <GridItem xs={8}>
                              <TextField
                                id="passwordInput"
                                type="password"
                                autoComplete="current-password"
                                className={classes.textField}
                                margin="normal"
                                onChange={inputNowPasswordChange}
                                value={password}
                              />
                            </GridItem>
                          </>
                        )}
                      </GridContainer>
                    </div>
                  </GridItem>
                  {!user.isWidthDrawDone && (
                    <GridItem xs={12}>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Button
                          id="submitBtn"
                          shape="greenOutlined"
                          sx={{ minWidth: "160px" }}
                          onClick={withdrawSubmit}
                        >
                          {t("Submit")}
                        </Button>
                      </div>
                    </GridItem>
                  )}
                </>
              )}
            </GridContainer>
          </div>
        </Modal>
      </Container>
    )
  );
};

export default React.memo(UserInfo);
