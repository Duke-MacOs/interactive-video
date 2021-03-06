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
    // ??????????????????
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
    // ????????????????????????
    key.deleteScope('all');

    // ??????
    key('???+q', () => {
      dispatch(actionSetDialog(true));
    });
    // ??????
    key('???+s', () => {
      projectManager.saveProject();
    });
    // ??????/??????
    key('space', () => {
      videoManage.toggle();
    });
    // redux ????????????
    key('???+shift+x', () => {
      console.log('redux ????????????');
      modalDispatch.showReduxToolModal();
    });

    // ???????????????
    key('???+???+shift+z', () => {
      console.log('???????????????');
      modalDispatch.showShortcutInfoModal();
    });

    // ????????????
    key('backspace', handleDeleteCurrentNode);

    // ??????
    key('???+s', () => {
      projectManager.saveProject();
    });

    // ??????????????????
    key('left', handleleft);

    // ??????????????????
    key('right', handleRight);
  }, []);

  // ???????????????????????????scale, ????????????????????????????????????????????????????????????, ???????????????
  useEffect(() => {
    key.deleteScope('scaleProgress');
    // ??????????????? / ?????? --- ??????????????? - ??? =????????? shift + ???-??? / shift + ???+???????????????+-
    key('=', 'scaleProgress', () => {
      // ??????
      hanldeScaleUp();
    });
    key('-', 'scaleProgress', () => {
      // ??????
      hanldeScaleDown();
    });
    key.setScope('scaleProgress');
  }, [scale]);
};

export default useListenKeyDown;
