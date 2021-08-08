/* eslint-disable @typescript-eslint/naming-convention */
/**
 * 【全部选项拖拽完成】，即 correctRuleType = and；此时 correctGroups.length = 1，correctGroups[0] = [所有有终点 item 的 id]；
 * 【任意起点拖入终点】，即 correctRuleType = or；此时 correctGroups.length = [有终点 item 个数]，correctGroups[idx] = [有终点 item 的 id]；
 * correctGroups = string[][];
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Radio, InputNumber, Slider, Checkbox } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import NodeGenerator from '../../../../../classes/NodeGenerator';
import * as INative from '../../../../../interface/native-interface';
import useNativeState from '../../../../../hooks/useNativeState';
import { DragItemMaxLength } from '../../../../../config';
import AnswerFeedbackSetting from './common-answer-feedback';
import RewardSetting from './common-reward';
import LoopTimeSetting from './common-loopTime-setting';
import ImageSetting from './common-image-setting';
import AnswerLimitedTimeSetting from './common-answer-limited';

interface IProps {
  node: INative.InteractNode | undefined;
}

const nodeGenerator = NodeGenerator.getInstance();

const DragNDropSetting: React.FC<IProps> = ({ node }) => {
  const {
    autoLoop,
    correctGroups,
    dragItems,
  } = node?.node as INative.DragNDrop;
  const { isAuto } = autoLoop;
  const { nativeDispatch } = useNativeState();

  const [correctRuleType, setCorrectRuleType] = useState<'or' | 'and'>('or');

  const nodeRef = useRef<INative.InteractNode>();

  useEffect(() => {
    setCorrectRuleType(correctGroups.length > 1 ? 'or' : 'and');
  }, [correctGroups]);

  useEffect(() => {
    nodeRef.current = node;
  }, [node]);

  const handleChangeDragItemNum = useCallback(
    (val: number) => {
      const _node = _.cloneDeep(nodeRef.current);
      if (val > dragItems.length) {
        const pre = dragItems[dragItems.length - 1];
        const newItem = nodeGenerator.createDragItem(pre);
        (_node?.node as INative.DragNDrop).dragItems.push(newItem);
        _node && nativeDispatch.updateInteractiveNode(_node);
      } else {
        (_node?.node as INative.DragNDrop).dragItems.pop();
        _node && nativeDispatch.updateInteractiveNode(_node);
      }
      setTimeout(handleChangeOverRule, 0);
    },
    [dragItems]
  );

  const handleDeleteDragItem = useCallback(
    (id: string) => {
      const _node = _.cloneDeep(node);
      _.remove(
        (_node?.node as INative.DragNDrop).dragItems,
        (i) => i.id === id
      );
      _node && nativeDispatch.updateInteractiveNode(_node);
      setTimeout(handleChangeOverRule, 0);
    },
    [dragItems]
  );

  const handleChangeEnd = useCallback(
    (id: string, noEnd: boolean) => {
      const _node = _.cloneDeep(node);
      const idx = _.findIndex(
        (_node?.node as INative.DragNDrop).dragItems,
        (i) => i.id === id
      );
      const newEnd = nodeGenerator.getDefaultEndPos();
      // 无终点
      (_node?.node as INative.DragNDrop).dragItems[idx].endPos = noEnd
        ? null
        : newEnd;
      _node && nativeDispatch.updateInteractiveNode(_node);
      setTimeout(handleChangeOverRule, 0);
    },
    [dragItems]
  );

  const hanldeAddDragItemImage = (id: string) => {
    return (assetId: string) => {
      const _node = _.cloneDeep(nodeRef.current);
      const idx = _.findIndex(
        (_node?.node as INative.DragNDrop).dragItems,
        (i) => i.id === id
      );
      if (idx !== -1) {
        (_node?.node as INative.DragNDrop).dragItems[idx].imgFilename = assetId;
        _node && nativeDispatch.updateInteractiveNode(_node);
      }
    };
  };

  const handleDeleteDragItemImage = (id: string) => {
    return () => {
      const _node = _.cloneDeep(nodeRef.current);
      const idx = _.findIndex(
        (_node?.node as INative.DragNDrop).dragItems,
        (i) => i.id === id
      );
      (_node?.node as INative.DragNDrop).dragItems[idx].imgFilename = '';
      _node && nativeDispatch.updateInteractiveNode(_node);
    };
  };

  const handleUpdateDragItemImage = hanldeAddDragItemImage;

  const handleChangeOverRule = (value?: string) => {
    const _node = _.cloneDeep(nodeRef.current);
    const { dragItems, correctGroups } = _node?.node as INative.DragNDrop;
    console.log('dragItems:', dragItems);
    console.log('value: ', value);
    const val = value ?? (correctGroups.length > 1 ? 'or' : 'and');
    console.log('val: ', val);
    const newCorrectGroups: string[][] = [];
    if (val === 'and') {
      newCorrectGroups[0] = [];
      dragItems.forEach((i) => {
        if (i.endPos === null) return;
        newCorrectGroups[0].push(i.id);
      });
    }
    if (val === 'or') {
      dragItems.forEach((i) => {
        if (i.endPos === null) return;
        newCorrectGroups.push([i.id]);
      });
    }
    console.log('newCorrectGroups: ', newCorrectGroups);
    (_node?.node as INative.DragNDrop).correctGroups = newCorrectGroups;
    _node && nativeDispatch.updateInteractiveNode(_node);
  };

  const handleChangeIsAuto = (val: boolean) => {
    const _node = _.cloneDeep(nodeRef.current);
    (_node?.node as INative.DragNDrop).autoLoop.isAuto = val;
    _node && nativeDispatch.updateInteractiveNode(_node);
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
          <Radio value={false}>点击按钮循环播放</Radio>
          <Radio value>循环播放</Radio>
        </Radio.Group>
      </div>
      <div
        className="setting-block"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <span className="gray small-title" style={{ marginRight: '10px' }}>
          选项数量（{dragItems.length}）
        </span>
        <Slider
          min={1}
          max={DragItemMaxLength}
          step={1}
          onChange={handleChangeDragItemNum}
          value={dragItems.length}
        />
        {dragItems.map((item, idx) => {
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <span style={{ marginRight: '5px' }}>拖拽组{`${idx + 1}`}</span>
              <ImageSetting
                assetId={item.imgFilename}
                handleAdd={hanldeAddDragItemImage(item.id)}
                handleDelete={handleDeleteDragItemImage(item.id)}
                handleUpdate={handleUpdateDragItemImage(item.id)}
              />
              <Checkbox
                style={{ marginRight: '5px', marginLeft: '5px' }}
                onChange={(e) => {
                  handleChangeEnd(item.id, e.target.checked);
                }}
                checked={!item.endPos}
              >
                无终点
              </Checkbox>
              {idx !== 0 && (
                <CloseOutlined
                  onClick={() => {
                    handleDeleteDragItem(item.id);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="setting-block">
        <span className="gray small-title" style={{ marginRight: '10px' }}>
          完成拖拽题条件
        </span>
        <Radio.Group
          onChange={(e) => {
            handleChangeOverRule(e.target.value);
          }}
          value={correctRuleType}
          size="small"
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '12px',
            marginTop: '5px',
          }}
        >
          <Radio value="or">任意起点拖入终点</Radio>
          <Radio value="and">所有起点拖入终点</Radio>
        </Radio.Group>
      </div>
      <div className="setting-block">
        <AnswerFeedbackSetting node={node} />
      </div>
      <div className="setting-block">
        <AnswerLimitedTimeSetting node={node} />
      </div>
      <div className="setting-block">
        <RewardSetting node={node} />
      </div>
    </>
  ) : null;
};

export default DragNDropSetting;
