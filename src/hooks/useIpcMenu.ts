import { useEffect } from 'react';
import { openDirDialog } from '../utils/electron-util';
import useProjectManager from './useProjectManager';

const { ipcRenderer } = require('electron');

const useIpcMenu = () => {
  const { projectManager } = useProjectManager();
  // APP 激活时，进行资源检测
  useEffect(() => {
    console.log('MENU 打开文件');
    ipcRenderer.removeAllListeners('open_project');
    ipcRenderer.on('open_project', (event, arg) => {
      projectManager.saveProject();
      const path = openDirDialog();
      path && projectManager.openProject(path);
    });

    return () => {
      ipcRenderer.removeAllListeners('open_project');
    };
  }, []);
};

export default useIpcMenu;
