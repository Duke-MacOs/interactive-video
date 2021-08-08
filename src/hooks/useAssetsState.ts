import { useEffect, useRef } from 'react';
import * as _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/rootReducer';
import {
  VideoDict,
  Video,
  Audio,
  AduioDict,
  Image,
  ImageDict,
  AssetList,
  AssetsType,
  Asset,
} from '../interface/assets-interface';
import * as assetsActions from '../redux/assetsStore';

const useAssetsState = () => {
  const dispatch = useDispatch();
  const assetsState = useSelector((state: RootState) => state.assetsState);
  const { videoDict, audioDict, imageDict, lottieDict } = assetsState;

  const assetsStateRef = useRef<AssetList>(assetsState);

  useEffect(() => {
    assetsStateRef.current = assetsState;
  }, [assetsState]);

  const assetsDispatch = {
    /**
     * 全量替换 state
     */
    setAllState: (state: AssetList) => {
      dispatch(assetsActions.actionSetAllAssets(state));
      return assetsDispatch;
    },
    /**
     * 删除资源
     */
    deleteAsset: (type: AssetsType, id: string) => {
      dispatch(assetsActions.actionDeleteAsset({ type, id }));
      return assetsDispatch;
    },
    /**
     * 更新资源
     */
    updateAsset: (type: AssetsType, uid: string, value: Asset) => {
      dispatch(assetsActions.actionUpdateAsset({ type, uid, value }));
      return assetsDispatch;
    },
  };

  const assetsQueryTool = {
    getAllAssets: () => {
      const {
        videoDict,
        imageDict,
        audioDict,
        lottieDict,
      } = assetsStateRef.current;
      return { videoDict, imageDict, audioDict, lottieDict };
    },
    getVideos: () => {
      const { videoDict } = assetsStateRef.current;
      return Object.values(videoDict);
    },
    getVideoById: (key: string) => {
      const { videoDict } = assetsStateRef.current;
      return videoDict[key];
    },
    getAudioById: (<T extends AduioDict, U extends keyof T>(obj: T) => (
      id: U | string
    ): Audio => {
      return obj[id];
    })(audioDict),
    getAssetByMd5: (key: string) => {
      const {
        videoDict,
        audioDict,
        imageDict,
        lottieDict,
      } = assetsStateRef.current;
      return (
        videoDict[key] ||
        audioDict[key] ||
        imageDict[key] ||
        lottieDict[key] ||
        null
      );
    },
    getImageById: (<T extends ImageDict, U extends keyof T>(obj: T) => (
      id: U | string
    ): Image => {
      return obj[id];
    })(imageDict),
    getAssetByPath: (path: string) => {
      return (
        _.find(videoDict, (v: any) => v.path === path) ||
        _.find(audioDict, (v: any) => v.path === path) ||
        _.find(imageDict, (v: any) => v.path === path) ||
        _.find(lottieDict, (v: any) => v.path === path) ||
        null
      );
    },
    isExistState: (id: string) => {
      const {
        videoDict,
        imageDict,
        audioDict,
        lottieDict,
      } = assetsStateRef.current;
      return (
        videoDict[id] ||
        audioDict[id] ||
        imageDict[id] ||
        lottieDict[id] ||
        false
      );
    },
  };

  return { assetsState, assetsQueryTool, assetsDispatch };
};

export default useAssetsState;
