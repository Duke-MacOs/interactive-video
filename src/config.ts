export const videosType = ['mp4'];
export const audiosType = ['mp3', 'mwa'];
export const imagesType = ['gif', 'png', 'jpg', 'jpeg'];
export const lottiesType = ['json'];

// 允许最多 itv 数量
export const MaxItvLength = 12;

// 默认时间轴大小
export const DefaultScale = 50;
// 每根柱子间隔 x px;
export const DefaultGap = 10;
// 时间轴最小值
export const MinScale = 1;
// 时间轴最大值
export const MaxScale = 200;
// 点击缩放时的 step
export const ScaleStep = 5;

// 最小节点展示宽度（在事件轨上的宽度 px）
export const MinInteractiveNodeWidth = 5;

// 两个交互节点最小时间间隔 ms
export const MinTimeBetweenTwoInteractNode = 500;

// 用户数据存储路径
export const UserDatePath = `/.userData`;

// 分段节点截图存储路径
export const ScreenshotPath = `/.thumb`;

// 视频帧存放路径
export const vframesPath = `.userData/vframes`;

// 视频分段节点截图存储路径
export const thumbPath = `.userData/thumb`;

// 视频轨的缩略图宽度
export const VFrameWidth = 50;

// 轨道名称宽度，会影响时间游标定位
export const TrackNameWidth = 160;

// 单选题 - 最大选项数
export const SimpleSelectMaxLength = 6;

// 【选项】默认宽度：百分比
export const DefaultSelectWidth = 0.2;

// 【选项】默认高度：百分比
export const DefaultSelectHeight = 0.2;

// 【选项】默认第一个 X 位置：百分比
export const DefaultSelectPosX = 0.2;

// 【选项】默认第一个 Y 位置：百分比
export const DefaultSelectPosY = 0.2;

// 拖拽题 - 最大选项数
export const DragItemMaxLength = 6;

// 拖拽题 - 拖拽选项开始区域默认位置
export const DefaultDragStartPosX = 0.2;

// 拖拽题 - 拖拽选项结束区域默认位置
export const DefaultDragEndPosX = 0.6;

// 拖拽题 - 拖拽选项默认宽度
export const DefaultDragWidth = 0.2;

// 拖拽题 - 拖拽选项默认高度
export const DefaultDragHeight = 0.1;

// 一代制课工具 .itv 需要此字段
// TODO: 未来考虑优化 .itv 文件
export const MAKERVERSION = '0.2.6';

// 一代制课工具 .itv 需要此字段
// TODO: 未来考虑优化 .itv 文件
export const ITVVERSION = 2;

// 一代制课工具 .itv 需要此字段
// TODO: 未来考虑优化 .itv 文件
export const TANYUE_ITVVERION = '1';
