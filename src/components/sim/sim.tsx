import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mouse] = useState(new THREE.Vector2());
  const [raycaster] = useState(new THREE.Raycaster());
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
    setIsMobile(mobile);
  }, []);

  // @ts-ignore
  const createCube = (scene) => {
    // Create a dodecahedron geometry with a radius of 1
    const geometry = new THREE.DodecahedronGeometry(1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const dodecahedron = new THREE.Mesh(geometry, material);
    scene.add(dodecahedron);

    // Edges geometry and material
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 100,
    });

    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    dodecahedron.add(edges); // Add edges as a child of the dodecahedron mesh

    // Set the maximum size of the cube
    const maxCubeSize = 200; // Max size in pixels
    const aspect = window.innerWidth / window.innerHeight;
    const scale = (maxCubeSize / window.innerHeight) * aspect;
    dodecahedron.scale.set(scale, scale, scale);

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

    // @ts-ignore
    const onMouseMove = (event) => {
      // Calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    mountRef.current.addEventListener("mousemove", onMouseMove, false);

    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0xffffff, 0);

    camera.position.z = 5;
    const cube = createCube(scene);
    //    const line = createLine(scene);
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

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);

    // Modify the expandIfRollover function to set a target scale instead of immediately changing the object's scale.
    const expandIfRollover = (
      // @ts-ignore
      mouse,
      // @ts-ignore
      camera,
      // @ts-ignore
      object,
      // @ts-ignore
      targetScale,
      // @ts-ignore

      originalScale,
    ) => {
      // Lerping
      object.userData.targetScale =
        object.userData.targetScale || originalScale.clone();
      object.scale.lerp(object.userData.targetScale, 0.05); // Adjust 0.05 to control the speed of the scale animation
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([object]);
      const isHovered = intersects.length > 0;
      object.userData.targetScale = isHovered ? targetScale : originalScale;
    };

    // @ts-ignore
    const pulseOverTime = (object, targetScale, originalScale, duration) => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime % duration) / duration; // Use modulus to loop time
      const sineWave = Math.sin(elapsedTime * Math.PI * 2); // Sine wave oscillates between -1 and 1
      const progress = sineWave * 0.5 + 0.5;
      const scale = originalScale.clone().lerp(targetScale, progress);
      object.scale.copy(scale);
    };

    const animate = () => {
      if (!isAnimating) return;
      requestAnimationFrame(animate);
      const time = Date.now() * 0.0005;
      cube.material.color.setHSL(Math.sin(time) * 0.5 + 0.5, 0.5, 0.5);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      cube.position.y = -scrollY * 0.01;

      const originalScale = new THREE.Vector3(1, 1, 1);
      const targetScale = new THREE.Vector3(1.2, 1.2, 1.2);
      pulseOverTime(cube, targetScale, originalScale, 3000);
      //      if (!isMobile) {
      // expandIfRollover(mouse, camera, cube, targetScale, originalScale);
      //     }
      renderer.render(scene, camera);
    };

    if (WebGL.isWebGLAvailable()) {
      // Initiate function or other initializations here
      animate();
    } else {
      const warning = WebGL.getWebGLErrorMessage();
      alert("could not render 3d scene");
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAnimating(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (mountRef.current) {
      observer.observe(mountRef.current);
    }

    // Cleanup
    return () => {
      if (!mountRef.current) return;
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove, false);
      window.removeEventListener("scroll", handleScroll);

      if (mountRef.current) {
        observer.unobserve(mountRef.current);
      }
    };
  }, [isAnimating, scrollY]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", minWidth: "400px", height: "100%" }}
    />
  );
};

export default ThreeScene;
