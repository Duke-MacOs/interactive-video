import React, { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { message, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import * as fs from '../utils/fs';
import ITVManager from '../classes/ITVManager';
import { RootState } from '../redux/rootReducer';
import useNativeState from './useNativeState';
import useAssetsManager from './useAssetsManager';
import useSystemState from './useSystemState';
import useAssetsState from './useAssetsState';
import { addRecentDoc, removeRecentDoc } from '../utils/electron-util';
import * as INative from '../interface/native-interface';
import * as IAssets from '../interface/assets-interface';

const iTVManager = ITVManager.getInstance();

const useProjectManager = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { systemDispatch } = useSystemState();
  const { nativeDispatch, nativeState } = useNativeState();
  const { assetsState, assetsDispatch } = useAssetsState();
  const { assetsManager } = useAssetsManager();

  const nativeStateRef = useRef<INative.NativeStore>();
  const assetsStateRef = useRef<IAssets.AssetList>();
  useEffect(() => {
    nativeStateRef.current = nativeState;
    assetsStateRef.current = assetsState;
  }, [nativeState, assetsState]);

  const isDirectory = (path: string) => {
    return fs.isDirectory(path);
  };

  const hasITVMFile = () => {
    return fs.existsSync(`${window.__WORK_DIR__}/data.itvm`);
  };

  const initialProject = async () => {
    await new Promise((resolve, reject) => {
      if (!window.__WORK_DIR__) {
        message.error('初始化项目失败, 请检查 __WORK_DIR__');
        reject();
        return;
      }

      // 初始化 native store
      nativeDispatch.initialState();
      // 保存进 .itvm, 延迟执行，initialState 为异步执行，需等待 redux 被写入
      setTimeout(() => {
        projectManager.saveProject();
      }, 1000);

      addRecentDoc(window.__WORK_DIR__);
      const path = `${window.__WORK_DIR__}/.userData/vframes`;
      if (!fs.existsSync(path)) {
        fs.mkdir(path);
      }
      resolve(true);
    });
  };

  const openAlreadyProject = async () => {
    await new Promise((resolve, reject) => {
      const { isValid, msg, data } = iTVManager.isValidITVMFile();
      if (!isValid) {
        message.error(msg);
        reject();
        return;
      }
      addRecentDoc(window.__WORK_DIR__);

      // 初始化 native state
      nativeDispatch.setAllState(data.nativeState);
      assetsDispatch.setAllState(data.assetsState);
      systemDispatch.setCurrentItvId(data?.nativeState?.ITVS[0] ?? '');

      fs.mkdir(`${window.__WORK_DIR__}/.userData/vframes`);
      resolve(true);
    });
  };

  const showErrorModal = () => {
    Modal.error({
      title: '错误',
      content: '无法打开所选项目，因为找不到该文件夹',
    });
  };

  const projectManager = {
    // 设置项目地址
    setWorkDir: (path: string) => {
      window.__WORK_DIR__ = path;
      return projectManager;
    },

    reset: () => {
      return projectManager;
    },

    openProject: async (path: string) => {
      try {
        if (!fs.existsSync(path)) {
          showErrorModal();
          removeRecentDoc(path);
          return;
        }
        if (isDirectory(path)) {
          projectManager.setWorkDir(path);
          systemDispatch.openSpin().setSpinTip('正在初始化资源...');

          // 打开项目
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          hasITVMFile() ? await openAlreadyProject() : await initialProject();

          // 初始化资源库
          assetsManager.getLibraryFiles();

          // 检测工作目录下资源
          assetsManager.checkAllAssets();

          // 设置项目名
          const leftIndex = window.__WORK_DIR__.lastIndexOf('/');
          systemDispatch.setProjectName(
            window.__WORK_DIR__.slice(leftIndex + 1)
          );

          systemDispatch.closeSpin();
          message.success('打开项目成功');
          setTimeout(() => {
            if (location.pathname !== '/main') {
              history.push('/main');
            }
          }, 500);
        } else {
          message.error('请选择打开文件夹');
        }
        window.sessionStorage.setItem('enterEdit', 'true');
      } catch (error) {
        console.log(error);
        systemDispatch.closeSpin();
      }
    },
    saveProject: () => {
      if (nativeStateRef.current && assetsStateRef.current) {
        console.log('assetsStateRef.current: ', assetsStateRef.current);
        const data = iTVManager.generatorITVM(
          nativeStateRef.current,
          assetsStateRef.current
        );
        const path = `data.itvm`;
        fs.createFile(path, data);

        // TODO: document.title 在多个地方存在修改，可优化 useBeforeQuit.ts
        const newtitle = document.title.replace(/(\*)/gi, '');
        document.title = newtitle;
      } else {
        message.error('保存失败，请检查 store 数据');
      }
    },
  };

  return { projectManager };
};

export default useProjectManager;
