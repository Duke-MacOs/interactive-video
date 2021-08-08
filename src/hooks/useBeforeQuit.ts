import { useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useDispatch } from 'react-redux';
import * as _ from 'lodash';
import useNativeState from './useNativeState';
import useAssetsState from './useAssetsState';
import { actionSetDialog } from '../redux/systemStore';

export const useBeforeQuit = () => {
  const dispatch = useDispatch();
  const { nativeState } = useNativeState();
  const { assetsState } = useAssetsState();
  useEffect(() => {
    ipcRenderer.on('changeWin', (event, arg) => {
      // 这里是主进程传过来的消息
      const { closeMainWindow } = arg;
      if (closeMainWindow) {
        dispatch(actionSetDialog(true));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    const prevStatus = window.sessionStorage.getItem('prevStatus');
    const newtitle = document.title.replace(/(\*)/gi, '');
    const hasEnterEdit = window.sessionStorage.getItem('enterEdit');
    if (!prevStatus) {
      window.sessionStorage.setItem(
        'prevStatus',
        JSON.stringify(_.cloneDeep(nativeState))
      );
    } else if (JSON.stringify(nativeState) !== prevStatus && hasEnterEdit) {
      document.title = `${newtitle}*`;
      ipcRenderer.send('sendmsg', { canQuit: false });
    } else {
      document.title = newtitle;
    }
  }, [nativeState, assetsState]);
};
