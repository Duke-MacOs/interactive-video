/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useRef } from 'react';
import { Radio, Slider, Popover } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import NodeGenerator from '../../../../../classes/NodeGenerator';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useAssetsState from '../../../../../hooks/useAssetsState';
import useSystemState from '../../../../../hooks/useSystemState';
import useModalState from '../../../../../hooks/useModalState';
import { SimpleSelectMaxLength } from '../../../../../config';
import AnswerLimitedTimeSetting from './common-answer-limited';

import VideoImage from '../../../assets/video-record@2x.png';

const nodeGenerator = NodeGenerator.getInstance();

interface IProps {
  node: INative.InteractNode | undefined;
}
const BranchStorySetting: React.FC<IProps> = ({ node }) => {
  const { autoLoop, selections } = node?.node as INative.BranchStory;
  const { isAuto } = autoLoop;

  const { systemDispatch } = useSystemState();
  const { nativeDispatch, nativeQueryTool } = useNativeState();
  const { assetsQueryTool } = useAssetsState();
  const { modalDispatch } = useModalState();

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChangeSelectNum = useCallback(
    (val: number) => {
      const _node = _.cloneDeep(nodeRef.current);
      if (val > selections.length) {
        const pre = selections[selections.length - 1];
        const newSelect = nodeGenerator.createSimpleSelect(pre.pos);
        (_node?.node as INative.SimpleSelect).selections.push(newSelect);
        _node && nativeDispatch.updateInteractiveNode(_node);
      } else {
        (_node?.node as INative.SimpleSelect).selections.pop();
        _node && nativeDispatch.updateInteractiveNode(_node);
      }
    },
    [selections]
  );

  const handleDeleteSelect = (idx: number) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.BranchStory).selections.splice(idx, 1);
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleChangeIsAuto = (val: boolean) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.BranchStory).autoLoop.isAuto = val;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleOpenSelectModal = (selectId: string) => {
    systemDispatch.setCurrentSelectId(selectId);
    modalDispatch.showSegmentNodeModal();
  };

  const handleClickDelete = (id: string) => {
    console.log('handle click delete');
    if (nodeRef.current) {
      const _node = _.cloneDeep(nodeRef.current);
      const idx = _.findIndex(
        (_node.node as INative.BranchStory).selections,
        (s) => s.id === id
      );
      (_node.node as INative.BranchStory).selections[idx].next = null;
      nativeDispatch.updateInteractiveNode(_node);
    }
  };

  const handleClickChange = (id: string) => {
    handleOpenSelectModal(id);
  };

  const getContent = (path: string, id: string) => {
    return path === '' ? null : (
      <div className="preview-container verticality-horizontal-center">
        <img src={path} className="preview-image" alt="" />
        <span
          className="preview-text"
          onClick={() => {
            handleClickChange(id);
          }}
        >
          {path === '' ? '添加跳转' : '更换跳转'}
        </span>
        <div
          className="delete-icon"
          onClick={() => {
            handleClickDelete(id);
          }}
        >
          <DeleteOutlined />
        </div>
      </div>
    );
  };

  return node ? (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
        className="setting-block"
      >
        <span className="gray small-title">题干播放方式</span>
        <Radio.Group
          onChange={(e) => {
            handleChangeIsAuto(e.target.value);
          }}
          value={isAuto}
          size="small"
          style={{
            fontSize: '12px',
            width: '180px',
            marginTop: '5px',
          }}
        >
          <Radio value={false}>点击按钮继续播放</Radio>
          <Radio value>循环播放</Radio>
        </Radio.Group>
      </div>
      <div className="setting-block">
        <span className="gray small-title" style={{ marginRight: '10px' }}>
          分支选项数量（{selections.length}）
        </span>
        <Slider
          min={1}
          max={SimpleSelectMaxLength}
          step={1}
          onChange={handleChangeSelectNum}
          value={selections.length}
        />
        {selections.map((s, idx) => {
          const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
            s.next?.segmentNodeId ?? ''
          );
          const video = assetsQueryTool.getVideoById(s.next?.videoId ?? '');
          const thumbPath = segmentNode
            ? `${segmentNode?.thumbPath}`
            : video
            ? nativeQueryTool.getVideoCoverPathByVideoId(video.uid)
            : '';
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span style={{ width: '60px' }}>分支故事{`${idx + 1}`}</span>
              <span style={{ marginLeft: '5px', marginRight: '5px' }}>
                触发跳转到
              </span>
              <Popover
                placement="bottomLeft"
                content={getContent(thumbPath, s.id)}
                trigger="hover"
                className="horizontal-verticality-center"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '108px',
                    background: 'gray',
                    marginRight: '5px',
                  }}
                  onClick={() => {
                    handleOpenSelectModal(s.id);
                  }}
                >
                  <img
                    src={VideoImage}
                    width="16px"
                    alt=""
                    style={{ marginRight: '3px' }}
                  />
                  <span style={{ width: '80px' }} className="span-full">
                    {s.next ? `${video?.name ?? ''}` : `添加跳转视频`}
                  </span>
                </div>
              </Popover>
              {idx !== 0 && (
                <CloseOutlined
                  onClick={() => {
                    handleDeleteSelect(idx);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="setting-block">
        <AnswerLimitedTimeSetting node={node} />
      </div>
    </>
  ) : null;
};

export default BranchStorySetting;
