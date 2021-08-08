import { PayloadAction, Middleware, Action, Dispatch } from '@reduxjs/toolkit';
import { message } from 'antd';
import { v4 } from 'uuid';
import * as _ from 'lodash';
import * as nativeStore from '../nativeStore';
import * as IAction from '../../interface/native-action-interface';
import {
  ITVDict,
  InteractsType,
  InteractNode,
  VideoTrackDict,
  EffectTrackDict,
  InteractNodeDict,
} from '../../interface/native-interface';
import { MinTimeBetweenTwoInteractNode } from '../../config';

const isValidItvId = (ITVDict: ITVDict, id: string) => {
  return (ITVDict && id && ITVDict[id] && true) || false;
};

const isValidVideoTrackId = (videoTrackDict: VideoTrackDict, id: string) => {
  return (videoTrackDict && id && videoTrackDict[id] && true) || false;
};

const isValidEffectTrackId = (effectTrackDict: EffectTrackDict, id: string) => {
  return (effectTrackDict && id && effectTrackDict[id] && true) || false;
};

const isValidInteractNodeTime = (
  node: InteractNode,
  effectTrackDict: EffectTrackDict,
  interactNodeDict: InteractNodeDict,
  nodesIdList?: string[]
) => {
  const { parentTrackId, node: interactNode } = node;
  // 只要外部传入了，就认外部的nodesId 目前批量移动时会直接从外部传入 该场景下nodesId里面要排除掉当前的要修改的id列表
  const nodesId = nodesIdList || effectTrackDict[parentTrackId]?.interactNodes;
  let isValid = false;
  if (nodesId && interactNode) {
    isValid = true;
    const nodes = nodesId.map((id) => interactNodeDict[id]);
    nodes.forEach((n) => {
      if (n.uid === node.uid || !n.node) return;

      // 判断节点是否有碰撞
      let max;
      if (n.node.type === InteractsType.AUDIO_RECORD) {
        // 录音节点不计算录音时间
        max = n.virtualTime + MinTimeBetweenTwoInteractNode;
      } else {
        max =
          n.virtualTime +
          ((n.node as any).loopTime ?? (n.node as any).duration ?? 0) * 1000;
      }

      const min = n.virtualTime - MinTimeBetweenTwoInteractNode;
      if ((interactNode as any).loopTime || (interactNode as any).duration) {
        const left = node.virtualTime;
        let right;
        if (node.node.type === InteractsType.AUDIO_RECORD) {
          // 录音节点不计算录音时间
          right = node.virtualTime + MinTimeBetweenTwoInteractNode;
        } else {
          right =
            node.virtualTime +
            ((interactNode as any).loopTime ?? (interactNode as any).duration) *
              1000;
        }

        if (
          (left >= min && left <= max) ||
          (right >= min && right <= max) ||
          (min >= left && min <= right) ||
          (max >= left && max <= right)
        ) {
          isValid = false;
        }
      } else if (node.virtualTime >= min && node.virtualTime <= max) {
        isValid = false;
      }
    });
  }
  return isValid;
};

const actionAddVideo: Middleware = ({ getState, dispatch }) => (next) => (
  action: PayloadAction<{ videoId: string; videoTrackId: string; idx?: number }>
) => {
  if (action?.type !== nativeStore.actionAddVideo?.type) {
    next(action);
    return;
  }
  const { videoId, videoTrackId, idx } = action.payload;
  const { nativeState, assetsState } = getState();
  const { videoTrackDict } = nativeState.present;
  const { videoDict } = assetsState.present;

  if (!isValidVideoTrackId(videoTrackDict, videoTrackId)) {
    message.error('添加视频失败，视频轨不存在');
    return;
  }
  if (videoDict && videoId && !videoDict[videoId]) {
    message.error('添加视频失败，视频不存在');
    return;
  }
  next(action);
};

const actionDeleteVideoOnVideoTrackId: Middleware = ({
  getState,
  dispatch,
}) => (next) => (
  action: PayloadAction<IAction.IActionDeleteVideoOnVideoTrackId>
) => {
  if (action?.type !== nativeStore.actionDeleteVideoOnVideoTrackId?.type) {
    next(action);
    return;
  }
  const { videoId, videoTrackId } = action.payload;
  const { nativeState, assetsState } = getState();
  const { videoTrackDict } = nativeState.present;
  console.log('videoTrackId: ', videoTrackId);
  console.log('videoTrackDict:', videoTrackDict);
  if (!isValidVideoTrackId(videoTrackDict, videoTrackId)) {
    message.error('删除视频失败，视频轨不存在');
    return;
  }
  next(action);
};

const actionUpdateVideosOnVideoTrackId: Middleware = ({
  getState,
  dispatch,
}) => (next) => (
  action: PayloadAction<IAction.IActionUpdateVideosOnVideoTrackId>
) => {
  if (action?.type !== nativeStore.actionUpdateVideosOnVideoTrackId?.type) {
    next(action);
    return;
  }
  const { videoTrackId } = action.payload;
  const { videoTrackDict } = getState().nativeState.present;
  if (!isValidVideoTrackId(videoTrackDict, videoTrackId)) {
    message.error('视频轨不存在');
    return;
  }
  next(action);
};

