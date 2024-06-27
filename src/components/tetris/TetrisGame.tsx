import React, { useState, useEffect, useCallback, useRef } from "react";
import "./TetrisGame.css";

const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: "cyan" }, // I-shape
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
  }, // O-shape
  // Add other shapes (L, J, T, S, Z) here
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TetrisGame: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)),
  );
  const [tetromino, setTetromino] = useState({
    shape: TETROMINOES[0].shape,
    color: TETROMINOES[0].color,
    x: 3,
    y: 0,
  });
  const [cellSize, setCellSize] = useState<number>(20);

  const calculateCellSize = useCallback(() => {
    if (boardRef.current) {
      const { clientWidth, clientHeight } = boardRef.current;
      const size = Math.min(
        clientWidth / BOARD_WIDTH,
        clientHeight / BOARD_HEIGHT,
      );
      setCellSize(size);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", calculateCellSize);
    calculateCellSize();
    return () => {
      window.removeEventListener("resize", calculateCellSize);
    };
  }, [calculateCellSize]);

  const getRandomTetromino = () => {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    return {
      shape: TETROMINOES[randomIndex].shape,
      color: TETROMINOES[randomIndex].color,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    };
  };
  const checkCollision = useCallback(
    (xOffset: number, yOffset: number): boolean => {
      for (let y = 0; y < tetromino.shape.length; y++) {
        for (let x = 0; x < tetromino.shape[y].length; x++) {
          if (
            tetromino.shape[y][x] &&
            (board[tetromino.y + y + yOffset] &&
              board[tetromino.y + y + yOffset][tetromino.x + x + xOffset]) !== 0
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [board, tetromino],
  );

  const mergeTetrominoToBoard = useCallback(() => {
    const newBoard = board.map((row) => [...row]);
    tetromino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          newBoard[tetromino.y + y][tetromino.x + x] = 1;
        }
      });
    });
    setBoard(newBoard);
    setTetromino(getRandomTetromino());
  }, [board, tetromino]);

  const moveTetromino = useCallback(
    (dx: number, dy: number) => {
      if (!checkCollision(dx, dy)) {
        setTetromino((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      } else if (dy > 0) {
        mergeTetrominoToBoard();
      }
    },
    [checkCollision, mergeTetrominoToBoard],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          moveTetromino(-1, 0);
          break;
        case "ArrowRight":
          moveTetromino(1, 0);
          break;
        case "ArrowDown":
          moveTetromino(0, 1);
          break;
        case "ArrowUp":
          // Rotate the piece (add rotation logic here)
          break;
      }
    },
    [moveTetromino],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const interval = setInterval(() => {
      moveTetromino(0, 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [moveTetromino]);

  useEffect(() => {
    mergeTetrominoToBoard();
  }, [mergeTetrominoToBoard, tetromino]);

  return (
    <div
      className="tetris-board  justify-center items-center flex"
      ref={boardRef}
      style={
        {
          width: "100%",
          height: "100%",
          "--cell-size": `${cellSize}px`,
        } as React.CSSProperties
      }
    >
      {board.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`cell ${cell ? "filled" : ""}`}
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          ></div>
        )),
      )}
      {/* <div className="tetromino">
        {tetromino.shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`cell ${cell ? tetromino.color : ""}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                gridRowStart: tetromino.y + y + 1,
                gridColumnStart: tetromino.x + x + 1,
              }}
            ></div>
          )),
        )}
      </div>*/}
    </div>
  );
};

export default TetrisGame;
