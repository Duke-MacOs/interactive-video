/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useSystemState from '../../../../../hooks/useSystemState';
import VideoManager from '../../../../../classes/VideoManager';

interface IProps {
  node: INative.InteractNode | undefined;
  canEdit: boolean;
  maskRect: {
    width: number;
    height: number;
  };
}

const videoManage = VideoManager.getInstance();

const AutoPause: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { nativeDispatch } = useNativeState();
  const { systemState, systemDispatch } = useSystemState();
  const { currentNodeVideoTime, mode } = systemState;
  const { size, pos } = node?.node as INative.AutoPause;
  const { width, height } = size;
  const { x, y } = pos;

  const handleClick = useCallback(() => {
    if (mode === 'edit') return;
    console.log('currentNodeVideoTime: ', currentNodeVideoTime);
    const continueTime = currentNodeVideoTime ?? 0 + 0.5;
    systemDispatch.setCurrentNodeId('');
    continueTime && videoManage.setCurrentTime(continueTime);
    videoManage.play();
  }, [currentNodeVideoTime, mode]);

  return (
    <>
      <Rnd
        enableResizing={canEdit}
        disableDragging={!canEdit}
        bounds=".interact-node-preview-container"
        size={{
          width: `${width * 100}%`,
          height: `${height * 100}%`,
        }}
        position={{
          x: x * maskRect.width,
          y: y * maskRect.height,
        }}
        scale={1}
        onDragStop={(e, d) => {
          const videoEle = document.getElementById('video-ele');
          console.log('videoEle: ', videoEle);
          if (videoEle) {
            const { width, height } = videoEle?.getBoundingClientRect();
            const _node = _.cloneDeep(node);
            (_node?.node as INative.AutoPause).pos.x = d.x / width;
            (_node?.node as INative.AutoPause).pos.y = d.y / height;
            _node && nativeDispatch.updateInteractiveNode(_node);
          }

          console.log('on drag stop:', videoEle);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const _node = _.cloneDeep(node);
          (_node?.node as INative.AutoPause).size.width =
            parseFloat(ref.style.width.split('%')[0]) / 100;
          (_node?.node as INative.AutoPause).size.height =
            parseFloat(ref.style.height.split('%')[0]) / 100;
          (_node?.node as INative.AutoPause).pos.x =
            position.x / maskRect.width;
          (_node?.node as INative.AutoPause).pos.y =
            position.y / maskRect.height;
          _node && nativeDispatch.updateInteractiveNode(_node);
        }}
        onClick={handleClick}
      >
        <span className="click-area">
          <span>点击继续播放</span>
        </span>
      </Rnd>
    </>
  );
};

export default AutoPause;
