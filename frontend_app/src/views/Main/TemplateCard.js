import React, { useState } from "react";

import Button from "components/CustomButtons/Button";
import { Divider, Grid } from "@mui/material";

const TemplateCard = ({ template }) => {
  const cardWidth = 288;
  const cardHeight = (cardWidth * 4) / 3;
  const thumbHeight = (cardWidth * 9) / 16;
  const bottomHeight = cardHeight - thumbHeight;

  return (
    <Grid item>
      <Grid
        sx={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          backgroundColor: "var(--background2)",
          borderRadius: "4px",
        }}
      >
        <Grid
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            height: `${thumbHeight}px`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          thumbnail
        </Grid>
        <Grid container sx={{ p: 2, height: `${bottomHeight}px` }}>
          <Grid>
            <Grid sx={{ height: `${bottomHeight / 4}px` }}>
              <span
                className="text-ellipsis--2"
                style={{
                  color: "var(--secondary1)",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {template.title}
              </span>
            </Grid>
            <Grid>
              <span className="text-ellipsis--2">{template.description}</span>
            </Grid>
          </Grid>
          <Grid container alignItems="end">
            <Grid
              container
              justifyContent="end"
              sx={{ borderTop: "1px solid var(--surface2)", pt: 2 }}
            >
              <Button shape="greenContained">Use this</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TemplateCard;
