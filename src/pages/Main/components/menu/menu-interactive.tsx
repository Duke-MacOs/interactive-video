// 交互节点模块
import React, { useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { v4 } from 'uuid';
import { InteractsType } from '../../../../interface/native-interface';
import { EffectDragItem } from '../effect-track-dnd/item';
import NodeGenerator from '../../../../classes/NodeGenerator';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import AutoPauseImage from '../../assets/auto-pause@2x.png';
import SimpleSelectImage from '../../assets/simple-select@2x.png';
import ComplexSelectImage from '../../assets/complex-select@2x.png';
import DragNDropImage from '../../assets/dragNdrop@2x.png';
import AudioRecordImage from '../../assets/audio-record@2x.png';
import VideoRecordImage from '../../assets/video-record@2x.png';
import BranchStoryImage from '../../assets/branch-story@2x.png';

interface ItemType {
  key: string;
  type: InteractsType;
  img: string;
  text: string;
}
const nodeGenerator = NodeGenerator.getInstance();
const lineStyle = {
  width: '100%',
  height: '2px',
  background: '#313233',
  margin: '5px 0 10px 0',
};

export const Interactives: ItemType[] = [
  {
    key: '1',
    type: InteractsType.AUTO_PAUSE,
    img: AutoPauseImage,
    text: '自动暂停',
  },
  {
    key: '2',
    type: InteractsType.SIMPLE_SELECT,
    img: SimpleSelectImage,
    text: '单选题',
  },
  // {
  //   key: '3',
  //   type: InteractsType.COMPLEX_SELECT,
  //   img: ComplexSelectImage,
  //   text: '多选题',
  // },
  {
    key: '4',
    type: InteractsType.DRAGNDROP,
    img: DragNDropImage,
    text: '拖拽题',
  },
  {
    key: '5',
    type: InteractsType.AUDIO_RECORD,
    img: AudioRecordImage,
    text: '录音',
  },
  {
    key: '6',
    type: InteractsType.VIDEO_RECORD,
    img: VideoRecordImage,
    text: '视频开窗',
  },
  {
    key: '7',
    type: InteractsType.BRANCH_STORY,
    img: BranchStoryImage,
    text: '分支故事',
  },
];

const Item = (props: { item: ItemType }) => {
  const { item } = props;
  const { type } = item;

  const { systemDispatch, systemState } = useSystemState();
  const { nativeQueryTool, nativeDispatch } = useNativeState();
  const {
    currentItvId,
    virtualTime,
    drag: { node: dragNodeStatus },
  } = systemState;

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: 'node',
      item: {
        id: v4(),
        type,
        left: -1,
        width: 100,
        isDrag: true,
        node: null,
      },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: 'copy',
      },
      end: () => {
        systemDispatch.setDragNodeStatus(false);
      },
    }),
    [dragNodeStatus]
  );

  const handleClick = useCallback(() => {
    const trackId = nativeQueryTool.getCurrentItvFirstEffectTrack()?.uid;
    if (trackId) {
      const options = {
        uid: v4(),
        type,
        parentITVId: currentItvId,
        parentTrackId: trackId,
        virtualTime,
      };
      const newNode = nodeGenerator.createInteractNode(options);
      nativeDispatch.addInteractiveNode(trackId, newNode);
    }
  }, [currentItvId, virtualTime]);

  return (
    <div
      ref={drag}
      className="item verticality-center horizontal-center"
      key={type}
      onDragStart={() => {
        systemDispatch.setDragNodeStatus(true);
      }}
      onClick={handleClick}
    >
      <img src={item.img} style={{ width: '24px', height: '24px' }} alt="" />
      <span>{item.text}</span>
    </div>
  );
};

const MenuInteractive = () => {
  return (
    <>
      <div
        className="font-small"
        style={{ color: 'rgba(255, 255, 255, 0.85)' }}
      >
        点击或拖拽即可添加交互事件到事件轨上
      </div>
      <div style={lineStyle} />
      <div className="interact-container">
        {Interactives.map((i) => {
          return <Item item={i} key={i.type} />;
        })}
      </div>
    </>
  );
};

export default MenuInteractive;
