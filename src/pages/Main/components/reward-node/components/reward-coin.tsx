import React, { useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import useNativeState from '../../../../../hooks/useNativeState';
import {
  InteractNode,
  SimpleSelect,
  ITVNodes,
} from '../../../../../interface/native-interface';

const RewardCoin: React.FC = () => {
  const { nativeState, nativeDispatch, nativeQueryTool } = useNativeState();
  const { interactNodeDict } = nativeState;
  const { getAllSubjectNodes } = nativeQueryTool;
  const [itvs, setItvs] = useState<ITVNodes[]>([]);

  const selectNode = (node: InteractNode) => {
    nativeDispatch.updateInteractiveNode({
      ...node,
      node: {
        ...node.node,
        reward: {
          opened: !(node.node as SimpleSelect).reward.opened,
        },
      } as SimpleSelect,
    });
  };

  useEffect(() => {
    setItvs(getAllSubjectNodes());
  }, [interactNodeDict]);

  return (
    <div className="reward-coin-wrap">
      <p className="title">选择需要设置奖励—喵币的节点</p>

      {itvs.map((item: ITVNodes) => (
        <div key={item.uid}>
          <p className="name">{item.name}</p>
          {item.nodes.map((node) => (
            <div
              className="item"
              key={node.uid}
              onClick={() => selectNode(node)}
            >
              {node.name}&nbsp;&nbsp;
              {moment(node.virtualTime).format('mm:ss.SS')}
              {(node.node as SimpleSelect)?.reward.opened ? (
                <div className="checkbox active">✓</div>
              ) : (
                <div className="checkbox" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RewardCoin;
