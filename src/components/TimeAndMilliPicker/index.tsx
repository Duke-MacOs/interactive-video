/**
 * 时间选择器（包含时/分/秒 + 毫秒）
 */
import React, { useState, useEffect } from 'react';
import { TimePicker, Select } from 'antd';
import moment from 'moment';

// virtualTime转换成毫秒 / 毫秒转换为virtualTime
import { getBatchUpdateMS, transferTimeToVirtual } from '../../utils/util';

const { Option } = Select;

// 小时/分钟的格式
const TIME_FORMAT = 'HH:mm:ss';

interface IProps {
  onChange: (value: number) => void;
  value: number;
}

// 毫秒选择器渲染处理
let milliSecondArr: number[] = [];
const renderMilliSecond = () => {
  if (milliSecondArr.length !== 100) {
    milliSecondArr = [];
    for (let i = 0; i < 100; i++) {
      milliSecondArr.push(i);
    }
  }
  return (
    <>
      {milliSecondArr.map((item, index) => (
        <Option key={index.toString()} value={`${item}`}>
          {item}
        </Option>
      ))}
    </>
  );
};

const TimeAndMilliPicker = (props: IProps) => {
  const { value, onChange } = props;

  // 把virtualTime转换为时分秒 + 毫
  const [normalTimeValue, setNormalTimeValue] = useState('00:00:00');
  const [milliTimeValue, setMilliTimeValue] = useState('0');

  // 外部传入的value变化时, 改变组件内的时间（包括毫秒时间）
  useEffect(() => {
    if (value || value === 0) {
      const transferredMSTime = getBatchUpdateMS(value, true);
      const transferredMSTimeArr = transferredMSTime.split('.');

      const normalTimeArr = transferredMSTimeArr[0].split(':');
      if (normalTimeArr.length === 2) {
        // 不带小时 补上
        normalTimeArr.unshift('00');
      }
      setNormalTimeValue(normalTimeArr.join(':'));
      setMilliTimeValue(transferredMSTimeArr[1]);
    }
  }, [value]);

  // 改变 时分秒 单位时处理
  const onChangeNormalValue = (time: moment.Moment | null, timeStr: string) => {
    const virtualTime = transferTimeToVirtual(timeStr, milliTimeValue);
    onChange(virtualTime);
  };

  // 改变 毫秒 单位时处理
  const onChangeMilliValue = (timeStr: string) => {
    const virtualTime = transferTimeToVirtual(normalTimeValue, timeStr);
    onChange(virtualTime);
  };

  return (
    <div className="time-wrap">
      <div className="time-selector-wrap">
        <TimePicker
          value={moment(normalTimeValue, TIME_FORMAT)}
          format={TIME_FORMAT}
          className="move-time-selector"
          size="small"
          suffixIcon=""
          bordered={false}
          showNow={false}
          onChange={onChangeNormalValue}
        />
      </div>
      <span className="time-split">.</span>
      <div className="time-selector-wrap millisecond-wrap">
        <Select
          showSearch
          placeholder="00"
          style={{
            width: 60,
          }}
          value={milliTimeValue}
          onChange={onChangeMilliValue}
          filterOption={(input, option) =>
            option?.children.toString().indexOf(input) >= 0
          }
        >
          {renderMilliSecond()}
        </Select>
      </div>
    </div>
  );
};

export default TimeAndMilliPicker;
