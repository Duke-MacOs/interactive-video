/**
 * 键盘快捷键弹窗
 */
import React from 'react';
import { Modal, Divider } from 'antd';
import useModalState from '../../hooks/useModalState';

// 快捷键列表 根据这个遍历展示 winValue表示Windows下展示的值
const shortcutList = [
  {
    type: 'divider',
  },
  {
    type: 'shortcut',
    name: '打开',
    value: '⌘N',
    winValue: 'Ctrl+N',
  },
  {
    type: 'shortcut',
    name: '保存',
    value: '⌘S',
    winValue: 'Ctrl+S',
  },
  {
    type: 'shortcut',
    name: '退出',
    value: '⌘Q',
    winValue: 'Ctrl+Q',
  },
  {
    type: 'divider',
  },
  {
    type: 'shortcut',
    name: '撤回',
    value: '⌘Z',
    winValue: 'Ctrl+Z',
  },
  {
    type: 'shortcut',
    name: '重做',
    value: '⇧⌘Z',
    winValue: 'Ctrl+Shift+Z',
  },
  {
    type: 'divider',
  },
  {
    type: 'shortcut',
    name: '删除节点',
    value: 'backspace',
    winValue: 'backspace',
  },
  {
    type: 'shortcut',
    name: '播放/暂停',
    value: 'space',
    winValue: 'space',
  },
  {
    type: 'shortcut',
    name: '删除',
    value: 'Delete',
    winValue: 'Delete',
  },
  {
    type: 'shortcut',
    name: '时间轴缩小',
    value: '-',
    winValue: '-',
  },
  {
    type: 'shortcut',
    name: '时间轴放大',
    value: '+',
    winValue: '+',
  },
  {
    type: 'divider',
  },
  {
    type: 'shortcut',
    name: '键盘快捷键和菜单',
    value: '⌥⇧⌘Z',
    winValue: 'Ctrl+Shift+Alt+Z',
  },
];
const ShortcutInfoModal = () => {
  const { modalState, modalDispatch } = useModalState();

  // 关闭弹窗
  const handleCancel = () => {
    modalDispatch.hideShortcutInfoModal();
  };

  return (
    <Modal
      title="键盘快捷键和菜单"
      visible={modalState.shortcutInfoModalVisible}
      className="short-cut-modal"
      onCancel={handleCancel}
      footer={null}
    >
      <div className="short-cut-item">
        <span>应用程序菜单命令</span>
        <span>快捷键</span>
      </div>
      {shortcutList.map((item, index) => {
        if (item.type === 'divider') {
          return <Divider key={index.toString()} />;
        }
        return (
          <div className="short-cut-item" key={index.toString()}>
            <span>{item.name}</span>
            <span>
              {process.platform === 'darwin' ? item.value : item.winValue}
            </span>
          </div>
        );
      })}
    </Modal>
  );
};

export default ShortcutInfoModal;
