import React, { useState, useEffect } from "react";
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
      coordinates: [1250, 150],
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
  const [nodeIdList, setNodeIdList] = useState([]);

  useEffect(() => {
    if (schema.nodes) {
      let idList = [];
      schema.nodes.forEach((node) => {
        idList.push(node.id);
      });
      setNodeIdList(idList);
    }
  }, [schema.nodes?.length]);

  const deleteNodeFromSchema = (id) => {
    const nodeToRemove = schema.nodes.find((node) => node.id === id);
    removeNode(nodeToRemove);
  };

  const addNewPort = (nodeId, direction) => {
    let tmpSchema = schema;
    let nodes = tmpSchema.nodes;
    let changeNode = {};
    let changeNodeIndex = -1;

    nodes.forEach((node, index) => {
      if (node.id === nodeId) {
        changeNodeIndex = index;
        changeNode = node;
      }
    });

    if (changeNodeIndex > -1 && tmpSchema.nodes[changeNodeIndex]) {
      let portList = [];
      if (direction === "in")
        portList = tmpSchema.nodes[changeNodeIndex].inputs;
      else if (direction === "out")
        portList = tmpSchema.nodes[changeNodeIndex].outputs;

      portList.push({
        id: `port-${Math.random()}`,
      });
      onChange(tmpSchema);
    }
  };

  const onChangeCustom = (schemaChanges) => {
    console.log("onChangeCustom", schemaChanges);
    onChange(schemaChanges);
  };

  const onSetNodeNum = (num) => {
    let strIdList = nodeIdList;
    let intIdList = [];

    strIdList.forEach((strId) => {
      let isStartOrEnd = strId === "node-start" || strId === "node-end";
      if (!isStartOrEnd) {
        let splitedArr = strId.split("-");
        let intId = parseInt(splitedArr[1]);
        intIdList.push(intId);
      }
    });

    if (intIdList?.length) {
      intIdList = intIdList.sort((a, b) => {
        return a - b;
      });
      intIdList.forEach((intId) => {
        if (intId === num) num += 1;
        else return;
      });
    }

    return num;
  };

  const addNewNode = () => {
    const nodes = schema.nodes;

    let startNodeIndex = 0;
    let endNodeIndex = 1;
    let nodeStandard = nodes.length === 2 ? startNodeIndex : nodes.length - 1;
    let lastNode = nodes[nodeStandard];

    let xPosition = lastNode.coordinates[0] + 100;
    let yPosition = lastNode.coordinates[1];
    if (xPosition > nodes[endNodeIndex].coordinates[0]) {
      xPosition = nodes[startNodeIndex].coordinates[0];
      yPosition = yPosition + 100;
    }

    let startNum = 1;
    let nodeNum = onSetNodeNum(startNum);
    let twoDigitNum = nodeNum < 10 ? `0${nodeNum}` : nodeNum;

    const nextNode = {
      id: `node-${twoDigitNum}`,
      content: `Node ${twoDigitNum}`,
      coordinates: [xPosition, yPosition],
      render: NodeRecipe,
      data: {
        onDeleteNode: deleteNodeFromSchema,
        portAdd: {
          in: true,
          out: true,
          func: addNewPort,
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
      <Diagram schema={schema} onChange={onChangeCustom} />
    </Grid>
  );
};

export default DiagramPage;
