import { v4 } from 'uuid';
import { NativeStore, InteractsType } from '../interface/native-interface';
import {
  DefaultSelectWidth,
  DefaultSelectHeight,
  DefaultSelectPosX,
  DefaultSelectPosY,
  DefaultDragStartPosX,
  DefaultDragEndPosX,
  DefaultDragHeight,
  DefaultDragWidth,
} from '../config';

/* eslint-disable import/prefer-default-export */
export const nativeState: NativeStore = {
  ITVS: [],
  ITVDict: {},
  videoTrackDict: {},
  effectTrackDict: {},
  segmentNodeDict: {},
  interactNodeDict: {},
};

export const getNewSelectionPos = (prevPos: { x: number; y: number }) => ({
  newX: Math.min(prevPos.x + 0.1, 1 - DefaultSelectWidth),
  newY: Math.min(prevPos.y + 0.1, 1 - DefaultSelectHeight),
});

export const getNewDragGroupPos = (prevPos: { x: number; y: number }) => ({
  startX: DefaultDragStartPosX,
  startY: Math.min(prevPos.y + 0.1, 1 - DefaultDragHeight),
  endX: DefaultDragEndPosX,
  endY: Math.min(prevPos.y + 0.1, 1 - DefaultDragHeight),
});

export const getSimpleSelectTemplate = () => {
  const firstSelectId = v4();
  return {
    type: InteractsType.SIMPLE_SELECT,
    loopTime: 3, // 循环播放自该交互节点至往后N秒(AKA题干背景）
    autoLoop: {
      isAuto: true,
      pos: { x: 0.25, y: 0.25 }, // 位置坐标(百分比)
      size: { width: 0.1, height: 0.1 }, // 大小(百分比)
    },
    selections: [
      {
        id: firstSelectId,
        pos: { x: DefaultSelectPosX, y: DefaultSelectPosY }, // 位置坐标(百分比)
        size: { width: DefaultSelectWidth, height: DefaultSelectHeight }, // 大小(百分比)
        next: null, // 指向 SegmentNodeId
      },
    ], // 选项
    correctSelectId: firstSelectId, // 正确答案ID
    correctSoundFilename: '', // 答对反馈音效
    wrongSoundFilename: '', // 答错反馈音效
    reward: {
      opened: false,
    },
    answerLimitedTime: {
      type: 'default',
      value: 0,
      time: 15,
    },
  };
};

export const autoPauseTemplate = {
  type: InteractsType.AUTO_PAUSE, // 固定值
  operation: 'play', // 点击后播放|点击后去编程|自动去编程
  pos: { x: 0.25, y: 0.25 }, // 位置坐标(百分比)
  size: { width: 0.5, height: 0.5 }, // 大小(百分比)
  answerLimitedTime: {
    // 答题限制时长
    type: 'default',
    value: 0,
    time: 15,
  },
};

export const getDragNDropTemplate = () => {
  const firstItemId = v4();
  return {
    type: InteractsType.DRAGNDROP, // 类型，固定值
    loopTime: 2, // 循环播放自该交互节点至往后N秒(AKA题干背景）
    autoLoop: {
      isAuto: true,
      pos: { x: 0.25, y: 0.25 }, // 位置坐标(百分比)
      size: { width: 0.1, height: 0.1 }, // 大小(百分比)
    },
    correctGroups: [[firstItemId]], // 正确拖拽的id组合
    dragItems: [
      {
        id: firstItemId,
        imgFilename: '',
        startPos: {
          x: 0.2,
          y: 0.2,
        },
        endPos: {
          x: 0.5,
          y: 0.5,
        },
        size: {
          width: DefaultDragWidth,
          height: DefaultDragHeight,
        },
      },
    ],
    correctSoundFilename: '', // 答对反馈音效
    wrongSoundFilename: '', // 答错反馈音效
    reward: {
      opened: false,
    },
    answerLimitedTime: {
      type: 'default',
      value: 0,
      time: 15,
    },
  };
};

export const audioRecordTemplate = {
  type: InteractsType.AUDIO_RECORD, // 类型，固定值
  duration: 15, // 持续时间(s)
  mode: 'once', // once: 自动播放一次；repeat: 重复录制；zero: 仅录音；
  repeatNum: 5, // 允许重复录音次数
  isOpenEffect: false, // 是否开启反馈
  correctSoundFilename: '', // 正确音效，此处与原 itv 结构不同，转换时注意
  wrongSoundFilename: '', // 错误音效，此处与原 itv 结构不同，转换时注意
  correctEffectFileName: '',
  wrongEffectFileName: '',
  reward: {
    opened: false,
  },
};

export const videoRecordTemplater = {
  type: InteractsType.VIDEO_RECORD,
  autoOff: false, // 自动关闭
  duration: 15, // 持续时间(s)
  pos: { x: 0.2, y: 0.2 }, // 位置坐标(百分比)
  size: { width: 0.5, height: 0.5 }, // 大小(百分比)
  decorateImage: {
    imgFilename: '',
    pos: { x: 0.2, y: 0.2 }, // 位置坐标(百分比)
    size: { width: 0.2, height: 0.2 }, // 大小(百分比)
  },
};

export const getBranchStoryTemplate = () => {
  const firstSelectId = v4();
  return {
    type: InteractsType.BRANCH_STORY, // 类型，固定值
    loopTime: 3, // 循环播放自该交互节点至往后N秒(AKA题干背景）
    autoLoop: {
      isAuto: true,
      pos: { x: 0.2, y: 0.2 }, // 位置坐标(百分比)
      size: { width: 0.1, height: 0.1 }, // 大小(百分比)
    },
    selections: [
      {
        id: firstSelectId,
        pos: { x: DefaultSelectPosX, y: DefaultSelectPosY }, // 位置坐标(百分比)
        size: { width: DefaultSelectWidth, height: DefaultSelectHeight }, // 大小(百分比)
        next: null, // 指向 SegmentNodeId
      },
    ],
    answerLimitedTime: {
      type: 'default',
      value: 0,
      time: 15,
    },
  };
};
