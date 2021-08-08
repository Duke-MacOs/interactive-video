/**
 * 最近打开文件
 */
import React, { useEffect } from 'react';
import * as _ from 'lodash';
import { useDispatch } from 'react-redux';
import * as fs from '../utils/fs';
import { RecentDoc } from '../interface/system-interface';
import { actionSetRecent, actionCleanRecent } from '../redux/systemStore';

const { ipcRenderer } = require('electron');

let userDataPath = '';
const useRecentDocument = () => {
  const dispatch = useDispatch();

  const setSystemRecentState = (recent: { items: RecentDoc[] }) => {
    dispatch(actionSetRecent(recent));
  };

  const cleanSystemRecentState = () => {
    dispatch(actionCleanRecent());
  };

  const getInitialString = () => {
    return JSON.stringify({ items: [] });
  };

  const getRecentDocPath = () => {
    return `${userDataPath}/recentDoc.json`;
  };

  const createItem = (path = '') => {
    const idx = path.lastIndexOf('/');
    return {
      path,
      key: Math.random(),
      name: idx === -1 ? '' : path.slice(idx + 1),
      openTime: new Date().getTime(),
    };
  };

  const removeItem = (path = '') => {
    const o = JSON.parse(fs.readFileSync(getRecentDocPath()));
    _.remove(o.items, (i: RecentDoc) => i.path === path);
    fs.writeFileSync(getRecentDocPath(), JSON.stringify(o));
    setSystemRecentState(o);
  };

  // 获取 electron 运行路径
  useEffect(() => {
    ipcRenderer.removeAllListeners('async-add-recent-doc-reply');
    ipcRenderer.removeAllListeners('async-clear-recent-doc-reply');

    ipcRenderer.send('async-get-electron-path-message');

    ipcRenderer.once('async-get-electron-path-reply', (event, arg) => {
      if (userDataPath === '') userDataPath = arg;

      if (fs.existsSync(getRecentDocPath())) {
        const recentState = JSON.parse(fs.readFileSync(getRecentDocPath()));
        console.log('!!recentState: ', recentState);
        setSystemRecentState(recentState);
      } else {
        fs.createFileAnyWhere(getRecentDocPath(), getInitialString());
        setSystemRecentState({ items: [] });
      }
    });
  }, []);

  // 监听 addRecentDocument
  useEffect(() => {
    ipcRenderer.on('async-add-recent-doc-reply', (event, arg) => {
      if (userDataPath === '') return;
      if (fs.existsSync(getRecentDocPath())) {
        const o = JSON.parse(fs.readFileSync(getRecentDocPath()));
        if (
          _.findIndex(
            o.items as RecentDoc[],
            (ite: RecentDoc) => ite.path === arg
          ) > -1
        ) {
          o.items = _.map(o.items, (i: RecentDoc) => {
            if (i.path === arg) {
              return {
                ...i,
                openTime: new Date().getTime(),
                key: Math.random(),
              };
            }
            return i;
          });
        } else {
          o.items.push(createItem(arg));
        }
        fs.writeFileSync(getRecentDocPath(), JSON.stringify(o));
        setSystemRecentState(o);
      } else {
        const i = {
          items: [createItem(arg)],
        };
        fs.createFile(getRecentDocPath(), JSON.stringify(i));
        setSystemRecentState(i);
      }
    });
  }, []);

  // 监听 clearRecentDocuemnt
  useEffect(() => {
    ipcRenderer.on('async-clear-recent-doc-reply', (event, path) => {
      if (userDataPath === '') return;
      if (fs.existsSync(getRecentDocPath())) {
        if (path) {
          removeItem(path);
        } else {
          fs.writeFileSync(getRecentDocPath(), getInitialString());
          cleanSystemRecentState();
        }
      }
    });
  }, []);
};

export default useRecentDocument;
