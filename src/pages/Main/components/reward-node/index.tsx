import React from 'react';
import useSystemState from '../../../../hooks/useSystemState';
import * as INative from '../../../../interface/native-interface';
import RewardCoin from './components/reward-coin';

/**
 * 奖励节点操作面板
 */
const RewardNode: React.FC = () => {
  const { systemState } = useSystemState();
  const { currentRewardType } = systemState;

  return (
    <div className="reward-option-wrap">
      {/* 喵币 */}
      {currentRewardType === INative.RewardTypes.MiaoCoin && <RewardCoin />}
    </div>
  );
};

export default RewardNode;
