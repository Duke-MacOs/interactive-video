import { combineReducers } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { getDefaultMiddleware, configureStore } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

import { nativeReducer, nativeStateUndoRedoFilterFun } from './nativeStore';
import { systemReducer } from './systemStore';
import { assetsReducer } from './assetsStore';
import customMiddleware from './middleware';

export const history = createBrowserHistory();
const router = routerMiddleware(history);
export const middleware = [
  ...customMiddleware,
  ...getDefaultMiddleware({ serializableCheck: false }),
  router,
];

const createRootReducer = (history: any) =>
  combineReducers({
    router: connectRouter(history),
    nativeState: undoable(nativeReducer, {
      ignoreInitialState: true,
      filter: nativeStateUndoRedoFilterFun,
      limit: 30,
    }),
    systemState: systemReducer,
    assetsState: assetsReducer,
  });

export type RootState = ReturnType<typeof rootReducer>;

export const rootReducer = createRootReducer(history);

export const store = configureStore({
  reducer: rootReducer,
  middleware,
});
