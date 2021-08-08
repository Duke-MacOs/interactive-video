/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import VideoManager from '../../../../../classes/VideoManager';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useSystemState from '../../../../../hooks/useSystemState';
import { RefLine } from '../../../../../classes/RefLine';

const videoManage = VideoManager.getInstance();
interface IProps {
  node: INative.InteractNode | undefined;
  canEdit: boolean;
  maskRect: {
    width: number;
    height: number;
  };
}

const refLine = RefLine.getInstance();

const SimpleSelect: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { nativeDispatch } = useNativeState();
  const { systemState, systemDispatch } = useSystemState();
  const { currentNodeVideoTime, currentVideoId } = systemState;
  const {
    selections,
    answerLimitedTime,
    correctSelectId,
    loopTime,
    autoLoop,
  } = node?.node as INative.SimpleSelect;

  const currentNodeVideoTimeRef = useRef<number>();

  useEffect(() => {
    currentNodeVideoTimeRef.current = currentNodeVideoTime;
  }, [currentNodeVideoTime]);

  const handleClick = useCallback(
    (selectId: string) => {
      const continueTime =
        (currentNodeVideoTimeRef.current ?? 0) +
        (node?.node as INative.SimpleSelect).loopTime;
      if (selectId === correctSelectId && currentVideoId) {
        systemDispatch.setCurrentNodeId('');
        continueTime && videoManage.setCurrentTime(continueTime);
        videoManage.play();
      }
    },
    [correctSelectId, loopTime, currentVideoId]
  );

  const handleClickLoopPlay = useCallback(() => {
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
              (_node?.node as INative.SimpleSelect).autoLoop.pos.x =
                d.x / width;
              (_node?.node as INative.SimpleSelect).autoLoop.pos.y =
                d.y / height;

              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            const _node = _.cloneDeep(node);

            (_node?.node as INative.SimpleSelect).autoLoop.size.width =
              parseFloat(ref.style.width.split('%')[0]) / 100;
            (_node?.node as INative.SimpleSelect).autoLoop.size.height =
              parseFloat(ref.style.height.split('%')[0]) / 100;
            (_node?.node as INative.SimpleSelect).autoLoop.pos.x =
              position.x / maskRect.width;
            (_node?.node as INative.SimpleSelect).autoLoop.pos.y =
              position.y / maskRect.height;

            _node && nativeDispatch.updateInteractiveNode(_node);
          }}
          onClick={handleClickLoopPlay}
        >
          <span className="click-area">点击循环播放</span>
        </Rnd>
      )}
      {selections.map((select, idx) => {
        const { size, pos } = select;
        const { width, height } = size;
        const { x, y } = pos;
        return (
          <>
            <Rnd
              id={`SimpleSelect-${select.id}`}
              key={Math.random()}
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
                  `SimpleSelect-${select.id}`
                );
                target && refLine?.check(target, '.hotspot');
              }}
              onDragStop={(e, d) => {
                const videoEle = document.getElementById('video-ele');
                if (videoEle) {
                  const { width, height } = videoEle?.getBoundingClientRect();
                  const _node = _.cloneDeep(node);
                  (_node?.node as INative.SimpleSelect).selections[idx].pos.x =
                    d.x / width;
                  (_node?.node as INative.SimpleSelect).selections[idx].pos.y =
                    d.y / height;
                  _node && nativeDispatch.updateInteractiveNode(_node);
                }
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const _node = _.cloneDeep(node);
                (_node?.node as INative.SimpleSelect).selections[
                  idx
                ].size.width = parseFloat(ref.style.width.split('%')[0]) / 100;
                (_node?.node as INative.SimpleSelect).selections[
                  idx
                ].size.height =
                  parseFloat(ref.style.height.split('%')[0]) / 100;
                (_node?.node as INative.SimpleSelect).selections[idx].pos.x =
                  position.x / maskRect.width;
                (_node?.node as INative.SimpleSelect).selections[idx].pos.y =
                  position.y / maskRect.height;
                _node && nativeDispatch.updateInteractiveNode(_node);
              }}
              onClick={() => {
                handleClick(select.id);
              }}
            >
              <span className="click-area">
                {correctSelectId === select.id ? '正确答案' : `错误答案`}
              </span>
            </Rnd>
          </>
        );
      })}
    </>
  );
};

export default SimpleSelect;
