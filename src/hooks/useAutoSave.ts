import { useRef, useEffect } from 'react';
import useProjectManager from './useProjectManager';
import useSystemState from './useSystemState';

// 自动保存间隔时间
const AutoSaveTimeout = 1000 * 300;

const useAutoSave = () => {
  const { systemDispatch } = useSystemState();
  const { projectManager } = useProjectManager();

  const timerRef = useRef<Timeout>();

  useEffect(() => {
    const settingTimer = () => {
      return setTimeout(() => {
        timerRef.current && clearTimeout(timerRef.current);
        projectManager.saveProject();
        systemDispatch.setAutoSaveTime(new Date().getTime());
        timerRef.current = settingTimer();
      }, AutoSaveTimeout);
    };
    timerRef.current = settingTimer();

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoSave;
