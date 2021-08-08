import * as _ from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SystemState,
  RecentDoc,
  MenuListId,
} from '../interface/system-interface';
import { DefaultScale, DefaultGap } from '../config';
import { getPxToMs } from '../utils/util';

const initialSystemState: SystemState = {
  projectName: '',
  mode: 'edit',
  isPlaying: false,
  currentItvId: '',
  currentNodeId: '',
  currentMenuType: MenuListId.INTERACTIVE, // 当前右侧面板菜单类型
  currentRewardType: MenuListId.MATERIAL, // 当前奖励类型
  currentSelectId: '',
  currentVideoId: '',
  currentEditVideoId: '',
  currentNodeVideoTime: 0,
  autoSaveTime: new Date().getTime(),
  redirectSegmentNode: {
    videoId: '',
    segmentNodeId: '',
  },
  virtualTime: 0,
  modal: {
    segmentNodeModalVisible: false,
    reduxToolModalVisible: false,
    batchUpdateNodeModalVisible: false,
    shortcutInfoModalVisible: false,
    confirmQuit: false,
  },
  spin: {
    isOpen: false,
    tip: '',
  },
  recent: { items: [] },
  activeMenu: MenuListId.MATERIAL,
  progressBar: {
    scale: DefaultScale,
    pxToMs: getPxToMs(DefaultGap * 10, DefaultScale * 1000),
    scrollLeft: 0,
  },
  drag: {
    video: false,
    node: false,
  },
};

export const slice = createSlice({
  name: 'systemState',
  initialState: initialSystemState,
  reducers: {
    actionSetMode: (state, action: PayloadAction<'edit' | 'preview'>) => {
      state.mode = action.payload;
      return state;
    },
    actionSetDialog: (state, action: PayloadAction<boolean>) => {
      state.modal.confirmQuit = action.payload;
      return state;
    },
    actionSetReduxToolModalVisible: (state, action: PayloadAction<boolean>) => {
      state.modal.reduxToolModalVisible = action.payload;
      return state;
    },
    actionSetSegmentNodeModalVisible: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.modal.segmentNodeModalVisible = action.payload;
      return state;
    },
    actionSetBatchUpdateNodeModalVisible: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.modal.batchUpdateNodeModalVisible = action.payload;
      return state;
    },
    actionSetShortcutInfoModalVisible: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.modal.shortcutInfoModalVisible = action.payload;
      return state;
    },
    actionSetRecent: (state, action: PayloadAction<{ items: RecentDoc[] }>) => {
      return { ...state, recent: action.payload };
    },
    actionCleanRecent: (state, action: PayloadAction) => {
      return { ...state, recent: { items: [] } };
    },
    actionSetVirtualTime: (state, action: PayloadAction<{ time: number }>) => {
      return { ...state, virtualTime: action.payload.time };
    },
    actionSetSpinOpen: (state, action: PayloadAction<boolean>) => {
      return { ...state, spin: { ...state.spin, isOpen: action.payload } };
    },
    actionSetSpinTip: (state, action: PayloadAction<string>) => {
      return { ...state, spin: { ...state.spin, tip: action.payload } };
    },
    actionSetActiveMenu: (state, action: PayloadAction<MenuListId>) => {
      return { ...state, activeMenu: action.payload };
    },
    actionSetVideoPlaying: (state) => {
      return { ...state, isPlaying: true };
    },
    actionSetVideoPause: (state) => {
      return { ...state, isPlaying: false };
    },
    actionSetCurrentItvId: (state, action: PayloadAction<string>) => {
      return { ...state, currentItvId: action.payload };
    },
    actionSetCurrentNodeId: (state, action: PayloadAction<string>) => {
      return { ...state, currentNodeId: action.payload };
    },
    actionSetProgressBarScale: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        progressBar: {
          ...state.progressBar,
          scale: action.payload,
          pxToMs: getPxToMs(DefaultGap * 10, action.payload * 1000),
        },
      };
    },
    actionSetProgressBarScrollLeft: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        progressBar: {
          ...state.progressBar,
          scrollLeft: action.payload,
        },
      };
    },
    actionSetDragVideoStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        drag: { ...state.drag, video: action.payload },
      };
    },
    actionSetDragNodeStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        drag: { ...state.drag, node: action.payload },
      };
    },
    actionSetCurrentRewardType: (state, action: PayloadAction<string>) => {
      return { ...state, currentRewardType: action.payload };
    },
    actionSetCurrentMenuType: (state, action: PayloadAction<MenuListId>) => {
      return { ...state, currentMenuType: action.payload };
    },
    actionSetCurrentSelectId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentSelectId: action.payload,
      };
    },
    actionSetCurrentNodeVideoTime: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentNodeVideoTime: action.payload,
      };
    },
    actionSetCurrentVideId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentVideoId: action.payload,
      };
    },
    actionSetRedirectSegmentNode: (
      state,
      action: PayloadAction<{ videoId: string; segmentNodeId: string }>
    ) => {
      return {
        ...state,
        redirectSegmentNode: action.payload,
      };
    },
    actionSetCurrentEditVideoId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentEditVideoId: action.payload,
      };
    },
    actionSetAutoSaveTime: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        autoSaveTime: action.payload,
      };
    },
    actionSetProjectName: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        projectName: action.payload,
      };
    },
  },
});

export const {
  actionSetMode,
  actionSetReduxToolModalVisible,
  actionSetSegmentNodeModalVisible,
  actionSetBatchUpdateNodeModalVisible,
  actionSetShortcutInfoModalVisible,
  actionSetRecent,
  actionCleanRecent,
  actionSetVirtualTime,
  actionSetSpinOpen,
  actionSetSpinTip,
  actionSetActiveMenu,
  actionSetVideoPlaying,
  actionSetVideoPause,
  actionSetCurrentItvId,
  actionSetCurrentNodeId,
  actionSetProgressBarScale,
  actionSetProgressBarScrollLeft,
  actionSetDragVideoStatus,
  actionSetDragNodeStatus,
  actionSetDialog,
  actionSetCurrentRewardType,
  actionSetCurrentMenuType,
  actionSetCurrentSelectId,
  actionSetCurrentVideId,
  actionSetCurrentNodeVideoTime,
  actionSetRedirectSegmentNode,
  actionSetCurrentEditVideoId,
  actionSetAutoSaveTime,
  actionSetProjectName,
} = slice.actions;

export const systemReducer = slice.reducer;
