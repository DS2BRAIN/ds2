import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";
import Button from "components/CustomButtons/Button";

import { Grid, IconButton, InputBase } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";

export const NodeRecipe = (props) => {
  const dispatch = useDispatch();
  const { id, content, inputs, outputs, data } = props;

  const isStartBlock = id === "node-start";
  const isEndBlock = id === "node-end";
  const isChangableBlock = !(isStartBlock || isEndBlock);

  const [title, setTitle] = useState(content ? content : "New block");
  const [isEdit, setIsEdit] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleEditOn = () => {
    setIsEdit(true);
  };

  const handleEditOff = (e) => {
    e.preventDefault();
    if (editValue) {
      setTitle(editValue);
      setIsEdit(false);
    } else {
      dispatch(openErrorSnackbarRequestAction("Please enter new title"));
    }
  };

  const handleTitle = (e) => {
    setEditValue(e.target.value);
  };

  return (
    <div className="custom-node">
      {isChangableBlock && (
        <IconButton
          icon="times"
          size="small"
          sx={{ mt: -4, alignSelf: "flex-end" }}
          onClick={() => data.onDeleteNode(id)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      <Grid className="custom-node-header" style={{ backgroundColor: "#fff" }}>
        {isEdit ? (
          <form onSubmit={handleEditOff}>
            <input
              placeholder="Enter new title"
              style={{ borderColor: "transparent" }}
              onChange={handleTitle}
            />
          </form>
        ) : (
          title
        )}
        <IconButton
          sx={{ mb: 0.5, p: 0.5, alignSelf: "flex-end" }}
          onClick={isEdit ? handleEditOff : handleEditOn}
        >
          {isEdit ? (
            <DoneIcon fontSize="small" sx={{ fill: "var(--secondary1)" }} />
          ) : (
            <EditIcon fontSize="small" sx={{ fill: "lightgray" }} />
          )}
        </IconButton>
      </Grid>
      <Grid sx={{ cursor: "pointer" }} onClick={() => data.onOpenDrawer(id)}>
        {inputs.map((port, index) => (
          <div
            key={"i-" + index}
            className="custom-node-port custom-node-port-in"
          >
            {React.cloneElement(port, {
              className: "circle-port circle-porter-in",
            })}
            <span>input node</span>
          </div>
        ))}
        {isChangableBlock && (
          <div className="custom-node-port custom-node-port-in">
            <Grid
              className="circle-port circle-porter-in"
              onClick={() => data.portAdd.func(id, "in")}
            ></Grid>
          </div>
        )}
        {outputs.map((port, index) => (
          <div
            key={"i-" + index}
            className="custom-node-port custom-node-port-out"
          >
            {React.cloneElement(port, {
              className: "circle-port circle-porter-out",
            })}
            <span>output node</span>
          </div>
        ))}
        {isChangableBlock && (
          <div className="custom-node-port custom-node-port-out">
            <Grid
              className="circle-port circle-porter-out"
              onClick={() => data.portAdd.func(id, "out")}
            ></Grid>
          </div>
        )}
      </Grid>
    </div>
  );
};
