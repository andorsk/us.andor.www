import React, { useEffect } from "react";
import * as THREE from "three";

interface KeyboardControlsProps {
  tetromino: THREE.Group;
}

const KeyboardControls: React.FC<KeyboardControlsProps> = ({ tetromino }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          tetromino.position.x -= 1;
          break;
        case "ArrowRight":
          tetromino.position.x += 1;
          break;
        case "ArrowDown":
          tetromino.position.y -= 1;
          break;
        case "ArrowUp":
          // Rotate the piece (add rotation logic)
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [tetromino]);

  return null;
};

export default KeyboardControls;
