import React, { useEffect } from 'react';
import useAssetsManager from './useAssetsManager';

const { ipcRenderer } = require('electron');

const useAppFocus = () => {
  const { assetsManager } = useAssetsManager();

  // APP 激活时，进行资源检测
  useEffect(() => {
    console.log('APP 激活时，进行资源检测');
    ipcRenderer.removeAllListeners('browser-window-focus');
    ipcRenderer.on('browser-window-focus', (event, arg) => {
      console.log('browser-window-focus'); // prints "pong"
      assetsManager.checkAllAssets();
    });

    return () => {
      ipcRenderer.removeAllListeners('browser-window-focus');
    };
  }, []);
};

export default useAppFocus;
