import React, { useState, useEffect } from "react";
import Diagram, { useSchema, createSchema } from "beautiful-react-diagrams";
import "beautiful-react-diagrams/styles.css";
import "./diagram-style.css";

import NodeDetailSetting from "./NodeDetailSetting";
import { NodeRecipe } from "./NodeRecipe";
import Button from "components/CustomButtons/Button";

import { Drawer, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const initialNodeDataSetting = {
  isDeletable: false,
  title: {
    isEditable: false,
  },
  portAdd: {
    in: false,
    out: false,
  },
};

const initalNodeList = [
  {
    id: "node-data",
    content: "Choose data",
    coordinates: [100, 150],
    render: NodeRecipe,
    outputs: [{ id: "port-data-out", alignment: "right" }],
    disableDrag: true,
    data: initialNodeDataSetting,
  },
  {
    id: "node-model",
    content: "Model",
    coordinates: [700, 150],
    render: NodeRecipe,
    inputs: [{ id: "port-model-in", alignment: "left" }],
    outputs: [{ id: "port-model-out", alignment: "right" }],
    data: initialNodeDataSetting,
  },
  {
    id: "node-result",
    content: "Result",
    coordinates: [1250, 150],
    inputs: [{ id: "port-1", alignment: "left" }],
    render: NodeRecipe,
    data: initialNodeDataSetting,
  },
];

const initialSchema = createSchema({
  nodes: initalNodeList,
  links: [{ input: "port-data-out", output: "port-model-in" }],
});

const DiagramPage = () => {
  const [schema, { onChange, addNode, removeNode }] = useSchema(initialSchema);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nodeIdList, setNodeIdList] = useState([]);
  const [selectedNode, setSelectedNode] = useState({});

  useEffect(() => {
    if (schema.nodes) {
      let idList = [];
      schema.nodes.forEach((node) => {
        idList.push(node.id);
      });
      setNodeIdList(idList);
    }
  }, [schema.nodes?.length]);

  useEffect(() => {
    console.log(selectedNode);
  }, [selectedNode]);

  const onChangeCustom = (schemaChanges) => {
    console.log("onChangeCustom", schemaChanges);
    onChange(schemaChanges);
  };

  const openDrawer = (nodeId) => {
    if (nodeId) {
      let nodes = schema.nodes;
      let selectedNd = {};

      nodes.forEach((node) => {
        if (node.id === nodeId) {
          selectedNd = node;
        }
      });
      setSelectedNode(selectedNd);
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const findNodeIndex = (nodeId, nodes) => {
    let changeNodeIndex = -1;
    let changeNode = {};
    nodes.forEach((node, index) => {
      if (node.id === nodeId) {
        changeNodeIndex = index;
        changeNode = node;
      }
    });

    return [changeNodeIndex, changeNode];
  };

  const deleteNodeFromSchema = (id) => {
    const nodeToRemove = schema.nodes.find((node) => node.id === id);
    removeNode(nodeToRemove);
  };

  const handleTitle = (nodeId, editedTitle) => {
    let tmpSchema = schema;
    let nodes = tmpSchema.nodes;
    let [changeNodeIndex, changeNode] = findNodeIndex(nodeId, nodes);

    if (changeNodeIndex > -1) {
      nodes[changeNodeIndex].content = editedTitle;
      onChange(tmpSchema);
    }
  };

  const addNewPort = (nodeId, direction) => {
    let tmpSchema = schema;
    let nodes = tmpSchema.nodes;
    let [changeNodeIndex, changeNode] = findNodeIndex(nodeId, nodes);

    if (changeNodeIndex > -1) {
      let portList = [];
      if (direction === "in") portList = changeNode.inputs;
      else if (direction === "out") portList = changeNode.outputs;

      portList.push({
        id: `port-${Math.random()}`,
      });
      onChange(tmpSchema);
    }
  };

  const onSetNodeNum = (num) => {
    let strIdList = nodeIdList;
    let intIdList = [];

    strIdList.forEach((strId) => {
      let isInitialNode =
        strId === "node-data" ||
        strId === "node-model" ||
        strId === "node-result";
      if (!isInitialNode) {
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

    console.log(initialSchema);

    let startNodeIndex = 0;
    let endNodeIndex = 2;
    let nodeStandard =
      nodes.length === endNodeIndex + 1 ? startNodeIndex : nodes.length - 1;
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
        onOpenDrawer: openDrawer,
        isDeletable: true,
        onDeleteNode: deleteNodeFromSchema,
        title: {
          isEditable: true,
          editFunc: handleTitle,
        },
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
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{ zIndex: 1000 }}
      >
        <NodeDetailSetting selectedNode={selectedNode} />
      </Drawer>
    </Grid>
  );
};

export default DiagramPage;
