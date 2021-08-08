/* eslint-disable @typescript-eslint/naming-convention */
import React, { useRef, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import { message } from 'antd';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useAssetsState from '../../../../../hooks/useAssetsState';
import useSystemState from '../../../../../hooks/useSystemState';
import VideoManager from '../../../../../classes/VideoManager';
import { RefLine } from '../../../../../classes/RefLine';

interface IProps {
  node: INative.InteractNode | undefined;
  canEdit: boolean;
  maskRect: {
    width: number;
    height: number;
  };
}

const refLine = RefLine.getInstance();
const videoManage = VideoManager.getInstance();

const BranchStory: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { nativeDispatch, nativeQueryTool } = useNativeState();
  const { assetsQueryTool } = useAssetsState();
  const { systemState, systemDispatch } = useSystemState();
  const { mode, currentNodeVideoTime } = systemState;

  const { selections, autoLoop } = node?.node as INative.BranchStory;

  const modeRef = useRef('');

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const currentNodeVideoTimeRef = useRef<number>();
  useEffect(() => {
    currentNodeVideoTimeRef.current = currentNodeVideoTime;
  }, [currentNodeVideoTime]);

  const handleClick = (selectId: string) => {
    if (modeRef.current !== 'preview') return;
    const select = nativeQueryTool.getCurrentSelectBySelectId(selectId);
    if (select) {
      const { next } = select;
      if (!next) {
        message.warning('没有设置跳转节点');
        return;
      }
      const { videoId, segmentNodeId } = next;
      const video = assetsQueryTool.getVideoById(videoId);
      if (video) {
        systemDispatch.setCurrentNodeId('');
        systemDispatch.setRedirectSegmentNode({ videoId, segmentNodeId });
      } else {
        message.error('分支故事不存在');
      }
    }
  };

  const handleClickContinue = useCallback(() => {
    videoManage.setCurrentTime(currentNodeVideoTime);
    videoManage.play();
  }, [currentNodeVideoTime]);

  return (
    <>
      {!autoLoop.isAuto && (
        // 点击后循环播放
        <Rnd
          id="SimpleSelect-autoloop"
          key={Math.random()}
          enableResizing={canEdit}
          disableDragging={!canEdit}
          bounds=".interact-node-preview-container"
          className="hotspot"
          size={{
            width: `${autoLoop.size.width * 100}%`,
            height: `${autoLoop.size.height * 100}%`,
          }}
          position={{
            x: autoLoop.pos.x * maskRect.width,
            y: autoLoop.pos.y * maskRect.height,
          }}
          scale={1}
          onDrag={() => {
            const target = document.getElementById(`SimpleSelect-autoloop`);
            target && refLine?.check(target, '.hotspot');
          }}
          onDragStop={(e, d) => {
            const videoEle = document.getElementById('video-ele');
            if (videoEle) {
              const { width, height } = videoEle?.getBoundingClientRect();
              const _node = _.cloneDeep(node);
              (_node?.node as INative.BranchStory).autoLoop.pos.x = d.x / width;
              (_node?.node as INative.BranchStory).autoLoop.pos.y =
                d.y / height;

              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            const _node = _.cloneDeep(node);

            (_node?.node as INative.BranchStory).autoLoop.size.width =
              parseFloat(ref.style.width.split('%')[0]) / 100;
            (_node?.node as INative.BranchStory).autoLoop.size.height =
              parseFloat(ref.style.height.split('%')[0]) / 100;
            (_node?.node as INative.BranchStory).autoLoop.pos.x =
              position.x / maskRect.width;
            (_node?.node as INative.BranchStory).autoLoop.pos.y =
              position.y / maskRect.height;

            _node && nativeDispatch.updateInteractiveNode(_node);
          }}
          onClick={handleClickContinue}
        >
          <span className="click-area">点击继续播放</span>
        </Rnd>
      )}
      {selections.map((select, idx) => {
        const { size, pos } = select;
        const { width, height } = size;
        const { x, y } = pos;
        return (
          <>
            <Rnd
              id={`BranchStory-${select.id}`}
              enableResizing={canEdit}
              disableDragging={!canEdit}
              bounds=".interact-node-preview-container"
              className="hotspot"
              size={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
              position={{
                x: x * maskRect.width,
                y: y * maskRect.height,
              }}
              scale={1}
              onDrag={() => {
                const target = document.getElementById(
                  `BranchStory-${select.id}`
                );
                target && refLine?.check(target, '.hotspot');
              }}
              onDragStop={(e, d) => {
                const videoEle = document.getElementById('video-ele');
                if (videoEle) {
                  const { width, height } = videoEle?.getBoundingClientRect();
                  const _node = _.cloneDeep(node);
                  (_node?.node as INative.BranchStory).selections[idx].pos.x =
                    d.x / width;
                  (_node?.node as INative.BranchStory).selections[idx].pos.y =
                    d.y / height;
                  _node && nativeDispatch.updateInteractiveNode(_node);
                }
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const _node = _.cloneDeep(node);
                (_node?.node as INative.BranchStory).selections[
                  idx
                ].size.width = parseFloat(ref.style.width.split('%')[0]) / 100;
                (_node?.node as INative.BranchStory).selections[
                  idx
                ].size.height =
                  parseFloat(ref.style.height.split('%')[0]) / 100;
                (_node?.node as INative.BranchStory).selections[idx].pos.x =
                  position.x / maskRect.width;
                (_node?.node as INative.BranchStory).selections[idx].pos.y =
                  position.y / maskRect.height;
                _node && nativeDispatch.updateInteractiveNode(_node);
              }}
            >
              <span
                className="click-area"
                onClick={() => {
                  handleClick(select.id);
                }}
              >{`分支故事${idx + 1}`}</span>
            </Rnd>
          </>
        );
      })}
    </>
  );
};

export default BranchStory;