const actionAddInteractiveNode: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<IAction.IActionAddInteractiveNode>) => {
  if (action?.type !== nativeStore.actionAddInteractiveNode?.type) {
    next(action);
    return;
  }
  const { effectTrackId, node } = action.payload;
  const { effectTrackDict, interactNodeDict } = getState().nativeState.present;
  if (_.isEmpty(node.node)) {
    message.error('添加节点失败，节点为空');
    return;
  }
  if (!isValidEffectTrackId(effectTrackDict, effectTrackId)) {
    message.error('添加节点失败，事件轨非法');
    return;
  }
  if (!isValidInteractNodeTime(node, effectTrackDict, interactNodeDict)) {
    message.error('更新节点失败，节点时间冲突');
    return;
  }
  next(action);
};

const actionUpdateInteractiveNode: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<IAction.IActionUpdateInteractiveNode>) => {
  if (action?.type !== nativeStore.actionUpdateInteractiveNode?.type) {
    next(action);
    return;
  }
  const { node } = action.payload;
  const { interactNodeDict, effectTrackDict } = getState().nativeState.present;
  if (!interactNodeDict[node.uid]) {
    message.error('更新节点失败，节点不存在');
    return;
  }
  if (!isValidInteractNodeTime(node, effectTrackDict, interactNodeDict)) {
    message.error('更新节点失败，节点时间冲突');
    return;
  }
  next(action);
};

// 批量改动节点
const actionBatchUpdateInteractiveNode: Middleware = ({
  getState,
  dispatch,
}) => (next) => (
  action: PayloadAction<IAction.IActionBatchUpdateInteractiveNode>
) => {
  if (action?.type !== nativeStore.actionBatchUpdateInteractiveNode?.type) {
    next(action);
    return;
  }

  const { nodeList } = action.payload;
  const { interactNodeDict, effectTrackDict } = getState().nativeState.present;
  if (!nodeList || nodeList.length === 0) {
    return;
  }
  const nodeListUids: string[] = [];
  nodeList.forEach((node) => {
    nodeListUids.push(node.uid);
  });
  console.log(nodeListUids, 98);

  // 批量改动节点，需要遍历判断是否能够更新节点成功，之后再改动节点。否则直接return
  let canPass = true;

  // 这里是为了取 parentTrackId
  const { parentTrackId } = nodeList[0];
  const tempNodesId = effectTrackDict[parentTrackId]?.interactNodes;
  // 筛选一下，如果用户主动选中了的节点，在判断节点碰撞时不考虑进去
  const filteredNodesIdList = tempNodesId.filter((node: string) => {
    return nodeListUids.indexOf(node) === -1;
  });

  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i];
    if (!interactNodeDict[node.uid]) {
      message.error('更新节点失败，节点不存在');
      canPass = false;
      break;
    }
    if (
      !isValidInteractNodeTime(
        node,
        effectTrackDict,
        interactNodeDict,
        filteredNodesIdList
      )
    ) {
      message.error('更新节点失败，节点时间冲突');
      canPass = false;
      break;
    }
  }
  if (!canPass) {
    return;
  }
  next(action);
};
const actionDeleteInteractiveNode: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<IAction.IActionDeleteInteractiveNode>) => {
  if (action?.type !== nativeStore.actionDeleteInteractiveNode?.type) {
    next(action);
    return;
  }
  const { interactiveNodeId } = action.payload;
  const { interactNodeDict } = getState().nativeState.present;

  if (!interactNodeDict[interactiveNodeId]) {
    message.error('删除节点失败，节点不存在');
    return;
  }
  next(action);
};

const actionDeleteSegementNode: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<IAction.IActionDeleteSegmentNode>) => {
  if (action?.type !== nativeStore.actionDeleteSegmentNode?.type) {
    next(action);
    return;
  }
  const { nodeId } = action.payload;
  const { segmentNodeDict } = getState().nativeState.present;

  if (!segmentNodeDict[nodeId]) {
    message.error('删除节点失败，节点不存在');
    return;
  }
  next(action);
};

const actionAddSegmentNode: Middleware = ({ getState, dispatch }) => (next) => (
  action: PayloadAction<IAction.IActionAddSegmentNode>
) => {
  if (action?.type !== nativeStore.actionAddSegmentNode?.type) {
    next(action);
    return;
  }
  const { node } = action.payload;
  const { segmentNodeDict } = getState().nativeState.present;

  if (
    _.find(Object.values(segmentNodeDict), (s: any) => {
      return (
        s.parentITVId === node.parentITVId &&
        s.parentVideoId === node.parentVideoId &&
        s.time === node.time
      );
    })
  ) {
    message.error('添加分段节点失败，当前时间已存在节点');
    return;
  }

  next(action);
};

const nativeStoreMiddleware = [
  actionAddVideo,
  actionDeleteVideoOnVideoTrackId,
  actionUpdateVideosOnVideoTrackId,
  actionAddInteractiveNode,
  actionUpdateInteractiveNode,
  actionBatchUpdateInteractiveNode,
  actionDeleteInteractiveNode,
  actionDeleteSegementNode,
  actionAddSegmentNode,
];

export default nativeStoreMiddleware;
