/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useRef, useEffect } from 'react';
import { Radio, InputNumber, Slider } from 'antd';
import * as _ from 'lodash';
import NodeGenerator from '../../../../../classes/NodeGenerator';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import { SimpleSelectMaxLength } from '../../../../../config';
import AnswerFeedbackSetting from './common-answer-feedback';
import RewardSetting from './common-reward';
import AnswerLimitedTimeSetting from './common-answer-limited';

const nodeGenerator = NodeGenerator.getInstance();

interface IProps {
  node: INative.InteractNode | undefined;
}
const SimpleSelectSetting: React.FC<IProps> = ({ node }) => {
  const { autoLoop, selections } = node?.node as INative.SimpleSelect;
  const { isAuto } = autoLoop;

  const { nativeDispatch } = useNativeState();

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChangeSelectNum = useCallback(
    (val: number) => {
      const _node = _.cloneDeep(nodeRef.current);
      if (val > selections.length) {
        const pre = selections[selections.length - 1];
        const newSelect = nodeGenerator.createSimpleSelect(pre.pos);
        (_node?.node as INative.SimpleSelect).selections.push(newSelect);
        _node && nativeDispatch.updateInteractiveNode(_node);
      } else {
        (_node?.node as INative.SimpleSelect).selections.pop();
        _node && nativeDispatch.updateInteractiveNode(_node);
      }
    },
    [selections]
  );

  const handleChangeIsAuto = (val: boolean) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.SimpleSelect).autoLoop.isAuto = val;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  return node ? (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        className="setting-block"
      >
        <span className="gray small-title">题干播放方式</span>
        <Radio.Group
          onChange={(e) => {
            handleChangeIsAuto(e.target.value);
          }}
          value={isAuto}
          size="small"
          style={{
            fontSize: '12px',
            width: '180px',
            marginTop: '5px',
          }}
        >
          <Radio value={false}>点击按钮循环播放</Radio>
          <Radio value>循环播放</Radio>
        </Radio.Group>
      </div>
      <div className="setting-block">
        <span className="gray small-title" style={{ marginRight: '10px' }}>
          选项数量（{selections?.length}）
        </span>
        <Slider
          min={1}
          max={SimpleSelectMaxLength}
          step={1}
          onChange={handleChangeSelectNum}
          value={selections?.length}
        />
      </div>
      <div className="setting-block">
        <AnswerFeedbackSetting node={node} />
      </div>
      <div className="setting-block">
        <AnswerLimitedTimeSetting node={node} />
      </div>
      <div className="setting-block">
        <RewardSetting node={node} />
      </div>
    </>
  ) : null;
};

export default SimpleSelectSetting;
