import { PayloadAction, Middleware, Action } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as IAssets from '../../interface/assets-interface';
import * as assetsState from '../assetsStore';

const actionAddAsset: Middleware = ({ getState, dispatch }) => (next) => (
  action: PayloadAction<{
    type: IAssets.AssetsType;
    value: IAssets.Video | IAssets.Audio | IAssets.Lottie | IAssets.Image;
  }>
) => {
  if (action?.type === assetsState.actionAddAsset?.type) {
    if (action.payload.type === IAssets.AssetsType.VIDEO) {
      const {
        pixels: { width, height },
        duration,
      } = action.payload.value as IAssets.Video;
      if (!(width && height && duration)) {
        message.warning('视频资源非法，无法添加');
        return;
      }
    }
  }
  next(action);
};

const assetsStoreMiddleware = [actionAddAsset, actionAddAsset];

export default assetsStoreMiddleware;
