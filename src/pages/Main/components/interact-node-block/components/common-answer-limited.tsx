/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import { Radio, Select } from 'antd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useSystemState from '../../../../../hooks/useSystemState';
import useNativeState from '../../../../../hooks/useNativeState';
import TimeAndMilliPicker from '../../../../../components/TimeAndMilliPicker';

interface IProps {
  node: INative.InteractNode | undefined;
}

const SelectTimes = [5, 10, 20, 30];

const defaultOptions = [
  {
    value: 'default',
    text: '正确答案',
  },
  {
    value: 'timeStamp',
    text: '选择时间',
  },
];

const AnswerLimitedTimeSetting: React.FC<IProps> = ({ node }) => {
  const { systemState } = useSystemState();
  const { nativeDispatch, nativeQueryTool } = useNativeState();
  const { currentNodeId } = systemState;

  const { answerLimitedTime } = node?.node as INative.AutoPause;
  const { time, type, value } = answerLimitedTime;

  const [modeOptions, setModeOptions] = useState<
    { value: string; text: string }[]
  >([]);
  const [timeVisible, setTimeVisible] = useState<boolean>(false);

  useEffect(() => {
    if (node?.node.type === INative.InteractsType.BRANCH_STORY) {
      const selections = node?.node.selections.map((s, idx) => {
        return {
          value: s.id,
          text: `分支${idx + 1}`,
        };
      });
      setModeOptions([...selections, { value: 'timeStamp', text: '选择时间' }]);
    } else {
      setModeOptions(defaultOptions);
    }
  }, [node]);

  useEffect(() => {
    setTimeVisible(answerLimitedTime.type === 'timeStamp');
  }, [answerLimitedTime]);

  const handleChangeTime = (time: number) => {
    const _node = _.cloneDeep(node);
    (_node?.node as INative.AutoPause).answerLimitedTime.time = time;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleChangeMode = (mode: string) => {
    const _node = _.cloneDeep(node);
    if (_node?.node.type === INative.InteractsType.BRANCH_STORY) {
      if (mode === 'timeStamp') {
        _node.node.answerLimitedTime.type = 'timeStamp';
        _node.node.answerLimitedTime.value = 0;
      } else {
        _node.node.answerLimitedTime.type = 'selection';
        _node.node.answerLimitedTime.value = mode;
      }
    } else {
      (_node?.node as INative.AutoPause).answerLimitedTime.type =
        mode === 'default' ? 'default' : 'timeStamp';
    }
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleChangeVirtualTime = (virtualTime: number) => {
    const _node = _.cloneDeep(node);
    (_node?.node as INative.AutoPause).answerLimitedTime.value = virtualTime;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  // return null;

  // 答题限时由于在跳转时，无法限制在同一个视频内跳转，与就数据不兼容，这里暂时不开发设置
  return node ? (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="small-title">答题限时</span>
        <div>
          <Select
            value={time}
            style={{ width: 80 }}
            onChange={handleChangeTime}
          >
            {SelectTimes.map((time, idx) => {
              return (
                <Select.Option
                  key={time}
                  value={time}
                >{`${time}s`}</Select.Option>
              );
            })}
          </Select>
          {/* <span style={{ margin: '0 5px' }}>后跳转到</span>
          <Select
            value={type === 'selection' ? value : type}
            style={{ width: 160 }}
            onChange={handleChangeMode}
          >
            {modeOptions.map((mode) => {
              return (
                <Select.Option key={mode.value} value={mode.value}>
                  {mode.text}
                </Select.Option>
              );
            })}
          </Select> */}
        </div>
        {/* {timeVisible && !isNaN(value) && (
          <div style={{ width: '163px', marginTop: '25px' }}>
            <TimeAndMilliPicker
              value={value}
              onChange={handleChangeVirtualTime}
            />
          </div>
        )} */}
      </div>
    </>
  ) : null;
};

export default AnswerLimitedTimeSetting;
