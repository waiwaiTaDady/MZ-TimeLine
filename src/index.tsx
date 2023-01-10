import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.less";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import duration from "dayjs/plugin/duration";
import { debounce } from "lodash";
import { useWindowSize } from "./customhooks";

dayjs.extend(minMax);
dayjs.extend(duration);

interface TimeDataType {
  location: number;
  time: string;
}

interface initParamsType {
  width: number;
  height: number;
  arrowsWidth: number;
  pointWidth: number;
  top: string;
  left: string;
}

interface PropsType {
  data: string[];
  initTLSize?: initParamsType;
}

/**
 * TimeLine-Fake 等分时间节点
 * @param props
 * @returns TimeLineF
 */
export default function TimeLineF(props: PropsType) {
  const {
    data,
    initTLSize = {
      width: 800,
      height: 120,
      arrowsWidth: 10,
      pointWidth: 2,
      top: "2%",
      left: "5%",
    },
  } = props;
  const { width, height } = initTLSize;
  const arrowref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const [lineSize, setLineSize] = useState({ width, height });
  const [x, setX] = useState(0);
  const [move, setMove] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [positionArr, setpositionArr] = useState<number[]>([]);
  const [lastPosition, setLastPosition] = useState(-1);
  const [changeType, setChangeType] = useState(false); //false 拖动  true 按钮
  const [timeData, setTimeData] = useState<TimeDataType[]>([]);
  const [curTime, setCurTime] = useState<string>();

  useEffect(() => {
    let width = (size[0] / 1920) * initTLSize.width;
    let height = (size[1] / 1080) * initTLSize.height;
    if (data) {
      let count = data.length;
      let singlePosition = 100 / (count + 1);
      // console.log(singlePosition);
      let pointPositions = data.map(
        (timepoint, index) =>
          Math.round((index + 1) * singlePosition * width) / 100
      );
      let timedata: TimeDataType[] = data.map((item, index) => {
        return {
          time: item,
          location: Math.trunc((index + 1) * singlePosition * 100) / 100,
        };
      });

      // console.log(pointPositions,timedata);
      setTimeData(timedata);
      setpositionArr(pointPositions);
    }
    setLineSize({
      width: width,
      height: height,
    });
  }, [size, data]);

  const hitPointCallback = useCallback(
    debounce((point: number) => {
      // console.log("point:"+point);
      // console.log(lastPosition);
      hitPoint(point);
    }, 300),
    [lastPosition, timeData]
  );

  const hitPoint = (point: number) => {
    // console.log(timeData);
    let curpoint = timeData.find((item, index) => index === point);
    // curpoint && message.info("当前节点" + curpoint.time);
    curpoint && setCurTime && setCurTime(curpoint.time);
  };

  const selectArrow = (e) => {
    setChangeType(false);
    setLastX(e.clientX);
    setMove(true);
  };

  /**
   * 就近捕捉时间节点
   * @param curx mousemove当前位置
   * @param pointArr 时间节点百分比数组
   * @param pointArr 当前位置
   * @param threshold 捕捉阈值默认15 px
   * @returns  值  索引
   */
  const catchPoint = (
    curx: number,
    pointArr: number[],
    curindex: number,
    threshold: number = 15
  ) => {
    let current = curx;
    let catched = curindex;
    if (curx < pointArr[0]) {
      catched = -1;
    }
    if (curx > pointArr[pointArr.length - 1]) {
      catched = pointArr.length - 1;
    }
    pointArr.forEach((point, index) => {
      if (point < curx && pointArr[index + 1] > curx) {
        // current = point + initTLSize.pointWidth / 2;
        catched = index;
      }
      //if捕捉else
      if (point >= curx - threshold && point <= curx + threshold) {
        current = point + initTLSize.pointWidth / 2;
        hitPointCallback(index);
      }
    });
    return { current, catched };
  };

  const mousemove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (lineRef && lineRef.current) {
      let boundLeft = lineRef.current.getBoundingClientRect().left;
      let boundRight = boundLeft + lineSize.width;
      let dx = e.clientX - lastX;
      // console.log(lastX, "left: " + boundLeft, "right: " + boundRight);
      if (e.clientX >= boundLeft && e.clientX <= boundRight) {
        let catchpoint = catchPoint(x + dx, positionArr, lastPosition);
        // let ddd = judgePosition(x + dx,positionArr,lastPosition);
        setX(catchpoint.current);
        // console.log("catched:" + catchpoint.catched);
        setLastPosition(catchpoint.catched);
        // setX(x + dx);
        setLastX(e.clientX);
      }
    }
  };
  const mouseup = (e) => {
    setMove(false);
  };

  useEffect(() => {
    if (move) {
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
    }
    return () => {
      document.removeEventListener("mousemove", mousemove);
      document.removeEventListener("mouseup", mouseup);
    };
  }, [move]);

  const leftClick = () => {
    let position = lastPosition;
    // console.log(position, changeType);
    if (changeType && position < 1) {
      position = position + 1;
    }
    if (lastPosition > -1) {
      setChangeType(true);
      setX(positionArr[position - 1] + initTLSize.pointWidth / 2);
      // if (lastPosition > -1) {
      setLastPosition(position - 1);
      hitPointCallback(position - 1);
      // }
    }
  };
  const rightClick = () => {
    let position = lastPosition;
    setChangeType(true);
    if (lastPosition < timeData.length - 1) {
      setX(positionArr[position + 1] + initTLSize.pointWidth / 2);
      setLastPosition(position + 1);
      hitPointCallback(position + 1);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: `${lineSize.height}px`,
        width: `${lineSize.width + 150}px`,
        top: initTLSize.top,
        left: initTLSize.left,
        background: "#FFFFFFcF",
      }}
    >
      <div
        className="timelinef"
        ref={lineRef}
        style={{
          position: "absolute",
          height: `${lineSize.height}px`,
          width: `${lineSize.width}px`,
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          onClick={leftClick}
          style={{
            position: "absolute",
            left: `-50px`,
            zIndex: "100",
            background: "#dad",
            border: "unset",
            cursor: "pointer",
          }}
        >
          Pre
        </div>
        <div
          className="arrows"
          ref={arrowref}
          onMouseDown={selectArrow}
          style={{
            transform: `translateX(${x}px)`,
            left: "-5px",
            height: "30%",
            width: `${initTLSize.arrowsWidth}px`,
            transition: `${changeType ? "all .5s" : "unset"}`,
          }}
          // style={{ left: `${x}` }}
        ></div>
        <div
          className="timelinep-line"
          style={{ height: "15%", width: "100%" }}
        >
          <div
            className="timelinep-line-fill"
            style={{
              width: `${
                timeData.find((item, index) => index === lastPosition)?.location
              }%`,
              transition: "all .4s",
            }}
          ></div>
          <div className="time-stamp">
            {timeData?.map((item, index) => {
              return (
                <div
                  className="time"
                  key={index}
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: `${initTLSize.pointWidth}px`,
                    background: "#0000002f",
                    left: `${item.location}%`,
                  }}
                >
                  <span>{item.time.replace(/-/g, "/")}</span>
                  {curTime && curTime === item.time && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "150%",
                          height: "40%",
                          width: `${initTLSize.pointWidth}px`,
                          background: "#0979FFFF",
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: "180%",
                          height: "30px",
                          width: `120px`,
                          fontSize: "18px",
                          border: "2px solid #0979FFFF ",
                          background: "#ffffff8f",
                          fontWeight: "600",
                          lineHeight: "24px",
                          textAlign: "center",
                        }}
                      >
                        {item.time.replace(/-/g, "/")}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div
          onClick={rightClick}
          style={{
            position: "absolute",
            right: `-50px`,
            zIndex: "100",
            background: "#dad",
            border: "unset",
            cursor: "pointer",
          }}
        >
          After
        </div>
      </div>
    </div>
  );
}
