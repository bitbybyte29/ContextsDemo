import { useState, useMemo, useEffect } from "react";
import "./styles.css";

// Color constants for easy management
const COLORS = {
  palette: ["#2ecc71", "#e74c3c", "#f1c40f", "#9b59b6", "#e67e22", "#3498db"],
  background: "#2c3e50",
  text: "#ecf0f1",
  success: "#2ecc71",
  error: "#e74c3c",
};

const GameHeader = () => (
  <header className="game-header">
    <div className="logo-container">
      <span className="logo">🧠🎨</span>
      <h1>Brain Paint</h1>
    </div>
    <p className="subtitle">Where Colors Meet Memory!</p>
  </header>
);

// Timer component
const Timer = ({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) => (
  <div className="timer-container">
    <div
      className="timer-progress"
      style={{ width: `${(timeLeft / totalTime) * 100}%` }}
    />
  </div>
);

// Level progress component
const LevelProgress = ({ currentLevel }: { currentLevel: number }) => (
  <div className="level-container">
    <h2>Level: {currentLevel - 1}</h2>
    <div className="progress-bar">
      {Array(currentLevel)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="progress-dot" />
        ))}
    </div>
  </div>
);

// Game controls component
const GameControls = ({
  onCheck,
  colors,
  onDragStart,
}: {
  onCheck: () => void;
  colors: string[];
  onDragStart: (e: React.DragEvent, color: string) => void;
}) => (
  <div className="game-controls">
    <h3>Drag colors to the slots below</h3>
    <div className="color-palette">
      {colors.map((color, index) => (
        <div
          key={index}
          className="color-chip"
          style={{ backgroundColor: color }}
          draggable
          onDragStart={(e) => onDragStart(e, color)}
        />
      ))}
    </div>
    <button className="check-button" onClick={onCheck}>
      CHECK ANSWER
    </button>
  </div>
);

// Main game component
export default function MemoryGame() {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [gameState, setGameState] = useState({
    isPlaying: false,
    showSequence: true,
    timeLeft: 5000,
    result: null as null | "success" | "error",
  });

  const [userSequence, setUserSequence] = useState<string[]>([]);

  const targetSequence = useMemo(
    () =>
      Array.from(
        { length: currentLevel },
        () => COLORS.palette[Math.floor(Math.random() * COLORS.palette.length)]
      ),
    [currentLevel]
  );

  const handleDragStart = (e: React.DragEvent, color: string) => {
    e.dataTransfer.setData("color", color);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const color = e.dataTransfer.getData("color");
    setUserSequence((prev) => {
      const newSeq = [...prev];
      newSeq[index] = color;
      return newSeq;
    });
  };

  const checkAnswer = () => {
    const isCorrect = targetSequence.every(
      (color, i) => color === userSequence[i]
    );
    setGameState((prev) => ({
      ...prev,
      result: isCorrect ? "success" : "error",
    }));

    if (isCorrect) {
      setTimeout(() => {
        setCurrentLevel((prev) => prev + 1);
        setGameState({
          isPlaying: true,
          showSequence: true,
          timeLeft: 5000,
          result: null,
        });
        setUserSequence([]);
      }, 1500);
    } else {
      setTimeout(() => {
        setGameState({
          isPlaying: false,
          showSequence: false,
          timeLeft: 0,
          result: null,
        });
      }, 1500);
    }
  };

  useEffect(() => {
    if (!gameState.isPlaying) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 100),
      }));
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.isPlaying]);

  useEffect(() => {
    if (gameState.timeLeft > 0 || !gameState.showSequence) return;

    const timeout = setTimeout(() => {
      setGameState((prev) => ({ ...prev, showSequence: false }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [gameState.showSequence, gameState.timeLeft]);

  return (
    <div className="game-container">
      {!gameState.isPlaying ? (
        <button
          className="start-button"
          onClick={() =>
            setGameState({
              isPlaying: true,
              showSequence: true,
              timeLeft: 5000,
              result: null,
            })
          }
        >
          START GAME
        </button>
      ) : (
        <>
          <LevelProgress currentLevel={currentLevel} />
          <Timer timeLeft={gameState.timeLeft} totalTime={5000} />

          {gameState.showSequence && (
            <div className="sequence-display">
              {targetSequence.map((color, i) => (
                <div
                  key={i}
                  className="sequence-color"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {!gameState.showSequence && (
            <div className="answer-slots">
              {targetSequence.map((_, index) => (
                <div
                  key={index}
                  className="slot"
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {userSequence[index] && (
                    <div
                      className="filled-slot"
                      style={{ backgroundColor: userSequence[index] }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {gameState.result && (
            <div className={`result-message ${gameState.result}`}>
              {gameState.result === "success"
                ? "🎉 Correct! Next level..."
                : "❌ Try again!"}
            </div>
          )}

          {!gameState.showSequence && !gameState.result && (
            <GameControls
              onCheck={checkAnswer}
              colors={COLORS.palette}
              onDragStart={handleDragStart}
            />
          )}
        </>
      )}
    </div>
  );
}
