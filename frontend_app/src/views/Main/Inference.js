import React, { useState } from "react";

import WorkSpaceList from "./WorkSpaceList";
import TemplateGrid from "./TemplateGrid";

import { Grid, Tab, Tabs } from "@mui/material";

const Flow = () => {
  const pageList = [
    { id: 0, label: "workspaces" },
    { id: 1, label: "templates" },
  ];

  const [selectedTabId, setSelectedTabId] = useState(pageList[0].id);

  const handlePage = (e, newValue) => {
    setSelectedTabId(newValue);
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
        <Tabs
          value={selectedTabId}
          TabIndicatorProps={{
            sx: {
              backgroundColor: "var(--secondary1)",
              color: "var(--secondary1)",
            },
          }}
          onChange={handlePage}
        >
          {pageList.map((page) => (
            <Tab
              key={`${page.id}_tab`}
              id={`${page.id}_tab`}
              label={page.label}
              sx={{
                p: 3,
                color:
                  selectedTabId === page.id
                    ? "var(--textWhite87) !important"
                    : "var(--textWhite6)",
              }}
            />
          ))}
        </Tabs>
      </Grid>
      <Grid>
        {selectedTabId === 0 && (
          <WorkSpaceList setSelectedTabId={setSelectedTabId} />
        )}
        {selectedTabId === 1 && <TemplateGrid />}
      </Grid>
    </Grid>
  );
};

export default Flow;
