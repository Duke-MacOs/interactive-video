/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import VideoManager from '../../../../classes/VideoManager';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import { InteractsType } from '../../../../interface/native-interface';
import { MenuListId } from '../../../../interface/system-interface';
import { getNodeInfoByType } from '../../../../utils/util';

export interface Props {
  id: string;
  type: InteractsType;
  left: number;
  width: number;
  isDrag: boolean;
  handleDrag: () => void;
  hanldeNotDrop: () => void;
}

export type EffectDragItem = {
  id: string;
  type: InteractsType;
  left: number;
  width: number;
  isDrag: boolean;
};

const videoManage = VideoManager.getInstance();

export const EffectItemDnd: FC<Props> = ({
  id,
  type,
  left,
  width,
  isDrag,
  handleDrag,
  hanldeNotDrop,
}) => {
  const { nativeQueryTool, nativeState } = useNativeState();
  const { systemState, systemDispatch } = useSystemState();
  const { currentNodeId } = systemState;
  const { interactNodeDict } = nativeState;
  const info = getNodeInfoByType(type);

  const [name, setName] = useState<string>('');

  useEffect(() => {
    const node = nativeQueryTool.getInteractNodeById(id);
    setName(node?.name ?? '');
  }, [interactNodeDict]);

  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: () => {
      return { id, type, left, width, isDrag: true };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item, monitor) {
      if (!monitor.didDrop()) hanldeNotDrop();
      systemDispatch.setDragNodeStatus(false);
    },
  });

  const handleClick = (id: string) => {
    videoManage.pause();
    systemDispatch.setCurrentMenuType(MenuListId.INTERACTIVE);
    systemDispatch.setCurrentNodeId(id);
  };

  const opacity = isDragging ? 0 : 1;

  return (
    <>
      <Tooltip placement="top" title={name} color="cyan">
        <div
          ref={drag}
          style={{ opacity, width: `${width}px`, left: `${left}px` }}
          className={classnames(
            'effect-drag-item',
            'horizontal-verticality-center',
            {
              'item-dragging': isDrag,
              'effect-drag-item-select': currentNodeId === id,
            }
          )}
          onClick={() => {
            handleClick(id);
          }}
          onDragStart={() => {
            handleDrag();
            systemDispatch.setDragNodeStatus(true);
          }}
        >
          <img src={info.img} width="18px" height="18px" alt="" />
          <span style={{ fontSize: '12px', marginLeft: '2px' }}>
            {info.text}
          </span>
        </div>
      </Tooltip>
    </>
  );
};
