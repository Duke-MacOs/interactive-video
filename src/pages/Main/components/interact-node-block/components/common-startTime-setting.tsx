/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef } from 'react';
import * as _ from 'lodash';
import { PushpinOutlined } from '@ant-design/icons';
import useNativeState from '../../../../../hooks/useNativeState';
import useSystemState from '../../../../../hooks/useSystemState';
import TimeAndMilliPicker from '../../../../../components/TimeAndMilliPicker';
import * as INative from '../../../../../interface/native-interface';

interface IProps {
  node: INative.InteractNode | undefined;
}

const StartTimeSetting: React.FC<IProps> = ({ node }) => {
  const { virtualTime } = node as INative.InteractNode;
  const { nativeDispatch } = useNativeState();
  const { systemState } = useSystemState();
  const { virtualTime: systemVirtualTime } = systemState;

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChangeNode = (time: number) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node as INative.InteractNode).virtualTime = time;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="gray small-title" style={{ marginBottom: '25px' }}>
        事件播放时间
      </span>
      <div style={{ display: 'flex', marginBottom: '25px' }}>
        <span style={{ marginRight: '5px' }}>开始时间</span>
        <div style={{ width: '163px' }}>
          <TimeAndMilliPicker value={virtualTime} onChange={handleChangeNode} />
        </div>
        <PushpinOutlined
          style={{ marginLeft: '5px' }}
          onClick={() => {
            handleChangeNode(systemVirtualTime);
          }}
        />
      </div>
    </div>
  );
};

export default StartTimeSetting;
