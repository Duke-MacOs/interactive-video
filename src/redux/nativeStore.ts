/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as _ from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterFunction } from 'redux-undo';
import { nativeState } from '../boilerplate/nativeStore';
import * as INative from '../interface/native-interface';
import * as IAction from '../interface/native-action-interface';

export const slice = createSlice({
  name: 'nativeState',
  initialState: nativeState,
  reducers: {
    actionSetAllState: (state, action: PayloadAction<INative.NativeStore>) => {
      return action.payload;
    },
    actionAddItv: (state, action: PayloadAction<INative.NativeStore>) => {
      return action.payload;
    },
    actionUpdateItv: (
      state,
      action: PayloadAction<IAction.IActionUpdateItv>
    ) => {
      const { itvId, itv } = action.payload;
      state.ITVDict[itvId] = itv;
      return state;
    },
    /**
     * 更新ITV，目前只能更改名称
     */
    actionUpdateItvName: (
      state,
      action: PayloadAction<{ key: string; name: string }>
    ) => {
      const { key, name } = action.payload;
      state.ITVDict[key].name = name;
      return state;
    },
    actionDeleteItv: (state, action: PayloadAction<{ key: string }>) => {
      const { key } = action.payload;
      delete state.ITVDict[key];
      state.ITVS = state.ITVS.filter((item) => item !== key);
      console.log('action delete itv');
      return state;
    },
    actionAddVideo: (state, action: PayloadAction<IAction.IActionAddVideo>) => {
      const { videoId, videoTrackId, idx } = action.payload;
      idx
        ? state.videoTrackDict[videoTrackId]?.videos?.splice(idx, 0, videoId)
        : state.videoTrackDict[videoTrackId]?.videos?.push(videoId);
      return state;
    },
    actionUpdateVideosOnVideoTrackId: (
      state,
      action: PayloadAction<IAction.IActionUpdateVideosOnVideoTrackId>
    ) => {
      const { videos, videoTrackId } = action.payload;
      state.videoTrackDict[videoTrackId].videos = [...videos];
      return state;
    },
    actionDeleteVideoOnVideoTrackId: (
      state,
      action: PayloadAction<IAction.IActionDeleteVideoOnVideoTrackId>
    ) => {
      const { videoId, videoTrackId } = action.payload;
      _.remove(state.videoTrackDict[videoTrackId].videos, (i) => i === videoId);
      return state;
    },
    actionAddInteractiveNode: (
      state,
      action: PayloadAction<IAction.IActionAddInteractiveNode>
    ) => {
      const { effectTrackId, node } = action.payload;
      state.effectTrackDict[effectTrackId].interactNodes.push(node.uid);
      state.interactNodeDict[node.uid] = node;
      return state;
    },
    actionUpdateInteractiveNode: (
      state,
      action: PayloadAction<IAction.IActionUpdateInteractiveNode>
    ) => {
      const { node } = action.payload;
      state.interactNodeDict[node.uid] = node;
      return state;
    },
    actionBatchUpdateInteractiveNode: (
      state,
      action: PayloadAction<IAction.IActionBatchUpdateInteractiveNode>
    ) => {
      const { nodeList } = action.payload;
      for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];
        state.interactNodeDict[node.uid] = node;
      }
      return state;
    },
    actionDeleteInteractiveNode: (
      state,
      action: PayloadAction<IAction.IActionDeleteInteractiveNode>
    ) => {
      const { interactiveNodeId } = action.payload;
      const trackId = state.interactNodeDict[interactiveNodeId]?.parentTrackId;
      _.remove(
        state.effectTrackDict[trackId]?.interactNodes,
        (i) => i === interactiveNodeId
      );
      delete state.interactNodeDict[interactiveNodeId];
      return state;
    },
    actionAddSegmentNode: (
      state,
      action: PayloadAction<IAction.IActionAddSegmentNode>
    ) => {
      const { node } = action.payload;
      state.segmentNodeDict[node.uid] = node;
      return state;
    },
    actionDeleteSegmentNode: (
      state,
      action: PayloadAction<IAction.IActionDeleteSegmentNode>
    ) => {
      const { nodeId } = action.payload;
      delete state.segmentNodeDict[nodeId];
      return state;
    },
    actionUpdateSegmentNode: (
      state,
      action: PayloadAction<IAction.IActionUpdateSegmentNode>
    ) => {
      const { node } = action.payload;
      state.segmentNodeDict[node.uid] = node;
      return state;
    },
  },
});

export const {
  actionSetAllState,
  actionAddItv,
  actionUpdateItv,
  actionAddVideo,
  actionDeleteVideoOnVideoTrackId,
  actionUpdateVideosOnVideoTrackId,
  actionAddInteractiveNode,
  actionUpdateInteractiveNode,
  actionBatchUpdateInteractiveNode,
  actionDeleteInteractiveNode,
  actionAddSegmentNode,
  actionDeleteSegmentNode,
  actionUpdateItvName,
  actionDeleteItv,
  actionUpdateSegmentNode,
} = slice.actions;

export const nativeReducer = slice.reducer;

// 不需要特殊处理的 action
const nativeStateUndoRedoNormalFilter = [];

// 需要特殊处理的 action
const nativeStateUndoRedoSpecialFilter: string[] = [];

export const nativeStateUndoRedoFilterFun: FilterFunction = (
  action,
  currentState,
  previousHistory
) => {
  let isValid = false;
  if (!nativeStateUndoRedoSpecialFilter.includes(action.type)) isValid = true;

  if (nativeStateUndoRedoSpecialFilter.includes(action.type)) {
    // 如果有特殊处理，写在这里
  }

  return isValid;
};
