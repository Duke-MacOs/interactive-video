import React from 'react';
import useSystemState from '../../../../hooks/useSystemState';
import { RewardTypes } from '../../../../interface/native-interface';
import { MenuListId } from '../../../../interface/system-interface';

import icon from '../../assets/ico_miaocoins@2x.png';

const MenuReward: React.FC = () => {
  const { systemDispatch } = useSystemState();

  const clickNode = () => {
    // 新增 interactive 节点
    systemDispatch.setCurrentMenuType(MenuListId.REWARD);
    systemDispatch.setCurrentRewardType(RewardTypes.MiaoCoin);
  };
  return (
    <div className="reward-wrap">
      <div className="item" onClick={clickNode}>
        <img src={icon} alt="" />
        <p>喵币</p>
      </div>
    </div>
  );
};

export default MenuReward;
