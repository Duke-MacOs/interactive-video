/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef } from 'react';
import { Switch } from 'antd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';

interface IProps {
  node: INative.InteractNode | undefined;
}

const RewardSetting: React.FC<IProps> = ({ node }) => {
  const { nativeDispatch } = useNativeState();

  const { reward } = node?.node as INative.SimpleSelect;
  const { opened = false } = reward;

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChange = (checked: boolean) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.SimpleSelect).reward.opened = checked;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  return node ? (
    <>
      <span className="gray small-title" style={{ marginRight: '10px' }}>
        奖励
      </span>
      <Switch checked={opened} size="small" onChange={handleChange} />
    </>
  ) : null;
};

export default RewardSetting;
