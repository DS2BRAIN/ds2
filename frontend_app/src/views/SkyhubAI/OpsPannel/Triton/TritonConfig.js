import React, { useState } from "react";

import TritonConfigButton from "./TritonConfigButton";
import TritonConfigModal from "./TritonConfigModal";

const TritonConfig = ({ newClasses }) => {
  const [isOpen, setIsOpen] = useState();

  const openModalHandler = (isOpen) => {
    setIsOpen(isOpen);
  };

  return (
    <>
      <TritonConfigButton
        newClasses={newClasses}
        openModalHandler={openModalHandler}
      />
      <TritonConfigModal isOpen={isOpen} openModalHandler={openModalHandler} />
    </>
  );
};

export default TritonConfig;
