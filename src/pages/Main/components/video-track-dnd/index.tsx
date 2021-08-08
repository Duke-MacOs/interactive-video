/* eslint-disable @typescript-eslint/naming-convention */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import * as _ from 'lodash';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import { VideoItemDnd } from './item';
import useAssetsState from '../../../../hooks/useAssetsState';
import useNativeState from '../../../../hooks/useNativeState';
import useSystemState from '../../../../hooks/useSystemState';
import { swap } from '../../../../utils/util';

import IconVideoChannel from '../../assets/icon_video_channel.png';

interface IProps {
  trackId: string;
}

const VideoTrackLeftX = 160;
const VideoItemWidth = 100;

// eslint-disable-next-line react/prop-types
const VideoTrackDnd: React.FC<IProps> = ({ trackId }) => {
  const { systemState } = useSystemState();
  const { nativeState, nativeQueryTool, nativeDispatch } = useNativeState();
  const { assetsState, assetsQueryTool } = useAssetsState();

  const { videoTrackDict } = nativeState;
  const {
    drag,
    currentItvId,
    progressBar: { pxToMs, scrollLeft },
  } = systemState;
  const { videoDict } = assetsState;

  const [videos, setVideos] = useState<{ id: string; text: string }[]>([]);

  // 视频轨标记，用于拖拽时判断插入位置
  const trackSign = useRef<number[]>([]);
  const currentDropSignIndex = useRef<number | null>(null);

  /**
   * 对象1 和 对象2 对调位置
   * @param array 原数组
   * @param first 对象1
   * @param second 对象2
   */
  const swapAndSort = (array: any[], first: number, second: number) => {
    return swap(array, first, second).map((i, idx) => {
      return { ...i, index: idx };
    });
  };

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: 'video',
      drop: (item) => {
        currentDropSignIndex.current = null;
        if (
          item.index === null &&
          _.find(videoTrackDict[trackId].videos, (v) => v === item.id)
        ) {
          message.warning('无法重复添加相同视频');
          return;
        }
        console.log('drop done: ', videos);
        nativeDispatch.updateVideosOnVideoTrackId(
          videos.map((i) => i.id),
          trackId
        );
      },
      hover: (
        item: { id: string; text: string; index: number },
        monitor: DropTargetMonitor
      ) => {
        console.log('hover');
        if (item.index === null && _.find(videos, (v) => v.id === item.id)) {
          return;
        }
        const newItem = {
          id: item.id,
          text: item.text,
        };
        const len = trackSign.current.length;
        if (len === 0) {
          // 新增第一个视频
          setVideos([newItem]);
        } else {
          const clientOffsetX = (monitor.getClientOffset() as XYCoord).x;
          const min = _.minBy(
            trackSign.current.filter((i) => i >= clientOffsetX),
            (t) => Math.abs(t - clientOffsetX)
          );
          const index = _.findIndex(trackSign.current, (i) => i === min);
          if (index === currentDropSignIndex.current) {
            return;
          }
          currentDropSignIndex.current = index;
          if (item.index !== null) {
            // 拖拽已经在视频轨的资源
            if (item.index === index) return;
            if (index === -1) {
              const newVideos = [...videos];
              const dragItem = newVideos.splice(item.index, 1);
              newVideos.push(dragItem[0]);

              item.index = newVideos.length - 1;
              setVideos(newVideos);
            } else {
              const newVideos = [...videos];
              const dragItem = newVideos.splice(item.index, 1);
              newVideos.splice(index, 0, dragItem[0]);
              item.index = index;
              setVideos(newVideos);
            }
          } else if (index === -1) {
            // 拖拽从资源区拖拽到视频轨的资源
            // 拖到最后面
            item.index = len;
            setVideos([...videos, newItem]);
          } else {
            item.index = index;
            const _videos = _.cloneDeep(videos);
            _videos.splice(index, 0, newItem);
            setVideos(_videos);
          }
        }
      },
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [videos]
  );

  useEffect(() => {
    if (drag) {
      console.log('drag: ', drag);
      setTimeout(() => {
        const videoTrack = nativeQueryTool.getCurrentItvFirstVideoTrack();
        if (videoTrack) {
          const arr = videoTrack.videos.map((v: string) => {
            return {
              id: v,
              text: assetsQueryTool.getVideoById(v)?.name ?? '',
            };
          });
          setVideos(arr);
          setTrackSign(arr);
        }
      }, 0);
    }
  }, [currentItvId, videoDict, videoTrackDict, pxToMs, drag]);

  const setTrackSign = useCallback(
    (arr: { id: string; text: string }[]) => {
      let totalWidth = VideoTrackLeftX;
      trackSign.current = arr
        .map((i, idx) => {
          const video = assetsQueryTool.getVideoById(i.id);
          const videoWidth = video
            ? (video.duration * 1000) / pxToMs
            : VideoItemWidth;
          const result = videoWidth + totalWidth;
          totalWidth += videoWidth;
          return result;
        })
        .sort((a, b) => a - b);
      console.log('trackSign.current: ', trackSign.current);
    },
    [pxToMs]
  );

  const renderVideos = (video: { id: string; text: string }, index: number) => {
    const handleDeleteVideo = () => {
      nativeDispatch.deleteVideoOnVideoTrackId(video.id, trackId);
    };
    return (
      <VideoItemDnd
        key={video.id}
        index={index}
        text={video.text}
        id={video.id}
        handleDeleteVideo={handleDeleteVideo}
      />
    );
  };

  const marginLeft = `-${scrollLeft}px`;

  return (
    <div className="video-track-container">
      <div className="video-track-name horizontal-verticality-center">
        视频轨
      </div>
      <div className="video-track-wrap">
        <div className="video-track" style={{ marginLeft }} ref={drop}>
          {!videos || videos.length === 0 ? (
            <div className="track-null">
              <img src={IconVideoChannel} alt="" className="track-null-img" />
              为视频添加合适的视频
            </div>
          ) : (
            videos.map((video, i) => renderVideos(video, i))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTrackDnd;
