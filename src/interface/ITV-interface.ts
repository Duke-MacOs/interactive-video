import {
  NativeStore,
  RedirectStorySegment as INativeRedirectStorySegment,
} from './native-interface';
// 数据文件
export type ITV = {
  MakerVersion: string; // 制课工具版本号
  courseId: string;
  version: number; // 小火箭 - 版本
  tanyueVersion: number; // 探月 - 版本
  name: string;
  sections: Section[]; // 课节数组（一般有且至少有一个课节）
  stories: Story[];
  videos: ITVAssetDict;
  audios: ITVAssetDict;
  images: ITVAssetDict;
  effects: ITVAssetDict; // 特效 lottie 文件
};

// 工程文件(App端无需关注)
// 旧版 ITVM
export type OldITVM = {
  MakerVersion: string; // 制课工具版本号
  courseId: string;
  version: number; // 小火箭 - 版本
  tanyueVersion: number; // 探月 - 版本
  stories: Story[];
  sections: Section[]; // 课节数组（一般有且至少有一个课节）
  videos: ITVMAssetDict;
  audios: ITVMAssetDict;
  images: ITVMAssetDict;
  effects: ITVMAssetDict; // 特效 lottie 文件
};
export type ITVM = NativeStore;

export type Reward = {
  opened: boolean;
};

export type Section = {
  id: string;
  storyId: string; // 故事ID
  segmentNodeId: string; // 分段节点ID，（可为空字符串，表示视频开头）
  iconUrl: string; // 图标url
};

// ==========================
// 素材资源
// ==========================

// ------ ITVM 资源 ------
export type ITVMAsset = {
  cdnUrl: string;
  localPath: string;
  md5: string;
  type: string;
  mtime: number; // 修改时间
  fileSize: number;
  size?: { width: number; height: number };
  duration?: number;
  thumb?: string;
};

export type ITVMAssetDict = {
  [filename: string]: ITVMAsset;
};

// ------ ITV 资源 ------
export type ITVAsset = {
  cdnUrl: string;
  size?: { width: number; height: number };
  duration?: number;
};

export type ITVAssetDict = {
  [filename: string]: ITVAsset;
};

// ==========================
// 故事
// ==========================
export type Story = {
  [key: string]: any;
  id: string; // 故事ID
  name: string; // 故事名
  vidFilename: string; // 视频素材文件名
  timeNodes: TimeNode[]; // 时间节点(数组)
  allowChangeProgress: boolean; // 允许用户拖动进度条
  next: RedirectStorySegment;
};

// ==========================
// 时间节点
// ==========================
export type TimeNode = InteractNode | SegmentNode;

export type SegmentNode = {
  id: string;
  type: 'segment'; // 固定值
  parentStoryId: string; // 父故事ID
  time: number; // 时间(秒)
  allowChangeProgress: boolean; // 允许用户拖动进度条
  next: RedirectStorySegment;
  thumb: string;
};

export type InteractNode = {
  id: string;
  name: string; // 名字
  type: 'interact'; // 固定值
  parentStoryId: string; // 父故事ID
  time: number; // 时间(秒)
  // allowChangeProgress:boolean,
  interact: Interact | null; // 一个交互节点只能有一个交互(互动类型见下一节)
};

// ==========================
// 互动
// ==========================
export type InteractType =
  | 'simple-select'
  | 'drag-n-drop'
  | 'branch-story'
  | 'complex-select'
  | 'auto-pause'
  | 'audio-record'
  | 'video-record';
export type Interact =
  | AutoPause
  | SimpleSelect
  | DragNDrop
  | BranchStory
  | ComplexSelect
  | AudioRecord
  | VideoRecord;

// 是否自动循环题干配置
export type AutoLoopStem = {
  isAuto: boolean;
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
};

// 自动暂停
export type AutoPause = {
  type: 'auto-pause'; // 固定值
  operation: 'play' | 'clickToKit' | 'autoToKit'; // 点击后播放|点击后去编程|自动去编程
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  answerLimitedTime: {
    // 答题限制时长
    type: 'default' | 'timeStamp';
    value: number;
    time: number;
  };
};

// 选择题(简单)
export type SimpleSelect = {
  type: 'simple-select'; // 类型，固定值
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  selections: Selection[]; // 选项
  correctSelectId: string; // 正确答案ID
  correctSoundFilename: string; // 答对反馈音效
  wrongSoundFilename: string; // 答错反馈音效
  reward: Reward;
  answerLimitedTime: {
    type: 'default' | 'timeStamp';
    value: number;
    time: number;
  };
};

// 选择题（简单） - 选项
export type Selection = {
  // 选择题(数组)
  id: string;
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  next: RedirectStorySegment;
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
// 拖拽
export type DragNDrop = {
  type: 'drag-n-drop'; // 类型，固定值
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
};

// 录音
export type AudioRecord = {
  type: 'audio-record'; // 类型，固定值
  duration: number | string;
  mode: 'once' | 'repeat' | 'zero'; // once: 自动播放一次；repeat: 重复录制；zero: 仅录音；
  repeatNum: number; // 允许重复录音次数
  isOpenEffect: boolean; // 是否开启反馈
  correctSetting: {
    soundFileName: string;
    effectFileName: string;
  };
  wrongSetting: {
    soundFileName: string;
    effectFileName: string;
  };
  reward: Reward;
};

// 视频开窗
export type VideoRecord = {
  type: 'video-record';
  autoOff: boolean; // 自动关闭
  duration: number; // 持续时间(s)
  pos: { x: number; y: number }; // 位置坐标(百分比)
  size: { width: number; height: number }; // 大小(百分比)
  decorateImage: {
    imgFilename: string;
    pos: { x: number; y: number }; // 位置坐标(百分比)
    size: { width: number; height: number }; // 大小(百分比)
  };
};

// 分支故事
export type BranchStory = {
  type: 'branch-story'; // 类型，固定值
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  selections: Selection[];
  answerLimitedTime: {
    type: 'default' | 'timeStamp' | 'selection';
    value: number | string;
    time: number;
  };
};

// 选择题(复杂)
export type ComplexSelect = {
  id: string;
  type: 'complex-select';
  loopTime: number; // 循环播放自该交互节点至往后N秒(AKA题干背景）
  autoLoop: AutoLoopStem;
  // In Construction
};

// 跳转的下一段故事分段
export type RedirectStorySegment = {
  // 播放结束后自动跳转至其他故事及分段节点
  storyId: string; // 要跳转的视频 id
  segmentNodeId: string; // 要跳转的分段节点ID，若为空值则默认从头开始播放
} | null;

// 工程文件夹文件树结构
export interface DirTree {
  dir: string; // 文件夹路径
  childFiles: {
    extname: string; // 文件后缀名
    short: string; // 文件名
    full: string; // 文件路径
  }[];
  childDir: {
    [name: string]: DirTree[];
  };
}

export type StoryState = {
  courseId: string;
  stories: Story[];
  sections: Section[]; // 课节数组（一般有且至少有一个课节）
  videos: ITVMAssetDict;
  audios: ITVMAssetDict;
  images: ITVMAssetDict;
  effects: ITVMAssetDict; // 特效 lottie 文件
  currentStoryId: string;
  currentTimeNodeId: string | null;
  currentStoryDuration: number;
  isPlaying: boolean;
};

export type AssetType = 'audios' | 'videos' | 'images' | 'effects';
