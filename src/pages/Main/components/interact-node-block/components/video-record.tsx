/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect, useRef } from 'react';
import { Radio, AutoComplete, Input, message } from 'antd';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import ImageSetting from './common-image-setting';

interface IProps {
  node: INative.InteractNode | undefined;
}

const DurationOptions = [
  { value: '3' },
  { value: '5' },
  { value: '8' },
  { value: '10' },
  { value: '15' },
];

const VideoRecordSetting: React.FC<IProps> = ({ node }) => {
  const {
    duration,
    decorateImage: { imgFilename, pos, size },
  } = node?.node as INative.VideoRecord;

  const { nativeDispatch } = useNativeState();

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleDurationBlur = () => {
    const min = 1;
    const max = 30;
    const defaultValue = 8;
    const _node = _.cloneDeep(nodeRef.current);
    if (isNaN(Number(duration))) {
      message.error('输入有误，请输入数字');
      (_node?.node as INative.VideoRecord).duration = defaultValue;
      _node && nativeDispatch.updateInteractiveNode(_node);
    } else {
      const time = Math.floor(Number(duration));
      (_node?.node as INative.VideoRecord).duration =
        time < min ? min : time > max ? max : time;
      _node && nativeDispatch.updateInteractiveNode(_node);
    }
  };

  const handleDurationSelect = (data: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.VideoRecord).duration = Number(data);
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleDurationChange = (data: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.VideoRecord).duration = Number(data);
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const hanldeAddDecorateImage = (uid: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.VideoRecord).decorateImage.imgFilename = uid;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleDeleteDecorateImage = () => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.VideoRecord).decorateImage.imgFilename = '';
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const hanldeUpdateAddDecorateImage = (uid: string) => {
    hanldeAddDecorateImage(uid);
  };

  return node ? (
    <>
      <div className="setting-block">
        <span className="gray small-title">视频开窗时长</span>
        <AutoComplete
          value={`${duration}`}
          options={DurationOptions}
          style={{ width: 100 }}
          onBlur={handleDurationBlur}
          onSelect={handleDurationSelect}
          onChange={handleDurationChange}
        />
      </div>
      <div className="setting-block" style={{ display: 'flex' }}>
        <span className="gray small-title">装饰</span>
        <ImageSetting
          assetId={imgFilename}
          handleAdd={hanldeAddDecorateImage}
          handleDelete={handleDeleteDecorateImage}
          handleUpdate={hanldeUpdateAddDecorateImage}
        />
      </div>
    </>
  ) : null;
};

export default VideoRecordSetting;
