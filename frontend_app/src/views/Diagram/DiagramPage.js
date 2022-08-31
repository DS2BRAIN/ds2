import React, { useState } from "react";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import "beautiful-react-diagrams/styles.css";
import "./diagram-style.css";

import { NodeRecipe } from "./NodeRecipe";
import Button from "components/CustomButtons/Button";

import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
  const [schema, { onChange, addNode, removeNode }] = useSchema(initialSchema);

  const deleteNodeFromSchema = (id) => {
    const nodeToRemove = schema.nodes.find((node) => node.id === id);
    removeNode(nodeToRemove);
  };

  const addNewNode = () => {
    const nextNode = {
      id: `node-${schema.nodes.length + 1}`,
      content: `Node ${schema.nodes.length + 1}`,
      coordinates: [
        schema.nodes[schema.nodes.length - 1].coordinates[0] + 100,
        schema.nodes[schema.nodes.length - 1].coordinates[1],
      ],
      render: NodeRecipe,
      data: { onClick: deleteNodeFromSchema },
      inputs: [{ id: `port-${Math.random()}` }],
      outputs: [{ id: `port-${Math.random()}` }],
    };

    addNode(nextNode);
  };

  return (
    <Grid sx={{ height: "80vh", mt: 3 }}>
      <Button
        shape="greenContainedSquare"
        startIcon={<AddIcon />}
        onClick={addNewNode}
      >
        Add new node
      </Button>
      <Diagram schema={schema} onChange={onChange} />
    </Grid>
  );
};

export default DiagramPage;
