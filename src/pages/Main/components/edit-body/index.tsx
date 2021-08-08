import React, { useState, useEffect } from 'react';
import VideoTrackDnd from '../video-track-dnd';
import EffectTrackDnd from '../effect-track-dnd';
import useNativeState from '../../../../hooks/useNativeState';
import useSystemState from '../../../../hooks/useSystemState';
import { ITV } from '../../../../interface/native-interface';

const EditBody = () => {
  const { nativeState } = useNativeState();
  const { systemState } = useSystemState();
  const { currentItvId } = systemState;
  const { ITVDict, videoTrackDict, effectTrackDict } = nativeState;
  const [itv, setItv] = useState<ITV>();

  useEffect(() => {
    console.log('currentItvId change: ', currentItvId);
    setItv(ITVDict[currentItvId]);
  }, [currentItvId]);

  return (
    <div>
      {/* 事件轨 */}
      {itv?.effectTrack.map((trackKey) => {
        const track = effectTrackDict[trackKey];
        return (
          <div key={track?.uid}>
            <EffectTrackDnd trackId={track?.uid} />
          </div>
        );
      })}
      {/* 视频轨 */}
      {itv?.videoTrack.map((trackKey) => {
        const track = videoTrackDict[trackKey];
        return (
          <div key={track?.uid}>
            {/* <VideoTrack /> */}
            <VideoTrackDnd trackId={track?.uid} />
          </div>
        );
      })}
    </div>
  );
};

export default EditBody;
