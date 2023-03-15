import React, { useState, useEffect, PureComponent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DropzoneArea } from "material-ui-dropzone";
import JSONPretty from "react-json-pretty";

import {
  openErrorSnackbarRequestAction,
  openSuccessSnackbarRequestAction,
} from "redux/reducers/messages.js";
import { getUserCountRequestAction } from "redux/reducers/user.js";
import Cookies from "helpers/Cookies";
import * as api from "controller/api.js";
import { fileurl } from "controller/api";
import {
  predict_for_file_response,
  predictSpeechToText,
} from "controller/api.js";
import { IS_ENTERPRISE } from "variables/common";
import currentTheme, { currentThemeColor } from "assets/jss/custom.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button";
import { sendErrorMessage } from "components/Function/globalFunc.js";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Checkbox,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
} from "@material-ui/core";
import { CircularProgress, Grid } from "@mui/material";
import ForwardIcon from "@material-ui/icons/Forward";
import Forward10Icon from "@material-ui/icons/Forward10";
import Replay10Icon from "@material-ui/icons/Replay10";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import * as THREE from "three";
import {PCDLoader} from "three/examples/jsm/loaders/PCDLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" height={0}>
          {payload.value}
        </text>
      </g>
    );
  }
}

const API = React.memo(
  ({
    isStandard,
    chosenItem,
    csv,
    trainingColumnInfo,
    modelDetail,
    history,
    isMarket,
    opsId,
    closeModal,
    marketProjectId,
    isStandardMovie,
  }) => {
    const classes = currentTheme();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { user, projects, models } = useSelector(
      (state) => ({
        user: state.user,
        projects: state.projects,
        models: state.models,
      }),
      []
    );
    var tzoffset = new Date().getTimezoneOffset() * 60000;
    var localISOTime = new Date(Date.now() - tzoffset)
      .toISOString()
      .slice(0, -1)
      .substr(0, 16);

    const [isLoading, setIsLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState("");
    const [isParamsChanged, setIsParamsChanged] = useState(false);
    const [paramsValue, setParamsValue] = useState({});
    const [paramsType, setParamsType] = useState({});
    const [inputLoadedModel, setInputLoadedModel] = useState("");
    const [response, setResponse] = useState("");
    const [predictedValue, setPredictedValue] = useState("");
    const [predictedInfo, setPredictedInfo] = useState([]);
    const [outliarInfo, setOutliarInfo] = useState({});
    const [files, setFiles] = useState(null);
    const [resultImageUrl, setResultImageUrl] = useState(null);
    const [resultAudioUrl, setResultAudioUrl] = useState(null);
    const [completed, setCompleted] = useState(0);
    const [selectedObjectTab, setSelectedObjectTab] = useState("image");
    const [objectJson, setObjectJson] = useState(null);
    const [randomFileIndex, setRandomFileIndex] = useState(0);
    const [randomFile, setRandomFile] = useState(null);
    const [randomFiles, setRandomFiles] = useState([]);
    const [xaiImage, setXaiImage] = useState(null);
    const [hasRecordsData, setHasRecordsData] = useState(false);
    const [shouldCallApiAgain, setShouldCallApiAgain] = useState(false);
    const [loadingMesseage, setLoadingMessage] = useState(t("Predicting"));
    const inputLoadedModelRef = useRef();
    const uploadVideoRef = useRef();
    const standardVideoRef = useRef();
    const syncRef = useRef();
    const [syncValue, setSyncValue] = useState("");
    const [validCsvCheck, setValidCsvCheck] = useState([]);
    const [localDateTime, setLocalDateTime] = useState("");
    const [vidCreatedDateTime, setVidCreatedDateTime] = useState(null);
    const [isPredictImageDone, setIsPredictImageDone] = useState(false);
    const [isPredictImageInfoDone, setIsPredictImageInfoDone] = useState(false);
    const [vidCreatedSec, setVidCreatedSec] = useState("00");
    const [isPcdImgLoading, setIsPcdImgLoading] = useState(false);
    const [
      isCheckedForSettingCreation,
      setIsCheckedForSettingCreation,
    ] = useState(false);
    const [multiplyAverage, setMultiplyAverage] = useState(true);

    useEffect(() => {
      if (isPredictImageInfoDone && isPredictImageDone) {
        setApiLoading("done");
      }
    }, [isPredictImageInfoDone, isPredictImageDone]);

    useEffect(() => {
      if (predictedValue) handleOutputResultText();
    }, [multiplyAverage, predictedValue]);

    useEffect(() => {
      if (csv !== undefined && trainingColumnInfo !== undefined) {
        try {
          setValidCsvCheck(
            csv?.filter((c) => trainingColumnInfo[c.id + ""] == true)
          );
        } catch (err) {
          console.log("validCsvCheckError", err);
        }
      }
    }, [csv, trainingColumnInfo]);

    useEffect(() => {
      (async () => {
        setIsLoading(true);
        setHasRecordsData(false);
        setCompleted(0);
        setLoadingMessage(t("Predicting"));
        if (projects.project && models.chosenModel) getRandomData();
        setIsLoading(false);
      })();
    }, [trainingColumnInfo]);

    const getRandomData = () => {
      const tempParams = {};
      const tempTypes = {};
      let records = modelDetail.records;
      setShouldCallApiAgain(false);
      if (records && records.length > 0) setHasRecordsData(true);

      const csvDict = {};
      for (let data in csv) {
        csvDict[csv[data].id] = csv[data];
      }
      trainingColumnInfo &&
        Object.keys(trainingColumnInfo).map((dataColumnId, index) => {
          if (trainingColumnInfo[dataColumnId]) {
            var dataColumnRealId = dataColumnId;
            let tempDict = csvDict[dataColumnId];
            if (tempDict) {
              dataColumnRealId = `${tempDict.columnName}__${tempDict.dataconnectorName}`;
            }
            tempParams[dataColumnRealId] = "";
            tempTypes[dataColumnRealId] = tempDict?.type;
          }
        });
      setParamsValue(tempParams);
      setParamsType(tempTypes);

      const trainMethod = projects.project.trainingMethod;
      let isTrainOrAiTypeImage =
        trainMethod === "image" || models.model.externalAiType === "image";
      let isTrainMethodSampleAvailable =
        trainMethod === "object_detection" || trainMethod === "detection_3d" || trainMethod === "cycle_gan";
      if (isTrainOrAiTypeImage || isTrainMethodSampleAvailable) {
        api.getSampleDataByModelId(models.chosenModel).then((res) => {
          if (res.data) setRandomFiles(res.data);
        });
      }
    };
  let camera, scene, renderer;

  function init() {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth / 4, window.innerHeight / 2 );
    // document.body.appendChild( renderer.domElement );
    renderer.sortObjects = false;
    renderer.autoClear = false;

    renderer = new THREE.WebGLRenderer({alpha: true});
    // let aspect = this.width / this.height;
    // let depth = 100;
    // let fov_y = 35;
    // let height_ortho = depth * 2 * Math.atan((fov_y * (Math.PI / 180)) / 2);
    // let width_ortho = height_ortho * aspect;
    // this.camera = new THREE.OrthographicCamera(width_ortho / -2, width_ortho / 2, height_ortho / 2, height_ortho / -2, 0.01, 30000);

    scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper( 0.1 );
    scene.add( axesHelper );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight * 2, 1, 100000 );
    // camera.layers.enable( 0 );
    // camera.layers.enable( 1 );
    // camera.layers.enable( 2 );
    // camera.position.x = 1.;
    // camera.position.y = 1;
    // camera.position.z = 1.;
    camera.position.set(0, 0, 100);
    // camera.up.set(0, 0, 0);
    // camera.lookAt(0, 0, 0);
    // camera.position.set( 0, 0, 1 );
    scene.add( camera );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor =  0.8;
    // controls.enableDamping = true;
    // controls.dampingFactor =  0.8;
    controls.addEventListener( 'change', render ); // use if there is no animation loop
    // controls.minDistance = 0.5;
    // controls.maxDistance = 10;

    //scene.add( new THREE.AxesHelper( 1 ) );

    const loader = new PCDLoader();
    loader.load(
        // 'https://threejs.org/examples/models/pcd/binary/Zaghetto.pcd'
      objectJson?.asset
      , function ( points ) {

      // points.material.size = 1;
      points.geometry.center();
      // points.geometry.rotateX( Math.PI );
      points.name = 'Zaghetto.pcd';
      scene.add( points );


        //

        // const gui = new GUI();
        //
        // gui.add( points.material, 'size', 0.001, 0.01 ).onChange( render );
        // gui.addColor( points.material, 'color' ).onChange( render );
        // gui.open();

        //
        document.getElementById("canvas03").appendChild(renderer.domElement);

        render();
        setIsPcdImgLoading(false);

    } );

    for (let label of objectJson?.labels) {
            console.log("label.classAttributes.contour");
            console.log(label.classAttributes.contour);
            var x = parseFloat(label.classAttributes.contour.center3D.x);
            var y = parseFloat(label.classAttributes.contour.center3D.y);
            var z = parseFloat(label.classAttributes.contour.center3D.z);
            var l = parseFloat(label.classAttributes.contour.size3D.x);
            var w = parseFloat(label.classAttributes.contour.size3D.y);
            var h = parseFloat(label.classAttributes.contour.size3D.z);
            var rot = parseFloat(label.classAttributes.contour.rotation3D.z);
            // var r = parseFloat(bbox_csv[i].r);
            // var g = parseFloat(bbox_csv[i].g);
            // var b = parseFloat(bbox_csv[i].b);
            var c = { r:0, g:0, b:255};


            // var color = new THREE.Color(c);
            // var geometry = new THREE.BoxBufferGeometry(h, w, l);
            var geometry = new THREE.BoxBufferGeometry(l,w,h);
            var edges = new THREE.EdgesGeometry(geometry);
            var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial({linewidth: 10}));
            // line.position.set(y, z, x);
            line.position.set(x - 50, y - 50, z);
            line.rotation.z = rot;

            // line.position.set(y, x, z);
            // line.position.set(y, x, z);
            // line.rotation.z = rot;
            // line.layers.set(1);
            // line.material.size = 10;
            scene.add(line);
            // y = y + 0.001;
            // if (info !== ' ') {
            //     var sprite = makeTextSprite(info,
            //         {fontsize: 25,
            //          borderColor: {r:0, g:0, b:0, a:.0},
            //          backgroundColor: c } );
            //     // sprite.center = new THREE.Vector2(0,0)
            //     sprite.position.setX(y);
            //     sprite.position.setY(z);
            //     sprite.position.setZ(x);
            //     sprite.layers.set(2);
            //     scene.add(sprite);
            // }
        }

    window.addEventListener( 'resize', onWindowResize );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
  }

  function render() {
      renderer.render( scene, camera )
  }

  useEffect(() => {
    if (objectJson) {
      if (objectJson) {

        console.log("PCD init");
        setIsPcdImgLoading(true);
        init();
        render();
      }
    }
  }, [objectJson]);

    useEffect(() => {
      if (completed && apiLoading === "loading") {
        const tempCompleted = completed + 5;
        if (completed >= 95) {
          return;
        }
        if (completed < 40) {
          const serviceType = projects.project?.service_type;
          if (
            completed >= 10 &&
            serviceType &&
            serviceType.includes("_training") &&
            serviceType.includes("offline_")
          )
            setLoadingMessage(
              t(
                "The model is downloading. This may take 3-5 minutes or longer depending on the size of the model file."
              )
            );
          setTimeout(() => {
            setCompleted(tempCompleted);
          }, 3000);
        } else if (completed < 80) {
          setTimeout(() => {
            setCompleted(tempCompleted);
          }, 5000);
        } else {
          setTimeout(() => {
            setCompleted(tempCompleted);
          }, 10000);
        }
      }
    }, [completed]);

    useEffect(() => {
      if (isParamsChanged) setIsParamsChanged(false);
    }, [isParamsChanged]);

    useEffect(() => {
      if (shouldCallApiAgain) sendAPI();
    }, [shouldCallApiAgain]);

    useEffect(() => {
      if (vidCreatedDateTime && vidCreatedSec) {
        const updatedStr = vidCreatedDateTime.slice(0, -2) + vidCreatedSec;
        setVidCreatedDateTime(updatedStr);
      }
    }, [vidCreatedSec]);

    useEffect(() => {
      if (isCheckedForSettingCreation) {
        setLocalDateTime(localISOTime);
      } else {
        setLocalDateTime("");
        setVidCreatedSec("");
        setVidCreatedDateTime(null);
      }
    }, [isCheckedForSettingCreation]);

    useEffect(() => {
      if (vidCreatedSec === "0" || vidCreatedSec === "") setVidCreatedSec("00");
    }, [vidCreatedSec]);

    const sendAPI = (_, predictingCount = 0) => {
      const caseItemApiVideo = () => {
        const serviceType = projects.project?.service_type;
        if (serviceType !== undefined) {
          if (
            serviceType !== null &&
            serviceType.includes("_training") &&
            syncValue == ""
          ) {
            dispatch(
              openErrorSnackbarRequestAction(t("Enter the video start point."))
            );
            return;
          }
          if (isCheckedForSettingCreation && !vidCreatedDateTime) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Please specify the video creation date and time.")
              )
            );
            return;
          }
        }
        if (!files || files.length < 1) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Please upload the file and proceed")
            )
          );
          return;
        }
        setLoadingMessage(t("Uploading"));
        setApiLoading("loading");
        setCompleted(5);
        api
          .predictVideo(
            models.chosenModel,
            files,
            isMarket,
            opsId,
            marketProjectId,
            isStandardMovie,
            parseFloat(
              syncValue == undefined || syncValue == null || syncValue == ""
                ? "0.000"
                : syncValue
            ),
            vidCreatedDateTime
          )
          .then((res) => {
            setIsPredictImageDone(true);
            setApiLoading("done");
            setLoadingMessage(t("Predicting"));
          })
          .then(() => {
            dispatch(getUserCountRequestAction());
          })
          .catch((e) => {
            // if (shouldCallApiAgain) {
            if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
              window.location.href = "/admin/setting/payment/?cardRequest=true";
              return;
            }
            if (e.response && e.response.status === 429) {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "You have been logged out due to exceeded API requests, please log in again"
                  )
                )
              );
              setTimeout(() => {
                Cookies.deleteAllCookies();
                history.push("/signin/");
              }, 2000);
              return;
            }
            if (e.response && e.response.data.message) {
              dispatch(
                openErrorSnackbarRequestAction(
                  sendErrorMessage(
                    e.response.data.message,
                    e.response.data.message_en,
                    user.language
                  )
                )
              );
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "Failed to analyze uploaded video. Please upload a different video file."
                  )
                )
              );
            }
            setApiLoading("");
            // } else {
            // setShouldCallApiAgain(true);
            // }
          })
          .finally(() => {
            setCompleted(0);
            setLoadingMessage(t("Predicting"));
          });
        return;
      };

      const caseItemApiSpeechToText = () => {
        if (!files || files.length < 1) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Please upload the file and proceed")
            )
          );
          return;
        }
        setLoadingMessage(t("Uploading"));
        setApiLoading("loading");
        setCompleted(5);
        api
          .predictSpeechToText(models.chosenModel, files, isMarket, opsId)
          .then((res) => {
            const response =
              res.data === null || res.data === undefined ? "오류" : res.data;
            setResponse(response);
            var responseJson = response;
            Object.keys(responseJson).map((key) => {
              if (key === "predict_value") {
                var predictedValueRaw = responseJson[key];
                setPredictedValue(predictedValueRaw);
              } else if (key.includes("predict_value_info")) {
                setPredictedInfo(responseJson[key]);
              } else if (key.includes("이상값")) {
                setOutliarInfo(responseJson[key]);
              }
            });
            if (response === "오류") {
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              dispatch(
                openErrorSnackbarRequestAction(
                  t("An error occurred while predicting API. Please try again.")
                )
              );
            }
          })
          .catch((e) => {
            // if (shouldCallApiAgain) {
            if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
              window.location.href = "/admin/setting/payment/?cardRequest=true";
              return;
            }
            if (e.response && e.response.status === 429) {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "You have been logged out due to exceeded API requests, please log in again"
                  )
                )
              );
              setTimeout(() => {
                Cookies.deleteAllCookies();
                history.push("/signin/");
              }, 2000);
              return;
            }
            if (e.response && e.response.data.message) {
              dispatch(
                openErrorSnackbarRequestAction(
                  sendErrorMessage(
                    e.response.data.message,
                    e.response.data.message_en,
                    user.language
                  )
                )
              );
            } else {
              dispatch(
                openErrorSnackbarRequestAction(
                  t(
                    "Failed to analyze uploaded video. Please upload a different video file."
                  )
                )
              );
            }
            setApiLoading("");
            // } else {
            // setShouldCallApiAgain(true);
            // }
          })
          .finally(() => {
            setCompleted(0);
            setApiLoading("done");
            setLoadingMessage(t("Predicting"));
          });
        return;
      };

      const caseTrainMethodImage = () => {
        if (randomFile) {
          setApiLoading("loading");
          setCompleted(5);
          api
            .predictImageByURL(
              models.chosenModel,
              randomFile,
              "json",
              isMarket,
              opsId
            )
            .then((res) => {
              const response =
                res.data === null || res.data === undefined ? "오류" : res.data;
              setResponse(response);
              var responseJson = response;
              Object.keys(responseJson).map((key) => {
                if (key === "predict_value") {
                  var predictedValueRaw = responseJson[key];
                  responseJson["predict_value_info"] &&
                    responseJson["predict_value_info"].map((info) => {
                      if (info["name"] === predictedValueRaw) {
                        predictedValueRaw += ` (${info["value"]}%)`;
                      }
                    });
                  setPredictedValue(predictedValueRaw);
                } else if (key.includes("predict_value_info")) {
                  setPredictedInfo(responseJson[key]);
                } else if (key.includes("이상값")) {
                  setOutliarInfo(responseJson[key]);
                }
              });
              if (response === "오류") {
                if (predictingCount !== 2) {
                  sendAPI(_, predictingCount + 1);
                  return;
                }
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "An error occurred while predicting API. Please try again."
                    )
                  )
                );
              }
            })
            .then(() => {
              setIsPredictImageDone(true);
              setApiLoading("done");
              dispatch(getUserCountRequestAction());
            })
            .catch((e) => {
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              // if (shouldCallApiAgain) {
              if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (e.response && e.response.status === 429) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "You have been logged out due to exceeded API requests, please log in again"
                    )
                  )
                );
                setTimeout(() => {
                  Cookies.deleteAllCookies();
                  history.push("/signin/");
                }, 2000);
                return;
              }
              if (e.response && e.response.data.message) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    sendErrorMessage(
                      e.response.data.message,
                      e.response.data.message_en,
                      user.language
                    )
                  )
                );
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "Failed to analyze uploaded image. Please upload a different image file."
                    )
                  )
                );
              }
              // setApiLoading("");
              // } else {
              // setShouldCallApiAgain(true);
              // }
            })
            .finally(() => {
              if (
                predictingCount >= 2 ||
                (isPredictImageInfoDone == true && isPredictImageDone)
              ) {
                setApiLoading("done");
              }
              setCompleted(0);
              setLoadingMessage(t("Predicting"));
            });
        } else {
          if (!files || files.length < 1) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Please upload the file and proceed")
              )
            );
            return;
          }
          setApiLoading("loading");
          setCompleted(5);
          api
            .predictImageForTextReturn(
              models.chosenModel,
              files,
              isMarket,
              opsId
            )
            .then((res) => {
              const response =
                res.data === null || res.data === undefined ? "오류" : res.data;
              setResponse(response);
              var responseJson = response;
              Object.keys(responseJson).map((key) => {
                if (key === "predict_value") {
                  var predictedValueRaw = responseJson[key];
                  responseJson["predict_value_info"] &&
                    responseJson["predict_value_info"].map((info) => {
                      if (info["name"] === predictedValueRaw) {
                        predictedValueRaw += ` (${info["value"]}%)`;
                      }
                    });
                  setPredictedValue(predictedValueRaw);
                } else if (key.includes("predict_value_info")) {
                  setPredictedInfo(responseJson[key]);
                } else if (key.includes("이상값")) {
                  setOutliarInfo(responseJson[key]);
                }
              });
              if (response === "오류") {
                if (predictingCount !== 2) {
                  sendAPI(_, predictingCount + 1);
                  return;
                }
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "An error occurred while predicting API. Please try again."
                    )
                  )
                );
              }
            })
            .then(() => {
              setSelectedObjectTab("image");
            })
            .then(() => {
              api
                .predictImageForTextReturnXai(
                  models.chosenModel,
                  files,
                  isMarket,
                  opsId
                )
                .then((response) => {
                  return new Blob([response.data]);
                })
                .then((blob) => {
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  setXaiImage(url);
                });
            })
            .then(() => {
              setIsPredictImageDone(true);
              setApiLoading("done");
              dispatch(getUserCountRequestAction());
            })
            .catch((e) => {
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              // if (shouldCallApiAgain) {
              if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (e.response && e.response.status === 429) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "You have been logged out due to exceeded API requests, please log in again"
                    )
                  )
                );
                setTimeout(() => {
                  Cookies.deleteAllCookies();
                  history.push("/signin/");
                }, 2000);
                return;
              }
              if (e.response && e.response.data.message) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    sendErrorMessage(
                      e.response.data.message,
                      e.response.data.message_en,
                      user.language
                    )
                  )
                );
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "Failed to analyze uploaded image. Please upload a different image file."
                    )
                  )
                );
              }
              // setApiLoading("");
              // } else {
              // setShouldCallApiAgain(true);
              // }
            })
            .finally(() => {
              if (
                predictingCount >= 2 ||
                (isPredictImageInfoDone == true && isPredictImageDone)
              ) {
                setApiLoading("done");
              }
              setCompleted(0);
              setLoadingMessage(t("Predicting"));
            });
        }
      };
      const caseTrainMethodObject3DCycle = () => {
        if (!files || files.length < 1) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Please upload the file and proceed")
              )
            );
            return;
          }
          setApiLoading("loading");
          setCompleted(5);

          api
            .predictImageInfo(
              models.chosenModel,
              files,
              isMarket,
              opsId
            )
            .then((res) => {
              setIsPredictImageDone(true);
              setApiLoading("done");
              console.log("success");
              console.log(res.data);
              setObjectJson(res.data);
            })
            .catch((e) => {
              console.log("e");
              console.log(e);
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              if (
                !IS_ENTERPRISE &&
                e.response &&
                e.response.status === 402
              ) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (!process.env.REACT_APP_DEPLOY) console.log(e);
              setObjectJson(null);
            });

      };

      const caseTrainMethodObjectCycle = () => {
        if (randomFile) {
          setApiLoading("loading");
          setCompleted(5);
          api
            .predictImageByURL(
              models.chosenModel,
              randomFile,
              "blob",
              isMarket,
              opsId
            )
            .then((response) => {
              return new Blob([response.data]);
            })
            .then(async (blob) => {
              if (projects.project.trainingMethod === "object_detection" || 
              projects.project.trainingMethod === "detection_3d") {
                let imageFile = files;
                if (!imageFile && randomFile) imageFile = randomFile;
                try {
                  await api
                    .predictRandomImageInfo(
                      models.chosenModel,
                      blob,
                      isMarket,
                      opsId
                    )
                    .then((res) => {
                      setObjectJson(res.data);
                    })
                    .catch((e) => {
                      if (predictingCount !== 2) {
                        sendAPI(_, predictingCount + 1);
                        return;
                      }
                      if (
                        !IS_ENTERPRISE &&
                        e.response &&
                        e.response.status === 402
                      ) {
                        window.location.href =
                          "/admin/setting/payment/?cardRequest=true";
                        return;
                      }
                      if (!process.env.REACT_APP_DEPLOY) console.log(e);
                      setObjectJson(null);
                    });
                } catch {
                  setObjectJson(null);
                }
              }
              return blob;
            })
            .then((blob) => {
              const url = window.URL.createObjectURL(new Blob([blob]));
              setResultImageUrl(url);
              return blob;
            })
            .then(() => {
              dispatch(getUserCountRequestAction());
              setIsPredictImageDone(true);
              setApiLoading("done");
            })
            .catch((e) => {
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              if (!process.env.REACT_APP_DEPLOY) console.log(e);
              // if (shouldCallApiAgain) {
              if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (e.response && e.response.status === 429) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "You have been logged out due to exceeded API requests, please log in again"
                    )
                  )
                );
                setTimeout(() => {
                  Cookies.deleteAllCookies();
                  history.push("/signin/");
                }, 2000);
                return;
              }
              if (e.response && e.response.data.message) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    sendErrorMessage(
                      e.response.data.message,
                      e.response.data.message_en,
                      user.language
                    )
                  )
                );
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "Failed to analyze uploaded image. Please upload a different image file."
                    )
                  )
                );
              }
              // setApiLoading("");
              // } else {
              // setShouldCallApiAgain(true);
              // }
            })
            .finally(() => {
              if (
                predictingCount >= 2 ||
                (isPredictImageInfoDone == true && isPredictImageDone)
              ) {
                setApiLoading("done");
              }
              setCompleted(0);
              setLoadingMessage(t("Predicting"));
            });
        } else {
          if (!files || files.length < 1) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Please upload the file and proceed")
              )
            );
            return;
          }
          setApiLoading("loading");
          setCompleted(5);

          api
            .predictImage(models.chosenModel, files, isMarket, opsId)
            .then((response) => {
              return new Blob([response.data]);
            })
            .then((blob) => {
              const url = window.URL.createObjectURL(new Blob([blob]));
              setResultImageUrl(url);
            })
            .then(() => {
              dispatch(getUserCountRequestAction());
              setIsPredictImageDone(true);
              setApiLoading("done");
              if (projects.project.trainingMethod === "object_detection" || 
              projects.project.trainingMethod === "detection_3d") {
                let imageFile = files;
                if (!imageFile && randomFile) imageFile = randomFile;
                try {
                  api
                    .predictImageInfo(
                      models.chosenModel,
                      files,
                      isMarket,
                      opsId
                    )
                    .then((res) => {
                      setIsPredictImageInfoDone(true);
                      setApiLoading("done");
                      setObjectJson(res.data);
                    })
                    .catch((e) => {
                      if (predictingCount !== 2) {
                        sendAPI(_, predictingCount + 1);
                        return;
                      }
                      if (
                        !IS_ENTERPRISE &&
                        e.response &&
                        e.response.status === 402
                      ) {
                        window.location.href =
                          "/admin/setting/payment/?cardRequest=true";
                        return;
                      }
                      if (!process.env.REACT_APP_DEPLOY) console.log(e);
                      setObjectJson(null);
                    });
                } catch {
                  if (predictingCount !== 2) {
                    sendAPI(_, predictingCount + 1);
                    return;
                  }
                  setObjectJson(null);
                }
              }
            })
            .catch((e) => {
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              if (!process.env.REACT_APP_DEPLOY) console.log(e);
              // if (shouldCallApiAgain) {
              if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (e.response && e.response.status === 429) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "You have been logged out due to exceeded API requests, please log in again"
                    )
                  )
                );
                setTimeout(() => {
                  Cookies.deleteAllCookies();
                  history.push("/signin/");
                }, 2000);
                return;
              }
              if (e.response && e.response.data.message) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    sendErrorMessage(
                      e.response.data.message,
                      e.response.data.message_en,
                      user.language
                    )
                  )
                );
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "Failed to analyze uploaded image. Please upload a different image file."
                    )
                  )
                );
              }
              // setApiLoading("");
              // } else {
              // setShouldCallApiAgain(true);
              // }
            })
            .finally(() => {
              if (
                predictingCount >= 2 ||
                (isPredictImageInfoDone == true && isPredictImageDone)
              ) {
                setApiLoading("done");
              }
              setCompleted(0);
              setLoadingMessage(t("Predicting"));
            });
        }
      };

      const caseTrainMethodEtc = () => {
        if (
          projects.project &&
          projects.project.trainingMethod !== "recommender"
        ) {
          let paramsList = Object.entries(paramsValue);
          let is_valid_to_proceed = true;
          paramsList.forEach(function(value, index, array) {
            const param = value[1];
            if (param === undefined || param === null || param === "") {
              if (value[0].indexOf("(Optional)") === -1) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t("Please fill in all the data and proceed.")
                  )
                );
                is_valid_to_proceed = false;
              }
            }
          });
          if (!is_valid_to_proceed) {
            return;
          }
          try {
            for (let i = 0; i < validCsvCheck.length; i++) {
              if (validCsvCheck[i].type == "number") {
                if (isNaN(paramsList[i][1] / 1)) {
                  throw new Error("invaildNumber");
                }
              } else if (validCsvCheck[i].type == "object") {
                if (!isNaN(paramsList[i][1] / 1)) {
                  throw new Error("invaildObject");
                }
                //JSON.parse(paramsList[i][1]);
              } else if (validCsvCheck[i].type == "datetime") {
                //대표님 백엔드 코드 보고 결정
              }
            }
          } catch (err) {
            dispatch(
              openErrorSnackbarRequestAction(
                t("Please fill in correct data and proceed.")
              )
            );
            return;
          }
        }

        setApiLoading("loading");
        setCompleted(5);
        let paramsValueForPredict = paramsValue;
        var paramsValueForPredictRaw = {};
        Object.keys(paramsValueForPredict).map((eachValue) => {
          paramsValueForPredictRaw[eachValue] =
            Number.isNaN(+paramsValueForPredict[eachValue]) ||
            paramsValueForPredict[eachValue].length === 0
              ? paramsValueForPredict[eachValue]
              : +paramsValueForPredict[eachValue];
        });
        paramsValueForPredict = paramsValueForPredictRaw;
        let parameter = {
          modelid: models.chosenModel,
          parameter: paramsValueForPredict,
          inputLoadedModel: inputLoadedModel,
        };
        let isClear = false;
        let isOutputDataAudio = modelDetail?.outputData_en?.includes("Audio");
        let isOutputDataImage = modelDetail?.outputData_en?.includes("Image");
        if (isOutputDataAudio || isOutputDataImage) {
          api
            .predict_for_file_response(parameter, isMarket, opsId)
            .then((response) => {
              return new Blob([response.data]);
            })
            .then((blob) => {
              const url = window.URL.createObjectURL(new Blob([blob]));
              let downloadFileName = "";
              if (isOutputDataAudio) {
                setResultAudioUrl(url);
                downloadFileName = "result.wav";
              }
              if (isOutputDataImage) {
                setResultImageUrl(url);
                downloadFileName = "result.gif";
              }
              setIsPredictImageDone(true);
              setApiLoading("done");
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", downloadFileName);
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
            });
        } else {
          api
            .postAPI(parameter, isMarket, opsId)
            .then((res) => {
              const response =
                res.data === null || res.data === undefined ? "오류" : res.data;
              setResponse(response);
              var responseJson = {};
              if (typeof response === "string")
                responseJson = JSON.parse(response);
              else if (typeof response === "object") responseJson = response;
              if (
                projects.project.trainingMethod === "recommender" ||
                projects.project.option.includes("load")
              ) {
                setObjectJson(responseJson);
              }
              Object.keys(responseJson).map((key) => {
                if (key.includes("__predict_value")) {
                  var predictedValueRaw = String(responseJson[key]);
                  let tempMaxValue = 0;
                  responseJson["predict_value_info"] &&
                    responseJson["predict_value_info"].map((info) => {
                      if (info["value"] > tempMaxValue) {
                        tempMaxValue = info["value"];
                        predictedValueRaw =
                          info["name"] + ` (${info["value"]}%)`;
                      }
                    });
                  setPredictedValue(predictedValueRaw);
                } else if (key.includes("predict_value_info")) {
                  setPredictedInfo(responseJson[key]);
                } else if (key.includes("이상값")) {
                  setOutliarInfo(responseJson[key]);
                } else if (key.includes("result")) {
                  setPredictedValue(responseJson[key]);
                }
              });
              if (response === "오류") {
                if (predictingCount !== 2) {
                  sendAPI(_, predictingCount + 1);
                  return;
                }
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "An error occurred while predicting API. Please try again."
                    )
                  )
                );
              }
            })
            .then(() => {
              isClear = true;
            })
            .then(() => {
              dispatch(getUserCountRequestAction());
            })
            .catch((e) => {
              console.log(e);
              if (predictingCount !== 2) {
                sendAPI(_, predictingCount + 1);
                return;
              }
              // if (shouldCallApiAgain) {
              if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                window.location.href =
                  "/admin/setting/payment/?cardRequest=true";
                return;
              }
              if (e.response && e.response.status === 429) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "You have been logged out due to exceeded API requests, please log in again"
                    )
                  )
                );
                setTimeout(() => {
                  Cookies.deleteAllCookies();
                  history.push("/signin/");
                }, 2000);
                return;
              }
              if (e.response && e.response.data.message) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    sendErrorMessage(
                      e.response.data.message,
                      e.response.data.message_en,
                      user.language
                    )
                  )
                );
              } else {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t(
                      "Prediction failed due to input value error. Please enter the data again."
                    )
                  )
                );
              }
              // setApiLoading("");
              // } else {
              // setShouldCallApiAgain(true);
              // }
            })
            .finally(() => {
              if (predictingCount >= 2 || isClear) {
                setApiLoading("done");
              }
              setCompleted(0);
              setLoadingMessage(t("Predicting"));
            });
        }
      };

      let trainMethod = projects.project?.trainingMethod;
      if (chosenItem === "apiVideo") {
        caseItemApiVideo();
      } else if (chosenItem === "ApiSpeechToText") {
        caseItemApiSpeechToText();
      } else if (
        trainMethod === "image" ||
        trainMethod === "ocr" ||
        models.model.externalAiType === "image"
      ) {
        caseTrainMethodImage();
      } else if (
        trainMethod === "detection_3d"
      ) {
        caseTrainMethodObject3DCycle();
      }  else if (
        trainMethod === "object_detection" ||
        trainMethod === "cycle_gan"
      ) {
        caseTrainMethodObjectCycle();
      } else {
        caseTrainMethodEtc();
      }
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length !== 0) {
        return (
          <div
            className="custom-tooltip"
            style={{
              background: currentThemeColor.background2,
              color: currentThemeColor.textWhite87,
            }}
          >
            <p
              className="label"
              style={{ padding: "10px" }}
            >{`${label} : ${payload[0].value}`}</p>
          </div>
        );
      }
      return null;
    };

    const getRandomRecords = () => {
      const traininMethodType = ["image", "object_detection", "cycle_gan"];
      if (traininMethodType.includes(projects.project.trainingMethod)) {
        if (randomFiles.length > 0) {
          var newIndex = (randomFileIndex + 1) % randomFiles.length;
          setRandomFileIndex(newIndex);
          setRandomFile(
            IS_ENTERPRISE
              ? fileurl + "static" + randomFiles[newIndex]
              : randomFiles[newIndex]
          );
        }
      } else {
        let records = modelDetail.records;
        if (records && records.length > 0) {
          records = JSON.parse(records);
          const randomIdx = parseInt(Math.random() * records.length);
          const tempParams = {};
          const randomRecord = records[randomIdx];
          for (let value in paramsValue) {
            if (randomRecord[value] === undefined) {
              tempParams[value] = "";
            } else if (!randomRecord[value] && randomRecord[value] !== 0) {
              const month = randomRecord[value + "Month"];
              const day = randomRecord[value + "Day"];
              const year = randomRecord[value + "Year"];
              if (month && day && year) {
                tempParams[value] = `${year}-${month}-${day}`;
              }
            } else {
              tempParams[value] = randomRecord[value];
            }
          }
          if (projects.project.trainingMethod.includes("time_series")) {
            api
              .postTimeSeriesSampleData(projects.project.id)
              .then((res) => {
                if (res.data) {
                  let timeSeriesData = res.data;
                  Object.keys(timeSeriesData).map((key) => {
                    if (tempParams[key]) {
                      tempParams[key] = timeSeriesData[key];
                    }
                  });
                } else {
                  dispatch(
                    openErrorSnackbarRequestAction(
                      t(
                        "No random forecasts exist. Please enter data manually."
                      )
                    )
                  );
                }
              })
              .catch((e) => {
                if (!process.env.REACT_APP_DEPLOY) console.log(e);
                if (!IS_ENTERPRISE && e.response && e.response.status === 402) {
                  window.location.href =
                    "/admin/setting/payment/?cardRequest=true";
                  return;
                }
              });
          }
          setParamsValue(tempParams);
          setIsParamsChanged(true);
        } else {
          dispatch(
            openErrorSnackbarRequestAction(
              t("No random forecasts exist. Please enter data manually.")
            )
          );
        }
      }
    };

    const resetImage = () => {
      let trainMethod = projects.project.trainingMethod;
      if (
        trainMethod === "image" ||
        models.model.externalAiType === "image" ||
        models.model.externalAiType === "audio" ||
        trainMethod === "object_detection" ||
        trainMethod === "detection_3d" ||
        trainMethod === "cycle_gan"
      ) {
        setIsPredictImageInfoDone(false);
        setIsPredictImageDone(false);
        setFiles(null);
        setRandomFile(null);
        setObjectJson(null);
        setResultImageUrl(null);
        setXaiImage(null);
        setResponse(null);
        setSelectedObjectTab("image");
        setApiLoading("");
        setShouldCallApiAgain(false);
      } else {
        const tempParams = paramsValue;
        for (let value in paramsValue) {
          tempParams[value] = "";
        }
        if (
          inputLoadedModelRef.current !== undefined &&
          inputLoadedModelRef.current.value !== undefined
        ) {
          inputLoadedModelRef.current.value = "";
        }
        setInputLoadedModel("");
        setResponse(null);
        setXaiImage(null);
        setParamsValue(tempParams);
        setIsParamsChanged(true);
        setObjectJson(null);
        setSelectedObjectTab(null);
        setApiLoading("");
        setShouldCallApiAgain(false);
      }
    };

    const renderContents = () => {
      const caseApiLoaded = () => {
        const onChangeText = (e) => {
          setInputLoadedModel(e.target.value);
        };

        return (
          <textarea
            style={{
              background: currentThemeColor.surface1,
              width: "100%",
              height: "300px",
              marginBottom: "30px",
              padding: "1em",
              color: "white",
            }}
            id={"edit"}
            onChange={onChangeText}
            ref={inputLoadedModelRef}
          >
            {/*{preview}*/}
          </textarea>
        );
      };

      const caseApi = () => {
        const changeParamValue = (event, type) => {
          const tempParams = paramsValue;
          const tempId = event.target.id;
          const tempValue = event.target.value;

          if (type === "number") {
            const regExp = /[^0-9]/g;
            if (regExp.test(tempValue)) return;
          }

          for (const param in tempParams) {
            if (param === tempId) {
              tempParams[tempId] = tempValue;
            }
          }
          setParamsValue(tempParams);
          setIsParamsChanged(true);
        };

        return (
          <div style={{ width: "100%", maxHeight: "500px", overflow: "auto" }}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell
                    className={classes.tableRowCell}
                    style={{ width: "30%" }}
                    align="center"
                  >
                    <b>KEY</b>
                  </TableCell>
                  <TableCell
                    className={classes.tableRowCell}
                    style={{ width: "70%" }}
                    align="center"
                  >
                    <b>VALUE</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(paramsValue).map((param, idx) => {
                  const project = projects.project;
                  let isTrainMethodRecommend =
                    project.trainingMethod === "recommender";

                  return (
                    ((project &&
                      isTrainMethodRecommend &&
                      param.includes(project.recommenderUserColumn)) ||
                      (project && !isTrainMethodRecommend)) && (
                      <TableRow key={param + idx} className={classes.tableRow}>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                          style={{
                            wordBreak: "keep-all",
                            width: "50%",
                            color: outliarInfo[param] ? "red" : "black",
                            fontWeight: outliarInfo[param] ? "700" : "400",
                          }}
                        >
                          {param}
                        </TableCell>
                        <TableCell
                          className={classes.tableRowCell}
                          align="center"
                        >
                          <TextField
                            id={param}
                            fullWidth
                            required
                            autoFocus={idx === 0 ? true : false}
                            value={paramsValue[param]}
                            placeholder={
                              (user.language === "ko"
                                ? `${paramsType[param]} ${t(
                                    "Enter the value."
                                  )}`
                                : `${t("Enter the value.")} (${
                                    paramsType[param]
                                  })`) + "*"
                            }
                            style={{
                              width: "50%",
                              wordBreak: "keep-all",
                              minWidth: "200px",
                            }}
                            InputProps={{
                              style: {
                                color: outliarInfo[param] ? "red" : "black",
                                fontWeight: outliarInfo[param] ? "700" : "400",
                              },
                            }}
                            onChange={(e) =>
                              changeParamValue(e, paramsType[param])
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      };

      const apiDropzone = (type, acceptedFiles) => {
        let typeGuideText = null;
        if (type === "image") typeGuideText = "png, jpg, bin (3D), pcd (3D)";
        else if (type === "video") typeGuideText = "mp4";
        else if (type === "audio") typeGuideText = "wav";

        const handleFileChange = (files) => {
          setFiles(
            files.map((file) =>
              Object.assign(file, {
                preview: URL.createObjectURL(file),
              })
            )
          );
        };

        const dropFilesReject = (type) => {
          dispatch(
            openErrorSnackbarRequestAction(
              t(`올바른 파일 형식이 아닙니다. ${type}파일만 업로드 가능합니다.`)
            )
          );
        };

        const dropFiles = () => {
          dispatch(
            openSuccessSnackbarRequestAction(t("The file(s) has been uploaded"))
          );
        };

        const deleteFiles = () => {
          dispatch(
            openSuccessSnackbarRequestAction(t("The file(s) has been deleted"))
          );
        };

        return (
          <div id={`${type}Predict`}>
            <DropzoneArea
              id={`${type}DropZone`}
              onChange={handleFileChange}
              onDropRejected={() => {
                dropFilesReject(typeGuideText);
              }}
              onDrop={dropFiles}
              onDelete={deleteFiles}
              acceptedFiles={acceptedFiles}
              showPreviews={false}
              showPreviewsInDropzone={false}
              maxFileSize={2147483648}
              dialogTitle={
                type === "image" ? t("Upload image") : t("Upload video")
              }
              dropzoneText={t(`Please upload your ${typeGuideText} file.`)}
              filesLimit={1}
              maxWidth={"xs"}
              fullWidth={false}
              showAlerts={false}
            />
          </div>
        );
      };

      const caseApiSpeechToText = (acceptedFiles) => {
        const showVideo = (srcFile) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              marginTop: resultImageUrl && "44px",
            }}
          >
            <video
              ref={uploadVideoRef}
              style={{ width: "100%", maxHeight: "24em" }}
              controls
              currentTime={0}
              src={srcFile}
              type="video/mp4"
            ></video>
          </div>
        );

        if (files && files.length > 0) {
          return showVideo(files[0].preview);
        } else if (randomFile) {
          return showVideo(randomFile);
        } else return apiDropzone("audio", acceptedFiles);
      };

      const caseApiImage = (acceptedFiles) => {
        const showImage = (srcFile) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              marginTop: resultImageUrl && "44px",
            }}
          >
            {files ? files[0].name.indexOf('.pcd') > -1 || files[0].name.indexOf('.bin') > -1 ?
                <div>No preview for PCD & BIN files</div>
                : <img src={srcFile} style={{ width: "100%", maxHeight: "24em" }} />
              : <img src={srcFile} style={{ width: "100%", maxHeight: "24em" }} />
            }
          </div>
        );

        if (files && files.length > 0) {
          return showImage(files[0].preview);
        } else if (randomFile) {
          return showImage(randomFile);
        } else return apiDropzone("image", acceptedFiles);
      };

      const caseApiVideo = (acceptedFiles) => {
        if (files && files.length > 0 && files[0].name.length >= 50) {
          dispatch(
            openErrorSnackbarRequestAction(
              t("Set your video title to 50 characters or less.")
            )
          );
          resetImage();
        }
        const secSetupVidCreationTime = () => {
          const onChangeTimeCheckBox = (e) => {
            setIsCheckedForSettingCreation(e.target.checked);
          };

          const onChangeVidCreationTime = (e) => {
            const val = e.target.value;
            const valStr = val.replace("T", " ") + `:${vidCreatedSec}`;
            const isValidDate =
              new Date(val).valueOf() <= new Date(localDateTime).valueOf();
            const year = valStr?.slice(0, 4);

            if (val) {
              if (year < 1970) {
                dispatch(
                  openErrorSnackbarRequestAction(
                    t("The starting year can be set after 1970.")
                  )
                );
                setLocalDateTime(localISOTime);
                return;
              } else {
                if (!isValidDate) {
                  dispatch(
                    openErrorSnackbarRequestAction(
                      t(
                        "It can be set to a point in time earlier than the present."
                      )
                    )
                  );
                  setLocalDateTime(localISOTime);
                  e.target.value = localISOTime;
                  return;
                }
                // setLocalDateTime(e.target.value)
                setVidCreatedDateTime(valStr);
              }
            }
          };

          const onChangeVidCreationSec = (e) => {
            let sec = e.target.value;
            if (sec < 10) {
              if (sec < 0) {
                e.target.value = 0;
                setVidCreatedSec("00");
                return;
              }
              if (String(sec).length > 1) {
                e.target.value = String(sec).substr(-1, 1);
                setVidCreatedSec("0" + String(sec).substr(-1, 1));
                return;
              }
              setVidCreatedSec("0" + String(sec));
            } else {
              if (sec >= 60) {
                e.target.value = 59;
                setVidCreatedSec("59");
                return;
              }
              setVidCreatedSec(String(sec));
            }
          };

          return (
            <>
              {/* <Grid style={{ fontSize: "8px" }} item container>
                  {"*" +
                    t(
                      "영상 시작점 기준으로 30분 길이에 해당되는 영상만 사용됩니다."
                    )}
                </Grid> */}
              <Grid item xs={12}>
                <Grid container alignItems="center">
                  <Checkbox
                    color="default"
                    checked={isCheckedForSettingCreation}
                    onChange={(e) => onChangeTimeCheckBox(e)}
                    style={{ marginRight: "4px" }}
                  />
                  <Grid item>
                    <span>{t("Specify the video creation date and time")}</span>
                  </Grid>
                  <Grid item>
                    <form className={classes.container} noValidate>
                      <TextField
                        id="datetime-local"
                        type="datetime-local"
                        defaultValue={localDateTime}
                        // value={localDateTime}
                        className={classes.textField}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          min: "1970-01-01T00:00",
                          max: localDateTime,
                        }}
                        disabled={!isCheckedForSettingCreation}
                        onChange={(e) => {
                          onChangeVidCreationTime(e);
                        }}
                      />
                    </form>
                  </Grid>
                  <Grid item>
                    <TextField
                      type="number"
                      onChange={(e) => onChangeVidCreationSec(e)}
                      placeholder={t("Enter seconds")}
                      inputProps={{
                        min: "0",
                        max: "59",
                      }}
                      disabled={!isCheckedForSettingCreation}
                      style={{ minWidth: "120px" }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </>
          );
        };

        const secSetupVidStartPoint = () => {
          const onChangeVidStartPoint = (e) => {
            let targetVal = e.target.value;
            if (targetVal >= uploadVideoRef.current?.duration) {
              setSyncValue("");
              syncRef.current.value = "";
              dispatch(
                openErrorSnackbarRequestAction(
                  t("The video start point exceeds the video length.")
                )
              );
            } else if (targetVal.includes(".")) {
              if (
                /^$|^[0-9]([.]\d{0,3})?$|^[1-9][0-9]*([.]\d{0,3})?$/.test(
                  targetVal
                ) == false
              ) {
                if (
                  uploadVideoRef !== undefined &&
                  uploadVideoRef.current !== undefined
                ) {
                  if (targetVal == "" || targetVal == ".") {
                    uploadVideoRef.current.currentTime = 0;
                  } else {
                    uploadVideoRef.current.currentTime = parseFloat(targetVal);
                  }
                }
                syncRef.current.value = targetVal.substr(
                  0,
                  targetVal.length - 1
                );
                setSyncValue(syncRef.current.value);
              } else {
                if (targetVal[targetVal.length - 1] !== ".") {
                  syncRef.current.value = targetVal;
                  setSyncValue(syncRef.current.value);
                  uploadVideoRef.current.currentTime = parseFloat(targetVal);
                }
              }
              if (standardVideoRef.current !== undefined) {
                standardVideoRef.current.currentTime = 0;
              }
            } else if (Number(targetVal) || targetVal == "0") {
              syncRef.current.value = targetVal;
              setSyncValue(syncRef.current.value);
              if (
                uploadVideoRef !== undefined &&
                uploadVideoRef.current !== undefined
              ) {
                if (targetVal == "" || targetVal == ".") {
                  uploadVideoRef.current.currentTime = 0;
                } else {
                  uploadVideoRef.current.currentTime = parseFloat(targetVal);
                }
                if (standardVideoRef.current !== undefined) {
                  standardVideoRef.current.currentTime = 0;
                }
              }
            } else {
              syncRef.current.value = "";
              setSyncValue(syncRef.current.value);
            }
          };

          const handleCurrentFrame = () => {
            const pauseVideo = (ref) => {
              ref.current.pause();
            };

            if (standardVideoRef.current !== undefined) {
              standardVideoRef.current.currentTime = 0;
            }
            if (
              String(uploadVideoRef.current?.currentTime).split(".")[1] ==
              undefined
            ) {
              syncRef.current.value = String(
                uploadVideoRef.current?.currentTime
              );
              setSyncValue(syncRef.current.value);
            } else {
              let l = String(uploadVideoRef.current?.currentTime).split(".")[1]
                .length;
              if (l > 3) {
                syncRef.current.value = String(
                  uploadVideoRef.current?.currentTime
                ).substr(
                  0,
                  String(uploadVideoRef.current?.currentTime).length - (l - 3)
                );
                setSyncValue(syncRef.current.value);
              }
            }
            pauseVideo(uploadVideoRef);
            if (standardVideoRef.current !== undefined) {
              pauseVideo(standardVideoRef);
            }
          };

          return (
            <Grid container item xs={12} style={{ marginTop: "10px" }}>
              <div style={{ paddingTop: "5px", marginRight: "10px" }}>
                {t("Enter video start point")}
              </div>
              <TextField
                onChange={(e) => {
                  onChangeVidStartPoint(e);
                }}
                inputRef={syncRef}
                width="20px"
                placeholder={t("upto 3 decimal places")}
                defaultValue={""}
                style={{ width: 200 }}
              />
              <Button
                className={classes.defaultOutlineButton}
                style={{
                  width: user.language == "ko" ? "100px" : "160px",
                  marginLeft: "10px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
                onClick={() => handleCurrentFrame()}
              >
                {t("Select current frame")}
              </Button>
              <Grid style={{ fontSize: "8px" }} item container>
                {projects.project?.service_type.includes("_training")
                  ? "*" +
                    t(
                      "Only images that are 10 minutes long from the starting point of the video are used."
                    )
                  : "*" +
                    t(
                      "Only images that are 30 minutes long from the starting point of the video are used."
                    )}
              </Grid>
              <Grid item container xs={12} justify="center">
                {isStandard && isStandardMovie == false && (
                  <Grid
                    container
                    item
                    xs={6}
                    justify="space-between"
                    alignItems="center"
                    className={classes.defaultOutlineButton}
                    style={{ height: "32px", borderRadius: "4px" }}
                  >
                    <Button
                      onClick={() => {
                        uploadVideoRef.current.currentTime -= 10;
                        if (standardVideoRef.current != undefined) {
                          standardVideoRef.current.currentTime -= 10;
                        }
                      }}
                    >
                      <Replay10Icon />
                    </Button>

                    <Button
                      onClick={() => {
                        uploadVideoRef.current.pause();
                        if (standardVideoRef.current != undefined) {
                          standardVideoRef.current.pause();
                        }
                      }}
                    >
                      <PauseIcon />
                    </Button>
                    <Button
                      onClick={() => {
                        uploadVideoRef.current.play();
                        if (standardVideoRef.current != undefined) {
                          standardVideoRef.current.play();
                        }
                      }}
                    >
                      <PlayArrowIcon />
                    </Button>
                    <Button
                      onClick={() => {
                        uploadVideoRef.current.currentTime += 10;
                        if (standardVideoRef.current != undefined) {
                          standardVideoRef.current.currentTime += 10;
                        }
                      }}
                    >
                      <Forward10Icon />
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          );
        };

        if (files && files.length > 0) {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
              }}
            >
              <Grid container item xs={12} justify="space-between">
                <Grid
                  container
                  item
                  xs={isStandard && isStandardMovie == false ? 6 : 12}
                  justify="center"
                  direction="column"
                >
                  {isStandard == false
                    ? isStandardMovie == true
                      ? t("Standard Video")
                      : t("Current Video")
                    : t("Current Video")}
                  <video
                    ref={uploadVideoRef}
                    style={{ width: "100%", maxHeight: "24em" }}
                    controls
                    autoPlay
                    currentTime={0}
                    src={files[0].preview}
                    type="video/mp4"
                  >
                    {/* <source id="videoPlayer1" src={files[0].preview} type="video/mp4" /> */}
                  </video>
                </Grid>
                {isStandard && isStandardMovie == false && (
                  <Grid
                    container
                    item
                    xs={6}
                    justify="center"
                    direction="column"
                  >
                    {t("Standard Video")}
                    <video
                      ref={standardVideoRef}
                      style={{ width: "100%", maxHeight: "24em" }}
                      controls
                      autoPlay
                      currentTime={0}
                      src={isStandard}
                      type="video/mp4"
                    >
                      {/* <source id="videoPlayer1" src={files[0].preview} type="video/mp4" /> */}
                    </video>
                  </Grid>
                )}
                {projects.project?.service_type !== undefined &&
                  projects.project?.service_type.includes("_training") &&
                  secSetupVidCreationTime()}
              </Grid>
              {projects.project?.service_type !== undefined &&
                secSetupVidStartPoint()}
            </div>
          );
        } else return apiDropzone("video", acceptedFiles);
      };

      let acceptedFiles = [];
      console.log("chosenItem");
      console.log(chosenItem);
      switch (chosenItem) {
        case "apiLoaded":
          return caseApiLoaded();
        case "api":
          return caseApi();
        case "ApiSpeechToText":
          acceptedFiles = [".mp3", ".mp4", ".wav", ".flac"];
          return caseApiSpeechToText(acceptedFiles);
        case "apiImage":
          acceptedFiles = [".jpg", ".jpeg", ".png", ".bin", ".pcd", ".bin"];
          return caseApiImage(acceptedFiles);
        case "apiVideo":
          acceptedFiles = [".mp4"];
          return caseApiVideo(acceptedFiles);
        default:
          return null;
      }
    };

    const handleChangeTab = (item) => {
      setSelectedObjectTab(item);
    };

    const downloadImage = () => {
      const link = document.createElement("a");
      link.href = resultImageUrl;
      link.setAttribute("download", `download.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    };

    const downloadAudio = () => {
      const link = document.createElement("a");
      link.href = resultAudioUrl;
      link.setAttribute("download", `download.wav`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    };

    const renderApiResult = () => {
      if (chosenItem === "apiVideo")
        return (
          <div
            style={{
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
            }}
            id="resultDiv"
          >
            {t("Video prediction has started.")}
            <br />{" "}
            {t(
              "You’ll be notified in the notification window when it is completed"
            )}
          </div>
        );
      if (projects.project.option.includes("load"))
        return (
          <>
            <div className={classes.content}>
              <div className={classes.displayText}>
                <b>{t("Output")}</b>
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ alignSelf: "center", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    maxHeight: "20em",
                    overflowY: "auto",
                  }}
                >
                  <JSONPretty
                    id="json-pretty"
                    data={objectJson}
                    className={classes.predictResultJson}
                    mainStyle="color:#ffffff"
                    keyStyle="color:#1BC6B4"
                    valueStyle="color:#0A84FF"
                  ></JSONPretty>
                </div>
              </div>
            </div>
          </>
        );

      else if (projects.project.trainingMethod === "detection_3d") {
        return (<div style={{ alignSelf: "center", width: "100%" }} id="resultDiv">
              <>
                  <Button
                    id="resultDownload"
                    className={classes.defaultHighlightButton}
                    onClick={downloadImage}
                  >
                    DOWNLOAD
                  </Button>
                  <div id="canvas03" className={classes.canvasDiv}></div>
                </>
            </div>)
      }
      else if (resultImageUrl) {
        if (projects.project.trainingMethod === "object_detection")
          return (
            <div style={{ alignSelf: "center", width: "100%" }} id="resultDiv">
              {selectedObjectTab === "image" ? (
                <>
                  <Button
                    id="resultDownload"
                    className={classes.defaultHighlightButton}
                    onClick={downloadImage}
                  >
                    DOWNLOAD
                  </Button>
                  <img
                    style={{ width: "100%", maxHeight: "24em" }}
                    src={resultImageUrl}
                    id="resultImg"
                  />
                </>
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxHeight: "20em",
                    overflowY: "auto",
                  }}
                >
                  <JSONPretty
                    id="json-pretty"
                    data={objectJson}
                    mainStyle="color:#ffffff"
                    keyStyle="color:#1BC6B4"
                    valueStyle="color:#0A84FF"
                  ></JSONPretty>
                </div>
              )}
            </div>
          );
        else
          return (
            <>
              <Button
                id="resultDownload"
                className={classes.defaultHighlightButton}
                onClick={downloadImage}
              >
                DOWNLOAD
              </Button>
              <img
                style={{ width: "100%", maxHeight: "24em" }}
                src={resultImageUrl}
                id="resultImg"
              />
            </>
          );
      } else if (resultAudioUrl) {
        return (
          <>
            <Button
              id="resultDownload"
              className={classes.defaultHighlightButton}
              onClick={downloadAudio}
            >
              DOWNLOAD
            </Button>
            <video
              ref={standardVideoRef}
              style={{ width: "100%", maxHeight: "24em" }}
              controls
              currentTime={0}
              src={resultAudioUrl}
              type="video/wav"
            ></video>
          </>
        );
      } else {
        if (projects.project.trainingMethod === "recommender")
          return (
            <>
              <div className={classes.content}>
                <div className={classes.displayText}>
                  <b>{t("Output")}</b>
                </div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ alignSelf: "center", width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      maxHeight: "20em",
                      overflowY: "auto",
                    }}
                  >
                    <JSONPretty
                      id="json-pretty"
                      data={objectJson}
                      className={classes.predictResultJson}
                      mainStyle="color:#ffffff"
                      keyStyle="color:#1BC6B4"
                      valueStyle="color:#0A84FF"
                    ></JSONPretty>
                  </div>
                </div>
              </div>
            </>
          );
        if (selectedObjectTab === "xai")
          return (
            <>
              <img
                style={{ width: "100%", maxHeight: "24em" }}
                src={xaiImage}
                id="resultImg"
              />
              <p>
                *{" "}
                {t(
                  "In the prediction results red is negative and blue is positive"
                )}
              </p>
            </>
          );
        else
          return (
            <>
              <div
                style={{
                  cursor: "auto",
                  textAlign: "left",
                  marginBottom: "10px",
                  fontSize: "25px",
                  color: currentThemeColor.primary1,
                }}
                id="resultDiv"
              >
                <b>
                  {chosenItem === "apiImage"
                    ? handleSelectedImageClass(predictedValue)
                    : handleOutputResultText(predictedValue)}
                </b>
              </div>
              {projects?.project?.valueForNorm ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    color="default"
                    size="small"
                    checked={multiplyAverage}
                    onChange={() => {
                      setMultiplyAverage(!multiplyAverage);
                    }}
                    style={{ marginRight: "4px" }}
                  />
                  <p
                    style={{
                      marginBottom: "0",
                      color: "white",
                      fontSize: "16px",
                    }}
                  >
                    {t("Average value reflected")}
                  </p>
                </div>
              ) : (
                <></>
              )}
              {predictedInfo.length > 0 && (
                <>
                  <b>{t("Predicted Value Information")} (%)</b>
                  <div
                    style={{
                      display: "flex",
                      overflowY: "scroll",
                      marginTop: "20px",
                    }}
                  >
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        // width={400}
                        // height={300}
                        data={predictedInfo}
                        // margin={{
                        // top: 5, right: 30, left: 20, bottom: 5}}
                        layout="vertical"
                      >
                        {/*<Legend verticalAlign="top" height={36} />*/}
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: currentThemeColor.background2 }}
                        />
                        <CartesianGrid
                          stroke={"#999999"}
                          strokeDasharray="3 3"
                        />
                        <YAxis
                          dataKey="name"
                          width={50}
                          height={10}
                          type="category"
                          style={{ fontSize: "0.75rem" }}
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          style={{ fontSize: "0.75rem" }}
                        />
                        <ReferenceLine
                          x={0}
                          stroke="rgb(24, 160, 251)"
                          strokeWidth={3}
                          alwaysShow={true}
                        />
                        <Bar
                          dataKey="value"
                          type="monotone"
                          barSize={30}
                          fill={currentThemeColor.primary2}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          );
      }
    };

    const handleSelectedImageClass = (preVal) => {
      if (preVal) return preVal;
      else if (predictedValue) {
        let topValueLabel = "";
        let topValue = 0;
        predictedValue.forEach((data) => {
          if (data.value > topValue) {
            topValue = data.value;
            topValueLabel = data.name;
          }
        });
        return topValueLabel;
      }
    };

    const handleOutputResultText = (preVal) => {
      let tempResultValue = preVal;
      let tempDiscriminant = !isNaN(+tempResultValue);
      if (
        projects?.project?.valueForNorm &&
        multiplyAverage &&
        typeof tempResultValue === "number"
      )
        tempResultValue = tempResultValue * projects?.project?.valueForNorm;
      return tempDiscriminant
        ? +(Math.round(+tempResultValue * 1000) / 1000)
        : tempResultValue;
    };

    const secAPIActionBtns = () => {
      let serviceType = projects.project?.service_type;
      let isNewUpload =
        serviceType &&
        (serviceType.includes("_training") ||
          serviceType.includes("offline_")) &&
        chosenItem == "apiVideo";

      return (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Button
              id="cancelBtn"
              shape="whiteOutlined"
              style={{ width: "100%", height: "35px" }}
              onClick={closeModal}
            >
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              id="resetData"
              shape="whiteOutlined"
              style={{ width: "100%", height: "35px" }}
              onClick={resetImage}
            >
              {isNewUpload ? t("New Upload") : t("New Prediction")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            {apiLoading === "done" ? null : (
              <Button
                id="sendApiBtn"
                shape="greenOutlined"
                style={{ width: "100%", height: "35px" }}
                onClick={sendAPI}
              >
                {isNewUpload ? t("Confirm") : t("Execute")}
              </Button>
            )}
          </Grid>
        </Grid>
      );
    };

    const renderDescription = (desc) =>
      desc
        ? desc.includes("\\n")
          ? desc.split("\\n").map((sentence, idx) => {
              return <div key={idx}>{sentence}</div>;
            })
          : desc
        : "";

    return (
      <>
        {apiLoading === "loading" || isLoading || models.isLoading ? (
          <div className={classes.loading}>
            <CircularProgress />
            {apiLoading === "loading" && (
              <>
                <LinearProgress
                  style={{ width: "100%", marginTop: "20px" }}
                  variant="determinate"
                  value={completed}
                />
                <p className={classes.text}>
                  {loadingMesseage} {completed}% {t("Completed")}...{" "}
                </p>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {chosenItem === "apiVideo" ? (
              <GridContainer>
                <GridItem xs={12} style={{ fontSize: "25px" }}>
                  {models.model &&
                    models.model.name &&
                    models.model.name.toUpperCase()}
                </GridItem>
                <GridItem
                  xs={12}
                  style={{
                    marginBottom: "12px",
                    maxHeight: "80px",
                    overflowY: "auto",
                  }}
                >
                  {projects.project &&
                    renderDescription(projects.project.description)}
                </GridItem>
                <GridItem xs={12}>
                  {apiLoading === "done" ? renderApiResult() : renderContents()}
                </GridItem>
              </GridContainer>
            ) : (
              <GridContainer style={{ minHeight: "488px" }}>
                <GridItem
                  xs={11}
                  style={{
                    marginTop: "-24px",
                    padding: "0px",
                    fontSize: "20px",
                  }}
                >
                  {models.model &&
                    models.model.name &&
                    models.model.name.toUpperCase()}
                </GridItem>
                <GridItem
                  xs={12}
                  style={{
                    marginBottom: "12px",
                    maxHeight: "80px",
                    overflowY: "auto",
                  }}
                >
                  {projects.project &&
                    renderDescription(projects.project.description)}
                </GridItem>
                <GridItem xs={apiLoading === "done" ? 5 : 8}>
                  <div className={classes.flexContent}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "48px",
                      }}
                    >
                      <b>{t("Input")}</b>
                    </div>
                    {apiLoading !== "done" &&
                      ((chosenItem === "api" && hasRecordsData) ||
                        randomFiles.length > 0) && (
                        <GridItem xs={6}>
                          <Button
                            className={classes.modelTabHighlightButton}
                            style={{
                              width: user.language === "ko" ? "120px" : "150px",
                              height: "30px",
                              marginLeft: "20px",
                              fontSize:
                                user.language === "ko" ? "14px" : "12px",
                            }}
                            onClick={getRandomRecords}
                            id="getRandomeValueBtn"
                          >
                            {t("Fill random values")}
                          </Button>
                        </GridItem>
                      )}
                  </div>
                </GridItem>
                <GridItem
                  xs={1}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                ></GridItem>
                <GridItem
                  xs={apiLoading === "done" ? 6 : 3}
                  style={{ paddingLeft: "0" }}
                >
                  <div className={classes.content}>
                    <div style={{ display: "flex" }}>
                      <b>{t("Result")} </b>
                      {chosenItem === "apiImage" && (
                        <div
                          onClick={() => handleChangeTab("image")}
                          style={{
                            marginLeft: "16px",
                            fontWeight: "700",
                            color:
                              selectedObjectTab === "image"
                                ? "var(--secondary1)"
                                : "var(--textWhite87)",
                          }}
                        >
                          {t("Image")}
                        </div>
                      )}
                    </div>
                    {projects.project && projects.project.valueForPredict && (
                      <div
                        style={{ marginBottom: "10px", wordBreak: "break-all" }}
                      >
                        {t("Target value")}: {projects.project.valueForPredict}
                      </div>
                    )}
                    <div style={{ display: "flex" }}>
                      {objectJson && (
                        <div
                          onClick={() => handleChangeTab("json")}
                          className={
                            selectedObjectTab === "json"
                              ? classes.selectedTab
                              : classes.notSelectedTab
                          }
                        >
                          {t("Coordinate value")}
                        </div>
                      )}
                      {xaiImage && (
                        <div
                          onClick={() => handleChangeTab("xai")}
                          className={
                            selectedObjectTab === "xai"
                              ? classes.selectedTab
                              : classes.notSelectedTab
                          }
                        >
                          XAI
                        </div>
                      )}
                    </div>
                  </div>
                </GridItem>
                <GridItem
                  xs={apiLoading === "done" ? 5 : 8}
                  style={{ paddingRight: "0" }}
                >
                  {renderContents()}
                  <p>
                    {Object.values(outliarInfo).filter(
                      (infoValue) => infoValue === true
                    ).length > 0
                      ? `* ${t("The red letters are outliar values")}`
                      : ""}
                  </p>
                </GridItem>
                <GridItem
                  xs={1}
                  style={{
                    padding: "0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ForwardIcon fontSize="large" />
                </GridItem>
                <GridItem
                  xs={apiLoading === "done" ? 6 : 3}
                  style={{ paddingLeft: "0" }}
                >
                  <div className={classes.content}>
                    <div style={{ overflow: "hidden" }}>
                      {apiLoading === "done" && renderApiResult()}
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
            )}
            {secAPIActionBtns()}
          </div>
        )}
      </>
    );
  }
);

export default API;
