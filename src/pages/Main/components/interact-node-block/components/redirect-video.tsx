/* eslint-disable no-nested-ternary */
import React from 'react';
import { Popover } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import * as IAssets from '../../../../../interface/assets-interface';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import useAssetsState from '../../../../../hooks/useAssetsState';
import VideoImage from '../../../assets/video-record@2x.png';

interface IRedirectVideoProps {
  id: string;
  option: INative.RedirectStorySegment;
  handleClickChange: (id: string) => void;
  handleClickDelete: (id: string) => void;
}
/**
 * 跳转视频组件
 */
const RedirectVideo: React.FC<IRedirectVideoProps> = ({
  id,
  option,
  handleClickDelete,
  handleClickChange,
}) => {
  const { nativeQueryTool } = useNativeState();
  const { assetsQueryTool } = useAssetsState();
  const segmentNode = nativeQueryTool.getSegmentNodeBySegmentId(
    option?.segmentNodeId ?? ''
  );
  const video = assetsQueryTool.getVideoById(option?.videoId ?? '');
  const thumbPath = segmentNode
    ? `${segmentNode?.thumbPath}`
    : video
    ? nativeQueryTool.getVideoCoverPathByVideoId(video.uid)
    : '';

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

  return (
    <Popover
      placement="bottomLeft"
      content={getContent(thumbPath, id)}
      trigger="hover"
      className="horizontal-verticality-center"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'gray',
          marginRight: '5px',
        }}
        onClick={() => {
          handleClickChange(id);
        }}
      >
        <img
          src={VideoImage}
          width="16px"
          alt=""
          style={{ marginRight: '3px' }}
        />
        <span style={{ width: '100px' }} className="span-full">
          {option ? `${video?.name ?? ''}` : `添加跳转视频`}
        </span>
      </div>
    </Popover>
  );
};

export default RedirectVideo;
