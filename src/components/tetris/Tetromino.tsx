import * as THREE from "three";

const tetrominoes = [
  [
    // I-shape
    [1, 1, 1, 1],
  ],
  [
    // O-shape
    [1, 1],
    [1, 1],
  ],
  // Add other shapes (L, J, T, S, Z) here
];

export const createTetromino = (): THREE.Group => {
  const shape = tetrominoes[0];
  const blockSize = 1;
  const tetromino = new THREE.Group();
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x * blockSize, y * blockSize, 0);
        tetromino.add(cube);
      }
    });
  });
  return tetromino;
};
