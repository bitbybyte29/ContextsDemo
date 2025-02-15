import { useState, useMemo, useEffect } from "react";
import "./styles.css";

function ColorFillingItem(props: {
  index: number;
  color: string;
  handleDrop: any;
}) {
  const { index, color, handleDrop } = props;

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  return (
    <div
      className="colorFillingItem"
      style={{ background: color }}
      onDrop={(e) => handleDrop(e, index)}
      onDragOver={handleDragOver}
    />
  );
}

const colorList = ["green", "red", "yellow", "purple", "orange", "blue"];

function ColorPalleteItem(props: {
  color: string;
  handleDragStart?: Function;
}) {
  const { color, handleDragStart } = props;
  return (
    <div
      className="colorPalleteItem"
      style={{ background: color }}
      draggable
      onDragStart={(event) => handleDragStart?.(event, color)}
    />
  );
}

function ColorSequence(props: { randomColorArr: string[]; hide: boolean }) {
  const { randomColorArr, hide } = props;

  return (
    <div style={{ marginBottom: "10px", height: "100px" }}>
      <h3>Memorize this color sequence and try repeat it!</h3>

      <div className="colorPalleteList" style={{ height: "100px" }}>
        {!hide
          ? randomColorArr.map((color, index) => (
              <ColorPalleteItem key={index} color={color} />
            ))
          : null}
      </div>
    </div>
  );
}

function ColorFilling(props: {
  colorFillList: string[];
  handleDrop: any;
  show: boolean;
}) {
  const { colorFillList, handleDrop, show } = props;

  if (!show) return null;

  return (
    <div>
      <div className="colorFillingList">
        {colorFillList.map((color, index) => (
          <ColorFillingItem
            index={index}
            color={color}
            handleDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

function ColorPallete(props: {
  onClickCheck: VoidFunction;
  handleDragStart: Function;
  show: boolean;
}) {
  const { onClickCheck, handleDragStart, show } = props;
  if (!show) return null;
  return (
    <div>
      <h5>Drag the colors to the slots. Then, click CHECK</h5>
      <div className="colorPalleteList">
        {colorList.map((color, index) => (
          <ColorPalleteItem
            key={index}
            color={color}
            handleDragStart={handleDragStart}
          />
        ))}
        <button onClick={onClickCheck}>Check</button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentLevel, setCurrentLevel] = useState(2);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hide, setHide] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5000);
  const randomColorArr = useMemo(
    () =>
      Array.from(
        { length: currentLevel },
        () => colorList[Math.floor(Math.random() * colorList.length)]
      ),
    [currentLevel]
  );

  const [colorFillArr, setColorFillArr] = useState(
    Array.from({ length: currentLevel }, () => "")
  );

  const onClickCheck = () => {
    const isCorrect = randomColorArr.toString() === colorFillArr.toString();
    setIsCorrect(isCorrect);
    if (isCorrect) {
      setCurrentLevel(currentLevel + 1);
      setColorFillArr(Array.from({ length: currentLevel + 1 }, () => ""));
    }
  };

  const handleDragStart = (event: any, color: string) => {
    event.dataTransfer.setData("color", color);
  };

  const handleDrop = (event: any, index: number) => {
    event.preventDefault();
    const droppedColor = event.dataTransfer.getData("color");

    setColorFillArr((prevState) => {
      const newState = Object.assign([], prevState) as string[];
      newState[index] = droppedColor;
      return newState;
    });
  };

  useEffect(() => {
    setInterval(() => !hide && setTimeLeft(timeLeft - 1000), 1000);
  }, [hide, timeLeft]);

  useEffect(() => {
    setHide(false);
    setTimeLeft(5000);
    setTimeout(() => {
      setHide(true);
    }, 5000);
  }, [currentLevel]);

  return (
    <div className="App">
      <ColorSequence randomColorArr={randomColorArr} hide={hide} />
      {/* {!hide && <div>{timeLeft / 1000} seconds left</div>} */}
      <ColorFilling
        colorFillList={colorFillArr}
        handleDrop={handleDrop}
        show={hide}
      />
      <ColorPallete
        onClickCheck={onClickCheck}
        handleDragStart={handleDragStart}
        show={hide}
      />
      {isCorrect === false ? (
        <div style={{ color: "red" }}>Oops! Try again later</div>
      ) : isCorrect === true ? (
        <div style={{ color: "green" }}>
          That's correct, head on to the next level
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
