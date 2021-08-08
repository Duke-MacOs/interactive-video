/* eslint-disable react/style-prop-object */
// 资源管理模块
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useRef } from 'react';
import { Button, Select, Divider, Radio } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { useDrag } from 'react-dnd';
import useSystemState from '../../../../hooks/useSystemState';
import useAssetsManager from '../../../../hooks/useAssetsManager';
import useAssetsState from '../../../../hooks/useAssetsState';
import { Asset, Video, Audio } from '../../../../interface/assets-interface';
import { getDurationFormat } from '../../../../utils/util';
import { openFileDialog } from '../../../../utils/electron-util';

import VideoImage from '../../assets/video-record@2x.png';
import SoundImage from '../../assets/sound@2x.png';
import PictureImage from '../../assets/image@2x.png';
import LottieImage from '../../assets/lottie@2x.png';

const { Option } = Select;

const Options = [
  {
    value: 'all',
    text: '全部',
  },
  {
    value: 'audio',
    text: '音频',
  },
  {
    value: 'image',
    text: '图片',
  },
  {
    value: 'lottie',
    text: '动效',
  },
];

const VideoBlock = (props: { video: Video }) => {
  const { video } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const { systemState, systemDispatch } = useSystemState();
  const {
    drag: { video: dragVideoStatus },
  } = systemState;

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: 'video',
      item: {
        id: video.uid,
        text: video.name,
        index: null,
      },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      options: {
        dropEffect: 'copy',
      },
      end: () => {
        systemDispatch.setDragVideoStatus(false);
      },
    }),
    [dragVideoStatus]
  );

  const hanldeMouseIn = () => {
    videoRef.current && videoRef.current.play();
  };

  const hanldeMouseOut = () => {
    videoRef.current && videoRef.current.pause();
  };

  const handleStartDrag = () => {
    systemDispatch.setDragVideoStatus(true);
  };

  return (
    <div
      ref={dragPreview}
      style={{
        opacity: isDragging ? '0.5' : '1',
      }}
    >
      <div
        ref={drag}
        className="block-container"
        onDragStart={handleStartDrag}
        onMouseEnter={hanldeMouseIn}
        onMouseLeave={hanldeMouseOut}
      >
        <div className="block">
          <video
            ref={videoRef}
            src={video?.path}
            loop
            muted
            width="100%"
            height="100%"
          />
          <div className="info">
            <span className="font-mini" style={{ marginRight: '2px' }}>
              {getDurationFormat(video?.duration, false)}
            </span>
            <img src={VideoImage} width="12px" height="12px" alt="" />
          </div>
        </div>
        <span className="span-full font-middle">{video?.name}</span>
      </div>
    </div>
  );
};

const ImageBlock = (props: { image: Asset }) => {
  const { image } = props;
  const imgStyle = {
    objectFix: 'cover',
    objectPosition: 'top',
  };

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'image',
    item: {
      id: image.uid,
      text: image.name,
      index: null,
    },
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'copy',
    },
  }));

  return (
    <div className="block-container" ref={drag}>
      <div className="block">
        <img src={image?.path} style={imgStyle} width="100%" height="100%" />
        <div className="info">
          <img src={PictureImage} width="12px" height="12px" alt="" />
        </div>
      </div>
      <span className="span-full font-middle">{image?.name}</span>
    </div>
  );
};

const AudioBlock = (props: { audio: Audio }) => {
  const { audio } = props;
  const audioRef = useRef<HTMLVideoElement>(null);

  const hanldeMouseIn = () => {
    audioRef.current && audioRef.current.play();
  };

  const hanldeMouseOut = () => {
    audioRef.current && audioRef.current.pause();
  };

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'audio',
    item: {
      id: audio.uid,
      text: audio.name,
      index: null,
    },
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'copy',
    },
  }));

  return (
    <div
      ref={drag}
      className="block-container"
      onMouseLeave={hanldeMouseOut}
      onMouseEnter={hanldeMouseIn}
    >
      <div className="block audio-block">
        <img src={SoundImage} width="22px" height="18px" alt="" />
        <audio src={audio?.path} loop ref={audioRef} />
        <div className="info">
          <span className="font-mini" style={{ marginRight: '2px' }}>
            {getDurationFormat(audio?.duration, false)}
          </span>
          <img src={SoundImage} width="12px" height="12px" alt="" />
        </div>
      </div>
      <span className="span-full font-middle">{audio?.name}</span>
      <div />
    </div>
  );
};

