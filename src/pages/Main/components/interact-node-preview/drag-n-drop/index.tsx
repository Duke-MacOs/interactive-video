/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import VideoManager from '../../../../../classes/VideoManager';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useAssetsState from '../../../../../hooks/useAssetsState';
import useSystemState from '../../../../../hooks/useSystemState';
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

const DragNDrop: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { nativeDispatch } = useNativeState();
  const { assetsQueryTool } = useAssetsState();
  const { systemDispatch, systemState } = useSystemState();

  const { mode, currentNodeVideoTime } = systemState;

  const [previewNode, setPreviewNode] = useState<INative.InteractNode>();

  const [dragStopLock, setDragStopLock] = useState<boolean>(true);

  const currentNodeVideoTimeRef = useRef<number>();

  const { autoLoop } = node?.node as INative.DragNDrop;

  useEffect(() => {
    setPreviewNode(_.cloneDeep(node));
  }, [mode]);

  useEffect(() => {
    currentNodeVideoTimeRef.current = currentNodeVideoTime;
  }, [currentNodeVideoTime]);

  useEffect(() => {
    if (!dragStopLock) {
      handleDrop();
      setDragStopLock(true);
    }
  }, [dragStopLock]);

  const handleDrop = useCallback(() => {
    if (mode === 'edit') return;
    const continueTime =
      (currentNodeVideoTimeRef.current ?? 0) +
      (node?.node as INative.DragNDrop).loopTime;

    const items = (previewNode?.node as INative.DragNDrop).correctGroups;

    const correctNum = items.length === 1 ? items[0].length : 1;
    let dragNum = 0;
    console.log('correctNum:', correctNum);
    (previewNode?.node as INative.DragNDrop)?.dragItems.forEach((item) => {
      const { endPos, startPos } = item;
      const isCorrect = endPos
        ? Math.abs(startPos.x - endPos.x) < 0.1 &&
          Math.abs(startPos.y - endPos.y) < 0.1
        : false;
      console.log('isCorrect:', isCorrect);

      if (isCorrect) {
        dragNum += 1;
      }
    });
    if (correctNum === dragNum) {
      console.log('全部到对');
      systemDispatch.setCurrentNodeId('');
      continueTime && videoManage.setCurrentTime(continueTime);
      videoManage.play();
    }
  }, [mode, previewNode]);

  const handleClickContinue = useCallback(() => {
    videoManage.setCurrentTime(currentNodeVideoTime);
    videoManage.play();
  }, [currentNodeVideoTime]);

  const getNode = () => {
    return mode === 'preview' ? previewNode : node;
  };

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
              (_node?.node as INative.DragNDrop).autoLoop.pos.x = d.x / width;
              (_node?.node as INative.DragNDrop).autoLoop.pos.y = d.y / height;

              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            const _node = _.cloneDeep(node);

            (_node?.node as INative.DragNDrop).autoLoop.size.width =
              parseFloat(ref.style.width.split('%')[0]) / 100;
            (_node?.node as INative.DragNDrop).autoLoop.size.height =
              parseFloat(ref.style.height.split('%')[0]) / 100;
            (_node?.node as INative.DragNDrop).autoLoop.pos.x =
              position.x / maskRect.width;
            (_node?.node as INative.DragNDrop).autoLoop.pos.y =
              position.y / maskRect.height;

            _node && nativeDispatch.updateInteractiveNode(_node);
          }}
          onClick={handleClickContinue}
        >
          <span className="click-area">点击循环播放</span>
        </Rnd>
      )}
      {(getNode()?.node as INative.DragNDrop)?.dragItems.map((item, idx) => {
        const { size, startPos, endPos, imgFilename } = item;
        const { width, height } = size;
        const { x: x1, y: y1 } = startPos;
        const { x: x2, y: y2 } = endPos || { x: 0, y: 0 };
        return (
          <>
            {/* startPos */}
            <Rnd
              id={`DragNDrop-${item.id}-start`}
              key={item.id}
              enableResizing={canEdit}
              disableDragging={false}
              className="hotspot"
              bounds=".interact-node-preview-container"
              size={{
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
              position={{
                x: x1 * maskRect.width,
                y: y1 * maskRect.height,
              }}
              scale={1}
              onDrag={() => {
                const target = document.getElementById(
                  `DragNDrop-${item.id}-start`
                );
                target && refLine?.check(target, '.hotspot');
              }}
              onDragStop={(e, d) => {
                const videoEle = document.getElementById('video-ele');
                if (videoEle) {
                  const { width, height } = videoEle?.getBoundingClientRect();
                  const _node = _.cloneDeep(
                    mode === 'preview' ? previewNode : node
                  );
                  (_node?.node as INative.DragNDrop).dragItems[idx].startPos.x =
                    d.x / width;
                  (_node?.node as INative.DragNDrop).dragItems[idx].startPos.y =
                    d.y / height;
                  if (_node) {
                    if (mode === 'preview') {
                      setPreviewNode({ ..._node });
                      setDragStopLock(false);
                    } else {
                      nativeDispatch.updateInteractiveNode(_node);
                    }
                  }
                }
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const _node = _.cloneDeep(
                  mode === 'preview' ? previewNode : node
                );
                (_node?.node as INative.DragNDrop).dragItems[idx].size.width =
                  parseFloat(ref.style.width.split('%')[0]) / 100;
                (_node?.node as INative.DragNDrop).dragItems[idx].size.height =
                  parseFloat(ref.style.height.split('%')[0]) / 100;
                (_node?.node as INative.DragNDrop).dragItems[idx].startPos.x =
                  position.x / maskRect.width;
                (_node?.node as INative.DragNDrop).dragItems[idx].startPos.y =
                  position.y / maskRect.height;
                if (_node) {
                  mode === 'preview'
                    ? setPreviewNode(_node)
                    : nativeDispatch.updateInteractiveNode(_node);
                }
              }}
            >
              <span className="click-area">
                {imgFilename ? (
                  <img
                    style={{
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                    src={`${
                      assetsQueryTool.getImageById(imgFilename)?.path ?? ''
                    }`}
                  />
                ) : (
                  `拖拽组${idx + 1}起点`
                )}
              </span>
            </Rnd>

            {/* endPos */}
            {endPos && (
              <Rnd
                id={`DragNDrop-${item.id}-end`}
                key={`${item.id}-end`}
                enableResizing={false}
                disableDragging={!canEdit}
                className="hotspot"
                bounds=".interact-node-preview-container"
                size={{
                  width: `${width * 100}%`,
                  height: `${height * 100}%`,
                }}
                position={{
                  x: x2 * maskRect.width,
                  y: y2 * maskRect.height,
                }}
                scale={1}
                onDrag={() => {
                  const target = document.getElementById(
                    `DragNDrop-${item.id}-end`
                  );
                  target && refLine?.check(target, '.hotspot');
                }}
                onDragStop={(e, d) => {
                  const videoEle = document.getElementById('video-ele');
                  if (videoEle) {
                    const { width, height } = videoEle?.getBoundingClientRect();
                    const _node = _.cloneDeep(
                      mode === 'preview' ? previewNode : node
                    );
                    // @ts-ignore
                    (_node?.node as INative.DragNDrop).dragItems[idx].endPos.x =
                      d.x / width;
                    // @ts-ignore
                    (_node?.node as INative.DragNDrop).dragItems[idx].endPos.y =
                      d.y / height;
                    if (_node) {
                      mode === 'preview'
                        ? setPreviewNode(_node)
                        : nativeDispatch.updateInteractiveNode(_node);
                    }
                  }
                }}
              >
                <span className="click-area">{`拖拽组${idx + 1}终点`}</span>
              </Rnd>
            )}
          </>
        );
      })}
    </>
  );
};

export default DragNDrop;
