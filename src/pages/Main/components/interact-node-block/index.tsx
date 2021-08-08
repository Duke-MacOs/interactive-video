import React, { useState, useEffect } from 'react';
import * as _ from 'lodash';
import { Divider } from 'antd';
import * as INative from '../../../../interface/native-interface';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import { Interactives } from '../menu/menu-interactive';
import CommonNameSetting from './components/common-name';
import AutoPauseSetting from './components/auto-pause';
import BranchStorySetting from './components/branch-story';
import SimpleSelectSetting from './components/simple-select';
import AudioRecordSetting from './components/audio-record';
import VideoRecordSetting from './components/video-record';
import DragNDropSetting from './components/drag-n-drop';
import LoopTimeSetting from './components/common-loopTime-setting';
import StartTimeSetting from './components/common-startTime-setting';

import IconNoContent from '../../assets/ico_tool_no content@2x.png';

const InteractNodeBlock = () => {
  const { systemState } = useSystemState();
  const { nativeQueryTool, nativeState } = useNativeState();
  const { currentNodeId, mode } = systemState;
  const { interactNodeDict } = nativeState;

  const [type, setType] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [node, setNode] = useState<INative.InteractNode | null>(null);

  const updateInteractNode = () => {
    const n = nativeQueryTool.getInteractNodeById(currentNodeId);
    if (n) {
      const o = _.find(Interactives, (i) => i.type === n.node?.type);
      setType(o?.type ?? '');
      setText(o?.text ?? '');
      setNode(n);
    } else {
      setType('');
      setText('');
      setNode(null);
    }
  };

  useEffect(() => {
    updateInteractNode();
  }, [currentNodeId, interactNodeDict]);

  useEffect(() => {
    updateInteractNode();
  }, [interactNodeDict]);

  return (
    <div className="interact-node-block">
      {/* 互动面板 */}
      {node === null ? (
        <div
          style={{ width: '100%', height: '100%' }}
          className="verticality-horizontal-center"
        >
          <img src={IconNoContent} alt="" width="37" height="36" />
          <span>暂无选中节点</span>
        </div>
      ) : (
        <>
          {mode === 'preview' && (
            <div className="gray-screen horizontal-verticality-center">
              预览模式下无法编辑
            </div>
          )}
          <div className="interact-node-type">{text}节点设置</div>
          <div className="interact-node-body">
            <CommonNameSetting node={node} />
            {node?.node.type === INative.InteractsType.AUTO_PAUSE && (
              <>
                <StartTimeSetting node={node} />
                <Divider />
                <AutoPauseSetting node={node} />
              </>
            )}
            {node?.node.type === INative.InteractsType.SIMPLE_SELECT && (
              <>
                <LoopTimeSetting node={node} />
                <Divider />
                <SimpleSelectSetting node={node} />
              </>
            )}
            {node?.node.type === INative.InteractsType.AUDIO_RECORD && (
              <>
                <StartTimeSetting node={node} />
                <Divider />
                <AudioRecordSetting node={node} />
              </>
            )}
            {node?.node.type === INative.InteractsType.VIDEO_RECORD && (
              <>
                <StartTimeSetting node={node} />
                <Divider />
                <VideoRecordSetting node={node} />
              </>
            )}
            {node?.node.type === INative.InteractsType.DRAGNDROP && (
              <>
                <LoopTimeSetting node={node} />
                <Divider />
                <DragNDropSetting node={node} />
              </>
            )}
            {node?.node.type === INative.InteractsType.BRANCH_STORY && (
              <>
                <LoopTimeSetting node={node} />
                <Divider />
                <BranchStorySetting node={node} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InteractNodeBlock;
