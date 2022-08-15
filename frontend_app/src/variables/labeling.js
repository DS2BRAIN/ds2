export const LABEL_FILE_STATUS = {
  prepare: "시작전",
  working: "진행중",
  ready: "오토라벨링(대기중)",
  review: "검수중",
  reject: "반려",
  done: "완료",
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
    label: "사람",
  },
  {
    name: "animal",
    label: "동물",
  },
  {
    name: "road",
    label: "자율주행",
  },
  {
    name: "facepoint",
    label: "페이스 포인트 검출",
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
  { title: "작업자", width: "30%" },
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
