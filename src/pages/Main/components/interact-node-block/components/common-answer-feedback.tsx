/* eslint-disable @typescript-eslint/naming-convention */
import React, { useRef, useEffect } from 'react';
import * as _ from 'lodash';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import AudioSetting from './common-audio-setting';
import LottieSetting from './common-lottie-setting';

interface IProps {
  node: INative.InteractNode | undefined;
  hideLottieSetting?: boolean;
}

const AnswerFeedbackSetting: React.FC<IProps> = ({
  node,
  hideLottieSetting = true,
}) => {
  const { nativeDispatch } = useNativeState();
  const {
    correctSoundFilename,
    wrongSoundFilename,
    correctEffectFileName,
    wrongEffectFileName,
  } = node?.node as INative.AudioRecord;

  const nodeRef = useRef<INative.InteractNode>();
  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const hanldeAddAudio = (type: 'correct' | 'wrong') => {
    return (uid: string) => {
      console.log('handle add: ', uid);
      if (nodeRef.current) {
        const _node = _.cloneDeep(nodeRef.current);
        console.log('_node: ', _node);
        if (type === 'correct') {
          (_node?.node as INative.SimpleSelect).correctSoundFilename = uid;
        }
        if (type === 'wrong') {
          (_node?.node as INative.SimpleSelect).wrongSoundFilename = uid;
        }
        console.log('_node: ', _node);
        nativeDispatch.updateInteractiveNode(_node);
      }
    };
  };

  const hanldeDeleteAudio = (type: 'correct' | 'wrong') => {
    return () => {
      if (nodeRef.current) {
        const _node = _.cloneDeep(nodeRef.current);
        if (type === 'correct') {
          (_node?.node as INative.SimpleSelect).correctSoundFilename = '';
        }
        if (type === 'wrong') {
          (_node?.node as INative.SimpleSelect).wrongSoundFilename = '';
        }
        nativeDispatch.updateInteractiveNode(_node);
      }
    };
  };

  const handleUpdateAudio = (type: 'correct' | 'wrong') => {
    return hanldeAddAudio(type);
  };

  const handleAddLottie = (type: 'correct' | 'wrong') => {
    return (uid: string) => {
      if (nodeRef.current) {
        const _node = _.cloneDeep(nodeRef.current);
        if (type === 'correct') {
          (_node?.node as INative.AudioRecord).correctEffectFileName = uid;
        }
        if (type === 'wrong') {
          (_node?.node as INative.AudioRecord).wrongEffectFileName = uid;
        }
        nativeDispatch.updateInteractiveNode(_node);
      }
    };
  };

  const hanldeDeleteLottie = (type: 'correct' | 'wrong') => {
    return () => {
      if (nodeRef.current) {
        const _node = _.cloneDeep(nodeRef.current);
        if (type === 'correct') {
          (_node?.node as INative.AudioRecord).correctEffectFileName = '';
        }
        if (type === 'wrong') {
          (_node?.node as INative.AudioRecord).wrongEffectFileName = '';
        }
        nativeDispatch.updateInteractiveNode(_node);
      }
    };
  };

  const handleUpdateLottie = (type: 'correct' | 'wrong') => {
    return handleAddLottie(type);
  };

  return node ? (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="small-title">答题反馈</span>
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <span style={{ marginRight: '5px' }}>回答正确</span>
        <AudioSetting
          assetId={correctSoundFilename}
          handleAdd={hanldeAddAudio('correct')}
          handleDelete={hanldeDeleteAudio('correct')}
          handleUpdate={handleUpdateAudio('correct')}
        />
        <span style={{ margin: '0 5px' }} />
        {!hideLottieSetting && (
          <LottieSetting
            assetId={correctEffectFileName}
            handleAdd={handleAddLottie('correct')}
            handleDelete={hanldeDeleteLottie('correct')}
            handleUpdate={handleUpdateLottie('correct')}
          />
        )}
      </div>
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <span style={{ marginRight: '5px' }}>回答错误</span>
        <AudioSetting
          assetId={wrongSoundFilename}
          handleAdd={hanldeAddAudio('wrong')}
          handleDelete={hanldeDeleteAudio('wrong')}
          handleUpdate={handleUpdateAudio('wrong')}
        />
        <span style={{ margin: '0 5px' }} />
        {!hideLottieSetting && (
          <LottieSetting
            assetId={wrongEffectFileName}
            handleAdd={handleAddLottie('wrong')}
            handleDelete={hanldeDeleteLottie('wrong')}
            handleUpdate={handleUpdateLottie('wrong')}
          />
        )}
      </div>
    </div>
  ) : null;
};

export default AnswerFeedbackSetting;
