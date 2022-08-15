import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import LinearProgress from '@material-ui/core/LinearProgress';
import currentTheme from "assets/jss/custom.js";
import Container from "@material-ui/core/Container";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { currentThemeColor } from "assets/jss/custom";


const UserCount = () => {
    const classes = currentTheme();
    const user = useSelector(state => (state.user), []);
    const { t } = useTranslation();

    return (
        user && user.me && user.me.usageplan &&
        <>
        <div className={classes.settingTitle} style={{marginBottom: '16px'}}>
            Total Usage
        </div>
        <GridContainer style={{width: '100%', display:'flex' }}>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '20px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Number of projects')}
                </div>
                <div style={{width: '60%'}}>
                    <LinearProgress
                    variant="determinate"
                    color="blue"
                    value={(+user.me.cumulativeProjectCount) / (user.me.usageplan.planName === 'trial' ? 0 : +user.me.remainProjectCount + (+user.me.usageplan.projects * (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalProjectCount) * 100}
                    />
                </div>
                <div style={{width: '20%', marginLeft: '20px'}} className={classes.text87}>
                    <span id="projectCountText">{(+user.me.cumulativeProjectCount).toLocaleString()}</span> / <span id="projectTotalText">{user.me.usageplan.planName === 'trial' ? 0 : (+user.me.remainProjectCount + (+user.me.usageplan.projects* (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalProjectCount).toLocaleString()}</span> {t('')}
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Total disk capacity')}
                </div>
                <div style={{width: '60%'}}>
                    <LinearProgress
                    variant="determinate"
                    color="blue"
                    value={+user.me.cumulativeDiskUsage / (+user.me.remainDiskUsage + (+user.me.usageplan.storage * (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalDiskUsage) * 100}
                    />
                </div>
                <div style={{width: '20%', marginLeft: '20px'}} className={classes.text87}>
                    <span id="diskCountText">{(+user.me.cumulativeDiskUsage/ 1073741824).toFixed(2).toLocaleString()}</span> / <span id="diskTotalText">{((+user.me.remainDiskUsage + (+user.me.usageplan.storage * (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalDiskUsage) / 1073741824).toFixed(0).toLocaleString()}</span> (GB)
                </div>
            </GridItem>
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center' , margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Number of predictions')}
                </div>
                <div style={{width: '60%'}}>
                    <LinearProgress
                    variant="determinate"
                    color="blue"
                    value={+user.me.cumulativePredictCount / (+user.me.remainPredictCount + (+user.me.usageplan.noOfPrediction* (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalPredictCount) * 100}
                    />
                </div>
                <div style={{width: '20%', marginLeft: '20px'}} className={classes.text87}>
                    <span id="predictCountText">{(+user.me.cumulativePredictCount).toLocaleString()}</span> / <span id="predictTotalText">{(+user.me.remainPredictCount + (+user.me.usageplan.noOfPrediction* (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalPredictCount).toLocaleString()}</span> {t('')}
                </div>
            </GridItem>
            {
            user.me.usageplan.planName === 'business' &&
            <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Number of Labeling')}
                </div>
                <div style={{width: '60%'}}>
                    <LinearProgress
                    variant="determinate"
                    color="blue"
                    value={(+user.me.cumulativeLabelCount) / (+user.me.remainLabelCount + (+user.me.usageplan.noOfLabelling* (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalLabelCount) * 100}
                    />
                </div>
                <div style={{width: '20%', marginLeft: '20px'}} className={classes.text87}>
                    <span id="labeProjectCountText">{(+user.me.cumulativeLabelCount).toLocaleString()}</span> / <span id="labelPojectTotalText">{(+user.me.remainLabelCount + (+user.me.usageplan.noOfLabelling* (user.me.dynos ? +user.me.dynos : 1)) + +user.me.additionalLabelCount).toLocaleString()}</span> {t('')}
                </div>
            </GridItem>
            }
            {
            user.me.remainVoucher &&
                <GridItem xs={12} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '10px 0 10px 0'}}>
                <div style={{width: '20%'}} className={classes.settingFontWhite87}>
                    {t('Number of Vouchers')}
                </div>
                <div style={{width: '60%'}}>
                    <LinearProgress
                    variant="determinate"
                    color="blue"
                    value={(+user.me.remainVoucher) / (50) * 100}
                    />
                </div>
                <div style={{width: '20%', marginLeft: '20px'}} className={classes.text87}>
                    <span id="voucherCountText">{(+user.me.remainVoucher).toLocaleString()}</span> / <span id="voucherText">50</span> {t('')}
                </div>
            </GridItem>
            }
        </GridContainer>
        <div className={classes.settingTitle} style={{marginTop: '24px'}}>
        </div>
        </>
    );
}

export default React.memo(UserCount);
