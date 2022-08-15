import React from "react";
import Grid from "@material-ui/core/Grid";

const ServerForm = ({ server, index, clickedServer }) => {
  const click = () => {
    clickedServer[1](server);
  };
  return (
    <Grid
      container
      item
      xs={12}
      justify="center"
      alignItems="center"
      style={{
        color: "#FFFFFF",
        height: "30px",
        border:
          index !== 0 && server === clickedServer[0]
            ? "2px solid green"
            : "none",
        cursor: index !== 0 ? "pointer" : "default",
      }}
      onClick={index !== 0 && click}
    >
      <Grid
        container
        item
        xs={12}
        justify="center"
        alignItems="center"
        style={{
          borderBottom:
            index !== 0 && server === clickedServer[0]
              ? "none"
              : "1px solid #FFFFFF",
        }}
      >
        <Grid container item xs={2} justify="center" alignItems="center">
          {index !== 0 ? index : "NO"}
        </Grid>
        <Grid container item xs={2} justify="center" alignItems="center">
          {index !== 0 ? server.userId : "userId"}
        </Grid>
        <Grid container item xs={3} justify="center" alignItems="center">
          {index !== 0 ? server.movieId : "movieId"}
        </Grid>
        <Grid container item xs={2} justify="center" alignItems="center">
          {index !== 0 ? server.rating : "rating"}
        </Grid>
        <Grid container item xs={3} justify="center" alignItems="center">
          {index !== 0 ? server.timeslamp : "timeslamp"}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default ServerForm;
