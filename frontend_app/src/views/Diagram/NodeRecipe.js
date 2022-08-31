import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { openErrorSnackbarRequestAction } from "redux/reducers/messages.js";

import { IconButton, InputBase, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";

export const NodeRecipe = (props) => {
  const dispatch = useDispatch();
  const { id, content, inputs, outputs, data } = props;

  const isChangableNode = !(
    id === "node-1" ||
    id === "node-2" ||
    id === "node-3"
  );

  const [title, setTitle] = useState("New node");
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
      {isChangableNode && (
        <IconButton
          icon="times"
          size="small"
          sx={{ mt: -4, alignSelf: "flex-end" }}
          onClick={() => data.onClick(id)}
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
      {inputs.map((port, index) => (
        <div
          key={"i-" + index}
          className="custom-node-port custom-node-port-in"
        >
          {React.cloneElement(port, {
            className: "circle-port circle-porter-in",
          })}
          {data.inputsDetail && (
            <span>{data.inputsDetail[port.props.id].title || "not found"}</span>
          )}
        </div>
      ))}
      {outputs.map((port, index) => (
        <div
          key={"i-" + index}
          className="custom-node-port custom-node-port-out"
        >
          {React.cloneElement(port, {
            className: "circle-port circle-porter-out",
          })}
          {data.outputsDetail && (
            <span>
              {data.outputsDetail[port.props.id].title ||
                "not found" + port.props.id}
            </span>
          )}
        </div>
      ))}
      {data.portAdd && data.portAdd.in && (
        <div className={"port-add-container port-add-in"}>
          {React.cloneElement(outputs[outputs.length - 1], {
            className: "port-add",
          })}
        </div>
      )}
    </div>
  );
};
