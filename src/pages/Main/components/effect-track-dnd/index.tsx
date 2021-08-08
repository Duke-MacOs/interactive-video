import React, { useState, useEffect } from 'react';
import * as _ from 'lodash';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import * as INative from '../../../../interface/native-interface';
import { EffectDragItem, EffectItemDnd } from './item';
import {
  Nodes,
  InteractNode,
  InteractsType,
} from '../../../../interface/native-interface';
import NodeGenerator from '../../../../classes/NodeGenerator';
import {
  getNodeVirtualTimeMs,
  getNodeLeft,
  getNodeWidth,
} from '../../../../utils/util';

import IconEventChannel from '../../assets/icon_event_channel.png';

interface IProps {
  trackId: string;
}

interface Node extends EffectDragItem {
  node: InteractNode | null;
}

const nodeGenerator = NodeGenerator.getInstance();

// 左侧标题区域宽度
const EffectTrackLeftX = 160;

const interactiveNodeToNode = (node: InteractNode, pxToMs: number): Node => {
  let loopTime = 0;
  if (node.node.type !== INative.InteractsType.AUDIO_RECORD) {
    // 录音节点，不计算长度
    loopTime =
      (node.node as any)?.loopTime ?? (node.node as any)?.duration ?? 0;
  }
  const obj = {
    id: node.uid,
    type: node.node?.type as InteractsType,
    left: getNodeLeft(node.virtualTime, pxToMs),
    width: getNodeWidth(loopTime, pxToMs),
    isDrag: false,
    node,
  };
  return obj;
};

const EffectTrackDnd: React.FC<IProps> = ({ trackId }) => {
  const { systemState } = useSystemState();
  const { nativeState, nativeDispatch, nativeQueryTool } = useNativeState();
  const {
    currentItvId,
    drag: { node: dragNodeStatus },
    progressBar,
  } = systemState;
  const { pxToMs } = progressBar;
  const { effectTrackDict, interactNodeDict } = nativeState;

  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (dragNodeStatus) return;
    const effectTrack = effectTrackDict[trackId];
    const newNodes = effectTrack?.interactNodes.map((key) => {
      const node = interactNodeDict[key];
      return interactiveNodeToNode(node, pxToMs);
    });
    setNodes(newNodes);
  }, [dragNodeStatus, effectTrackDict, progressBar, interactNodeDict]);

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: 'node',
      drop: (item: Node, monitor) => {
        const idx = nodes.findIndex((n) => n.isDrag);
        const currentNode = nodes[idx];
        if (idx !== -1) {
          currentNode.isDrag = false;
          const virtualTime = getNodeVirtualTimeMs(item.left, pxToMs);
          const options = {
            uid: item.id,
            type: item.type,
            parentITVId: currentItvId,
            parentTrackId: trackId,
            virtualTime,
          };
          const newNode = nodeGenerator.createInteractNode(options);
          if (!currentNode.node) {
            // 新增 interactive 节点
            nativeDispatch.addInteractiveNode(trackId, newNode);
          } else {
            // 更新 节点
            const _interactNode = _.cloneDeep(
              nativeQueryTool.getInteractNodeById(item.id)
            );
            _interactNode.virtualTime = virtualTime;
            nativeDispatch.updateInteractiveNode(_interactNode);
          }
        }
      },
      hover: (item: Node, monitor: DropTargetMonitor) => {
        const clientOffsetX = (monitor.getClientOffset() as XYCoord).x;
        const left = clientOffsetX - EffectTrackLeftX;
        if (item.left === -1) {
          // 新增节点
          item.left = left;
          nodes.push(item);
          setNodes([...nodes]);
        } else {
          const idx = nodes.findIndex((n) => n.isDrag);
          if (idx !== -1) {
            item.left = left;
            nodes[idx].left = left;
            setNodes([...nodes]);
          }
        }
      },
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [systemState]
  );

  const hanldeDrag = (idx: number) => {
    nodes[idx].isDrag = true;
    setNodes([...nodes]);
  };

  const handleNotDrop = (idx: number) => {
    nativeDispatch.deleteInteractiveNode(nodes[idx]?.id);
  };

  const marginLeft = `-${progressBar.scrollLeft}px`;

  return (
    <div className="effect-track-container">
      <div className="effect-track-name horizontal-verticality-center">
        事件轨
      </div>
      <div className="effect-track" style={{ marginLeft }} ref={drop}>
        {!nodes || nodes.length === 0 ? (
          <div className="track-null">
            <img src={IconEventChannel} alt="" className="track-null-img" />
            为视频添加合适的互动事件
          </div>
        ) : (
          nodes.map((n, idx) => {
            return (
              <EffectItemDnd
                key={n.id}
                id={n.id}
                type={n.type}
                left={n.left}
                width={n.width}
                isDrag={n.isDrag}
                handleDrag={() => {
                  hanldeDrag(idx);
                }}
                hanldeNotDrop={() => {
                  handleNotDrop(idx);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default EffectTrackDnd;
