import React, { useState, useEffect, useRef } from "react";
import { currentTheme } from "assets/jss/material-dashboard-react.js";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import * as THREE from "three";
import $ from "jquery";

const styles = {
  canvasDiv: {
    alignSelf: "center",
    "&:active": {
      cursor: "-webkit-grabbing",
    },
  },
};

const useStyles = makeStyles(styles);

const StartCircle = ({ projectStatus, canRender }) => {
  const classes = useStyles();
  let ref = useRef();
  const COLOR_BACKGROUND = currentTheme.background2; // currentTheme.background1 백그라운드 #0D101B #0b1019 #0c101a
  const COLOR_BEFORE_START = "#8c8c8c"; // 시작하기전 //#757575, #7a7a7a, #808080, #8c8c8c
  const COLOR_AFTER_INNER = "#FFD700";
  const COLOR_AFTER_OUTER = "#FFA500"; // 밖에 원 + 백그라운드 파편

  useEffect(() => {
    var controls;
    var num = 0;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    var innerColor =
        projectStatus === 100 ? COLOR_AFTER_INNER : COLOR_BEFORE_START,
      outerColor =
        projectStatus === 100 ? COLOR_AFTER_OUTER : COLOR_BEFORE_START;
    var innerSize = 45, // 안에 구 사이즈
      outerSize = 60; // 밖에 구 사이즈

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // background
    var circleWidth = window.innerWidth * 0.375;
    var circleHeight = window.innerHeight * 0.375;
    //var circleWidth = 420;
    //var circleHeight = document.getElementById("canvas02").parentElement.offsetHeight;
    renderer.setSize(circleWidth, circleHeight);
    document.getElementById("canvas02").appendChild(renderer.domElement);

    // controls = new THREE.TrackballControls( camera );
    // controls.noPan = true;
    // controls.minDistance = 120;
    // controls.maxDistance = 650;

    camera.position.z = -400;
    // Mesh
    var group = new THREE.Group();
    scene.add(group);

    // Lights
    var light = new THREE.AmbientLight(innerColor); // soft white light
    scene.add(light);

    var directionalLight = new THREE.DirectionalLight(innerColor, 1);
    directionalLight.position.set(0, 128, 128);
    scene.add(directionalLight);

    // Sphere Wireframe Inner
    var sphereWireframeInner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(innerSize, 2),
      new THREE.MeshLambertMaterial({
        color: innerColor,
        ambient: innerColor,
        wireframe: true,
        transparent: true,
        //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/alphamap.jpg' ),
        shininess: 0, //check
      })
    );
    scene.add(sphereWireframeInner);

    // Sphere Wireframe Outer
    var sphereWireframeOuter = new THREE.Mesh(
      new THREE.IcosahedronGeometry(outerSize, 3),
      new THREE.MeshLambertMaterial({
        color: outerColor,
        ambient: outerColor,
        wireframe: true,
        transparent: true,
        //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/alphamap.jpg' ),
        shininess: 0, //check
      })
    );
    scene.add(sphereWireframeOuter);

    // Sphere Glass Inner
    var sphereGlassInner = new THREE.Mesh(
      new THREE.SphereGeometry(innerSize, 32, 32),
      new THREE.MeshPhongMaterial({
        color: innerColor,
        ambient: innerColor,
        transparent: true,
        shininess: 25,
        //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
        opacity: 0.3, //check //안에 구 투명도
      })
    );
    scene.add(sphereGlassInner);

    // Sphere Glass Outer
    var sphereGlassOuter = new THREE.Mesh(
      new THREE.SphereGeometry(outerSize, 32, 32),
      new THREE.MeshPhongMaterial({
        color: outerColor,
        ambient: outerColor,
        transparent: true,
        shininess: 25,
        //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
        opacity: 0.3, //check
      })
    );
    //scene.add(sphereGlassOuter);

    // Particles Outer
    var geometry = new THREE.Geometry();
    for (i = 0; i < 35000; i++) {
      var x = -1 + Math.random() * 2;
      var y = -1 + Math.random() * 2;
      var z = -1 + Math.random() * 2;
      var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
      x *= d;
      y *= d;
      z *= d;

      var vertex = new THREE.Vector3(
        x * outerSize,
        y * outerSize,
        z * outerSize
      );

      //geometry.vertices.push(vertex);
    }

    var particlesOuter = new THREE.PointCloud(
      geometry,
      new THREE.PointCloudMaterial({
        size: 0.1,
        color: innerColor,
        //map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
        transparent: true,
      })
    );
    scene.add(particlesOuter);

    // Particles Inner
    var geometry = new THREE.Geometry();
    for (var i = 0; i < 35000; i++) {
      var x = -1 + Math.random() * 2;
      var y = -1 + Math.random() * 2;
      var z = -1 + Math.random() * 2;
      var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
      x *= d;
      y *= d;
      z *= d;

      var vertex = new THREE.Vector3(
        x * outerSize,
        y * outerSize,
        z * outerSize
      );

      geometry.vertices.push(vertex);
    }

    var particlesInner = new THREE.PointCloud(
      geometry,
      new THREE.PointCloudMaterial({
        size: 0.1,
        color: innerColor,
        //map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
        transparent: true,
      })
    );
    scene.add(particlesInner);

    // Starfield
    var geometry = new THREE.Geometry();
    for (i = 0; i < 5000; i++) {
      var vertex = new THREE.Vector3();
      vertex.x = Math.random() * 2000 - 1000;
      vertex.y = Math.random() * 2000 - 1000;
      vertex.z = Math.random() * 2000 - 1000;
      geometry.vertices.push(vertex);
    }
    var starField = new THREE.PointCloud(
      geometry,
      new THREE.PointCloudMaterial({
        size: 2,
        color: innerColor, // 구 안에 색깔
      })
    );
    //scene.add(starField); // hide stars

    camera.position.z = -110;
    //camera.position.x = mouseX * 0.05;
    //camera.position.y = -mouseY * 0.05;
    //camera.lookAt(scene.position);

    var time = new THREE.Clock();

    var render = function() {
      if (!ref.current) {
        return;
      }
      //camera.position.x = mouseX * 0.05;
      //camera.position.y = -mouseY * 0.05;
      camera.lookAt(scene.position);

      sphereWireframeInner.rotation.x += 0.002;
      sphereWireframeInner.rotation.z += 0.002;

      sphereWireframeOuter.rotation.x += 0.001;
      sphereWireframeOuter.rotation.z += 0.001;

      sphereGlassInner.rotation.y += 0.005;
      sphereGlassInner.rotation.z += 0.005;

      sphereGlassOuter.rotation.y += 0.01;
      sphereGlassOuter.rotation.z += 0.01;

      particlesOuter.rotation.y += 0.0005;
      particlesInner.rotation.y -= 0.002;

      starField.rotation.y -= 0.002;

      if (projectStatus === 100) {
        var innerShift = Math.abs(Math.cos((time.getElapsedTime() + 2.5) / 20));
        var outerShift = Math.abs(Math.cos((time.getElapsedTime() + 5) / 10));

        //starField.material.color.setHSL(Math.abs(Math.cos((time.getElapsedTime() / 10))), 1, 1); //0.5

        sphereWireframeOuter.material.color.setHSL(0, 1, outerShift);
        sphereGlassOuter.material.color.setHSL(0, 1, outerShift);
        particlesOuter.material.color.setHSL(0, 1, outerShift);

        sphereWireframeInner.material.color.setHSL(0.08, 1, innerShift);
        particlesInner.material.color.setHSL(0.08, 1, innerShift);
        sphereGlassInner.material.color.setHSL(0.08, 1, innerShift);

        sphereWireframeInner.material.opacity = Math.abs(
          Math.cos((time.getElapsedTime() + 0.5) / 0.9) * 0.5
        );
        sphereWireframeOuter.material.opacity = Math.abs(
          Math.cos(time.getElapsedTime() / 0.9) * 0.5
        );

        directionalLight.position.x =
          Math.cos(time.getElapsedTime() / 0.5) * 128;
        directionalLight.position.y =
          Math.cos(time.getElapsedTime() / 0.5) * 128;
        directionalLight.position.z =
          Math.sin(time.getElapsedTime() / 0.5) * 128;
      }
      //controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    if (ref.current) {
      render();
    }

    // Mouse and resize events
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    //window.addEventListener('resize', onWindowResize, false);
    // if(projectStatus === 0){
    //   document.getElementById("canvas02").addEventListener( 'mouseenter', onDocumentMouseOver, false );
    //   document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    // }

    function onDocumentMouseOver() {
      var innerShift = Math.abs(Math.cos((time.getElapsedTime() + 2.5) / 20));
      var outerShift = Math.abs(Math.cos((time.getElapsedTime() + 5) / 10));
      sphereWireframeOuter.material.color.setHSL(0, 1, outerShift);
      //sphereGlassOuter.material.color.setHSL(0, 1, outerShift);
      //particlesOuter.material.color.setHSL(0, 1, outerShift);
      sphereWireframeInner.material.color.setHSL(0.08, 1, innerShift);
      //particlesInner.material.color.setHSL(0.08, 1, innerShift);
      //sphereGlassInner.material.color.setHSL(0.08, 1, innerShift);
    }

    function onDocumentMouseOut() {
      var innerShift = Math.abs(Math.cos(time.getElapsedTime()));
      var outerShift = Math.abs(Math.cos(time.getElapsedTime()));
      sphereWireframeOuter.material.color.setHSL(0, 0, outerShift);
      //sphereGlassOuter.material.color.setHSL(0, 0, outerShift);
      //particlesOuter.material.color.setHSL(0, 0, outerShift);
      sphereWireframeInner.material.color.setHSL(0, 0, innerShift);
      //particlesInner.material.color.setHSL(0, 0, innerShift);
      //sphereGlassInner.material.color.setHSL(0, 0, innerShift);
    }

    function onWindowResize() {
      var circleWidth = window.innerWidth * 0.35;
      var circleHeight = window.innerHeight * 0.35;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(circleWidth, circleHeight);
    }

    function onDocumentMouseMove(event) {
      if (num > 1) {
        return;
      }
      var mouseX = event.clientX - window.innerWidth / 2;
      var mouseY = event.clientY - window.innerHeight / 2;
      num++;
    }
  }, []);

  return <div id="canvas02" className={classes.canvasDiv} ref={ref}></div>;
};

export default React.memo(StartCircle);
