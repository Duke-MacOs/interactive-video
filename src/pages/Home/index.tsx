import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import TitleBar from '../TitleBar';
import useSystemState from '../../hooks/useSystemState';
import useNativeState from '../../hooks/useNativeState';
import useProjectManager from '../../hooks/useProjectManager';
import { openDirDialog } from '../../utils/electron-util';
import RecentList from './components/recent-list';

import DragIcon from './assets/ico-drag-folder.png';

const HomePage = () => {
  const { nativeState } = useNativeState();
  const { systemState, systemDispatch } = useSystemState();
  const { projectManager } = useProjectManager();

  const { recent } = systemState;
  const [isWaitDrop, setIsWaitDrop] = useState(false);

  const handleDragover = (e: DragEvent) => {
    e.preventDefault();
    setIsWaitDrop(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsWaitDrop(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsWaitDrop(false);
    const { files } = e.dataTransfer;
    const { path, name } = files[0];
    projectManager.openProject(path);
  };

  const handleClickChoose = () => {
    const path = openDirDialog();
    path && projectManager.openProject(path);
  };

  return (
    <>
      <div className="home-container">
        <header className="home-header user-unselect">
          <div>
            <h2>CODEMAO</h2>
            <h4 className="home-header-desc">
              <span>互动视频制作工具</span>
            </h4>
          </div>
        </header>
        {/* 拖拽区域 */}
        <div className="body">
          <div
            className={classNames(
              'horizontal-verticality-center',
              'verticality-center',
              'home-drop',
              {
                'home-drop-wait': isWaitDrop,
                'home-drop-large': recent?.items?.length === 0,
                'home-drop-small': recent?.items?.length !== 0,
              }
            )}
            onDragOver={(e) => {
              handleDragover(e);
            }}
            onDragLeave={(e) => {
              handleDragLeave(e);
            }}
            onDrop={(e) => {
              handleDrop(e);
            }}
          >
            <img src={DragIcon} className="icon-drag" alt="" />
            <p className="title">拖放文件夹</p>
            <p className="text">
              或从你的电脑中
              <span className="choose" onClick={handleClickChoose}>
                导入文件夹
              </span>
              开始使用
            </p>
          </div>
          {recent?.items?.length !== 0 && <RecentList />}
        </div>
      </div>
    </>
  );
};

export default HomePage;
