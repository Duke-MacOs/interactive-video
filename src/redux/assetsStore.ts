/* eslint-disable @typescript-eslint/naming-convention */
import * as _ from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Asset,
  AssetsType,
  Video,
  Audio,
  Lottie,
  Image,
  AssetList,
} from '../interface/assets-interface';
import assetsStoreBoilerplate from '../boilerplate/assetsStore';

const initialAssetsState = assetsStoreBoilerplate;

export const slice = createSlice({
  name: 'assetsState',
  initialState: initialAssetsState,
  reducers: {
    actionSetAllAssets: (state, action: PayloadAction<AssetList>) => {
      return action.payload;
    },
    actionInitialAssets: () => {
      return initialAssetsState;
    },
    actionAddAsset: (
      state,
      action: PayloadAction<{
        type: AssetsType;
        value: Video | Audio | Lottie | Image;
      }>
    ) => {
      const key = `${action?.payload?.type}Dict` as
        | 'videoDict'
        | 'audioDict'
        | 'lottieDict'
        | 'imageDict';
      if (key) {
        const { uid } = action.payload?.value;
        state[key] = { ...state[key], [uid]: action.payload?.value };
      }
      return state;
    },
    actionDeleteAsset: (
      state,
      action: PayloadAction<{
        type: AssetsType;
        id: string;
      }>
    ) => {
      const key = `${action?.payload?.type}Dict` as
        | 'videoDict'
        | 'audioDict'
        | 'lottieDict'
        | 'imageDict';
      const _state = _.cloneDeep(state);
      if (key) {
        delete _state[key][action.payload.id];
      }

      return _state;
    },
    actionUpdateAsset: (
      state,
      action: PayloadAction<{
        type: AssetsType;
        uid: string;
        value: Asset;
      }>
    ) => {
      const key = `${action?.payload?.type}Dict` as
        | 'videoDict'
        | 'audioDict'
        | 'lottieDict'
        | 'imageDict';
      const { uid, value } = action.payload;
      if (key) {
        state[key][uid] = value;
      }
      return state;
    },
  },
});

export const {
  actionSetAllAssets,
  actionInitialAssets,
  actionDeleteAsset,
  actionAddAsset,
  actionUpdateAsset,
} = slice.actions;

export const assetsReducer = slice.reducer;
