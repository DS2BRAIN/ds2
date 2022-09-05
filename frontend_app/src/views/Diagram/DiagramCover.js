import React, { useState } from "react";

import Button from "components/CustomButtons/Button";
import DiagramPage from "./DiagramPage";

import { Grid, IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SaveIcon from "@mui/icons-material/Save";

const DiagramCover = () => {
  const [selectedStep, setSelectedStep] = useState("build");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const steps = ["build", "settings", "analyze", "monitoring"];

  const handleSelectedStep = (step) => {
    setSelectedStep(step);
  };

  const handlePublish = () => {
    setIsPublished(!isPublished);
  };

  const onSaveTemplate = () => {
    setIsSaved(true);
  };

  return (
    <Grid sx={{ height: "90vh", mt: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid>
          <span
            style={{
              fontWeight: 700,
              fontSize: "24px",
              textTransform: "uppercase",
            }}
          >
            Flow
          </span>
        </Grid>
        <Grid>
          {steps.map((step, index) => {
            let isSelected = selectedStep === step;
            return (
              <React.Fragment key={`step_${step}`}>
                {index > 0 && (
                  <KeyboardArrowRightIcon fontSize="small" sx={{ mx: 2 }} />
                )}
                <Button
                  shape={`${isSelected ? "green" : "white"}Square`}
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
          {isSaved ? (
            <>
              <Grid>
                <span style={{ fontSize: "14px" }}>Saved!</span>
              </Grid>
              <IconButton
                sx={{ mx: 1.5, backgroundColor: "var(--secondary1)" }}
              >
                <CheckIcon fontSize="small" sx={{ fill: "white" }} />
              </IconButton>
            </>
          ) : (
            <>
              <Grid>
                <span style={{ fontSize: "14px" }}>Unsaved changes</span>
              </Grid>
              <IconButton sx={{ mx: 1.5 }} onClick={onSaveTemplate}>
                <SaveIcon fontSize="small" />
              </IconButton>
            </>
          )}
          <Button
            id={`diagram_${isPublished ? "published" : "publish"}_btn`}
            shape={`${isPublished ? "green" : "blue"}ContainedSquare`}
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
