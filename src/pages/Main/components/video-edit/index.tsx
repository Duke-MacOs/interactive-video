import React, { useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import * as _ from 'lodash';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import useAssetsState from '../../../../hooks/useAssetsState';
import useModalState from '../../../../hooks/useModalState';

import * as INative from '../../../../interface/native-interface';
import * as IAssets from '../../../../interface/assets-interface';
import { getDurationFormatMS } from '../../../../utils/util';
import RedirectVideo from '../interact-node-block/components/redirect-video';
import IconNoContent from '../../assets/ico_tool_no content@2x.png';

interface ISegmentSelect {
  id: string;
  timeFormat: string;
  thumbPath: string;
  next: INative.RedirectStorySegment;
  allowChangeProgress: boolean;
}

/**
 * 视频编辑操作面板
 */
const VideoEdit: React.FC = () => {
  const { modalDispatch } = useModalState();
  const { systemState, systemDispatch } = useSystemState();
  const { nativeDispatch, nativeState, nativeQueryTool } = useNativeState();
  const { assetsQueryTool, assetsDispatch, assetsState } = useAssetsState();
  const { currentEditVideoId, currentItvId } = systemState;
  const { videoDict } = assetsState;
  const { segmentNodeDict, videoTrackDict } = nativeState;

  const [segmentOptions, setSegmentOptions] = useState<ISegmentSelect[]>([]);
  const [currentVideo, setCurrentVideo] = useState<IAssets.Video>();

  useEffect(() => {
    const video = assetsQueryTool.getVideoById(currentEditVideoId);
    video && setCurrentVideo(video);
  }, [currentEditVideoId]);

  // 获取所有分段节点选项
  useEffect(() => {
    // 视频开头默认一个节点
    const video = assetsQueryTool.getVideoById(currentEditVideoId);
    if (video) {
      const segmentNodes = nativeQueryTool
        .getCurrentSegmentNodesByVideoId(currentEditVideoId)
        .filter((s) => s.parentITVId === currentItvId)
        .sort((a, b) => a.time - b.time);
      console.log('segmentNodes: ', segmentNodes);
      const firstSegmentNode = {
        timeFormat: getDurationFormatMS(0, false),
        thumbPath: nativeQueryTool.getVideoCoverPathByVideoId(
          currentEditVideoId
        ),
        next: segmentNodes[0] ? segmentNodes[0].next : video.next,
        id: segmentNodes[0] ? segmentNodes[0].uid : video.uid,
        allowChangeProgress: segmentNodes[0]
          ? segmentNodes[0].allowChangeProgress
          : video.allowChangeProgress,
      };
      const otherSegmentNode = segmentNodes.map(
        (n: INative.SegmentNode, idx: number) => {
          return {
            timeFormat: getDurationFormatMS(n.time),
            thumbPath: `${n.thumbPath}`,
            next: segmentNodes[idx + 1]
              ? segmentNodes[idx + 1].next
              : video.next,
            id: segmentNodes[idx + 1] ? segmentNodes[idx + 1].uid : video.uid,
            allowChangeProgress: segmentNodes[idx + 1]
              ? segmentNodes[idx + 1].allowChangeProgress
              : video.allowChangeProgress,
          };
        }
      );

      console.log('!!!:', [firstSegmentNode, ...otherSegmentNode]);

      setSegmentOptions([firstSegmentNode, ...otherSegmentNode]);
    } else {
      setSegmentOptions([]);
    }
  }, [currentEditVideoId, segmentNodeDict, videoDict, currentItvId]);

  const handleClickChange = (selectId: string) => {
    console.log('selectId: ', selectId);
    systemDispatch.setCurrentSelectId(selectId);
    modalDispatch.showSegmentNodeModal();
  };

  const handleClickDelete = (id: string) => {
    const video = assetsQueryTool.getVideoById(id);
    const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(id);
    if (video) {
      const _video = _.cloneDeep(video);
      _video.next = null;
      assetsDispatch.updateAsset(IAssets.AssetsType.VIDEO, _video.uid, _video);
    } else if (segmentNode) {
      const _segmentNode = _.cloneDeep(segmentNode);
      _segmentNode.next = null;
      nativeDispatch.updateSegmentNode(_segmentNode);
    }
  };

  const handleChangeAllowProgress = (id: string, checked: boolean) => {
    const video = assetsQueryTool.getVideoById(id);
    const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(id);
    if (video) {
      const _video = _.cloneDeep(video);
      _video.allowChangeProgress = checked;
      assetsDispatch.updateAsset(IAssets.AssetsType.VIDEO, _video.uid, _video);
    } else if (segmentNode) {
      const _segmentNode = _.cloneDeep(segmentNode);
      _segmentNode.allowChangeProgress = checked;
      nativeDispatch.updateSegmentNode(_segmentNode);
    }
  };

  return (
    <div className="video-edit-wrap">
      <div className="title">视频设置</div>
      {segmentOptions.length === 0 ? (
        <div
          style={{ width: '100%', height: '100%' }}
          className="verticality-horizontal-center"
        >
          <img src={IconNoContent} alt="" width="37" height="36" />
          <span>暂无选中视频</span>
        </div>
      ) : (
        <>
          <div className="sub-title">
            当前视频有{segmentOptions.length}个视频分段
          </div>
          <div style={{ overflow: 'scroll' }}>
            {segmentOptions.map((s, idx) => {
              const next = segmentOptions[idx + 1];
              return (
                <div key={Math.random()} className="video-edit-item">
                  <img
                    src={s.thumbPath}
                    width="120px"
                    height="72px"
                    style={{ objectFit: 'cover' }}
                    alt=""
                  />
                  <div className="info">
                    <span>
                      {s.timeFormat}
                      {next
                        ? ` - ${next.timeFormat}`
                        : ` - ${getDurationFormatMS(
                            currentVideo?.duration ?? 0,
                            false
                          )}`}
                    </span>
                    <div>
                      <Checkbox
                        checked={s.allowChangeProgress}
                        onChange={(e) => {
                          handleChangeAllowProgress(s.id, e.target.checked);
                        }}
                      >
                        显示播放进度条
                      </Checkbox>
                    </div>
                    <div style={{ width: '140px', marginTop: '5px' }}>
                      <RedirectVideo
                        id={s.id}
                        option={s.next}
                        handleClickChange={handleClickChange}
                        handleClickDelete={handleClickDelete}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoEdit;
