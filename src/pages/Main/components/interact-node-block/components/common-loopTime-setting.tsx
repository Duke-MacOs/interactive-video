/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect, useRef } from 'react';
import * as _ from 'lodash';
import { message } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import { isNumber } from 'util';
import useNativeState from '../../../../../hooks/useNativeState';
import useSystemState from '../../../../../hooks/useSystemState';
import TimeAndMilliPicker from '../../../../../components/TimeAndMilliPicker';
import * as INative from '../../../../../interface/native-interface';

interface IProps {
  node: INative.InteractNode | undefined;
}

const LoopTimeSetting: React.FC<IProps> = ({ node }) => {
  const { virtualTime, uid } = node as INative.InteractNode;
  const { loopTime } = node?.node as INative.DragNDrop;
  const { nativeDispatch } = useNativeState();
  const { systemState } = useSystemState();
  const { virtualTime: systemVirtualTime } = systemState;

  const [startTime, setStartTime] = useState(virtualTime);
  const [endTime, setEndTime] = useState(virtualTime);

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  useEffect(() => {
    setStartTime(virtualTime);
    setEndTime(virtualTime + loopTime * 1000);
  }, [node]);

  const updateVirtualTime = (startTime: number, endTime: number) => {
    const loopTime = (endTime - startTime) / 1000;
    if (isNumber(loopTime)) {
      handleChangeNode(startTime, loopTime);
    }
  };

  const handleChangeStartTime = (time: number) => {
    if (time >= endTime) {
      message.error('开始时间不能 >= 结束时间');
      return;
    }
    setStartTime(time);
    updateVirtualTime(time, endTime);
  };

  const handleChangeEndTime = (time: number) => {
    console.log('handle change 2: ', time);
    if (time <= startTime) {
      message.error('结束时间不能 <= 开始时间');
      return;
    }
    setEndTime(time);
    updateVirtualTime(startTime, time);
  };

  const handleChangeNode = (time: number, loopTime: number) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node as INative.InteractNode).virtualTime = time;
    (_node?.node as INative.DragNDrop).loopTime = loopTime;
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
          <TimeAndMilliPicker
            value={startTime}
            onChange={handleChangeStartTime}
          />
        </div>
        <PushpinOutlined
          style={{ marginLeft: '5px' }}
          onClick={() => {
            handleChangeStartTime(systemVirtualTime);
          }}
        />
      </div>
      <div style={{ display: 'flex' }}>
        <span style={{ marginRight: '5px' }}>结束时间</span>
        <div style={{ width: '163px' }}>
          <TimeAndMilliPicker value={endTime} onChange={handleChangeEndTime} />
        </div>
        <PushpinOutlined
          style={{ marginLeft: '5px' }}
          onClick={() => {
            handleChangeEndTime(systemVirtualTime);
          }}
        />
      </div>
    </div>
  );
};

export default LoopTimeSetting;
