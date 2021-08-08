import React from 'react';
import InteractNodeBlock from '../interact-node-block';
import { MenuListId } from '../../../../interface/system-interface';
import useSystemState from '../../../../hooks/useSystemState';
import RewardNode from '../reward-node';
import VideoEdit from '../video-edit';

/**
 * 右侧操作面板
 */
const OperationPanel: React.FC = () => {
  const { systemState } = useSystemState();
  const { currentMenuType } = systemState;

  return (
    <div className="main-container">
      {currentMenuType === MenuListId.REWARD && <RewardNode />}
      {currentMenuType === MenuListId.INTERACTIVE && <InteractNodeBlock />}
      {currentMenuType === MenuListId.VIDEO && <VideoEdit />}
    </div>
  );
};

export default OperationPanel;
