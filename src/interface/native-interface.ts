// in nativeStory

export enum InteractsType {
  SIMPLE_SELECT = 'simple-select',
  DRAGNDROP = 'drag-n-drop',
  BRANCH_STORY = 'branch-story',
  COMPLEX_SELECT = 'complex-select',
  AUTO_PAUSE = 'auto-pause',
  AUDIO_RECORD = 'audio-record',
  VIDEO_RECORD = 'video-record',
}

type InteractType =
  | 'simple-select'
  | 'drag-n-drop'
  | 'branch-story'
  | 'complex-select'
  | 'auto-pause'
  | 'audio-record'
  | 'video-record';

type AutoLoopStem = {
  isAuto: boolean;
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
};

type Reward = {
  opened: boolean;
};

// 跳转的下一段故事分段
export type RedirectStorySegment = {
  // 播放结束后自动跳转至其他故事及分段节点
  videoId: string; // 要跳转的视频 id
  segmentNodeId: string; // 要跳转的分段节点ID，若为空值则默认从头开始播放
} | null;

export type Selection = {
  // 选择题(数组)
  id: string;
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  next: RedirectStorySegment; // 指向 SegmentNodeId
};

export type DragItem = {
  id: string;
  imgFilename: string;
  startPos: {
    x: number;
    y: number;
  };
  endPos: {
    x: number;
    y: number;
  } | null;
  size: {
    width: number;
    height: number;
  };
};

export type Nodes =
  | SimpleSelect
  | AudioRecord
  | VideoRecord
  | AutoPause
  | BranchStory
  | DragNDrop;

interface Node {
  uid: string;
  name: string;
  parentITVId: string; // 父级 ITV uid
}
export type InteractiveNodeType = 'InteractNode';

export interface InteractNode extends Node {
  type: InteractiveNodeType;
  parentTrackId: string; // 父级 effectTrack uid
  virtualTime: number; // 时间轴毫秒数
  node: Nodes;
}

export type SegmentNodeType = 'SegmentNode';
export interface SegmentNode extends Node {
  type: SegmentNodeType;
  parentVideoId: string; // 父级 video uid
  thumbPath: string; // 节点截图路径
  time: number; // 分段节点在视频时间
  next: RedirectStorySegment;
  allowChangeProgress: boolean;
}

// 分支故事
export interface BranchStory {
  type: InteractsType.BRANCH_STORY; // 类型，固定值
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  selections: Selection[];
  answerLimitedTime: {
    type: 'default' | 'timeStamp' | 'selection';
    value: number | string;
    time: number;
  };
}

// 单选题
export interface SimpleSelect {
  type: InteractsType.SIMPLE_SELECT;
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  selections: Selection[]; // 选项
  correctSelectId: string; // 正确答案ID
  correctSoundFilename: string; // 答对反馈音效
  wrongSoundFilename: string; // 答错反馈音效
  reward: Reward;
  answerLimitedTime: {
    type: 'default' | 'timeStamp'; // default 结束时无操作；timeStamp 结束时跳转到时间点
    value: number; // 跳转到视频某个时间点
    time: number; // 答题时长
  };
}

// 自动暂停
export enum AutoPauseOperation {
  PLAY = 'play',
  CLICKTOKIT = 'clickToKit',
  AUTOTKIT = 'autoToKit',
}
export interface AutoPause {
  type: InteractsType.AUTO_PAUSE; // 固定值
  operation: 'play' | 'clickToKit' | 'autoToKit'; // 点击后播放|点击后去编程|自动去编程
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  answerLimitedTime: {
    // 答题限制时长
    type: 'default' | 'timeStamp';
    value: number;
    time: number;
  };
}

// 拖拽题
export interface DragNDrop {
  type: InteractsType.DRAGNDROP; // 类型，固定值
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  correctGroups: string[][]; // 正确拖拽的id组合
  dragItems: DragItem[];
  correctSoundFilename: string; // 答对反馈音效
  wrongSoundFilename: string; // 答错反馈音效
  reward: Reward;
  answerLimitedTime: {
    type: 'default' | 'timeStamp';
    value: number;
    time: number;
  };
}

// 录音节点
export enum AudioRecordMode {
  ONCE = 'once',
  REPEAT = 'repeat',
  ZERO = 'zero',
}
export interface AudioRecord {
  type: InteractsType.AUDIO_RECORD; // 类型，固定值
  duration: number; // 持续时间(s)
  mode: 'once' | 'repeat' | 'zero'; // once: 自动播放一次；repeat: 重复录制；zero: 仅录音；
  repeatNum: number; // 允许重复录音次数
  isOpenEffect: boolean; // 是否开启反馈
  correctSoundFilename: string; // 正确音效，此处与原 itv 结构不同，转换时注意
  wrongSoundFilename: string; // 错误音效，此处与原 itv 结构不同，转换时注意
  correctEffectFileName: string;
  wrongEffectFileName: string;
  reward: Reward;
}

// 视频开窗
export interface VideoRecord {
  type: InteractsType.VIDEO_RECORD;
  autoOff: boolean; // 自动关闭
  duration: number; // 持续时间(s)
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  decorateImage: {
    imgFilename: string;
    pos: { x: number; y: number }; // 位置坐标(百分比)
    size: { width: number; height: number }; // 大小(百分比)
  };
}

// 事件轨
interface EffectTrack {
  uid: string;
  parentITVId: string; // 父级 ITV uid
  interactNodes: string[]; // 存放事件 uid,详见 EffectPoint
}

// 视频轨
export interface VideoTrack {
  uid: string;
  parentITVId: string; // 父级 ITV uid
  videos: string[]; // 存放 video uid, 详见 Video
}

export interface InteractNodeDict {
  [key: string]: InteractNode;
}

export interface SegmentNodeDict {
  [key: string]: SegmentNode;
}

export interface EffectTrackDict {
  [key: string]: EffectTrack;
}

export interface VideoTrackDict {
  [key: string]: VideoTrack;
}

// ITV
export interface ITV {
  name: string; // 名称
  uid: string;
  effectTrack: string[]; // 存放事件轨 uid，详见 EffectTrack
  videoTrack: string[]; // 存放视频轨 uid, 详见 VideoTrack
  segments: string[]; // 存在 segmentNode uid
}

export interface ITVDict {
  [key: string]: ITV;
}

export interface NativeStore {
  ITVS: string[]; // 存放 ITV uid
  ITVDict: ITVDict;
  videoTrackDict: VideoTrackDict;
  effectTrackDict: EffectTrackDict;
  segmentNodeDict: SegmentNodeDict;
  interactNodeDict: InteractNodeDict;
}

// 奖励类型
export enum RewardTypes {
  MiaoCoin = 'miao-coin', // 喵币
}

// ITV已经所有互动节点数据
export interface ITVNodes {
  uid: string;
  name: string;
  nodes: InteractNode[];
}
