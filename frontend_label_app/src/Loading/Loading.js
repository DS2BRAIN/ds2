import React from "react";
import loader from '../assets/image/q6.svg';


const Loading = () => {

    return(
        <img src={loader} alt={"logo"}/>
    )
}

export default React.memo(Loading);