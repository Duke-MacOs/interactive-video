import React, { useState, useEffect } from 'react';
import { Popover } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import useSystemState from '../../../../../hooks/useSystemState';
import useAssetsState from '../../../../../hooks/useAssetsState';
import useAssetsManager from '../../../../../hooks/useAssetsManager';
import { openFileDialog } from '../../../../../utils/electron-util';

import iconImage from '../../../assets/sound@2x.png';

interface IProps {
  assetId: string;
  handleAdd: (uid: string) => void;
  handleDelete: VoidFunction;
  handleUpdate: (uid: string) => void;
}

const ImageSetting: React.FC<IProps> = ({
  assetId,
  handleAdd,
  handleDelete,
  handleUpdate,
}) => {
  const { assetsQueryTool } = useAssetsState();
  const { systemDispatch } = useSystemState();
  const { assetsManager } = useAssetsManager();

  const [str, setStr] = useState<string>('');
  const [path, setPath] = useState<string>('');

  useEffect(() => {
    const asset = assetsQueryTool.getImageById(assetId);
    setStr(asset?.name ?? '');
    setPath(asset?.path ?? '');
  }, [assetId]);

  const handleClick = async (e: any) => {
    e.stopPropagation();
    const path = openFileDialog(['image']);
    if (path) {
      systemDispatch.setSpinTip('正在复制资源...');
      systemDispatch.openSpin();
      const result = await assetsManager.copyFile(path);
      console.log('result: ', result);
      systemDispatch.closeSpin();
      result && handleAdd(result?.value.uid ?? '');
    }
  };

  const handleClickDelete = (e: any) => {
    e.stopPropagation();
    handleDelete();
  };

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item: any, monitor) => {
      console.log('drop done: ', monitor.didDrop());
      console.log('item: ', item);
      handleAdd(item.id);
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const content = (
    <div className="preview-container verticality-horizontal-center">
      <span className="preview-text" onClick={handleClick}>
        {str === '' ? '添加图片' : '更换图片'}
      </span>
      {str !== '' && (
        <>
          <img src={path} className="preview-image" alt="" />
          <span className="preview-name span-full">{str}</span>
          <div className="delete-icon" onClick={handleClickDelete}>
            <DeleteOutlined />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      ref={drop}
      className="audio-setting horizontal-verticality-center"
      onClick={handleClick}
    >
      <Popover
        placement="bottomLeft"
        content={content}
        trigger="hover"
        className="horizontal-verticality-center"
      >
        <img
          src={iconImage}
          style={{ marginRight: '2px' }}
          width="12px"
          height="12px"
          alt=""
        />
        <span style={{ width: '60px' }} className="span-full">
          {str || '添加图片'}
        </span>
      </Popover>
    </div>
  );
};

export default ImageSetting;
