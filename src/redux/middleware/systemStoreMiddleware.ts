import { PayloadAction, Middleware, Action } from '@reduxjs/toolkit';
import { message } from 'antd';
import * as systemState from '../systemStore';

const actionSetCurrentItvId: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<string>) => {
  if (action?.type === systemState.actionSetCurrentItvId?.type) {
    const { nativeState } = getState();
    const { ITVDict } = nativeState.present;
    if (!ITVDict[action.payload]) {
      message.error('itv 文件不存在');
      return;
    }
  }
  next(action);
};

const actionSetCurrentNodeId: Middleware = ({ getState, dispatch }) => (
  next
) => (action: PayloadAction<string>) => {
  if (action?.type !== systemState.actionSetCurrentNodeId?.type) {
    next(action);
    return;
  }
  const { nativeState } = getState();
  const { interactNodeDict } = nativeState.present;
  const key = action.payload;
  if (key === '') {
    next(action);
    return;
  }
  if (!interactNodeDict[key]) {
    message.error('捕获节点失败，节点 id 无效');
    return;
  }
  next(action);
};

const systemStoreMiddleware = [actionSetCurrentItvId, actionSetCurrentNodeId];

export default systemStoreMiddleware;
