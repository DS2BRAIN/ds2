import React, { useState } from "react";

import { TEMPLATES_MOCKUP } from "./Mockups";
import TemplateCard from "./TemplateCard";

import Button from "components/CustomButtons/Button";
import { Grid } from "@mui/material";

const TemplateGrid = () => {
  const mockupTemplates = TEMPLATES_MOCKUP;

  return (
    <Grid>
      <Grid container justifyContent="flex-end" sx={{ mb: 10 }}>
        <Button shape="greenContainedSquare" size="lg">
          Start from scratch
        </Button>
      </Grid>
      <Grid container spacing={2}>
        {mockupTemplates.map((template) => (
          <TemplateCard
            key={`template_card_${template.id}`}
            template={template}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default TemplateGrid;
