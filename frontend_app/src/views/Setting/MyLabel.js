import React, {useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import LinearProgress from '@material-ui/core/LinearProgress';
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { useTranslation } from "react-i18next";
import { getAllWorkageRequestAction } from "redux/reducers/user.js";
import { useDispatch, useSelector } from 'react-redux';

const UserCount = () => {
    const classes = currentTheme();
    const dispatch = useDispatch();
    const { user, messages } = useSelector(state => ({ user: state.user, messages: state.messages }), []);
    const { t } = useTranslation();

    return (
        user.allWorkage && 
        <>
        <div className={classes.settingTitle} style={{marginBottom: '16px'}}>
            My Labeling
        </div>
        <GridContainer style={{width: '100%', display:'flex' }}>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '20px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Box')}
                </div>
                <div style={{width: '60%'}} className={classes.text87} id="labelBoxText"> 
                    {user.allWorkage && user.allWorkage.box ? user.allWorkage.box : 0}
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Polygon')}
                </div>
                <div style={{width: '60%'}} className={classes.text87} id="labelPolygonText">
                    {user.allWorkage && user.allWorkage.polygon ? user.allWorkage.polygon : 0}
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Magic Tool')}
                </div>
                <div style={{width: '60%'}} className={classes.text87} id="labelPolygonText">
                    {user.allWorkage && user.allWorkage.masic ? user.allWorkage.masic : 0}
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Total')}
                </div>
                <div style={{width: '60%'}} className={classes.text87} id="labelTotalText">
                    {user.allWorkage && user.allWorkage.box+user.allWorkage.polygon+user.allWorkage.masic}
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '20px 0 10px 0'}}>
                <div className={classes.settingFontWhite87}>
                ** {t('If you work with a magic tool, it is calculated as a box.')}
                </div>
            </GridItem> 
        </GridContainer>
        <div className={classes.settingTitle} style={{marginTop: '24px'}}>
        </div>
        </>
    );
}

export default React.memo(UserCount);
