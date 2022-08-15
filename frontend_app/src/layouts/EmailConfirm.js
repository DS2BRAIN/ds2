import React,{useEffect} from "react";
import Grid from "@material-ui/core/Grid";
import * as api from "../controller/api";
import Loading from "../components/Loading/Loading";
import currentTheme from "assets/jss/custom.js";
const queryString = require("query-string");
const EmailConfirm=(props)=>{
    const classes=currentTheme();
    const parsed = queryString.parse(props.location.search);
    useEffect(()=>{
        if(parsed.user!==undefined && parsed.token!==undefined){
            let data={
                user:parsed.user,
                token:parsed.token,
            }
            api.emailConfirm(data)
            .then(res=>{
                props.history.push("/signout?email_confirm=true");
            })
            .catch(err=>{
                props.history.push("/signout?email_confirm=false");
            })
        }
    },[])
    return(
        <Grid container item xs={12} justify="center" alignItems="center" alignContent="center" style={{height:"100vh"}}>
                <Grid container item xs={12} justify="center">
                    이메일 확인 진행중
                </Grid>
                <Grid container item xs={12} justify="center">
                    <Loading size={100} />
                </Grid>
                    
        </Grid>
    );
}
export default EmailConfirm;