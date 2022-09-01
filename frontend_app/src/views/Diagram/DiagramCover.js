import React, { useState } from "react";

import Button from "components/CustomButtons/Button";
import DiagramPage from "./DiagramPage";

import { Grid } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const DiagramCover = () => {
  const [selectedStep, setSelectedStep] = useState("build");
  const [isPublished, setIsPublished] = useState(false);

  const steps = ["build", "settings", "analyze"];

  const handleSelectedStep = (step) => {
    setSelectedStep(step);
  };

  const handlePublish = () => {
    setIsPublished(!isPublished);
  };

  return (
    <Grid sx={{ height: "90vh", mt: 3 }}>
      <Grid container justifyContent="space-between">
        <Grid></Grid>
        <Grid>
          {steps.map((step, index) => {
            let isSelected = selectedStep === step;
            return (
              <React.Fragment key={`step_${step}`}>
                {index > 0 && (
                  <KeyboardArrowRightIcon fontSize="small" sx={{ mx: 2 }} />
                )}
                <Button
                  shape={isSelected ? "greenSquare" : "whiteSquare"}
                  size="lg"
                  style={{ cursor: isSelected && "default" }}
                  onClick={() => handleSelectedStep(step)}
                >
                  {step}
                </Button>
              </React.Fragment>
            );
          })}
        </Grid>
        <Grid sx={{ display: "flex", alignItems: "center" }}>
          <Button
            shape={isPublished ? "greenContainedSquare" : "blueContainedSquare"}
            sx={{ minWidth: "120px" }}
            onClick={handlePublish}
          >
            {isPublished ? "Published" : "Publish"}
          </Button>
        </Grid>
      </Grid>
      {selectedStep === "build" && <DiagramPage />}
    </Grid>
  );
};

export default DiagramCover;
