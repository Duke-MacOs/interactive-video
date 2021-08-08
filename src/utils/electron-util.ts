/* eslint-disable import/prefer-default-export */
const { ipcRenderer } = require('electron');

/**
 * 将文件/文件夹路径添加到最近打开
 * @param path string 文件/文件夹路径
 */
export const addRecentDoc = (path: string) => {
  return ipcRenderer.send('add-recent-doc', path);
};

export const removeRecentDoc = (path: string) => {
  return ipcRenderer.send('async-clear-recent-doc-message', path);
};

/**
 * 打开本地文件夹
 * @returns 路径
 */
export const openDirDialog = () => {
  return ipcRenderer.sendSync('open-dir-dialog');
};

/**
 * 打开本地文件夹
 * @returns 路径
 */
export const openFileDialog = (arg: string[] = []) => {
  return ipcRenderer.sendSync('open-file-dialog', arg);
};
