/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Divider, Select } from 'antd';
import * as _ from 'lodash';
import { Video } from '../../interface/assets-interface';
import useModalState from '../../hooks/useModalState';
import useSystemState from '../../hooks/useSystemState';
import useNativeState from '../../hooks/useNativeState';
import useAssetsState from '../../hooks/useAssetsState';
import { getDurationFormatMS } from '../../utils/util';
import * as INative from '../../interface/native-interface';
import * as IAssets from '../../interface/assets-interface';

import SelectedImage from '../../pages/Main/assets/selected.png';

interface ISegmentSelect {
  timeFormat: string;
  thumbPath: string;
  segmentNodeId: string; // 如果为空，则是视频开头
  videoId: string;
}

const SegmentNodeModal = () => {
  const { systemState } = useSystemState();
  const { modalState, modalDispatch } = useModalState();
  const { nativeState, nativeQueryTool, nativeDispatch } = useNativeState();
  const { assetsState, assetsQueryTool, assetsDispatch } = useAssetsState();

  const { currentSelectId, currentNodeId } = systemState;
  const { segmentNodeModalVisible } = modalState;

  const [videoOptions, setVideoOptions] = useState<Video[]>([]);
  const [selectVideoId, setSelectVideoId] = useState<string>('');
  const [segmentOptions, setSegmentOptions] = useState<ISegmentSelect[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  useEffect(() => {
    const select =
      nativeQueryTool.getCurrentSelectBySelectId(currentSelectId) ||
      assetsQueryTool.getVideoById(currentSelectId);
    setSelectedIdx(-1);
    if (select) {
      if (selectVideoId === select.next?.videoId) {
        if (select.next.segmentNodeId === '') {
          setSelectedIdx(0);
        } else {
          segmentOptions.forEach((s, idx) => {
            s.segmentNodeId === select.next?.segmentNodeId &&
              setSelectedIdx(idx);
          });
        }
      }
    }
  }, [currentSelectId, segmentOptions]);

  // 获取所有 video 下拉选项
  useEffect(() => {
    if (segmentNodeModalVisible) {
      const videosId = nativeQueryTool.getCurrentVideos();
      console.log('videosId: ', videosId);
      const videos = videosId.map((videoId) =>
        assetsQueryTool.getVideoById(videoId)
      );
      setVideoOptions(videos);
      setSelectVideoId(videos[0]?.uid ?? '');
    }
  }, [segmentNodeModalVisible]);

  // 获取所有分段节点选项
  useEffect(() => {
    if (segmentNodeModalVisible) {
      // 视频开头默认一个节点
      const firstSegmentNode = {
        timeFormat: getDurationFormatMS(0, false),
        thumbPath: nativeQueryTool.getVideoCoverPathByVideoId(selectVideoId),
        segmentNodeId: '', // 如果为空，则是视频开头
        videoId: selectVideoId,
      };
      const segmentNodes = nativeQueryTool
        .getCurrentSegmentNodesByVideoId(selectVideoId)
        .sort((a, b) => a.time - b.time)
        .map((n: INative.SegmentNode) => {
          return {
            timeFormat: getDurationFormatMS(n.time),
            thumbPath: `${n.thumbPath}`,
            segmentNodeId: n.uid,
            videoId: selectVideoId,
          };
        });
      setSegmentOptions([firstSegmentNode, ...segmentNodes]);
    }
  }, [segmentNodeModalVisible, selectVideoId]);

  const handleOk = () => {
    modalDispatch.hideSegmentNodeModal();
  };

  const handleCancel = () => {
    modalDispatch.hideSegmentNodeModal();
  };

  const handleChangeVideo = (val: string) => {
    setSelectVideoId(val);
  };

  const handleSelectSegmentNode = useCallback(
    (i: ISegmentSelect, index: number) => {
      const node = nativeQueryTool.getInteractNodeById(currentNodeId);
      if (node) {
        const _node = _.cloneDeep(node);
        const idx = _.findIndex(
          (_node.node as INative.BranchStory).selections,
          (s) => s.id === currentSelectId
        );
        if (i.segmentNodeId === '') {
          // 选择视频开头
          (_node.node as INative.BranchStory).selections[idx].next = {
            videoId: i.videoId,
            segmentNodeId: '',
          };
        } else {
          (_node.node as INative.BranchStory).selections[idx].next = {
            videoId: i.videoId,
            segmentNodeId: i.segmentNodeId,
          };
        }
        setSelectedIdx(index);
        nativeDispatch.updateInteractiveNode(_node);
      }
    },
    [selectVideoId, currentSelectId, currentNodeId]
  );

  const handleSelectVideoNext = useCallback(
    (i: ISegmentSelect, index: number) => {
      const video = assetsQueryTool.getVideoById(currentSelectId);
      const _video = _.cloneDeep(video);
      console.log('selectVideoId: ', i.videoId);
      if (i.segmentNodeId === '') {
        // 选择视频开头
        _video.next = {
          videoId: i.videoId,
          segmentNodeId: '',
        };
      } else {
        _video.next = {
          videoId: i.videoId,
          segmentNodeId: i.segmentNodeId,
        };
      }
      setSelectedIdx(index);
      assetsDispatch.updateAsset(IAssets.AssetsType.VIDEO, _video.uid, _video);
    },
    [selectVideoId, currentSelectId]
  );

  const handleSelectSegmentNodeNext = useCallback(
    (i: ISegmentSelect, index: number) => {
      const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
        currentSelectId
      );
      const _segmentNode = _.cloneDeep(segmentNode);
      if (i.segmentNodeId === '') {
        // 选择视频开头
        _segmentNode.next = {
          videoId: i.videoId,
          segmentNodeId: '',
        };
      } else {
        _segmentNode.next = {
          videoId: i.videoId,
          segmentNodeId: i.segmentNodeId,
        };
      }
      setSelectedIdx(index);
      nativeDispatch.updateSegmentNode(_segmentNode);
    },
    [selectVideoId, currentSelectId]
  );

  const hanldeSelect = useCallback(
    (i: ISegmentSelect, index: number) => {
      const video = assetsQueryTool.getVideoById(currentSelectId);
      const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
        currentSelectId
      );
      console.log('video:', video);
      console.log('segmentNode: ', segmentNode);
      if (video) {
        handleSelectVideoNext(i, index);
      } else if (segmentNode) {
        handleSelectSegmentNodeNext(i, index);
      } else {
        handleSelectSegmentNode(i, index);
      }
    },
    [currentSelectId]
  );

  const renderTitle = (
    <div className="horizontal-verticality-center" style={{ fontSize: '12px' }}>
      <span>从</span>
      <Select
        value={selectVideoId}
        style={{ width: 160, marginLeft: '5px', marginRight: '5px' }}
        size="small"
        onChange={handleChangeVideo}
      >
        {videoOptions.map((v) => {
          return (
            <Select.Option key={v.uid} value={v.uid}>
              {v.name}
            </Select.Option>
          );
        })}
      </Select>
      <span>中选择跳转节点</span>
    </div>
  );

  return (
    <Modal
      className="segment-node-modal"
      title={renderTitle}
      visible={modalState.segmentNodeModalVisible}
      closable={false}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div className="item-container">
        {segmentOptions.map((s, idx) => {
          return (
            <div
              key={idx}
              className="item verticality-horizontal-center"
              onClick={() => {
                hanldeSelect(s, idx);
              }}
            >
              {selectedIdx === idx && (
                <img src={SelectedImage} className="selected" alt="" />
              )}
              <img
                src={s.thumbPath}
                width="120px"
                height="72px"
                style={{ objectFit: 'cover' }}
                alt=""
              />
              <span>{s.timeFormat}</span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default SegmentNodeModal;
