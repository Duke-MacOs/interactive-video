import * as _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/rootReducer';
import { MenuListId } from '../interface/system-interface';
import * as systemStore from '../redux/systemStore';

const useSystemState = () => {
  const dispatch = useDispatch();
  const systemState = useSelector((state: RootState) => state.systemState);

  const systemDispatch = {
    setMode: (mode: 'edit' | 'preview') => {
      dispatch(systemStore.actionSetMode(mode));
      return systemDispatch;
    },
    openSpin: () => {
      dispatch(systemStore.actionSetSpinOpen(true));
      return systemDispatch;
    },
    closeSpin: () => {
      dispatch(systemStore.actionSetSpinOpen(false));
      return systemDispatch;
    },
    setSpinTip: (tip: string) => {
      dispatch(systemStore.actionSetSpinTip(tip));
      return systemDispatch;
    },
    setActiveMenu: (id: MenuListId) => {
      dispatch(systemStore.actionSetActiveMenu(id));
      return systemDispatch;
    },
    setVideoPlaying: () => {
      dispatch(systemStore.actionSetVideoPlaying());
      return systemDispatch;
    },
    setVideoPause: () => {
      dispatch(systemStore.actionSetVideoPause());
      return systemDispatch;
    },
    setCurrentItvId: (id: string) => {
      dispatch(systemStore.actionSetCurrentItvId(id));
      return systemDispatch;
    },
    setCurrentNodeId: (id: string) => {
      dispatch(systemStore.actionSetCurrentNodeId(id));
      return systemDispatch;
    },
    setProgressBarScale: (val: number) => {
      dispatch(systemStore.actionSetProgressBarScale(val));
      return systemDispatch;
    },
    setProgressBarScrollLeft: (val: number) => {
      dispatch(systemStore.actionSetProgressBarScrollLeft(val));
      return systemDispatch;
    },
    setDragVideoStatus: (status: boolean) => {
      dispatch(systemStore.actionSetDragVideoStatus(status));
      return systemDispatch;
    },
    setDragNodeStatus: (status: boolean) => {
      dispatch(systemStore.actionSetDragNodeStatus(status));
      return systemDispatch;
    },
    setVirtualTime: (time: number) => {
      dispatch(systemStore.actionSetVirtualTime({ time }));
      return systemDispatch;
    },
    setCurrentRewardType: (type: string) => {
      dispatch(systemStore.actionSetCurrentRewardType(type));
    },
    setCurrentMenuType: (type: MenuListId) => {
      dispatch(systemStore.actionSetCurrentMenuType(type));
    },
    setCurrentSelectId: (id: string) => {
      dispatch(systemStore.actionSetCurrentSelectId(id));
      return systemDispatch;
    },
    setCurrentNodeVideoTime: (time: number) => {
      dispatch(systemStore.actionSetCurrentNodeVideoTime(time));
      return systemDispatch;
    },
    setCurrentVideoId: (id: string) => {
      dispatch(systemStore.actionSetCurrentVideId(id));
      return systemDispatch;
    },
    setRedirectSegmentNode: (params: {
      videoId: string;
      segmentNodeId: string;
    }) => {
      dispatch(systemStore.actionSetRedirectSegmentNode(params));
      return systemDispatch;
    },
    setCurrentEditVideoId: (videoId: string) => {
      dispatch(systemStore.actionSetCurrentEditVideoId(videoId));
      return systemDispatch;
    },
    setAutoSaveTime: (time: number) => {
      dispatch(systemStore.actionSetAutoSaveTime(time));
      return systemDispatch;
    },
    setProjectName: (name: string) => {
      dispatch(systemStore.actionSetProjectName(name));
      return systemDispatch;
    },
  };

  return { systemDispatch, systemState };
};

export default useSystemState;
