import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip, Input, Modal } from 'antd';
import classnames from 'classnames';
import {
  PlusSquareOutlined,
  ScissorOutlined,
  UnorderedListOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import useNativeState from '../../../../hooks/useNativeState';
import useSystemState from '../../../../hooks/useSystemState';
import useModalState from '../../../../hooks/useModalState';
import useSegmentNode from '../../../../hooks/useSegmentNode';
import { InteractNode } from '../../../../interface/native-interface';
import {
  MaxItvLength,
  ScaleStep,
  MaxScale,
  MinScale,
} from '../../../../config';
import VideoManager from '../../../../classes/VideoManager';

const videoManager = VideoManager.getInstance();

const EditHeader = () => {
  const { systemDispatch, systemState } = useSystemState();
  const { createSegmentNode } = useSegmentNode();
  const { nativeDispatch, nativeState, nativeQueryTool } = useNativeState();
  const { modalDispatch } = useModalState();
  const { ITVDict, ITVS } = nativeState;
  const { currentItvId, progressBar } = systemState;
  const { scale } = progressBar;
  const interactDetailNodes: InteractNode[] = nativeQueryTool?.getCurrentInteractNodes();
  const [renameId, setRenameId] = useState<string>();
  const [menuVisibleId, setMenuVisibleId] = useState<string>();

  const nativeStateRef = useRef(nativeState);

  useEffect(() => {
    nativeStateRef.current = nativeState;
  }, [nativeState]);

  const handleClickItv = (id: string) => {
    systemDispatch.setVideoPause();
    systemDispatch.setCurrentItvId(id);
    systemDispatch.setCurrentNodeId('');
    systemDispatch.setCurrentEditVideoId('');
  };

  const handleAddItv = () => {
    nativeDispatch.addItv();
  };

  const hanldeScaleDown = () => {
    const val = scale + ScaleStep;
    systemDispatch.setProgressBarScale(val <= MaxScale ? val : MaxScale);
  };

  const hanldeScaleUp = () => {
    const val = scale - ScaleStep;
    systemDispatch.setProgressBarScale(val >= MinScale ? val : MinScale);
  };

  const handleScaleInputChange = (num: string) => {
    systemDispatch.setProgressBarScale(MaxScale - Number(num) + 1);
  };

  const showBatchUpdateNodeModal = () => {
    modalDispatch.showBatchUpdateNodeModal();
  };

  const handleInputSegmentNode = async () => {
    const node = await createSegmentNode();
    node && nativeDispatch.addSegmentNode(node);
  };

  const changeName = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    nativeDispatch.UpdateItvName(key, e.target.value);
  };

  const closeMenu = (visible: boolean) => {
    !visible && setMenuVisibleId('');
    setRenameId('');
  };

  const deleteItv = (key: string) => {
    Modal.confirm({
      content: `删除 ${ITVDict[key].name} 将删除该文件内的所有视频资源、交互事件及其属性，确定删除？`,
      okText: '删除',
      cancelText: '取消',
      onOk: () => {
        nativeDispatch.deleteItv(key);
        setTimeout(() => {
          handleClickItv(nativeStateRef.current.ITVS[0]);
        }, 0);
      },
    });
  };

  return (
    <div className="edit-header">
      <div className="itv-bar">
        {ITVS.map((i) => {
          const itv = ITVDict[i];
          return (
            <div key={itv.uid}>
              <Tooltip
                title={
                  <ul className="menu-wrap">
                    <li
                      onClick={() => {
                        setRenameId(itv.uid);
                      }}
                    >
                      重命名
                    </li>
                    {ITVS.length > 1 ? (
                      <li onClick={() => deleteItv(itv.uid)}>删除</li>
                    ) : (
                      <li className="disabled">删除</li>
                    )}
                  </ul>
                }
                placement="bottomRight"
                visible={menuVisibleId === itv.uid}
                onVisibleChange={(visible) => closeMenu(visible)}
              >
                <div
                  className={classnames('itv-item', 'span-full', {
                    active: currentItvId === itv.uid,
                  })}
                  onContextMenu={() => {
                    setMenuVisibleId(itv.uid);
                  }}
                  onClick={() => {
                    handleClickItv(itv.uid);
                  }}
                >
                  {renameId === itv.uid ? (
                    <Input
                      value={itv.name}
                      onChange={(e) => changeName(e, i)}
                      onPressEnter={() => setRenameId('')}
                    />
                  ) : (
                    itv.name
                  )}
                </div>
              </Tooltip>
            </div>
          );
        })}
        <Button
          type="text"
          icon={<PlusSquareOutlined />}
          size="middle"
          disabled={ITVS.length >= MaxItvLength}
          onClick={handleAddItv}
        />
      </div>
      <div className="edit-right">
        <Button
          type="text"
          icon={<ScissorOutlined />}
          size="large"
          onClick={handleInputSegmentNode}
        />
        <Button
          type="text"
          icon={<UnorderedListOutlined />}
          className={
            interactDetailNodes && interactDetailNodes.length !== 0
              ? ''
              : 'edit-btn-disabled'
          }
          size="large"
          onClick={showBatchUpdateNodeModal}
        />
        <div style={{ width: '1px', height: '100%', background: 'gray' }} />
        <div className="scale">
          <Button
            type="text"
            icon={<ZoomOutOutlined />}
            size="small"
            onClick={hanldeScaleDown}
            disabled={scale >= MaxScale}
          />
          <input
            type="range"
            className="scale-range"
            min={MinScale}
            max={MaxScale}
            value={MaxScale - scale + 1 ?? MinScale}
            onChange={(e) => {
              handleScaleInputChange(e.target.value);
            }}
          />
          <Button
            type="text"
            icon={<ZoomInOutlined />}
            size="small"
            disabled={scale <= MinScale}
            onClick={hanldeScaleUp}
          />
        </div>
      </div>
    </div>
  );
};

export default EditHeader;
