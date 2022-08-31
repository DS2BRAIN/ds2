import React, { useState } from "react";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import "beautiful-react-diagrams/styles.css";
import "./diagram-style.css";

import { NodeRecipe } from "./NodeRecipe";

import Button from "components/CustomButtons/Button";
import { Grid } from "@mui/material";

const initialSchema = createSchema({
  nodes: [
    {
      id: "node-1",
      content: "Start",
      coordinates: [100, 150],
      render: NodeRecipe,
      outputs: [
        { id: "port-1", alignment: "right" },
        { id: "port-2", alignment: "right" },
      ],
      disableDrag: true,
      data: {
        foo: "bar",
        count: 0,
      },
    },
    {
      id: "node-2",
      content: "Middle",
      coordinates: [300, 150],
      render: NodeRecipe,
      inputs: [
        { id: "port-3", alignment: "left" },
        { id: "port-4", alignment: "left", name: "dslab2" },
      ],
      outputs: [
        { id: "port-5", alignment: "right", name: "dslab3" },
        { id: "port-6", alignment: "right", name: "dslab4" },
      ],
      data: {
        bar: "foo",
      },
    },
    {
      id: "node-3",
      content: "End",
      coordinates: [600, 150],
      inputs: [
        { id: "port-7", alignment: "left" },
        { id: "port-8", alignment: "left" },
      ],
      render: NodeRecipe,
      data: {
        foo: true,
        bar: false,
        some: {
          deep: {
            object: true,
          },
        },
      },
    },
  ],
  links: [{ input: "port-1", output: "port-4" }],
});

const DiagramPage = () => {
  const [schema, { onChange }] = useSchema(initialSchema);

  return (
    <div style={{ height: "80vh" }}>
      <Diagram schema={schema} onChange={onChange} />
    </div>
  );
};

export default DiagramPage;
