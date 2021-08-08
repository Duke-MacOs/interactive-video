/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef } from 'react';
import { Radio } from 'antd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import AnswerLimitedTimeSetting from './common-answer-limited';

interface IProps {
  node: INative.InteractNode | undefined;
}
const AutoPauseSetting: React.FC<IProps> = ({ node }) => {
  const { operation } = node?.node as INative.AutoPause;

  const { nativeDispatch } = useNativeState();

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChangeOperation = (val: INative.AutoPauseOperation) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.AutoPause).operation = val;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  return node ? (
    <>
      <div
        className="setting-block"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <span className="gray small-title">暂停区域交互设置</span>
        <Radio.Group
          onChange={(e) => {
            handleChangeOperation(e.target.value);
          }}
          value={operation}
          size="small"
          style={{
            fontSize: '12px',
            width: '180px',
            marginTop: '5px',
          }}
        >
          <Radio value={INative.AutoPauseOperation.PLAY}>
            点击按钮继续播放
          </Radio>
          <Radio value={INative.AutoPauseOperation.CLICKTOKIT}>
            点击按钮切换到编程
          </Radio>
          <Radio value={INative.AutoPauseOperation.AUTOTKIT}>
            自动切换到编程
          </Radio>
        </Radio.Group>
      </div>
      <div className="setting-block">
        <AnswerLimitedTimeSetting node={node} />
      </div>
    </>
  ) : null;
};

export default AutoPauseSetting;
