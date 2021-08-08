import React from 'react';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { Spin, Alert, message } from 'antd';
import { readSync } from 'fs';
import HomePage from './pages/Home';
import useListenKeyDown from './hooks/useListenKeyDown';
import useRecentDocument from './hooks/useRecentDocument';
import { useBeforeQuit } from './hooks/useBeforeQuit';
import useIpcMenu from './hooks/useIpcMenu';
import useSystemState from './hooks/useSystemState';
import ModalMain from './components/modal';
import MainPage from './pages/Main';
import { history } from './redux/rootReducer';

import 'antd/dist/antd.css';
import './App.global.css';
import './App.global.scss';

export default function App() {
  message.config({
    maxCount: 1,
  });
  useListenKeyDown();
  useRecentDocument();
  useBeforeQuit();
  // 系统菜单 ipc 通信
  useIpcMenu();
  const { systemState } = useSystemState();

  return (
    <Spin tip={systemState.spin.tip} spinning={systemState.spin.isOpen}>
      <ConnectedRouter history={history}>
        <ModalMain />
        <Switch>
          <Route path="/main" component={MainPage} basename="/main" />
          <Route path="/" component={HomePage} basename="/" />
        </Switch>
      </ConnectedRouter>
    </Spin>
  );
}
