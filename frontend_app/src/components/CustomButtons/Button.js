import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getAnalytics, logEvent } from "firebase/analytics";
import amplitude from "amplitude-js";

import Button from "@mui/material/Button";
import PastMaterialButton from "./PastMaterialButton";
import { styled } from "@mui/material/styles";

const TraceableButton = (props) => {
  const { id, shape, size, disabled, children, ...rest } = props;
  const { user } = useSelector((state) => ({ user: state.user }), []);
  const [isAgreedBehaviorStatistics, setIsAgreedBehaviorStatistics] = useState(
    false
  );
  const fontSizeDict = {
    xl: "18px",
    lg: "16px",
    md: "15px",
    sm: "14px",
    xs: "12px",
  };
  const paddingSizeDict = {
    xl: "16px 20px",
    lg: "12px 16px",
    md: "8px 16px",
    sm: "4px 12px",
    xs: "2px 8px",
  };

  let cusSize = size ? size : "md";
  let cusFontSize = fontSizeDict[cusSize];
  let cusPadding = paddingSizeDict[cusSize];
  let cusBorderRadius = shape?.includes("Square") ? "4px" : "50px";

  const defaultColor = "white";
  const defaultBackColor = "transparent";
  let cusColor = defaultColor;
  let cusBorderColor = defaultBackColor;
  let cusBackgroundColor = defaultBackColor;
  let cusHoverColor = defaultBackColor;

  let isOutlined = false;
  let isContained = false;
  if (shape) {
    if (shape.includes("Outlined")) {
      isOutlined = true;
    } else if (shape.includes("Contained")) {
      isContained = true;
      cusColor = "white";
    }
  }

  let pointColor = "";

  if (disabled) {
    pointColor = "var(--textMediumGrey)";
    cusColor = pointColor;
    cusBorderColor = pointColor;
    if (isContained) {
      cusColor = "var(--textWhite6) !important";
      cusBackgroundColor = pointColor;
      cusHoverColor = pointColor;
    }
  } else if (shape) {
    if (shape.includes("green")) {
      pointColor = "var(--secondary1)";
      cusHoverColor = "rgba(27, 198, 180, 0.04)";
      if (isContained) {
        cusHoverColor = "var(--secondaryHovering)";
      }
    } else if (shape.includes("blue")) {
      pointColor = "var(--primary1)";
      cusHoverColor = "rgba(10, 132, 255, 0.04)";
      if (isContained) {
        cusHoverColor = "var(--primaryHovering)";
      }
    } else if (shape.includes("white")) {
      pointColor = "#f0f0f0";
      cusHoverColor = "rgba(255, 255, 255, 0.04)";
      // no white contained
    } else if (shape.includes("red")) {
      pointColor = "red";
      cusHoverColor = "rgba(255, 0, 0, 0.04)";
      // no red contained
    }
    if (isOutlined) cusBorderColor = pointColor;
    if (isContained) {
      cusBackgroundColor = pointColor;
    } else {
      cusColor = pointColor;
    }
  }

  const DefaultButton = styled(Button)`
    min-width: 0;
    border-width: 1px;
    border-style: solid;
    border-color: ${cusBorderColor};
    border-radius: ${cusBorderRadius};
    background-color: ${cusBackgroundColor};
    padding: ${cusPadding};
    color: ${cusColor};
    font-size: ${cusFontSize};
    font-weight: 600;
    line-height: 1;
    &:hover {
      background-color: ${cusHoverColor};
      ${isContained ? `border-color: ${cusHoverColor};` : null}
    }
  `;

  const customClick = () => {
    let eventText = "Click_Button_" + children;
    if (id) {
      eventText = "Click_Button_" + id;
    }
    props.onClick();
    if (user?.me && user?.me.isAgreedBehaviorStatistics) {
      amplitude.getInstance().logEvent("button click : " + window.location.pathname + " : " + eventText);
    }
  }

  if (disabled) {
    return (
      <DefaultButton id={id} disabled={disabled} {...rest}>
        {children}
      </DefaultButton>
    );
  } else if (shape) {
    return (
      <DefaultButton id={id} onClick={customClick} {...rest}>
        {children}
      </DefaultButton>
    );
  } else
    return (
      <PastMaterialButton id={id} onClick={customClick} {...rest}>
        {children}
      </PastMaterialButton>
    );
};

export default TraceableButton;
