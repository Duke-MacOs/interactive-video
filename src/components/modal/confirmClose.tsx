import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Modal, Button } from 'antd';
import { RootState } from '../../redux/rootReducer';
import { actionSetDialog } from '../../redux/systemStore';
import useProjectManager from '../../hooks/useProjectManager';

export const ConfirmClose = () => {
  const dispatch = useDispatch();
  const { projectManager } = useProjectManager();
  const dialogState = useSelector((state: RootState) => state.systemState);
  const {
    modal: { confirmQuit: open },
  } = dialogState;

  const handleClose = () => {
    dispatch(actionSetDialog(false));
  };

  const handleSave = () => {
    projectManager.saveProject();
    ipcRenderer.send('sendmsg', { canQuit: true });
    window.close();
  };

  const handleNotSave = () => {
    ipcRenderer.send('sendmsg', { canQuit: true });
    window.close();
  };

  return (
    <Modal
      title="退出"
      visible={open}
      onCancel={handleClose}
      footer={[
        <Button key="submit" onClick={handleSave}>
          保存
        </Button>,
        <Button key="nosubmit" onClick={handleNotSave}>
          不保存
        </Button>,
        <Button key="back" onClick={handleClose}>
          取消
        </Button>,
      ]}
    >
      <h3 className="batch-update-sub-title">
        即将退出制课工具，要保存最新修改吗？
      </h3>
    </Modal>
  );
};
