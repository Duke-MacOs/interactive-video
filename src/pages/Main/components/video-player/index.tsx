/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button, Switch } from 'antd';
import * as _ from 'lodash';
import {
  StepBackwardOutlined,
  StepForwardOutlined,
  CaretRightOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import useAssetsState from '../../../../hooks/useAssetsState';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import VideoManager from '../../../../classes/VideoManager';
import AnimationFrame from '../../../../classes/AnimationFrame';
import { getDurationFormatMS } from '../../../../utils/util';
import { Video } from '../../../../interface/assets-interface';
import { VideoTrack } from '../../../../interface/native-interface';
import InteractNodePreview from '../interact-node-preview';

import EditImage from '../../assets/edit.png';
import PreviewImage from '../../assets/preview.png';

const videoManage = VideoManager.getInstance();
const animationFrame = AnimationFrame.getInstance();

const VideoPlayer = () => {
  const { assetsState, assetsQueryTool } = useAssetsState();
  const { systemState, systemDispatch } = useSystemState();
  const { nativeQueryTool, nativeState } = useNativeState();
  const { videoTrackDict } = nativeState;
  const {
    isPlaying,
    virtualTime,
    currentItvId,
    mode,
    currentVideoId,
    redirectSegmentNode,
  } = systemState;

  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [videoTrack, setVideoTrack] = useState<VideoTrack>();

  const isChangeVideoOnEnd = useRef<boolean>(false);
  const redirectSegmentTimeRef = useRef<number>(-1);

  // 左侧需要切换的虚拟时间。
  // eg. virtualTimeSignLeft = 200000 ，即当 virtualTime < 2000000 时，需要切换到上一个视频
  // virtualTimeSignRight 同理
  const virtualTimeSignLeft = useRef<{ time: number; index: number }>({
    time: 0,
    index: -1,
  });
  const virtualTimeSignRight = useRef<{ time: number; index: number }>({
    time: 0,
    index: -1,
  });

  /** ************************ 插入 AMF 事件 Start ************************ */
  const isPlayingRef = useRef<boolean>(false);
  const updateVideoCurrentTime = () => {
    if (isPlayingRef.current) {
      const ct = videoManage.getCurrentTime();
      const virtualTime =
        virtualTimeSignLeft.current.time + Math.floor(ct * 1000);
      !isNaN(virtualTime) && systemDispatch.setVirtualTime(virtualTime);
    }
  };
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    animationFrame.setEvent(updateVideoCurrentTime, 'updateVideoCurrentTime');
  }, []);
  /** **************************插入 AMF 事件 End ************************** */

  useEffect(() => {
    const videoTrack = nativeQueryTool.getCurrentItvFirstVideoTrack();
    setVideoTrack(videoTrack);
  }, [currentItvId, videoTrackDict]);

  // 视频轨发生变化时，修改 videos
  useEffect(() => {
    console.log('视频轨发生变化');
    if (videoTrack) {
      const arr: Video[] = [];
      videoTrack.videos.forEach((key) => {
        const video = assetsQueryTool.getVideoById(key);
        video && arr.push(video);
      });
      setVideos(arr);
    }
  }, [videoTrack?.videos]);

  // videos 发生变化时，根据 virtualTime，修改 currentVideo
  const getCurrentVideo = useCallback(() => {
    let preTotalDuration = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      if (video.duration * 1000 + preTotalDuration >= virtualTime) {
        return video;
      }
      preTotalDuration += video.duration * 1000;
    }
    return null;
  }, [virtualTime, videos]);

  useEffect(() => {
    const video = getCurrentVideo();
    console.log('!!!video: ', video);
    if (video) {
      systemDispatch.setCurrentVideoId(video?.uid);
    } else {
      systemDispatch.setCurrentVideoId('');
    }
  }, [videos]);

  // setCurrentVideo 只允许在这里设置
  useEffect(() => {
    const video = assetsQueryTool.getVideoById(currentVideoId);
    video ? setCurrentVideo(video) : setCurrentVideo(null);
  }, [currentVideoId]);

  // currentVideo 变化时，变更切换节点
  const setVideoSignRef = useRef<any>();
  setVideoSignRef.current = () => {
    console.log('!!:', currentVideo);
    if (!currentVideo) {
      virtualTimeSignLeft.current.time =
        videos[videos.length - 1]?.duration * 1000 ?? 0;
      virtualTimeSignRight.current.time = 0;
      virtualTimeSignLeft.current.index = 0;
      virtualTimeSignRight.current.index = -1;

      console.log('virtualTimeSignLeft: ', virtualTimeSignLeft);
      console.log('virtualTimeSignRight: ', virtualTimeSignRight);
      console.log('----------------------------------');
    } else {
      let preTotalDuration = 0;
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const preVideo = videos[i - 1];
        const nextVideo = videos[i + 1];
        if (video.uid === currentVideo?.uid) {
          virtualTimeSignLeft.current.time = preTotalDuration;
          virtualTimeSignRight.current.time =
            preTotalDuration + video.duration * 1000;
          virtualTimeSignLeft.current.index = preVideo ? i - 1 : -1;
          virtualTimeSignRight.current.index = nextVideo ? i + 1 : -1;

          console.log('virtualTimeSignLeft: ', virtualTimeSignLeft);
          console.log('virtualTimeSignRight: ', virtualTimeSignRight);
          console.log('----------------------------------');
          return;
        }
        preTotalDuration += video.duration * 1000;
      }
    }
  };
  const setVideoSign = useCallback(() => {
    setVideoSignRef.current();
  }, [videos, currentVideo]);

  // currentVideo 变换时，修改 video 属性
  useEffect(() => {
    console.log('currentVideo change: ', currentVideo);
    setVideoSign();
    if (currentVideo) {
      videoManage.setSrc(currentVideo?.path);
      handleVideoManageCurrentTime();
      hanldeVideoManagerPlay();
    } else {
      videoManage.setSrc('');
      systemDispatch.setCurrentVideoId('');
    }
  }, [currentVideo]);

  useEffect(() => {
    setVideoSign();
    handleVideoManageCurrentTime();
  }, [videos]);

  // virtualTime 变化时，更新 currentVideo
  useEffect(() => {
    if (!isPlaying && !isChangeVideoOnEnd.current) {
      // 切换当前视频
      if (
        virtualTime <= virtualTimeSignLeft.current.time &&
        virtualTimeSignLeft.current.index !== -1
      ) {
        systemDispatch.setCurrentVideoId(
          videos[virtualTimeSignLeft.current.index].uid
        );
      }
      if (
        virtualTime >= virtualTimeSignRight.current.time &&
        virtualTimeSignRight.current.index !== -1
      ) {
        systemDispatch.setCurrentVideoId(
          videos[virtualTimeSignRight.current.index].uid
        );
      }

      // 设置视频 currentTime
      handleVideoManageCurrentTime();
    }
  }, [virtualTime, isPlaying]);

  // 分支故事跳转时，切换视频
  useEffect(() => {
    console.log('redirectSegmentNode change: ', redirectSegmentNode);
    const { videoId, segmentNodeId } = redirectSegmentNode;
    if (videoId) {
      const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
        segmentNodeId
      );
      if (videoId === currentVideo?.uid) {
        // 相同视频
        videoManage.setCurrentTime((segmentNode?.time ?? 0 + 200) / 1000);
        videoManage.play();
      } else {
        // 不同视频
        systemDispatch.setCurrentVideoId(videoId);
        redirectSegmentTimeRef.current = segmentNode?.time ?? 0 + 200;
      }
      console.log('segmentNode: ', segmentNode);
    }
  }, [redirectSegmentNode]);

  const handleVideoManageCurrentTime = () => {
    // 如果有分支跳转时间
    if (redirectSegmentTimeRef.current !== -1) {
      videoManage.setCurrentTime(redirectSegmentTimeRef.current / 1000);
      redirectSegmentTimeRef.current = -1;
      isChangeVideoOnEnd.current = true;
    } else {
      const time = (virtualTime - virtualTimeSignLeft.current.time) / 1000;
      !isNaN(time) && videoManage.setCurrentTime(time);
    }
  };

  const hanldeVideoManagerPlay = useCallback(() => {
    if (isChangeVideoOnEnd.current) {
      videoManage.play();
      isChangeVideoOnEnd.current = false;
    }
  }, [isPlaying]);

  const handleToggleVideo = () => {
    videoManage.toggle();
  };

  const hanldeVideoPlay = () => {
    setTimeout(() => {
      systemDispatch.setVideoPlaying();
    }, 150);
  };

  const hanldeVideoPause = () => {
    systemDispatch.setVideoPause();
  };

  const handleVideoEnd = () => {
    console.log('handle video end: ', currentVideo?.next);
    if (currentVideo?.next) {
      const { videoId, segmentNodeId } = currentVideo.next;
      systemDispatch.setRedirectSegmentNode({ videoId, segmentNodeId });
      isChangeVideoOnEnd.current = true;
    } else if (virtualTimeSignRight.current.index !== -1) {
      console.log(
        'virtualTimeSignRight.current: ',
        virtualTimeSignRight.current
      );
      systemDispatch.setVideoPause();
      const idx = _.findIndex(videos, (i) => i.uid === currentVideo?.uid);
      const nextVideo = videos[idx + 1];
      nextVideo && systemDispatch.setCurrentVideoId(nextVideo.uid);
      isChangeVideoOnEnd.current = true;
    }
  };

  const handleChangeMode = (mode: 'edit' | 'preview') => {
    systemDispatch.setMode(mode);
  };

  return (
    <div className="video-container">
      {/* 主视频播放器 */}
      <div className="video-player verticality-horizontal-center">
        <video
          id="video-ele"
          src={currentVideo?.path}
          style={{
            display: 'block',
            position: 'relative',
          }}
          ref={(ref) => {
            if (!ref) {
              return;
            }
            videoManage.bindVideoElement(ref);
          }}
          onLoadStart={() => {
            console.log('on load start: ', videoManage.getSrc());
            setVideoSignRef.current();
          }}
          onPlay={hanldeVideoPlay}
          onPause={hanldeVideoPause}
          onEnded={handleVideoEnd}
        />
        <InteractNodePreview />
      </div>
      <div className="video-ctrl">
        <div className="video-time">
          <span className="video-active-time">
            {getDurationFormatMS(virtualTime)}
          </span>
          /
          <span style={{ display: 'inline-block', width: '60px' }}>
            {getDurationFormatMS(nativeQueryTool.getCurrentVideosDuration())}
          </span>
        </div>
        <div className="video-do">
          {/* <Button type="text" icon={<StepBackwardOutlined />} size="large" /> */}
          {!isPlaying && (
            <Button
              type="text"
              icon={<CaretRightOutlined />}
              size="large"
              onClick={handleToggleVideo}
            />
          )}
          {isPlaying && (
            <Button
              type="text"
              icon={<PauseOutlined />}
              size="large"
              onClick={handleToggleVideo}
            />
          )}
          {/* <Button type="text" icon={<StepForwardOutlined />} size="large" /> */}
        </div>
        <div style={{ display: 'flex', marginRight: '5px' }}>
          <div
            style={{
              borderRadius: '5px 0 0 5px',
              padding: '3px 10px',
              background: mode === 'edit' ? '#1db1b1' : 'gray',
            }}
            onClick={() => {
              handleChangeMode('edit');
            }}
          >
            <img src={EditImage} width="18px" alt="" />
          </div>
          <div
            style={{
              borderRadius: '0 5px 5px 0',
              padding: '3px 10px',
              background: mode === 'preview' ? '#1db1b1' : 'gray',
            }}
            onClick={() => {
              handleChangeMode('preview');
            }}
          >
            <img src={PreviewImage} width="18px" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
