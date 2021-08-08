import React from 'react';
import Menu from '../menu';
import VideoPlayer from '../video-player';
import OperationPanel from '../operation-panel';

const MainContainer = () => {
  return (
    <div className="main-container">
      <Menu />
      <VideoPlayer />
      <OperationPanel />
    </div>
  );
};

export default MainContainer;
