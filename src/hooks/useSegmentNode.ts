import { useCallback, useRef, useEffect } from 'react';
import { message } from 'antd';
import NodeGenerator from '../classes/NodeGenerator';
import useNativeState from './useNativeState';
import useSystemState from './useSystemState';
import useAssetsState from './useAssetsState';
import { Video } from '../interface/assets-interface';
import { SegmentNode } from '../interface/native-interface';

const nodeGenerator = NodeGenerator.getInstance();

const useSegementNode = () => {
  const { nativeQueryTool, nativeState } = useNativeState();
  const { assetsState } = useAssetsState();
  const { systemState } = useSystemState();
  const { currentItvId, virtualTime } = systemState;
  const { videoDict } = assetsState;

  const virtualTimeRef = useRef<number>();
  useEffect(() => {
    virtualTimeRef.current = virtualTime;
  }, [virtualTime]);

  const getParentITVId = useCallback(() => {
    return currentItvId;
  }, [currentItvId]);

  const getParentVideo = useCallback((): {
    video: Video;
    time: number;
  } | null => {
    const durationTotal = nativeQueryTool.getCurrentVideosDuration();
    if (virtualTime >= durationTotal) {
      message.error('当前时间上无视频');
      return null;
    }
    let video = null;
    let time = 0;
    let sectionTime = 0;
    const videos = nativeQueryTool.getCurrentVideos();
    videos.forEach((key) => {
      const v = videoDict[key];
      if (v) {
        const min = sectionTime;
        const max = sectionTime + v.duration * 1000;
        if (virtualTime >= min && virtualTime <= max) {
          video = v;
          time = virtualTime - sectionTime;
        }
        sectionTime += v.duration * 1000;
      }
    });
    return video ? { video, time } : null;
  }, [virtualTime, videoDict]);

  const createSegmentNode = async (): Promise<SegmentNode | null> => {
    const parentITVId = getParentITVId();
    const videoInfo = getParentVideo();
    if (videoInfo && parentITVId) {
      const { video, time } = videoInfo;
      const node = await nodeGenerator.createSegmentNode({
        parentITVId,
        parentVideoId: video?.uid,
        videoPath: video?.path,
        time,
      });
      return node;
    }
    return null;
  };

  return { createSegmentNode };
};

export default useSegementNode;
