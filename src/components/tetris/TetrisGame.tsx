import React, { useState, useEffect, useCallback, useRef } from "react";
import "./TetrisGame.css";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";

type Tetrino = {
  shape: string[][]; // Change shape to string[][]
  color: string;
  label: string;
  y: number;
  rotation?: number;
  textcolor?: string;
  x: number;
};

type TetrinoShapeProps = {
  tetrino: Tetrino;
};

const TetrinoShape: React.FC<TetrinoShapeProps> = ({ tetrino }) => {
  return (
    <div
      className="tetris-shape"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${tetrino.shape.length}, 20px)`, // Adjust height of rows
        gridTemplateColumns: `repeat(${tetrino.shape.reduce(
          (max, row) => Math.max(max, row.length),
          0,
        )}, 20px)`, // Adjust width of columns
      }}
    >
      {tetrino.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="shape-cell"
            style={{
              backgroundColor: tetrino.color,
              color: tetrino.textcolor,
              textAlign: "center",
              lineHeight: "20px", // Ensures vertical centering
            }}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  );
};

const Tetrinos: Tetrino[] = [
  {
    shape: [["G", "O"]],
    color: "cyan",
    textcolor: "black",
    label: "Golang",
    x: 4,
    y: 0,
  },
  {
    shape: [["J"], ["S"]],
    color: "red",
    textcolor: "black",
    label: "JS",
    x: 4,
    y: 0,
  },
  {
    shape: [
      ["P", "Y"],
      ["Y", "H", "O", "N"],
    ],
    color: "green",
    textcolor: "black",
    label: "Python",
    x: 4,
    y: 0,
  },
  {
    shape: [
      ["E", "L"],
      ["I", "S", "P"],
    ],
    color: "yellow",
    textcolor: "black",
    label: "Elisp",
    x: 4,
    y: 0,
  },
  {
    shape: [
      ["T", "E", "R", "R"],
      ["A", "F", "O", "R", "M"],
    ],
    color: "orange",
    textcolor: "black",
    label: "Terraform",
    x: 4,
    y: 0,
  },
  {
    shape: [["G", "C"], ["P"]],
    color: "brown",
    textcolor: "black",
    label: "GCP",
    x: 4,
    y: 0,
  },
];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

type GameControlsProps = {
  nextTetrinos: Tetrino[];
  handleRotate: () => void;
  handleLeft: () => void;
  handleRight: () => void;
  allTetrinos: Tetrino[];
  handleDown: () => void;
};

const ControlButtons: React.FC<GameControlsProps> = ({
  handleRotate,
  handleLeft,
  handleRight,
  handleDown,
}) => {
  return (
    <div className="control-buttons flex flex-col gap-2">
      <button className="control-button" onClick={handleRotate}>
        <ArrowPathIcon className="control-icon w-8 h-8" />
      </button>
      <div className="flex flex-row gap-2">
        <button className="control-button" onClick={handleLeft}>
          <ArrowLeftIcon className="control-icon w-8 h-8" />
        </button>
        <button className="control-button" onClick={handleDown}>
          <ArrowDownIcon className="control-icon w-8 h-8" />
        </button>
        <button className="control-button" onClick={handleRight}>
          <ArrowRightIcon className="control-icon w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const GameControls: React.FC<GameControlsProps> = ({
  nextTetrinos,
  allTetrinos,
  handleRotate,
  handleLeft,
  handleRight,
  handleDown,
}) => {
  return (
    <div className="tetris-control-panel w-full grid grid-cols-3 gap-4">
      {/* First Column: Controls */}
      <div className="controls col-span-1">
        <h2 className="text-lg font-bold mb-4">Controls:</h2>
        <ControlButtons
          nextTetrinos={nextTetrinos} // Display the next 3 tetrinos
          allTetrinos={Tetrinos}
          handleRotate={handleRotate}
          handleLeft={handleLeft}
          handleRight={handleRight}
          handleDown={handleDown}
        />
      </div>

      {/* Second Column: Upcoming Tetrinos */}
      <div className="upcoming-tetrinos col-span-1">
        <h2 className="text-lg font-bold mb-4">Upcoming Tetrinos:</h2>
        <div className="flex flex-col gap-2">
          {nextTetrinos.map((tetrino, index) => (
            <div
              key={index}
              className="next-tetrino flex flex-row gap-2 items-center"
            >
              <div
                className={`tetris-preview bg-${tetrino.color} w-12 h-12 flex items-center justify-center text-sm font-bold text-gray-800`}
              >
                <TetrinoShape tetrino={tetrino} />
              </div>
              <span className="text-sm">{tetrino.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Third Column: All Tetrinos */}
      <div className="all-tetrinos col-span-1">
        <h2 className="text-lg font-bold mb-4">All Tetrinos:</h2>
        <div className="flex flex-col gap-2">
          {allTetrinos.map((tetrino, index) => (
            <div
              key={index}
              className="all-tetrino flex flex-row gap-2 items-center"
            >
              <div
                className={`tetris-preview bg-${tetrino.color} w-12 h-12 flex items-center justify-center text-sm font-bold text-gray-800`}
              >
                <TetrinoShape tetrino={tetrino} />
              </div>
              <span className="text-sm">{tetrino.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TetrisGame: React.FC = () => {
  const boardRef = useRef<HTMLDivElement>(null);

  const [boardFilled, setIsBoardFilled] = useState(false);
  const [tetrinoQueue, setTetrinoQueue] = useState<Tetrino[]>([]);
  const [currentTetrino, setCurrentTetrino] = useState<Tetrino | null>(null);
  const [board, setBoard] = useState<(string | number)[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)),
  );
  const [cellSize, setCellSize] = useState<number>(20);

  const addTetrinoToQueue = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * Tetrinos.length);
    const newTetrino = {
      ...Tetrinos[randomIndex],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    };
    setTetrinoQueue((prevQueue) => [...prevQueue, newTetrino]);
  }, []);

  useEffect(() => {
    if (tetrinoQueue.length === 0) {
      addTetrinoToQueue();
      addTetrinoToQueue();
      addTetrinoToQueue();
    }
  }, [tetrinoQueue, addTetrinoToQueue]);

  useEffect(() => {
    if (tetrinoQueue.length > 0 && !currentTetrino) {
      setCurrentTetrino(tetrinoQueue[0]);
      setTetrinoQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [tetrinoQueue, currentTetrino]);

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

  const checkCollision = useCallback(
    (xOffset: number, yOffset: number): boolean => {
      if (!currentTetrino) return false;
      for (let y = 0; y < currentTetrino.shape.length; y++) {
        for (let x = 0; x < currentTetrino.shape[y].length; x++) {
          if (
            currentTetrino.shape[y][x] &&
            (board[currentTetrino.y + y + yOffset] &&
              board[currentTetrino.y + y + yOffset][
                currentTetrino.x + x + xOffset
              ]) !== 0
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [board, currentTetrino],
  );

  const mergeTetrinoToBoard = useCallback(() => {
    if (!currentTetrino) return;

    const newBoard = board.map((row) => [...row]);
    let gameOver = false;

    currentTetrino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== " ") {
          // Check for non-empty character
          if (currentTetrino.y + y <= 0) {
            // If any part of the shape reaches the top
            gameOver = true;
          } else {
            newBoard[currentTetrino.y + y][currentTetrino.x + x] =
              currentTetrino.color;
          }
        }
      });
    });

    if (gameOver) {
      setIsBoardFilled(true);
      console.log("Game Over");
      return; // You can add your game over logic here
    }

    // Check for completed lines and remove them
    let linesToRemove: number[] = [];
    newBoard.forEach((row, index) => {
      if (row.every((cell) => cell !== 0)) {
        linesToRemove.push(index);
      }
    });

    if (linesToRemove.length > 0) {
      // Remove completed lines
      linesToRemove.forEach((lineIndex) => {
        newBoard.splice(lineIndex, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
      });
    }

    setBoard(newBoard);
    setCurrentTetrino(null);
    addTetrinoToQueue();
  }, [board, currentTetrino, addTetrinoToQueue]);

  const moveTetrino = useCallback(
    (dx: number, dy: number) => {
      if (!currentTetrino) return;
      if (!checkCollision(dx, dy)) {
        setCurrentTetrino((t) => t && { ...t, x: t.x + dx, y: t.y + dy });
      } else if (dy > 0) {
        mergeTetrinoToBoard();
      }
    },
    [checkCollision, mergeTetrinoToBoard, currentTetrino],
  );

  const rotateTetrino = useCallback(
    (direction: "clockwise" | "counterclockwise") => {
      if (!currentTetrino) return;

      if (!currentTetrino.rotation) {
        currentTetrino.rotation = 0;
      }

      const newRotation =
        direction === "clockwise"
          ? (currentTetrino?.rotation + 1) % 4
          : (currentTetrino?.rotation + 3) % 4; // 3 is the same as -1 mod 4

      if (!checkCollision(0, 0)) {
        setCurrentTetrino(
          (t) =>
            t && {
              ...t,
              shape: rotateShape(t.shape, newRotation),
              rotation: newRotation,
            },
        );
      }
    },
    [checkCollision, currentTetrino],
  );

  const rotateShape = (shape: string[][], rotation: number): string[][] => {
    const size = shape.length;
    const rotatedShape: string[][] = [];

    for (let y = 0; y < size; y++) {
      rotatedShape[y] = [];
      for (let x = 0; x < size; x++) {
        rotatedShape[y][x] = shape[size - 1 - x][y]; // Rotate clockwise
        // For counterclockwise: rotatedShape[y][x] = shape[x][size - 1 - y];
      }
    }

    return rotatedShape;
  };

  const handleRotateClick = () => {
    rotateTetrino("clockwise");
  };

  const handleLeftClick = () => {
    moveTetrino(-1, 0);
  };

  const handleRightClick = () => {
    moveTetrino(1, 0);
  };

  const handleDownClick = () => {
    moveTetrino(0, 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveTetrino(0, 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [moveTetrino]);
  return (
    <div className="w-full text-center flex h-full m-10 items-center">
      {boardFilled && (
        <div className="absolute flex text-4xl flex-col bg-black items-center justify-center">
          Board Complete
        </div>
      )}
      <div
        className="tetris-board h-full w-full "
        ref={boardRef}
        style={
          {
            "--cell-size": `${cellSize}px`,
          } as React.CSSProperties
        }
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            const isTetrinoCell =
              currentTetrino &&
              currentTetrino.shape[y - currentTetrino.y] &&
              currentTetrino.shape[y - currentTetrino.y][x - currentTetrino.x];

            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${cell ? "filled" : ""}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  color: isTetrinoCell ? currentTetrino!.textcolor : undefined,
                  backgroundColor: isTetrinoCell
                    ? currentTetrino!.color
                    : typeof cell === "string"
                      ? cell
                      : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isTetrinoCell && (
                  <div
                    className={`cell ${currentTetrino!.color}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      textAlign: "center",
                      lineHeight: `${cellSize}px`, // Ensures vertical centering
                    }}
                  >
                    {
                      currentTetrino!.shape[y - currentTetrino!.y][
                        x - currentTetrino!.x
                      ]
                    }
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
      <div className="w-full">
        <GameControls
          nextTetrinos={tetrinoQueue.slice(0, 3)} // Display the next 3 tetrinos
          allTetrinos={Tetrinos}
          handleRotate={handleRotateClick}
          handleLeft={handleLeftClick}
          handleRight={handleRightClick}
          handleDown={handleDownClick}
        />
      </div>
    </div>
  );
};

export default TetrisGame;
