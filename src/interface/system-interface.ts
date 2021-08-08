// in systemStory

export enum MenuListId {
  MATERIAL = 'material', // 素材
  INTERACTIVE = 'interacitve', // 互动
  REWARD = 'reward', // 奖励
  VIDEO = 'video',
}

export interface SystemState {
  projectName: string; // 打开的项目名称
  mode: 'edit' | 'preview'; // 编辑模式、预览模式
  isPlaying: boolean; // 是否正在播放视频
  currentItvId: string;
  currentNodeId: string; // 当前节点 ID
  currentSelectId: string; // 当前编辑的选项 id，用于在 segmentNodeModal 中高亮选中分段
  currentVideoId: string; // 当前播放的视频 id；
  currentEditVideoId: string; // 当前正在编辑的视频
  currentNodeVideoTime: number; // 当前节点所在 video 上的时间
  autoSaveTime: number; // 上一次自动保存时间戳
  redirectSegmentNode: {
    // 分支故事预览时，点击时跳转参数
    videoId: string;
    segmentNodeId: string;
  };
  virtualTime: number;
  recent: {
    items: RecentDoc[]; // 最近打开文件列表
  };
  modal: {
    segmentNodeModalVisible: boolean; // 分段节点选择弹窗
    reduxToolModalVisible: boolean; // 全局 Redux 调试弹窗
    batchUpdateNodeModalVisible: boolean; // 批量修改节点弹窗
    shortcutInfoModalVisible: boolean; // 快捷键信息 弹窗
    confirmQuit: boolean; // 退出弹窗
  };
  spin: {
    // 全局 Loading
    isOpen: boolean;
    tip: string;
  };
  activeMenu: MenuListId; // 左侧激活菜单
  progressBar: {
    scale: number;
    pxToMs: number;
    scrollLeft: number;
  };
  drag: {
    video: boolean;
    node: boolean;
  };
  currentRewardType: string; // 当前奖励节点
  currentMenuType: string; // 当前右侧面板类型
}

export interface RecentDoc {
  path: string;
  name: string;
  openTime: number;
  src?: string;
}
