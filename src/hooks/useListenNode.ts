/**
 * 全局监听 currentNode 的变化
 */
import React, { useEffect, useRef, useCallback } from 'react';
import useSystemState from './useSystemState';
import useNativeState from './useNativeState';
import useAssets from './useAssetsState';
import * as INative from '../interface/native-interface';
import AnimationFrame from '../classes/AnimationFrame';
import VideoManager from '../classes/VideoManager';
import { isNodeInVirtualTime } from '../utils/util';

interface IMatchInteractNode {
  [key: string]: string;
}

const animationFrame = AnimationFrame.getInstance();
const videoManage = VideoManager.getInstance();

// 包含 loopTime 的节点类型
const LoopTimeNodeType = [
  INative.InteractsType.SIMPLE_SELECT,
  INative.InteractsType.BRANCH_STORY,
  INative.InteractsType.DRAGNDROP,
];

const useListenNode = () => {
  const { assetsQueryTool } = useAssets();
  const { systemState, systemDispatch } = useSystemState();
  const {
    currentNodeId,
    virtualTime,
    mode,
    isPlaying,
    currentItvId,
  } = systemState;
  const { nativeQueryTool, nativeState } = useNativeState();
  const { interactNodeDict, segmentNodeDict, videoTrackDict } = nativeState;

  const modeRef = useRef<'edit' | 'preview'>('edit');
  const isPlayingRef = useRef<boolean>(false);
  const virtualTimeRef = useRef<number>();
  const interactNodeRef = useRef<INative.InteractNode>();
  const interactNodesRef = useRef<IMatchInteractNode>({});
  const segmentNodesRef = useRef<IMatchInteractNode>({});
  const matchNodeStartRealTimeRef = useRef<number>(0);

  const handleChangeVirtualTime = (time: number) => {
    systemDispatch.setVirtualTime(time);
  };
  /** ****** AFM 开始 */
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    virtualTimeRef.current = virtualTime;
  }, [virtualTime]);
  const hanldePreivewNode = () => {
    if (!isPlayingRef.current) return;
    if (modeRef.current === 'edit') return;
    if (!interactNodeRef.current) return;
    const interactNode = interactNodeRef.current;
    const virtualTime = virtualTimeRef.current ?? 0;
    // 单选题
    // 分支故事
    // 拖拽题
    if (LoopTimeNodeType.includes(interactNode.node.type)) {
      if (
        virtualTime - interactNode.virtualTime >
        (interactNode.node as any).loopTime * 1000
      ) {
        // 检测是否自动循环
        if ((interactNode.node as any).autoLoop.isAuto) {
          videoManage.setCurrentTime(matchNodeStartRealTimeRef.current);
          videoManage.play();
        } else {
          videoManage.pause();
        }
      }
    }
    // 自动暂停
    if (interactNode.node.type === INative.InteractsType.AUTO_PAUSE) {
      videoManage.pause();
    }
    // 录音节点
    if (interactNode.node.type === INative.InteractsType.AUDIO_RECORD) {
      videoManage.pause();
    }
    // 视频开窗节点
    // if (interactNode.node.type === INative.InteractsType.VIDEO_RECORD) {
    //   videoManage.pause();
    // }
  };

  useEffect(() => {
    animationFrame.setEvent(hanldePreivewNode, 'hanldePreivewNode');
  }, []);
  /** ***** AFM 结束 */

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  /**
   * 将当前事件轨上的事件，放在对象 Dict 中。方便在 AMF 中 Catch Node
   */
  useEffect(() => {
    segmentNodesRef.current = {};
    interactNodesRef.current = {};
    const videos = nativeQueryTool.getCurrentVideos();
    const interactNodes = nativeQueryTool?.getCurrentInteractNodes();
    interactNodes?.forEach((node) => {
      const timeS = (node?.virtualTime ?? 0) / 1000;
      if (timeS) {
        interactNodesRef.current[timeS.toFixed(1)] = node.uid;
      }
    });
    let durationTotal = 0;
    videos?.forEach((videoId) => {
      const video = assetsQueryTool.getVideoById(videoId);
      if (!video) return;
      const segmentNodes = nativeQueryTool.getCurrentSegmentNodesByVideoId(
        videoId
      );
      segmentNodes?.forEach((node) => {
        const timeS = node.time / 1000 + durationTotal;
        if (timeS) {
          segmentNodesRef.current[timeS.toFixed(1)] = node.uid;
        }
      });
      durationTotal += video.duration;
    });
  }, [interactNodeDict, segmentNodeDict, currentItvId, videoTrackDict]);

  /**
   * 捕获节点
   */
  useEffect(() => {
    if (isPlayingRef.current) {
      const matchTimeKey = (virtualTime / 1000).toFixed(1);
      const interactNodeId = interactNodesRef.current[matchTimeKey];
      const segmentNodeId = segmentNodesRef.current[matchTimeKey];
      if (interactNodeId) {
        const interactNode = nativeQueryTool.getInteractNodeById(
          interactNodeId
        );
        interactNode && systemDispatch.setCurrentNodeId(interactNodeId);
      }
      if (segmentNodeId) {
        const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
          segmentNodeId
        );
        if (segmentNode) {
          if (segmentNode.next) {
            const { videoId, segmentNodeId } = segmentNode.next;
            systemDispatch.setRedirectSegmentNode({ videoId, segmentNodeId });
          }
          console.log('捕获到分段节点：', segmentNode);
        }
      }
    }
  }, [virtualTime]);

  /**
   * 清空节点
   */
  useEffect(() => {
    const node = interactNodeRef.current;
    if (
      node &&
      isPlayingRef.current &&
      !isNodeInVirtualTime(node, virtualTime)
    ) {
      systemDispatch.setCurrentNodeId('');
    }
  }, [virtualTime]);

  /**
   * currentNodeId 变更后，修改 interactNodeRef
   * currentNodeId 变更后，修改 virtualTime
   * currentNodeId 变更后，获取当前 videoTime 并暂存
   */
  useEffect(() => {
    if (currentNodeId) {
      const interactNode = nativeQueryTool.getInteractNodeById(currentNodeId);
      if (!interactNode) return;
      interactNodeRef.current = interactNode;

      // 暂存当前节点在视频中的时间
      // 需等待 video 的 currentTime 变化后再执行
      setTimeout(() => {
        const videoTime = videoManage.getCurrentTime();
        matchNodeStartRealTimeRef.current = videoTime;
        systemDispatch.setCurrentNodeVideoTime(videoTime);
      }, 500);

      // virtual 设置为当前节点时间
      interactNode && handleChangeVirtualTime(interactNode.virtualTime);
    } else {
      interactNodeRef.current = undefined;
      matchNodeStartRealTimeRef.current = 0;
      systemDispatch.setCurrentNodeVideoTime(0);
    }
  }, [currentNodeId, interactNodeDict]);
};

export default useListenNode;
