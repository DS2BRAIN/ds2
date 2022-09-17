export const LABEL_FILE_STATUS = {
  prepare: "prepare",
  working: "working",
  ready: "ready",
  review: "review",
  reject: "reject",
  done: "done",
};

export const LABELAPP_ROUTES = {
  voice: "lv",
  normal_classification: "ls",
  normal_regression: "ls",
  text: "ln",
  image: "li",
};

export const GENERAL_AI_GROUPS = [
  {
    name: "person",
    label: "person",
  },
  {
    name: "animal",
    label: "animal",
  },
  {
    name: "road",
    label: "road",
  },
  {
    name: "facepoint",
    label: "facepoint",
  },
  // {
  //   name: "keypoint",
  //   label: "사람 키포인트",
  // },
];

export const GENERAL_AI_MODELS = {
  person: ["person"],
  animal: [
    "person",
    "bird",
    "cat",
    "dog",
    "horse",
    "sheep",
    "cow",
    "elephant",
    "bear",
    "zebra",
    "giraffe",
  ],
  road: [
    "person",
    "bicycle",
    "car",
    "motorcycle",
    "airplane",
    "bus",
    "train",
    "truck",
    "boat",
    "trafficlight",
    "firehydrant",
    "stopsign",
    "parkingmeter",
    "bench",
  ],
  facepoint: ["person"],
  keypoint: ["person"],
};

export const WORKAGE_TABLE_HEADER = [
  { title: "NO", width: "5%" },
  { title: "worker", width: "30%" },
  { title: "Box", width: "12%" },
  { title: "Polygon", width: "12%" },
  { title: "Magic", width: "12%" },
  { title: "Total", width: "12%" },
  { title: "Point", width: "12%" },
];

export const WORKAGE_TABLE_BODY = [
  "idx",
  "workAssinee",
  "boxCount",
  "polygonCount",
  "magicCount",
  "totalCount",
  "pointCount",
];
