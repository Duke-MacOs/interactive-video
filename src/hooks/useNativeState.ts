/* eslint-disable @typescript-eslint/naming-convention */
import * as _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
import useSystemState from './useSystemState';
import useAssetsState from './useAssetsState';
import * as nativeActions from '../redux/nativeStore';
import * as INative from '../interface/native-interface';
import * as ISystem from '../interface/system-interface';
import * as IAction from '../interface/native-action-interface';
import { RootState } from '../redux/rootReducer';
import { vframesPath } from '../config';
import { AssetsType } from '../interface/assets-interface';

const useNativeState = () => {
  const dispatch = useDispatch();
  const { systemDispatch, systemState } = useSystemState();
  const { assetsQueryTool, assetsDispatch } = useAssetsState();
  const nativeState = useSelector((state: RootState) => state.nativeState)
    .present;

  const nativeStateRef = useRef<INative.NativeStore>(nativeState);
  const systemStateRef = useRef<ISystem.SystemState>(systemState);

  useEffect(() => {
    console.log('update native state ref');
    nativeStateRef.current = nativeState;
  }, [nativeState]);

  useEffect(() => {
    systemStateRef.current = systemState;
  }, [systemState]);

  const getOneInitialItv = () => {
    // 初始化一个 itv
    const itvuid = v4();
    const videoTrackuid = v4();
    const effectTrackuid = v4();
    const { ITVDict } = nativeStateRef.current;
    const itvNames = Object.values(ITVDict)
      .map((itv) => itv.name)
      .reverse();
    let newName = 'itv0';
    itvNames.forEach((name) => {
      for (let i = 12; i >= 0; i--) {
        if (name === `itv${i}`) {
          newName = `itv${i + 1}`;
          return;
        }
      }
    });
    const initialItv = {
      name: newName,
      uid: itvuid,
      effectTrack: [effectTrackuid],
      videoTrack: [videoTrackuid],
      segments: [],
    };
    const videoTrackDict = {
      [videoTrackuid]: {
        uid: videoTrackuid,
        parentITVId: itvuid,
        videos: [],
      },
    };
    const effectTrackDict = {
      [effectTrackuid]: {
        uid: effectTrackuid,
        parentITVId: itvuid,
        interactNodes: [],
      },
    };
    const segmentNodeDict = {};
    const interactNodeDict = {};
    return {
      initialItv,
      videoTrackDict,
      effectTrackDict,
      segmentNodeDict,
      interactNodeDict,
    };
  };

  const nativeDispatch = {
    /**
     * 初始化 state，用于打开新项目时使用
     */
    initialState: () => {
      const {
        initialItv,
        videoTrackDict,
        effectTrackDict,
        segmentNodeDict,
        interactNodeDict,
      } = getOneInitialItv();
      // 初始化一个 itv
      const initialState = {
        ITVS: [initialItv.uid],
        ITVDict: { [initialItv.uid]: initialItv },
        videoTrackDict,
        effectTrackDict,
        segmentNodeDict,
        interactNodeDict,
        actionFlag: false,
      };
      dispatch(nativeActions.actionSetAllState(initialState));
      systemDispatch.setCurrentItvId(initialItv.uid);
      return nativeDispatch;
    },
    /**
     * 添加一个 itv
     */
    addItv: () => {
      const {
        initialItv,
        videoTrackDict,
        effectTrackDict,
      } = getOneInitialItv();
      const newState = {
        ITVS: [...nativeState.ITVS, initialItv.uid],
        ITVDict: { [initialItv.uid]: initialItv, ...nativeState.ITVDict },
        videoTrackDict: { ...videoTrackDict, ...nativeState.videoTrackDict },
        effectTrackDict: { ...effectTrackDict, ...nativeState.effectTrackDict },
        segmentNodeDict: { ...nativeState.segmentNodeDict },
        interactNodeDict: { ...nativeState.interactNodeDict },
      };
      dispatch(nativeActions.actionSetAllState(newState));
      return nativeDispatch;
    },
    /**
     * 添加视频到视频轨
     */
    addVideoOnVideoTrackId: (
      videoId: string,
      videoTrackId: string,
      idx?: number
    ) => {
      dispatch(
        nativeActions.actionAddVideo({
          videoId,
          videoTrackId,
          idx,
        })
      );
      return nativeDispatch;
    },
    /**
     * 更新视频轨视频
     */
    updateVideosOnVideoTrackId: (videos: string[], videoTrackId: string) => {
      dispatch(
        nativeActions.actionUpdateVideosOnVideoTrackId({ videos, videoTrackId })
      );
      return nativeDispatch;
    },
    /**
     * 删除视频轨上的视频
     */
    deleteVideoOnVideoTrackId: (videoId: string, videoTrackId: string) => {
      // 如果当前视频属于编辑状态，需要将 currentEditVideoId 置空
      if (videoId === systemStateRef.current.currentEditVideoId) {
        systemDispatch.setCurrentEditVideoId('');
      }

      // 如果有对视频开头引用的，需要重置为空
      const videos = assetsQueryTool.getVideos();
      const interactNodes = nativeQueryTool.getCurrentInteractNodes();
      const segmentNodes = nativeQueryTool.getAllSegmentNodes();
      interactNodes.forEach((i) => {
        // 单选题
        if (i.node && i.node.type === INative.InteractsType.SIMPLE_SELECT) {
          i.node.selections.forEach((select, idx) => {
            if (select.next && select.next.videoId === videoId) {
              const _node = _.cloneDeep(i);
              (_node.node as INative.SimpleSelect).selections[idx].next = null;
              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          });
        }
        // 分支故事
        if (i.node && i.node.type === INative.InteractsType.BRANCH_STORY) {
          i.node.selections.forEach((select, idx) => {
            if (select.next && select.next.videoId === videoId) {
              const _node = _.cloneDeep(i);
              (_node.node as INative.BranchStory).selections[idx].next = null;
              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          });
        }
      });
      videos.forEach((video) => {
        if (video.next && video.next.videoId === videoId) {
          const _video = _.cloneDeep(video);
          (_video as any).next = null;
          assetsDispatch.updateAsset(AssetsType.VIDEO, _video.uid, _video);
        }
      });
      segmentNodes.forEach((node) => {
        if (node.next && node.next.videoId === videoId) {
          const _node = _.cloneDeep(node);
          _node.next = null;
          nativeDispatch.updateSegmentNode(_node);
        }
      });

      // 删除视频时，检查当前 itv 用到的此 video 上是有有分段节点
      // 有分段节点，也要将分段节点清除
      const segmentNodesOnVideo = nativeQueryTool.getCurrentSegmentNodesByVideoId(
        videoId
      );
      segmentNodesOnVideo.forEach((n) => {
        nativeDispatch.deleteSegmentNode(n.uid);
      });

      dispatch(
        nativeActions.actionDeleteVideoOnVideoTrackId({ videoId, videoTrackId })
      );
      return nativeDispatch;
    },
    /**
     * 添加交互节点
     */
    addInteractiveNode: (effectTrackId: string, node: INative.InteractNode) => {
      dispatch(nativeActions.actionAddInteractiveNode({ effectTrackId, node }));
      systemDispatch.setCurrentNodeId(node.uid);
      return nativeDispatch;
    },
    /**
     * 更新交互节点
     */
    updateInteractiveNode: (
      node: INative.InteractNode | INative.SimpleSelect
    ) => {
      dispatch(nativeActions.actionUpdateInteractiveNode({ node }));
      return nativeDispatch;
    },
    /**
     * 批量更新交互节点
     * @param nodeList 交互节点List
     * @returns dispatch
     */
    batchUpdateInteractiveNode: (nodeList: INative.InteractNode[]) => {
      dispatch(
        nativeActions.actionBatchUpdateInteractiveNode({
          nodeList,
        })
      );
      return nativeDispatch;
    },
    /**
     * 删除交互节点
     */
    deleteInteractiveNode: (interactiveNodeId: string) => {
      dispatch(
        nativeActions.actionDeleteInteractiveNode({ interactiveNodeId })
      );
      return nativeDispatch;
    },
    /**
     * 添加一个分段节点
     */
    addSegmentNode: async (node: INative.SegmentNode) => {
      dispatch(nativeActions.actionAddSegmentNode({ node }));

      // 并插入当前 itv segments 中
      const currentItvId = nativeQueryTool.getCurrentItvId();
      const itv = _.cloneDeep(nativeQueryTool.getCurrentItv());
      console.log('itv: ', itv);
      itv?.segments.push(node.uid);
      dispatch(nativeActions.actionUpdateItv({ itvId: currentItvId, itv }));
      return nativeDispatch;
    },
    /**
     * 更新一个分段节点
     */
    updateSegmentNode: async (node: INative.SegmentNode) => {
      dispatch(nativeActions.actionUpdateSegmentNode({ node }));
      return nativeDispatch;
    },
    /**
     * 删除一个分段节点
     */
    deleteSegmentNode: (id: string) => {
      // 获取当前事件轨上所有交互节点
      // 如果有对分段节点引用的，需要重置为空
      const videos = assetsQueryTool.getVideos();
      const interactNodes = nativeQueryTool.getCurrentInteractNodes();
      const segmentNodes = nativeQueryTool.getAllSegmentNodes();
      interactNodes.forEach((i) => {
        // 单选题
        if (i.node && i.node.type === INative.InteractsType.SIMPLE_SELECT) {
          i.node.selections.forEach((select, idx) => {
            if (select.next && select.next.segmentNodeId === id) {
              const _node = _.cloneDeep(i);
              (_node.node as INative.SimpleSelect).selections[idx].next = null;
              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          });
        }
        // 分支故事
        if (i.node && i.node.type === INative.InteractsType.BRANCH_STORY) {
          i.node.selections.forEach((select, idx) => {
            if (select.next && select.next.segmentNodeId === id) {
              const _node = _.cloneDeep(i);
              (_node.node as INative.BranchStory).selections[idx].next = null;
              _node && nativeDispatch.updateInteractiveNode(_node);
            }
          });
        }
      });
      videos.forEach((video) => {
        if (video.next && video.next.segmentNodeId === id) {
          const _video = _.cloneDeep(video);
          (_video as any).next = null;
          assetsDispatch.updateAsset(AssetsType.VIDEO, _video.uid, _video);
        }
      });
      segmentNodes.forEach((node) => {
        if (node.next && node.next.segmentNodeId === id) {
          const _node = _.cloneDeep(node);
          _node.next = null;
          nativeDispatch.updateSegmentNode(_node);
        }
      });
      dispatch(nativeActions.actionDeleteSegmentNode({ nodeId: id }));
      return nativeDispatch;
    },
    /**
     * 数据清理，将无引用的数据删除
     */
    cleanState: () => {
      console.log('clean state');
      const segmentNodes = nativeQueryTool.getAllSegmentNodes();
      const interactNodes = nativeQueryTool.getAllInteractNodes();

      // 清理交互节点
      interactNodes.forEach((node) => {
        if (!nativeQueryTool.getItvByItvId(node.parentITVId)) {
          nativeDispatch.deleteInteractiveNode(node.uid);
        }
      });

      // 清理分段节点
      segmentNodes.forEach((node) => {
        if (!nativeQueryTool.getItvByItvId(node.parentITVId)) {
          nativeDispatch.deleteSegmentNode(node.uid);
        }
      });
    },
    /**
     * 全量替换 state
     */
    setAllState: (state: INative.NativeStore) => {
      dispatch(nativeActions.actionSetAllState(state));
      return nativeDispatch;
    },
    UpdateItvName: (key: string, name: string) => {
      dispatch(nativeActions.actionUpdateItvName({ key, name }));
    },
    deleteItv: (key: string) => {
      dispatch(nativeActions.actionDeleteItv({ key }));
      setTimeout(() => {
        nativeDispatch.cleanState();
      }, 0);
    },
  };

  const nativeQueryTool = {
    /**
     * 根据 itvId 获取 Itv 对象
     */
    getItvByItvId: (id: string) => {
      const { ITVDict } = nativeStateRef.current;
      return ITVDict[id];
    },
    /**
     * 获取当前 Itv ID
     */
    getCurrentItvId: () => {
      return systemStateRef.current.currentItvId;
    },
    /**
     * 获取当前 Itv
     */
    getCurrentItv: () => {
      const id = nativeQueryTool.getCurrentItvId();
      return nativeQueryTool.getItvByItvId(id);
    },
    /**
     * 获取当前 itv 的第一条事件轨 id
     */
    getCurrentItvFirstEffectTrackId: () => {
      const { currentItvId } = systemStateRef.current;
      const { ITVDict } = nativeStateRef.current;
      return ITVDict[currentItvId]?.effectTrack[0] ?? null;
    },
    /**
     * 获取当前 itv 的第一条事件轨对象
     */
    getCurrentItvFirstEffectTrack: () => {
      const { effectTrackDict } = nativeStateRef.current;
      return effectTrackDict
        ? effectTrackDict[nativeQueryTool.getCurrentItvFirstEffectTrackId()]
        : null;
    },
    /**
     * 获取当前 itv 的第一条视频轨 id
     */
    getCurrentItvFirstVideoTrackId: () => {
      const { currentItvId } = systemStateRef.current;
      const { ITVDict } = nativeStateRef.current;
      return ITVDict[currentItvId]?.videoTrack[0] ?? null;
    },
    /**
     * 获取当前 itv 的第一条视频轨对象
     */
    getCurrentItvFirstVideoTrack: () => {
      const { videoTrackDict } = nativeStateRef.current;
      return videoTrackDict[nativeQueryTool.getCurrentItvFirstVideoTrackId()];
    },
    /**
     * 获取当前视频轨上的视频ID
     */
    getCurrentVideos: () => {
      const videoTrack = nativeQueryTool.getCurrentItvFirstVideoTrack();
      return videoTrack?.videos ?? [];
    },
    /**
     * 获取当前视频轨上视频总时长
     */
    getCurrentVideosDuration: () => {
      let result = 0;
      nativeQueryTool.getCurrentVideos().forEach((v) => {
        const video = assetsQueryTool?.getVideoById(v);
        result += (video?.duration || 0) * 1000;
      });
      return result;
    },
    /**
     * 获取当前 itv 所有交互节点 id
     */
    getCurrentInteractNodesId: () => {
      const effectTrack = nativeQueryTool?.getCurrentItvFirstEffectTrack();
      return effectTrack?.interactNodes ?? [];
    },
    /**
     * 获取当前 itv 所有交互节点对象
     */
    getCurrentInteractNodes: () => {
      const { interactNodeDict } = nativeStateRef.current;
      return nativeQueryTool.getCurrentInteractNodesId().map((id) => {
        return interactNodeDict[id];
      });
    },
    /**
     * 获取当前 itv 所有时间排序后的交互节点对象
     */
    getCurrentInteractNodesBySort: () => {
      return nativeQueryTool
        .getCurrentInteractNodes()
        .sort((a, b) => a.virtualTime - b.virtualTime);
    },
    /**
     * 获取当前 itv 所有分段节点
     */
    getCurrentSegmentNodes: () => {
      const { currentItvId } = systemStateRef.current;
      const allSegmentNodes = nativeQueryTool.getAllSegmentNodes();
      return allSegmentNodes.filter(
        (node) => node.parentITVId === currentItvId
      );
    },
    /**
     * 通过 id 获取交互节点对象
     */
    getInteractNodeById: (id: string) => {
      const { interactNodeDict } = nativeStateRef.current;
      return interactNodeDict[id];
    },
    /**
     * 通过 videoId 获取该视频上所有分段节点
     */
    getSegmentNodesByVideoId: (videoId: string) => {
      const { segmentNodeDict } = nativeStateRef.current;
      return _.filter(Object.values(segmentNodeDict), [
        'parentVideoId',
        videoId,
      ]);
    },
    /**
     * 通过 videoId 获取当前 Itv 视频下 segmentNode 对象
     */
    getCurrentSegmentNodesByVideoId: (videoId: string) => {
      const { currentItvId } = systemStateRef.current;
      const segmentNodes = nativeQueryTool.getSegmentNodesByVideoId(videoId);
      return _.filter(Object.values(segmentNodes), [
        'parentITVId',
        currentItvId,
      ]);
    },
    /**
     * 通过 videoId 获取视频封面地址
     */
    getVideoCoverPathByVideoId: (videoId: string) => {
      return `${window.__WORK_DIR__}/${vframesPath}/${videoId}/index-1.png`;
    },
    /**
     * 通过 segmentNodeId 获取 segmentNode 对象
     */
    getSegmentNodeBySegmentId: (id: string) => {
      const { segmentNodeDict } = nativeStateRef.current;
      return segmentNodeDict[id];
    },
    /**
     * 通过 selectId 获取 select 对象。
     * 只找当前 itv 上的
     */
    getCurrentSelectBySelectId: (
      selectId: string
    ): INative.Selection | null => {
      const interactNodes = nativeQueryTool.getCurrentInteractNodes();
      let select = null;
      interactNodes.forEach((node) => {
        if (!node.node) return;
        if (!(node.node as any).selections) return;
        (node.node as any)?.selections.forEach((s: INative.Selection) => {
          if (s.id === selectId) {
            select = s;
          }
        });
      });
      return select;
    },
    /**
     * 获取所有ITV下所有题目节点
     */
    getAllSubjectNodes: (): INative.ITVNodes[] => {
      const { interactNodeDict, ITVDict } = nativeStateRef.current;
      const list = _.filter(interactNodeDict, (item) => {
        const { type } = item.node;
        const { InteractsType } = INative;
        return (
          type === InteractsType.SIMPLE_SELECT ||
          type === InteractsType.DRAGNDROP ||
          type === InteractsType.AUDIO_RECORD
        );
      });
      const itvs = _.groupBy(list, 'parentITVId');

      return _.map(itvs, (item, key) => {
        const { name = '', uid = '' } = ITVDict[key] ?? {};
        return {
          name,
          uid,
          nodes: item,
        };
      }).filter((i) => i.uid !== '');
    },
    /**
     * 获取所有视频轨对象
     */
    getAllVideoTracks: () => {
      const { videoTrackDict } = nativeStateRef.current;
      return Object.values(videoTrackDict);
    },
    /**
     * 获取所有交互节点对象
     */
    getAllInteractNodes: () => {
      const { interactNodeDict } = nativeStateRef.current;
      return Object.values(interactNodeDict);
    },
    /**
     * 获取所有分段节点
     */
    getAllSegmentNodes: () => {
      const { segmentNodeDict } = nativeStateRef.current;
      return Object.values(segmentNodeDict);
    },
  };

  return { nativeState, nativeDispatch, nativeQueryTool };
};

export default useNativeState;
