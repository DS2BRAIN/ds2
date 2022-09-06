import React from "react";
import { useHistory } from "react-router";

import { TEMPLATES_MOCKUP } from "./Mockups";
import TemplateCard from "./TemplateCard";

import Button from "components/CustomButtons/Button";
import { Grid } from "@mui/material";

const TemplateGrid = () => {
  const history = useHistory();
  const mockupTemplates = TEMPLATES_MOCKUP;

  const openDiagram = () => {
    history.push("/admin/diagram");
  };

  return (
    <Grid>
      <Grid container justifyContent="flex-end" sx={{ mb: 10, py: 1.5 }}>
        <Button shape="greenContainedSquare" size="lg" onClick={openDiagram}>
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
