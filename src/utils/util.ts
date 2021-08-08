/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import {
  MinInteractiveNodeWidth,
  UserDatePath,
  ScreenshotPath,
} from '../config';
import { InteractsType, InteractNode } from '../interface/native-interface';
import AutoPauseImage from '../pages/Main/assets/auto-pause@2x.png';
import SimpleSelectImage from '../pages/Main/assets/simple-select@2x.png';
import DragNDropImage from '../pages/Main/assets/dragNdrop@2x.png';
import AudioRecordImage from '../pages/Main/assets/audio-record@2x.png';
import VideoRecordImage from '../pages/Main/assets/video-record@2x.png';
import BranchStoryImage from '../pages/Main/assets/branch-story@2x.png';

const FileType = require('file-type');

const modulePath = require('ffmpeg-static-electron').path;

/**
 * 获取打包后 Contents/resources 地址
 */
export const getAppResources = () => {
  return process.env.NODE_ENV === 'production'
    ? modulePath.split('/app')[0]
    : '';
};

/**
 * 返回格式化距离当前时间时间戳
 * @param time 时间戳(ms)
 */
export const getDValueFormat = (time: number) => {
  const dValue = new Date().getTime() - time;
  let str = '';
  if (dValue <= 24 * 3600 * 1000) {
    // 1 天之内
    const min =
      dValue <= 60 * 1000
        ? `1分钟前`
        : `${Math.floor(dValue / 60 / 1000)}分钟前`;
    str =
      dValue <= 3600 * 1000 ? min : `${Math.floor(dValue / 3600 / 1000)}小时前`;
  } else if (dValue <= 30 * 24 * 3600 * 1000) {
    // 一个月内
    str = `${Math.floor(dValue / 24 / 3600 / 1000) || 1}天前`;
  } else {
    str = `${Math.floor(dValue / 24 / 2600 / 1000 / 30) || 1}月前`;
  }
  return str;
};

/**
 * 格式化 Duration 到秒
 */
