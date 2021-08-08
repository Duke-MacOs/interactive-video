/* eslint-disable no-lone-blocks */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect, useRef, memo } from 'react';
import * as _ from 'lodash';
import VideoManager from '../../../../classes/VideoManager';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import * as INative from '../../../../interface/native-interface';
import { isNodeInVirtualTime } from '../../../../utils/util';
import AutoPause from './auto-pause';
import SimpleSelect from './simple-select';
import AudioRecord from './audio-record';
import VideoRecord from './video-record';
import DragNDrop from './drag-n-drop';
import BranchStory from './branch-story';

const videoManage = VideoManager.getInstance();

const Test = () => {
  useEffect(() => {
    console.log('cz 我应该执行一次3');
  }, []);

  return (
    <>
      <span style={{ display: 'none' }}>123</span>
    </>
  );
};

const InteractNodePreview = () => {
  const { systemState } = useSystemState();
  const { nativeQueryTool, nativeState } = useNativeState();
  const { currentNodeId, isPlaying, mode, virtualTime } = systemState;
  const { interactNodeDict } = nativeState;

  const [customStyle, setCustomStyle] = useState({});
  const [node, setNode] = useState<INative.InteractNode | null>(null);
  const [maskRect, setMaskRect] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [canEdit, setCanEdit] = useState<boolean>(false);
  // 是否展示拖拽热区
  const [visibleDnd, setVisibleDnd] = useState<boolean>(true);

  const maskRectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanEdit(!isPlaying && mode === 'edit');
  }, [isPlaying, mode]);

  useEffect(() => {
    const interactNode = nativeQueryTool.getInteractNodeById(currentNodeId);
    if (!interactNode) return;
    const isVisible = isNodeInVirtualTime(interactNode, virtualTime);
    if (visibleDnd !== isVisible) setVisibleDnd(isVisible);
  }, [virtualTime, currentNodeId, interactNodeDict, visibleDnd]);

  useEffect(() => {
    // 监听播放器宽高大小变化，更新播放器上层蒙版宽高
    // @ts-ignore
    new ResizeObserver((entries: any) => {
      {
        updateStyle();
      }
    }).observe(videoManage.getVideoEle());
  }, []);

  useEffect(() => {
    window.onresize = () => {
      updateStyle();
    };
  }, []);

  useEffect(() => {
    console.log('currentNodeId:', currentNodeId);
    updateInteractNode();
  }, [currentNodeId]);

  useEffect(() => {
    console.log('interactNodeDict');
    updateInteractNode();
  }, [interactNodeDict]);

  const updateInteractNode = () => {
    console.log('cz123: update node');
    const n = nativeQueryTool.getInteractNodeById(currentNodeId);
    if (n) {
      setNode(n);
    } else {
      setNode(null);
    }
  };

  const updateStyle = () => {
    const videoEle = document.getElementById('video-ele');
    if (videoEle) {
      const { width, height, top, left } = videoEle.getBoundingClientRect();
      console.log(videoEle.getBoundingClientRect());
      setCustomStyle({
        width: `${width}px`,
        height: `${height}px`,
        top: `${top}px`,
        left: `${left}px`,
      });
      setMaskRect({ width, height });
    }
  };

  return (
    <div
      id="interact-node-preview-container"
      ref={maskRectRef}
      className="interact-node-preview-container"
      style={{ ...customStyle }}
    >
      <Test />
      {visibleDnd && node?.node.type === INative.InteractsType.AUTO_PAUSE && (
        <AutoPause node={node} maskRect={maskRect} canEdit={canEdit} />
      )}
      {visibleDnd &&
        node?.node.type === INative.InteractsType.SIMPLE_SELECT && (
          <SimpleSelect
            key={`simpleSelect-${Math.random()}`}
            node={node}
            maskRect={maskRect}
            canEdit={canEdit}
          />
        )}
      {visibleDnd && node?.node.type === INative.InteractsType.AUDIO_RECORD && (
        <AudioRecord node={node} maskRect={maskRect} canEdit={canEdit} />
      )}
      {visibleDnd && node?.node.type === INative.InteractsType.VIDEO_RECORD && (
        <VideoRecord node={node} maskRect={maskRect} canEdit={canEdit} />
      )}
      {visibleDnd && node?.node.type === INative.InteractsType.DRAGNDROP && (
        <DragNDrop node={node} maskRect={maskRect} canEdit={canEdit} />
      )}
      {visibleDnd && node?.node.type === INative.InteractsType.BRANCH_STORY && (
        <BranchStory node={node} maskRect={maskRect} canEdit={canEdit} />
      )}
    </div>
  );
};

export default InteractNodePreview;
