import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as _ from 'lodash';
import { ipcRenderer } from 'electron';
import key from 'keymaster';
import { ActionCreators } from 'redux-undo';
import useModalState from './useModalState';
import useProjectManager from './useProjectManager';
import { actionSetDialog } from '../redux/systemStore';
import VideoManager from '../classes/VideoManager';
import useSystemState from './useSystemState';
import useNativeState from './useNativeState';
import { ScaleStep, MaxScale, MinScale } from '../config';

const videoManage = VideoManager.getInstance();

const useListenKeyDown = () => {
  const dispatch = useDispatch();
  const { systemDispatch, systemState } = useSystemState();
  const { nativeDispatch, nativeState, nativeQueryTool } = useNativeState();
  const { modalDispatch } = useModalState();
  const { projectManager } = useProjectManager();

  const { progressBar, currentNodeId } = systemState;
  const { scale } = progressBar;

  const currentNodeIdRef = useRef<string>(currentNodeId);

  useEffect(() => {
    currentNodeIdRef.current = currentNodeId;
  }, [currentNodeId]);

  const hanldeScaleDown = () => {
    const val = scale + ScaleStep;
    systemDispatch.setProgressBarScale(val <= MaxScale ? val : MaxScale);
  };

  const hanldeScaleUp = () => {
    const val = scale - ScaleStep;
    systemDispatch.setProgressBarScale(val >= MinScale ? val : MinScale);
  };

  const handleDeleteCurrentNode = () => {
    currentNodeIdRef.current &&
      nativeDispatch.deleteInteractiveNode(currentNodeIdRef.current);
  };

  const handleleft = () => {
    const nodes = nativeQueryTool.getCurrentInteractNodesBySort();
    const currentIndex = _.findIndex(nodes, ['uid', currentNodeIdRef.current]);
    const prevNode = nodes[currentIndex - 1];
    if (prevNode) {
      systemDispatch.setCurrentNodeId(prevNode.uid);
    }
  };

  const handleRight = () => {
    const nodes = nativeQueryTool.getCurrentInteractNodesBySort();
    const currentIndex = _.findIndex(nodes, ['uid', currentNodeIdRef.current]);
    const nextNode = nodes[currentIndex + 1];
    if (nextNode) {
      systemDispatch.setCurrentNodeId(nextNode.uid);
    }
  };

  useEffect(() => {
    // 注册监听事件
    ipcRenderer.on('shortcutEvent', (event, arg) => {
      const { type } = arg;
      switch (type) {
        case 'undo':
          dispatch(ActionCreators.undo());
          break;
        case 'redo':
          dispatch(ActionCreators.redo());
          break;
        case 'shortcutModal':
          modalDispatch.showShortcutInfoModal();
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    // 清空原有注册事件
    key.deleteScope('all');

    // 退出
    key('⌘+q', () => {
      dispatch(actionSetDialog(true));
    });
    // 保存
    key('⌘+s', () => {
      projectManager.saveProject();
    });
    // 播放/暂停
    key('space', () => {
      videoManage.toggle();
    });
    // redux 调试窗口
    key('⌘+shift+x', () => {
      console.log('redux 调试窗口');
      modalDispatch.showReduxToolModal();
    });

    // 快捷键弹窗
    key('⌥+⌘+shift+z', () => {
      console.log('快捷键弹窗');
      modalDispatch.showShortcutInfoModal();
    });

    // 删除节点
    key('backspace', handleDeleteCurrentNode);

    // 保存
    key('⌘+s', () => {
      projectManager.saveProject();
    });

    // 切换左侧节点
    key('left', handleleft);

    // 切换右侧节点
    key('right', handleRight);
  }, []);

  // 以下快捷键需要监听scale, 为了避免对所有事件监听进行解绑和重新绑定, 单独写一块
  useEffect(() => {
    key.deleteScope('scaleProgress');
    // 时间轴放大 / 缩小 --- 键盘上只有 - 和 =，其实 shift + ‘-’ / shift + ‘+’才能表示+-
    key('=', 'scaleProgress', () => {
      // 放大
      hanldeScaleUp();
    });
    key('-', 'scaleProgress', () => {
      // 缩小
      hanldeScaleDown();
    });
    key.setScope('scaleProgress');
  }, [scale]);
};

export default useListenKeyDown;
