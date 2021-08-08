/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect, useRef } from 'react';
import { Radio, AutoComplete, Input, message, Switch } from 'antd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import RewardSetting from './common-reward';
import AnswerFeedbackSetting from './common-answer-feedback';

interface IProps {
  node: INative.InteractNode | undefined;
}

const DurationOptions = [
  { value: '3' },
  { value: '5' },
  { value: '8' },
  { value: '10' },
  { value: '15' },
];

const AudioRecordSetting: React.FC<IProps> = ({ node }) => {
  const { mode, duration } = node?.node as INative.AudioRecord;

  const { nativeDispatch } = useNativeState();

  const [_repeatNum, _setRepeatNum] = useState<string>('');

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  useEffect(() => {
    const { repeatNum } = node?.node as INative.AudioRecord;
    _setRepeatNum(`${repeatNum === -1 ? '-' : repeatNum}`);
  }, [node]);

  const handleChangeMode = (val: INative.AudioRecordMode) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.AudioRecord).mode = val;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleDurationBlur = () => {
    const min = 1;
    const max = 30;
    const defaultValue = 8;
    const _node = _.cloneDeep(nodeRef.current);
    if (isNaN(Number(duration))) {
      message.error('输入有误，请输入数字');
      (_node?.node as INative.AudioRecord).duration = defaultValue;
      _node && nativeDispatch.updateInteractiveNode(_node);
    } else {
      const time = Math.floor(Number(duration));
      (_node?.node as INative.AudioRecord).duration =
        time < min ? min : time > max ? max : time;
      _node && nativeDispatch.updateInteractiveNode(_node);
    }
  };

  const handleDurationSelect = (data: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.AudioRecord).duration = Number(data);
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleDurationChange = (data: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.AudioRecord).duration = Number(data);
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const hanldeRepeatNumBlur = () => {
    const max = 10;
    const min = 0;
    const num = Number(_repeatNum);
    const _node = _.cloneDeep(nodeRef.current);
    if (isNaN(num)) {
      (_node?.node as INative.AudioRecord).repeatNum = -1;
      _node && nativeDispatch.updateInteractiveNode(_node);
    } else {
      (_node?.node as INative.AudioRecord).repeatNum =
        num < min ? min : num > max ? max : num;
      _node && nativeDispatch.updateInteractiveNode(_node);
    }
  };

  const handleRepeatNumChange = (val: string) => {
    _setRepeatNum(val);
  };

  const handleClickOpenEffect = (checked: boolean) => {
    const _node = _.cloneDeep(nodeRef.current);
    if (_node) {
      (_node.node as INative.AudioRecord).isOpenEffect = checked;
      nativeDispatch.updateInteractiveNode(_node);
    }
  };

  return node ? (
    <>
      <div
        className="setting-block"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <span className="gray small-title">录音模式</span>
        <Radio.Group
          onChange={(e) => {
            handleChangeMode(e.target.value);
          }}
          value={mode}
          size="small"
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '11px',
            marginTop: '5px',
          }}
        >
          <Radio value={INative.AudioRecordMode.ONCE}>
            录音结束后自动播放一次
          </Radio>
          <Radio value={INative.AudioRecordMode.ZERO}>仅录音</Radio>
          <Radio value={INative.AudioRecordMode.REPEAT}>
            允许重录
            {mode === 'repeat' ? (
              <>
                <Input
                  style={{ width: 50, marginLeft: 10 }}
                  value={_repeatNum}
                  maxLength={3}
                  onBlur={hanldeRepeatNumBlur}
                  onChange={(e) => {
                    handleRepeatNumChange(e.target.value);
                  }}
                />
                <span style={{ marginLeft: '10px' }}>次</span>
                <div style={{ color: 'gray' }}>
                  - 表示不限次数，最小次数0，最大次数10
                </div>
              </>
            ) : null}
          </Radio>
        </Radio.Group>
      </div>
      <div className="setting-block">
        <span className="gray small-title">录音时长</span>
        <AutoComplete
          value={`${duration}`}
          options={DurationOptions}
          style={{ width: 100 }}
          onBlur={handleDurationBlur}
          onSelect={handleDurationSelect}
          onChange={handleDurationChange}
        />
      </div>
      <div className="setting-block">
        <span className="gray small-title">开启反馈</span>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          size="small"
          checked={(node.node as INative.AudioRecord).isOpenEffect}
          onClick={handleClickOpenEffect}
        />
      </div>
      <div className="setting-block">
        <AnswerFeedbackSetting node={node} hideLottieSetting={false} />
      </div>
      <div className="setting-block">
        <RewardSetting node={node} />
      </div>
    </>
  ) : null;
};

export default AudioRecordSetting;
