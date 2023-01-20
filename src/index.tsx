import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.less";
import Icon, {
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import minMax from "dayjs/plugin/minMax";
import duration from "dayjs/plugin/duration";

import {
  Alert,
  Button,
  DatePicker,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Spin,
} from "antd";
import { debounce } from "lodash";
import { calendarsvg } from "./images/svgicons";
import youbiao from "./images/youbiao.png";
import moment from "moment";
import { useWindowSize } from "./customhooks";

const { Option } = Select;
type PickerType = "time" | "date" | "month";

dayjs.extend(minMax);
dayjs.extend(duration);

interface TimeDataType {
  max: number;
  min: number;
  times: TimesData[];
}

interface TimesData {
  location: number;
  time: string;
}

const initTLSize = {
  width: 1200,
  height: 120,
  arrowsWidth: 10,
  pointWidth: 2,
  top: "2%",
  left: "5%",
};

/**
 * 时间数组装换方法
 * @param params 时间string数组 YYYY-MM-DD
 * @returns
 */
const timePoint = (params: string[]): TimeDataType => {
  let array = params.map((item) => dayjs(item));
  // let max = dayjs.max(array).add(overday ?? 20, "day");
  // let min = dayjs.min(array).add(-(overday ?? 20), "day");
  let max = dayjs(dayjs.max(array).add(1, "year").get("year") + "-01-01");
  let min = dayjs(dayjs.min(array).get("year") + "-01-01");
  let totalduration = dayjs.duration(max.diff(min)).asDays();
  return {
    max: Number(dayjs(dayjs.max(array).add(1, "year").get("year"))),
    min: Number(dayjs(dayjs.min(array).get("year"))),
    times: params.map((item) => {
      let time = dayjs(item);
      return {
        location:
          Math.trunc(
            (dayjs.duration(time.diff(min)).asDays() / totalduration) * 10000
          ) / 100,
        time: item,
      };
    }),
  };
};

/**
 * 时间范围筛选 用了momentjs
 * @param params 时间string数组 YYYY-MM-DD
 * @param start 开始时间
 * @param end 结束时间
 * @returns
 */
function timeSlice(
  params: string[],
  start: moment.Moment,
  end: moment.Moment
): string[] {
  let array = params.filter((item) => {
    let m = moment(item);
    if (m.isBetween(start, end)) {
      return m;
    }
  });
  return array;
}

function timeYearSlice(
  params: string[],
  time: string,
  minmax?: {
    min: number;
    max: number;
  }
): string[] {
  let year = time.split("-")[0];
  let array = params.filter((item) => item.includes(year));
  return array;
}

/**
 * TimeLine-U 复杂时间轴 这个组件太乱了别看了
 */
export default function TimeLineU(props: {
  data:string[];
  curTime?: string;
  setCurTime?: Function;
}) {
  // const { data, curTime, setCurTime } = props;
  const { width, height } = initTLSize;
  const arrowref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const size = useWindowSize();
  const [curTime, setCurTime] = useState<string>()
  const [lineSize, setLineSize] = useState({ width, height });
  const [elementSize, seteElementSize] = useState<number[]>([1, 1]);
  const [x, setX] = useState(0);
  const [move, setMove] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [positionArr, setpositionArr] = useState<number[]>([]);
  const [lastPosition, setLastPosition] = useState(-1);
  const [changeType, setChangeType] = useState(false); //false 拖动  true 按钮
  const [timeData, setTimeData] = useState<TimesData[]>([]);
  const [minmax, setMinMax] = useState<{
    min: number;
    max: number;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<PickerType>("month");
  const [alertShow, setAlertShow] = useState(false);
  // const timedata = timePoint(times);
  // let timedata: TimeDataType[] = [];

  const [timeForm] = Form.useForm();

  const changeData = (timedata: TimeDataType) => {
    let { times, min, max } = timedata;
    setMinMax({ min, max });
    // setCurMinYear(dayjs(min));
    // setCurMaxYear(dayjs(max));
    timeForm.setFieldsValue({
      start: moment(min + "-01-01"),
      end: moment(max + "-01-01"),
    });
    // setCurMinYear(min);
    let pointPositions: number[] = [];
    for (let index = 0; index < times.length; index++) {
      const element = times[index];
      let wid = (element.location * width) / 100;
      pointPositions.push(wid);
    }
    setTimeData(times);
    setpositionArr(pointPositions);

    let crindex = times.findIndex((i) => i.time === curTime);
    // console.log(crindex,pointPositions[crindex]);
    setLastPosition(crindex);
    crindex > -1 && setX(pointPositions[crindex] + initTLSize.pointWidth / 2);
  };

  useEffect(() => {
    let width = (size[0] / 1920) * initTLSize.width;
    let height = (size[1] / 1080) * initTLSize.height;
    setLineSize({
      width: width,
      height: height,
    });
    seteElementSize([size[0] / 1920, size[1] / 1080]);
  }, [size]);

  useEffect(() => {
    if (data) {
      let timedata = timePoint(data);
      changeData(timedata);
    }
  }, [data]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
    // curpoint && setCurTime && setCurTime(curpoint.time);
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
   * @param threshold 捕捉阈值默认10 px
   * @returns  值  索引
   */
  const catchPoint = (
    curx: number,
    pointArr: number[],
    curindex: number,
    threshold: number = 10
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
  const handleTimeOk = (value: {
    start: moment.Moment;
    end: moment.Moment;
  }) => {
    const { start, end } = value;
    if (data) {
      let timed = timePoint(timeSlice(data, start, end));
      changeData(timed);
    }
    setIsModalOpen(false);
  };

  const handleBig = () => {
    // console.log(lastPosition, timeData[lastPosition].time);
    if (data) {
      let timed = timePoint(
        timeYearSlice(data, timeData[lastPosition].time, minmax)
      );
      changeData(timed);
    }
  };

  const handleSmall = () => {
    if (data) {
      let timedata = timePoint(data);
      changeData(timedata);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: `${lineSize.height + 15}px`,
        width: `${lineSize.width + 150}px`,
        top: initTLSize.top,
        left: initTLSize.left,
        background: "#FFFFFFca",
        borderRadius: "5px",
      }}
    >
      <Space
        size={0}
        style={{ width: "100%", marginLeft: "1%", zIndex: "100" }}
      >
        <Button
          type="text"
          icon={
            <Icon
              component={calendarsvg("blue", `${elementSize[1] * 25}`)}
            />
          }
          onClick={showModal}
        />
        <Button
          type="text"
          onClick={handleBig}
          icon={
            <PlusCircleOutlined
              style={{ fontSize: `${elementSize[1] * 18}px` }}
            />
          }
        />
        <Button
          type="text"
          onClick={handleSmall}
          icon={
            <MinusCircleOutlined
              style={{ fontSize: `${elementSize[1] * 18}px` }}
            />
          }
        />
      </Space>
      <Button
        style={{ position: "absolute", right: "0", top: "0" }}
        type="text"
        onClick={() => {
          setAlertShow(!alertShow);
        }}
        icon={
          <QuestionCircleOutlined
            style={{ fontSize: `${elementSize[1] * 18}px` }}
          />
        }
      />
      <div
        className="timelineu"
        ref={lineRef}
        style={{
          position: "absolute",
          height: `${lineSize.height}px`,
          width: `${lineSize.width}px`,
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <CaretLeftOutlined
          onClick={leftClick}
          style={{
            position: "absolute",
            left: "-10%",
            zIndex: "1000",
            background: "transparent",
            border: "unset",
          }}
        />
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
        >
          <img src={youbiao} style={{ position: "absolute", height: "100%" }} />
        </div>
        <div
          className="timelineu-line"
          style={{ height: "15%", width: "100%" }}
        >
          <div
            className="timelineu-line-fill"
            style={{
              width: `${
                timeData.find((item, index) => index === lastPosition)?.location
              }%`,
              transition: "all .4s",
            }}
          ></div>
          <div className="time-stamp">
            {minmax && (
              <span
                style={{ left: "-20px", fontSize: `${elementSize[1] * 18}px` }}
              >
                {minmax?.min}
              </span>
            )}
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
                  {/* <span>{item.time.replace(/-/g, "/")}</span> */}
                  {curTime && curTime === item.time && (
                    <>
                      {/* <div
                        style={{
                          position: "absolute",
                          bottom: "150%",
                          height: "40%",
                          width: `${initTLSize.pointWidth}px`,
                          background: "#0979FFFF",
                        }}
                      ></div> */}
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                          bottom: "160%",
                          height: `${elementSize[1] * 25}px`,
                          width: `${elementSize[1] * 100}px`,
                          fontSize: `${elementSize[1] * 16}px`,
                          // border: "2px solid #0979FFFF ",
                          background: "#ffffff8f",
                          fontWeight: "bold",
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
            {minmax && (
              <span
                style={{ right: "-20px", fontSize: `${elementSize[1] * 18}px` }}
              >
                {minmax?.max}
              </span>
            )}
          </div>
        </div>
        <CaretRightOutlined
          onClick={rightClick}
          style={{
            position: "absolute",
            right: "-10%",
            zIndex: "1000",
            background: "transparent",
            border: "unset",
          }}
        />
      </div>
      <Modal
        title={
          <span style={{ fontSize: "18px" }}>
            时间范围:
            <span style={{ fontWeight: "bold", paddingLeft: "2px" }}>
              {minmax?.min + "~" + minmax?.max}
            </span>
          </span>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        mask={false}
        footer={null}
        destroyOnClose={true}
        centered
      >
        <Form
          name="selecttime"
          onFinish={handleTimeOk}
          // onFinishFailed={() => {}}
          preserve={false}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          form={timeForm}
        >
          <Form.Item label="时间类型">
            <Select value={type} onChange={setType}>
              <Option value="date">日期</Option>
              <Option value="month">月份</Option>
              <Option value="year">年份</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="开始时间"
            name="start"
            dependencies={["end"]}
            rules={[
              {
                required: true,
                message: "请输入开始时间!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue("end")) {
                    return Promise.resolve();
                  }
                  if (!value || getFieldValue("end").isSameOrAfter(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("开始时间不能大于结束时间!"));
                },
              }),
            ]}
          >
            <DatePicker
              picker={type}
              style={{ width: "100%" }}
              // onChange={onMinChange}
            />
          </Form.Item>
          <Form.Item
            label="结束时间"
            name="end"
            dependencies={["start"]}
            rules={[
              {
                required: true,
                message: "请输入结束时间!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue("start")) {
                    return Promise.resolve();
                  }
                  if (!value || getFieldValue("start").isSameOrBefore(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("结束时间不能小于开始时间!"));
                },
              }),
            ]}
          >
            <DatePicker
              picker={type}
              style={{ width: "100%" }}
              // onChange={onMaxChange}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {alertShow && (
        <Alert
          style={{
            position: "absolute",
            zIndex: "9999",
            opacity: 0.9,
            width: "80%",
            right: "20px",
          }}
          message={<span style={{fontWeight:"bold"}}>FAQ</span>}
          description={
            <div
              style={{
                padding:"0 6%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  height:"30px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Icon
                  component={calendarsvg(
                    "#daa",
                    `${elementSize[1] * 25}`
                  )}
                />
                <span>时间轴使日期范围选择</span>
              </div>
              <div
                style={{
                  height:"30px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <PlusCircleOutlined
                  style={{ fontSize: `${elementSize[1] * 18}px` }}
                />
                <span>缩小时间范围，当前时间前后一年</span>
              </div>
              <div
                style={{
                  height:"30px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <MinusCircleOutlined
                  style={{ fontSize: `${elementSize[1] * 18}px` }}
                />
                <span>放大时间范围至所有时间</span>
              </div>
            </div>
          }
          type="info"
          // showIcon
          closable
        />
      )}
    </div>
  );
}
