import React, { useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/styles";
import Button from "components/CustomButtons/Button";
import Flag from "./Flags";

const useStyle = makeStyles({
  ContinentMainBox: {
    overflow: "hidden",
  },
  ContinentBoxHead: {
    paddingLeft: "5px",
    background: "linear-gradient(45deg,#1F4582,#5EC3B5)",
    height: "30px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#E2E2E2",
  },
  RegionButton: {
    marginTop: "4px",
    fontSize: "12px",
    width: "95%",
    height: "50px",
    borderRadius: "3px",
    background: "linear-gradient(45deg,#255199 5%,#FFFFFF)",
    "&:hover": {
      transition: "all 0.1 liner",
      transform: "scaleY(1.1)",
      border: "2px solid green",
    },
    "&:focus": {
      border: "3px solid green",
    },
  },
});

const defaultStyles = {
  btn_FocusedRegionButton: {
    border: "3px solid green",
  },
};

const ContinentBox = ({ continentData, cloudRegion, continentName, setWarning }) => {
  const classes = useStyle();
  return (
    <Grid
      container
      item
      xs={11}
      justify="flex-end"
      alignItems="center"
      className={classes.ContinentMainBox}
    >
      <Grid
        item
        xs={12}
        container
        alignItems="center"
        className={classes.ContinentBoxHead}
      >
        {continentName}
      </Grid>
      {continentData !== null &&
        continentData.map((region, i) => (
          <Button
            id={`region_${region.display_name.split("(")[1].replace(")","").replace(" ","").replace(".","")}`}
            key={i + "_region_section"+region.display_name}
            onClick={() => {
              cloudRegion[1](region);
              setWarning("");
            }}
            className={classes.RegionButton}
            style={
              cloudRegion[0] === region
                ? defaultStyles.btn_FocusedRegionButton
                : {}
            }
          >
            {" "}
            {/* 국기 이미지는 정확한 국가명을 통해 추가 : 추후 제작 */}
            <Grid container item xs={12} justify="flex-start">
              <img
                src={`https://flagcdn.com/w80/${
                  Flag[region.display_name.split("(")[1].split(")")[0]]
                }.png`}
                style={{ width: "20px", height: "15px", marginRight: "4px" }}
              />
              {`${region.display_name}`}
            </Grid>
          </Button>
        ))}
    </Grid>
  );
};
export default ContinentBox;