export const getDurationFormat = (time: number, isMS = true) => {
  const intTime = Math.floor(isMS ? time / 1000 : time);
  let result = '';
  if (intTime < 60) {
    result = `00:${intTime < 10 ? '0' : ''}${intTime}`;
  } else if (intTime < 3600) {
    const m = Math.floor(intTime / 60);
    const s = intTime % 60;
    result = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  } else {
    const h = Math.floor(intTime / 3600);
    const m = Math.floor((intTime % 3600) / 60);
    const s = Math.floor((intTime % 3600) % 60);
    result = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${
      s < 10 ? '0' : ''
    }${s}`;
  }
  return result;
};

/**
 * 格式化 Duration 到毫秒
 */
export const getDurationFormatMS = (time: number, isMS = true) => {
  const s = time / 1000;
  const result = getDurationFormat(time, isMS);
  return `${result}.${s.toFixed(3).split('.').pop()?.slice(0, 2)}`;
};

export const getBatchUpdateMS = (time: number, needFixHour?: boolean) => {
  const result = getDurationFormat(time);
  // 取毫秒的值
  const milliSecondStr = time.toString().split('.').pop();
  const milliSecond = milliSecondStr
    ? (parseInt(milliSecondStr, 10) % 1000) / 10
    : 0;

  if (needFixHour) {
    // 如果getDurationFormat方法返回值是00:00，需要补充小时变成00:00:00
    const baseFormatArr = result.split(':');
    if (baseFormatArr.length === 2) {
      baseFormatArr.unshift('00');
    }
    return `${baseFormatArr.join(':')}.${milliSecond}`;
  }
  return `${result}.${milliSecond}`;
};
/**
 * 获取文件类型
 * @param path 文件地址
 */
export const getFileType = async (path: string) => {
  const info = await FileType.fromFile(path);
  return info ? info.ext : path.split('.').pop();
};

/**
 * 是否为函数
 * @param obj any
 */
export const isFunction = (obj: any) => {
  return typeof obj === 'function' && typeof obj.nodeType !== 'number';
};

/**
 * 数组对调位置，返回新数组
 * @param array 数组
 * @param first 下标
 * @param second 下标
 */
export const swap = (array: any[], first: number, second: number) => {
  const _array = [...array];
  const tmp = _array[second];
  _array[second] = _array[first];
  _array[first] = tmp;
  return _array;
};

/**
 * 获取时间轴 1px = x 时间
 * @param width 宽度 px
 * @param totalTimeMs 代表时间 ms
 */
export const getPxToMs = (width: number, totalTimeMs: number) => {
  return totalTimeMs / width;
};

/**
 * 获取节点 virtual time
 * @param left 距离左侧定位 px
 * @param pxTimeUnit 1px 代表 x ms
 */
export const getNodeVirtualTimeMs = (left: number, pxTimeUnit: number) => {
  return left * pxTimeUnit;
};

/**
 * 获取节点距左侧定位
 * @param virtualTimeMs 时间轴时间
 * @param pxTimeUnit 1px 代表 x ms
 */
export const getNodeLeft = (virtualTimeMs: number, pxTimeUnit: number) => {
  return Math.floor(virtualTimeMs) / pxTimeUnit;
};

/**
 * 根据节点持续时间，计算宽度
 */
export const getNodeWidth = (duration: number, pxTimeUnit: number) => {
  return duration && pxTimeUnit
    ? (duration * 1000) / pxTimeUnit < MinInteractiveNodeWidth
      ? MinInteractiveNodeWidth
      : (duration * 1000) / pxTimeUnit
    : MinInteractiveNodeWidth;
};

/**
 * 获取节点名称 & 图片
 */
export const getNodeInfoByType = (type: InteractsType) => {
  const info = {
    text: '',
    img: '',
  };
  if (type === InteractsType.AUDIO_RECORD) {
    info.text = '录音节点';
    info.img = AudioRecordImage;
  }
  if (type === InteractsType.AUTO_PAUSE) {
    info.text = '自动暂停';
    info.img = AutoPauseImage;
  }
  if (type === InteractsType.BRANCH_STORY) {
    info.text = '分支故事';
    info.img = BranchStoryImage;
  }
  if (type === InteractsType.DRAGNDROP) {
    info.text = '拖拽选择';
    info.img = DragNDropImage;
  }
  if (type === InteractsType.SIMPLE_SELECT) {
    info.text = '简单选择';
    info.img = SimpleSelectImage;
  }
  if (type === InteractsType.VIDEO_RECORD) {
    info.text = '视频开窗';
    info.img = VideoRecordImage;
  }
  return info;
};

/**
 * 是否为用户数据路径
 * @param path string 路径
 */
export const isUserDataPath = (path: string) => {
  return path.includes(UserDatePath);
};

/**
 * 是否为分段节点截图存储路径
 * @param path string 路径
 */
export const isScreenshotPath = (path: string) => {
  return path.includes(ScreenshotPath);
};

// 把 00:00:00 的格式转换为 virtualTime
export const transferTimeToVirtual = (
  normalTime: string,
  milliSecond: string
): number => {
  const normalTimeArr = normalTime.split(':');
  if (normalTimeArr.length !== 3) {
    // 没有设置时分秒
    return parseInt(milliSecond, 10) * 10;
  }
  const hour = parseInt(normalTimeArr[0], 10);
  const min = parseInt(normalTimeArr[1], 10);
  const second = parseInt(normalTimeArr[2], 10);
  // 秒级单位的virtualTime
  const baseVirtualTime = hour * 3600 + min * 60 + second;
  // 毫秒级单位最终的virtualTime
  const resVirtualTime =
    baseVirtualTime * 1000 + parseInt(milliSecond, 10) * 10;
  return resVirtualTime;
};

/**
 * 判断节点是否在时间轨内
 * @param node 节点
 * @param virtualTime 时间轨时间
 */
export const isNodeInVirtualTime = (
  node: InteractNode,
  virtualTime: number
) => {
  const min = node.virtualTime - 150;
  // 节点持续时间
  let duration;
  if (node.node.type === InteractsType.VIDEO_RECORD) {
    duration = node.node.duration * 1000;
  } else if (node.node.type === InteractsType.AUDIO_RECORD) {
    duration = 0;
  } else {
    duration = (node.node?.loopTime ?? 0) * 1000;
  }
  const max = node.virtualTime + duration + 150;
  return virtualTime >= min && virtualTime <= max;
};

/**
 * 兼容多种路径格式的资源
 */
export const getLocalAssetPath = (path: string) => {
  if (path.includes(`${window.__WORK_DIR__}`)) {
    return path;
  }
  const leftIndex = window.__WORK_DIR__.lastIndexOf('/');
  const projectName = window.__WORK_DIR__.slice(leftIndex + 1);

  const getNewLocalPath = () => {
    const nameStartIdx = path.indexOf(projectName);
    const index = path.indexOf('/', nameStartIdx + 1);
    return `${window.__WORK_DIR__}/${path.slice(index + 1)}`;
  };

  const localPath = path.includes(projectName)
    ? getNewLocalPath()
    : `${window.__WORK_DIR__}/${path}`;
  return localPath.replace('//', '/');
};
