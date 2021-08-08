/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useAssetsState from '../../../../../hooks/useAssetsState';
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

const VideoRecordDecorateImage: React.FC<IProps> = ({
  node,
  canEdit,
  maskRect,
}) => {
  const { nativeDispatch } = useNativeState();
  const { assetsQueryTool } = useAssetsState();
  const {
    size,
    pos,
    imgFilename,
  } = (node?.node as INative.VideoRecord).decorateImage;
  const { width, height } = size;
  const { x, y } = pos;

  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    setImgSrc(`${assetsQueryTool.getImageById(imgFilename)?.path ?? ''}`);
  }, [imgFilename]);

  return imgSrc ? (
    <>
      <Rnd
        enableResizing={canEdit}
        disableDragging={!canEdit}
        bounds=".interact-node-preview-container"
        style={{ zIndex: 100 }}
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
            console.log(width, height);
            console.log('d: ', d);
            const _node = _.cloneDeep(node);
            (_node?.node as INative.VideoRecord).decorateImage.pos.x =
              d.x / width;
            (_node?.node as INative.VideoRecord).decorateImage.pos.y =
              d.y / height;
            _node && nativeDispatch.updateInteractiveNode(_node);
          }

          console.log('on drag stop:', videoEle);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const _node = _.cloneDeep(node);
          (_node?.node as INative.VideoRecord).decorateImage.size.width =
            parseFloat(ref.style.width.split('%')[0]) / 100;
          (_node?.node as INative.VideoRecord).decorateImage.size.height =
            parseFloat(ref.style.height.split('%')[0]) / 100;
          (_node?.node as INative.VideoRecord).decorateImage.pos.x =
            position.x / maskRect.width;
          (_node?.node as INative.VideoRecord).decorateImage.pos.y =
            position.y / maskRect.height;
          _node && nativeDispatch.updateInteractiveNode(_node);
        }}
      >
        <img
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          src={imgSrc}
        />
      </Rnd>
    </>
  ) : null;
};

const VideoRecord: React.FC<IProps> = ({ node, canEdit, maskRect }) => {
  const { systemState, systemDispatch } = useSystemState();
  const { nativeDispatch } = useNativeState();
  const { mode, currentNodeVideoTime } = systemState;
  const { size, pos, duration } = node?.node as INative.VideoRecord;
  const { width, height } = size;
  const { x, y } = pos;

  const [previewDuration, setPreviewDuration] = useState<number>(duration);
  const timerRef = useRef<any>();
  const previewDurationRef = useRef<number>(duration);
  const continueTimeRef = useRef<number>(0);

  useEffect(() => {
    continueTimeRef.current = (currentNodeVideoTime ?? 0) + duration;
  }, [currentNodeVideoTime, duration]);

  const handleClick = useCallback(() => {
    if (mode === 'edit') return;
    systemDispatch.setCurrentNodeId('');
    videoManage.setCurrentTime(continueTimeRef.current);
    videoManage.play();
  }, [currentNodeVideoTime, duration, mode]);

  const handlePreviewDuration = useCallback(() => {
    const value = previewDurationRef.current - 1;
    previewDurationRef.current = value;
    setPreviewDuration(value);
    if (value === 0) {
      handleClick();
      clearInterval(timerRef.current);
    }
  }, [previewDuration, currentNodeVideoTime, handleClick]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mode === 'preview') {
      timerRef.current = setInterval(handlePreviewDuration, 1000);
    }
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [mode]);

  return (
    <>
      {/* 装饰图片区域 */}
      <VideoRecordDecorateImage
        node={node}
        canEdit={canEdit}
        maskRect={maskRect}
      />
      {/* 开窗区域 */}
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
            console.log(width, height);
            console.log('d: ', d);
            const _node = _.cloneDeep(node);
            (_node?.node as INative.VideoRecord).pos.x = d.x / width;
            (_node?.node as INative.VideoRecord).pos.y = d.y / height;
            _node && nativeDispatch.updateInteractiveNode(_node);
          }

          console.log('on drag stop:', videoEle);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const _node = _.cloneDeep(node);
          (_node?.node as INative.VideoRecord).size.width =
            parseFloat(ref.style.width.split('%')[0]) / 100;
          (_node?.node as INative.VideoRecord).size.height =
            parseFloat(ref.style.height.split('%')[0]) / 100;
          (_node?.node as INative.VideoRecord).pos.x =
            position.x / maskRect.width;
          (_node?.node as INative.VideoRecord).pos.y =
            position.y / maskRect.height;
          _node && nativeDispatch.updateInteractiveNode(_node);
        }}
        onClick={handleClick}
      >
        <span
          className="click-area"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>视频开窗区域</span>
          <span>点击继续播放</span>
          <span style={{ position: 'absolute', top: '5px', right: '5px' }}>
            {mode === 'preview' ? previewDuration : duration}秒
          </span>
        </span>
      </Rnd>
    </>
  );
};

export default VideoRecord;
