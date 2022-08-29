import React, { useState } from "react";

import WorkSpaceList from "./WorkSpaceList";
import TemplateGrid from "./TemplateGrid";

import { Button, Grid } from "@mui/material";

const Flow = () => {
  const pageList = ["workspaces", "templates"];

  const [selectedPage, setSelectedPage] = useState(pageList[0]);

  const handlePage = (page) => {
    setSelectedPage(page);
  };

  return (
    <Grid>
      <Grid
        sx={{
          my: 3,
          px: 3,
          display: "flex",
          backgroundColor: "var(--background2)",
        }}
      >
        {pageList.map((page) => (
          <Button
            key={`${page}_tab`}
            id={`${page}_tab`}
            sx={{
              p: 3,
              borderRadius: 0,
              borderBottom:
                selectedPage === page
                  ? "4px solid var(--secondary1)"
                  : "4px solid transparent",
            }}
            onClick={() => handlePage(page)}
          >
            <span
              style={{
                textTransform: "capitalize",
                color:
                  selectedPage === page
                    ? "var(--textWhite87)"
                    : "var(--textWhite6)",
              }}
            >
              {page}
            </span>
          </Button>
        ))}
      </Grid>
      <WorkSpaceList />
      <TemplateGrid />
    </Grid>
  );
};

export default Flow;
