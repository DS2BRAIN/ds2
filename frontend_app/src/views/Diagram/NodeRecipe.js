import React from "react";

export const NodeRecipe = (props) => {
  const { inputs, outputs, data } = props;

  return (
    <div className="custom-node">
      <div className="custom-node-header" style={{ backgroundColor: "#fff" }}>
        Custom Node
      </div>
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
