import { message } from 'antd';
import { v4 } from 'uuid';
import { getVideoIFrameByTime } from '../utils/ffmpeg';
import {
  DragItem,
  Selection,
  InteractNode,
  SegmentNode,
  SegmentNodeType,
  InteractsType,
  InteractiveNodeType,
} from '../interface/native-interface';
import * as nativeTemplate from '../boilerplate/nativeStore';
import {
  DefaultSelectWidth,
  DefaultSelectHeight,
  DefaultDragWidth,
  DefaultDragHeight,
} from '../config';

export default class NodeGenerator {
  private static instance: NodeGenerator | null = null;

  public static getInstance(): NodeGenerator {
    if (NodeGenerator.instance === null) {
      NodeGenerator.instance = new NodeGenerator();
    }
    return NodeGenerator.instance;
  }

  /**
   * 生成分段节点截图
   */
  private async createThumb(
    videoId: string,
    videoPath: string,
    time: number
  ): Promise<string> {
    // 注意名称合法性，name 会影响最终存储路径
    // eg. xxx-28.33.png is invalid path
    // 所以时间必须为整数: xxx-28-33.png;
    const name = `${videoId}-${time.toString().replace('.', '-')}`;
    const thumbPath = await getVideoIFrameByTime(videoPath, name, time);
    console.log('thumbPath: ', thumbPath);
    return thumbPath;
  }

  /**
   * 生成一个分段节点
   * @param options
   */
  public async createSegmentNode(options: {
    parentITVId: string;
    parentVideoId: string;
    videoPath: string;
    time: number;
  }): Promise<SegmentNode | null> {
    const { parentITVId, parentVideoId, videoPath, time } = options;
    if (parentITVId && parentVideoId && time) {
      const thumbPath = await this.createThumb(parentVideoId, videoPath, time);
      const segmentNode = {
        uid: v4(),
        name: '',
        parentITVId,
        type: 'SegmentNode' as SegmentNodeType,
        parentVideoId,
        thumbPath,
        time,
        next: null,
        allowChangeProgress: true,
      };
      return segmentNode;
    }
    message.error('创建分段节点失败，请检查参数');
    return null;
  }

  /**
   * 生成一个交互节点
   * @param option
   */
  public createInteractNode(option: {
    uid: string;
    parentITVId: string;
    parentTrackId: string;
    virtualTime: number;
    type: InteractsType;
  }): InteractNode {
    const obj = {
      uid: option.uid,
      name: '未命名',
      parentITVId: option.parentITVId,
      type: 'InteractNode' as InteractiveNodeType,
      parentTrackId: option.parentTrackId,
      virtualTime: option.virtualTime,
      node: {},
    };
    if (option.type === InteractsType.AUDIO_RECORD) {
      obj.name = '录音节点';
      obj.node = nativeTemplate.audioRecordTemplate;
    }
    if (option.type === InteractsType.AUTO_PAUSE) {
      obj.name = '自动暂停';
      obj.node = nativeTemplate.autoPauseTemplate;
    }
    if (option.type === InteractsType.BRANCH_STORY) {
      obj.name = '分支故事';
      obj.node = nativeTemplate.getBranchStoryTemplate();
    }
    if (option.type === InteractsType.DRAGNDROP) {
      obj.name = '拖拽题';
      obj.node = nativeTemplate.getDragNDropTemplate();
    }
    if (option.type === InteractsType.SIMPLE_SELECT) {
      obj.name = '简单选择';
      obj.node = nativeTemplate.getSimpleSelectTemplate();
    }
    if (option.type === InteractsType.VIDEO_RECORD) {
      obj.name = '视频开窗';
      obj.node = nativeTemplate.videoRecordTemplater;
    }
    return obj as InteractNode;
  }

  /**
   * 生成一个单项选择的选项
   */
  public createSimpleSelect(prevPos: { x: number; y: number }): Selection {
    const { newX, newY } = nativeTemplate.getNewSelectionPos(prevPos);
    return {
      id: v4(),
      pos: { x: newX, y: newY },
      size: { width: DefaultSelectWidth, height: DefaultSelectHeight },
      next: null,
    };
  }

  /**
   * 生成一个拖拽选项
   * @param prevItem
   */
  public createDragItem(prevItem: DragItem): DragItem {
    const { startX, startY, endX, endY } = nativeTemplate.getNewDragGroupPos(
      prevItem.startPos
    );
    return {
      id: v4(),
      imgFilename: '',
      startPos: {
        x: startX,
        y: startY,
      },
      endPos: {
        x: endX,
        y: endY,
      },
      size: {
        width: DefaultDragWidth,
        height: DefaultDragHeight,
      },
    };
  }

  /**
   * 获取拖拽默认结束位置
   */
  public getDefaultEndPos() {
    return {
      x: 0.5,
      y: 0.5,
    };
  }
}
