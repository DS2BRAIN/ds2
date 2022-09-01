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
      id: "node-start",
      content: "Start",
      coordinates: [100, 150],
      render: NodeRecipe,
      outputs: [{ id: "port-0", alignment: "right" }],
      disableDrag: true,
      data: {
        foo: "bar",
        count: 0,
        portAdd: {
          in: false,
          out: false,
        },
      },
    },
    {
      id: "node-end",
      content: "End",
      coordinates: [1200, 150],
      inputs: [{ id: "port-1", alignment: "left" }],
      render: NodeRecipe,
      data: {
        foo: true,
        bar: false,
        some: {
          deep: {
            object: true,
          },
        },
        portAdd: {
          in: false,
          out: false,
        },
      },
    },
  ],
  links: [{ input: "port-0", output: "port-1" }],
});

const DiagramPage = () => {
  const [schema, { onChange, addNode, removeNode }] = useSchema(initialSchema);

  const deleteNodeFromSchema = (id) => {
    const nodeToRemove = schema.nodes.find((node) => node.id === id);
    removeNode(nodeToRemove);
  };

  const addNewInputPort = () => {
    console.log("addnewinputnode");
  };

  const addNewOutputPort = () => {
    console.log("addnewoutputnode");
  };

  const addNewNode = () => {
    let nodeStandardPosition =
      schema.nodes.length === 2 ? 0 : schema.nodes.length - 1;

    const nextNode = {
      id: `node-${schema.nodes.length - 1}`,
      content: `Node ${schema.nodes.length - 1}`,
      coordinates: [
        schema.nodes[nodeStandardPosition].coordinates[0] + 100,
        schema.nodes[nodeStandardPosition].coordinates[1],
      ],
      render: NodeRecipe,
      data: {
        onDeleteNode: deleteNodeFromSchema,
        portAdd: {
          in: true,
          out: true,
          inFunc: addNewInputPort,
          outFunc: addNewOutputPort,
        },
      },
      inputs: [{ id: `port-${Math.random()}` }],
      outputs: [{ id: `port-${Math.random()}` }],
    };

    addNode(nextNode);
  };

  return (
    <Grid sx={{ height: "75vh", mt: 3 }}>
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
