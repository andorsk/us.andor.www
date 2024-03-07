import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  //  const mountRef = useRef(null);

  // @ts-ignore
  const createCube = (scene) => {
    // Create a dodecahedron geometry with a radius of 1
    const geometry = new THREE.DodecahedronGeometry(1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const dodecahedron = new THREE.Mesh(geometry, material);
    scene.add(dodecahedron);
    // Edges geometry and material
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    dodecahedron.add(edges); // Add edges as a child of the dodecahedron mesh

    return dodecahedron;
  };

  // @ts-ignore
  const createLine = (scene) => {
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    return line;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    camera.position.z = 5;
    const cube = createCube(scene);
    const line = createLine(scene);
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.0005;
      cube.material.color.setHSL(Math.sin(time) * 0.5 + 0.5, 0.5, 0.5);
      cube.material.color.setHSL(Math.sin(time) * 0.5 + 0.5, 0.5, 0.5);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    if (WebGL.isWebGLAvailable()) {
      // Initiate function or other initializations here
      animate();
    } else {
      const warning = WebGL.getWebGLErrorMessage();
    }

    // Cleanup
    return () => {
      if (!mountRef.current) return;
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Style the div to specify its dimensions, or use external CSS/className
  return <div ref={mountRef} style={{ width: "100%", height: "400px" }} />;
};

export default ThreeScene;
