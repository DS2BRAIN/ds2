import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";

const PastMaterialButton = (props) => {
  const { id, ...rest } = props;

  return <Button id={id} {...rest} />;
};

export default PastMaterialButton;