const LottieBlock = (props: { lottie: Asset }) => {
  const { lottie } = props;

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'lottie',
    item: {
      id: lottie.uid,
      text: lottie.name,
      index: null,
    },
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'copy',
    },
  }));

  return (
    <div className="block-container" ref={drag}>
      <div className="block">
        <lottie-player
          autoplay
          loop
          mode="normal"
          src={lottie.path}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        <div className="info">
          <img src={LottieImage} width="12px" height="12px" alt="" />
        </div>
      </div>
      <span className="span-full font-middle">{lottie?.name}</span>
    </div>
  );
};

const MenuMaterial = () => {
  const { assetsState } = useAssetsState();
  const { assetsManager } = useAssetsManager();
  const { systemDispatch } = useSystemState();
  const [selected, setSelected] = useState('all');
  const [currMaterialType, setCurrMaterialType] = useState('lesson');
  const [isShowLibraryList, setIsShowLibraryList] = useState(false);

  const handleSelectChange = (value: string) => {
    setSelected(value);
  };

  const handleAddAsset = async () => {
    const path = openFileDialog();
    if (path) {
      console.log('path: ', path);
      systemDispatch.setSpinTip('正在复制资源...');
      systemDispatch.openSpin();
      await assetsManager.copyFile(path);

      systemDispatch.closeSpin();
    }
  };

  return (
    <div className="material-container">
      <div className="material-selector">
        <Radio.Group
          value={currMaterialType}
          onChange={(e) => {
            setCurrMaterialType(e.target.value);
            setIsShowLibraryList(e.target.value === 'library');
          }}
        >
          <Radio.Button value="lesson">本地素材</Radio.Button>
          <Radio.Button value="library">素材库</Radio.Button>
        </Radio.Group>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
        }}
      >
        <Select
          defaultValue={selected}
          style={{ width: 120 }}
          onChange={handleSelectChange}
        >
          {Options.map((i, idx) => {
            return (
              <Option key={i.value} value={i.value}>
                {i.text}
              </Option>
            );
          })}
        </Select>
        {!isShowLibraryList && (
          <Button
            type="text"
            icon={<PlusCircleOutlined />}
            size="middle"
            onClick={handleAddAsset}
          />
        )}
      </div>
      <div className="assets-container">
        {_.values(assetsState.videoDict).map((video: any) => {
          return video && video.isLibrary === isShowLibraryList ? (
            <VideoBlock key={video.uid} video={video} />
          ) : null;
        })}
      </div>
      {!isShowLibraryList && <Divider />}
      <div className="assets-container">
        {['image', 'all'].includes(selected) &&
          _.values(assetsState.imageDict).map((img: any) => {
            return img && img.isLibrary === isShowLibraryList ? (
              <ImageBlock key={img.uid} image={img} />
            ) : null;
          })}
        {['audio', 'all'].includes(selected) &&
          _.values(assetsState.audioDict).map((audio: any) => {
            return audio && audio.isLibrary === isShowLibraryList ? (
              <AudioBlock key={audio.uid} audio={audio} />
            ) : null;
          })}
        {['lottie', 'all'].includes(selected) &&
          _.values(assetsState.lottieDict).map((lottie: any) => {
            return lottie && lottie.isLibrary === isShowLibraryList ? (
              <LottieBlock key={lottie.uid} lottie={lottie} />
            ) : null;
          })}
      </div>
    </div>
  );
};

export default MenuMaterial;
