/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useSystemState from '../../../../../hooks/useSystemState';
import VideoManager from '../../../../../classes/VideoManager';

import AudioRecordImage from '../../../assets/audio-record@2x.png';

interface IProps {
  node: INative.InteractNode | undefined;
  canEdit: boolean;
  maskRect: {
    width: number;
    height: number;
  };
}

const videoManage = VideoManager.getInstance();

const AudioRecord: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { nativeDispatch } = useNativeState();
  const { systemState, systemDispatch } = useSystemState();
  const { mode, currentNodeVideoTime } = systemState;

  const handleClick = useCallback(() => {
    if (mode === 'edit') return;
    const continueTime = currentNodeVideoTime ?? 0 + 0.5;
    systemDispatch.setCurrentNodeId('');
    continueTime && videoManage.setCurrentTime(continueTime);
    videoManage.play();
  }, [currentNodeVideoTime, mode]);

  return (
    <>
      <Rnd
        enableResizing={false}
        disableDragging
        bounds=".interact-node-preview-container"
        size={{
          width: '100%',
          height: '100%',
        }}
        position={{
          x: 0,
          y: 0,
        }}
        scale={1}
        onClick={handleClick}
      >
        <span
          className="click-area"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <img src={AudioRecordImage} width="80" alt="" />
          <span className="text">模拟录音中</span>
          <span className="text">点击继续播放</span>
        </span>
      </Rnd>
    </>
  );
};

export default AudioRecord;
