/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, FC, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { Popover, Tooltip } from 'antd';
import classnames from 'classnames';
import PreviewVideo from './preview';
import { Video } from '../../../../interface/assets-interface';
import useSystemState from '../../../../hooks/useSystemState';
import useAssetsState from '../../../../hooks/useAssetsState';
import useAssetsManager from '../../../../hooks/useAssetsManager';
import useNativeState from '../../../../hooks/useNativeState';
import { VFrameWidth } from '../../../../config';
import * as INative from '../../../../interface/native-interface';

import SegmentImage from '../../assets/segment.png';
import { MenuListId } from '../../../../interface/system-interface';

export interface Props {
  id: never;
  text: string;
  index: number;
  handleDeleteVideo: () => void;
}

export const VideoItemDnd: FC<Props> = ({
  id,
  text,
  index,
  handleDeleteVideo,
}) => {
  const { nativeQueryTool, nativeState, nativeDispatch } = useNativeState();
  const { assetsManager } = useAssetsManager();
  const { systemState, systemDispatch } = useSystemState();
  const { assetsQueryTool } = useAssetsState();
  const {
    currentItvId,
    currentEditVideoId,
    currentMenuType,
    progressBar: { pxToMs },
  } = systemState;
  const { segmentNodeDict } = nativeState;

  const [segmentNodes, setSegmentNodes] = useState<INative.SegmentNode[]>([]);
  const [video, setVideo] = useState<Video>();
  const [previewWidth, setPreviewWidth] = useState<number>(0);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    const segmentNodes = nativeQueryTool.getSegmentNodesByVideoId(id);
    setSegmentNodes(segmentNodes.filter((s) => s.parentITVId === currentItvId));
  }, [segmentNodeDict, currentItvId]);

  useEffect(() => {
    const video = assetsQueryTool.getVideoById(id);
    video && setVideo(video);
  }, [id]);

  useEffect(() => {
    const duration = video?.duration || 0;
    setPreviewWidth((duration * 1000) / pxToMs);
  }, [pxToMs, video]);

  const [{ isDragging }, drag] = useDrag({
    type: 'video',
    item: () => {
      return { id, index, text };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item, monitor) {
      if (!monitor.didDrop()) {
        handleDeleteVideo();
      }
      systemDispatch.setDragVideoStatus(false);
    },
  });

  const handleDeleteSegmentNode = (id: string) => {
    nativeDispatch.deleteSegmentNode(id);
  };

  const handleEditVideo = () => {
    systemDispatch.setCurrentEditVideoId(id);
    systemDispatch.setCurrentMenuType(MenuListId.VIDEO);
  };

  const opacity = isDragging ? 0 : 1;
  const width = previewWidth;

  const renderPreviewVideo = useCallback(() => {
    return (
      <div className="video-preview-item">
        <PreviewVideo videoId={id} />
      </div>
    );
  }, [id]);

  const renderSegmentNode = () => {
    return (
      <>
        {segmentNodes.map((node) => {
          const { time } = node;
          const left = time / pxToMs - 10;
          return (
            <div className="segment-node" style={{ left }} key={node.uid}>
              <Popover
                content={
                  <a
                    onClick={() => {
                      handleDeleteSegmentNode(node.uid);
                    }}
                  >
                    删除
                  </a>
                }
                trigger="click"
              >
                <img src={SegmentImage} width="20px" alt="" />
              </Popover>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <Tooltip
        title={
          <ul className="menu-wrap">
            <li
              onClick={() => {
                handleDeleteVideo();
              }}
            >
              删除
            </li>
          </ul>
        }
        color="red"
        placement="bottom"
        visible={menuVisible}
        onVisibleChange={() => setMenuVisible(false)}
      >
        <div
          ref={drag}
          style={{ opacity, width }}
          className={classnames(
            'video-drag-item',
            'verticality-horizontal-center',
            {
              'video-select':
                currentEditVideoId === id &&
                currentMenuType === MenuListId.VIDEO,
            }
          )}
          onClick={handleEditVideo}
          onDragStart={() => {
            systemDispatch.setDragVideoStatus(true);
          }}
          onContextMenu={() => {
            setMenuVisible(true);
          }}
        >
          {renderSegmentNode()}
          {renderPreviewVideo()}
        </div>
      </Tooltip>
    </>
  );
};
