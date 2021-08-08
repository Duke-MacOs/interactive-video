/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import TitleBar from '../TitleBar';
import AudioManager from '../../classes/AudioManager';
import Header from './components/header';
import MainContainer from './components/main-container';
import EditContainer from './components/edit-container';
import useListenNode from '../../hooks/useListenNode';
import useAppFocus from '../../hooks/useAppFocus';
import useAutoSave from '../../hooks/useAutoSave';

const audioManage = AudioManager.getInstance();

const MainPage = () => {
  console.log('执行 MainPage 组件');
  // 监听 currentNode
  useListenNode();
  // 监听页面可见性
  useAppFocus();
  // 自动保存
  useAutoSave();

  return (
    <>
      <TitleBar />
      <div className="main-wrap">
        <Header />
        <MainContainer />
        <EditContainer />

        {/* 音频资源预览播放器 */}
        <audio
          src=""
          ref={(ref) => {
            if (!ref) {
              return;
            }
            audioManage.bindAudioElement(ref);
          }}
        />
      </div>
    </>
  );
};

export default MainPage;
