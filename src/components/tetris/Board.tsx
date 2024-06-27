import * as THREE from "three";

export const createBoard = (scene: THREE.Scene): THREE.Mesh[] => {
  const boardWidth = 10;
  const boardHeight = 20;
  const blockSize = 1;

  const board: THREE.Mesh[] = [];
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        x * blockSize - boardWidth / 2,
        y * blockSize - boardHeight / 2,
        0,
      );
      scene.add(cube);
      board.push(cube);
    }
  }
  return board;
};
