import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import * as _ from 'lodash';
import TimeAndMilliPicker from '../TimeAndMilliPicker';
import useModalState from '../../hooks/useModalState';
import useNativeState from '../../hooks/useNativeState';
import { InteractNode } from '../../interface/native-interface';
import { Interactives } from '../../pages/Main/components/menu/menu-interactive';

import { getBatchUpdateMS } from '../../utils/util';

interface ISelectedNodeIDs {
  [proppName: string]: boolean;
}

/**
 * 把Interactives转换成组件渲染所需对象
 * @param arr interactives
 * @returns
 */
const transInteractivesToMap = (arr: typeof Interactives) => {
  return arr.reduce(function (obj, interactive) {
    obj[interactive.type] = interactive;
    return obj;
  }, {});
};
const mapInteractTypeToInfo = transInteractivesToMap(Interactives);

// 移动方向枚举
enum MoveWay {
  FORWARD = -1,
  UNSET = 0,
  BACKWORD = 1,
}

const BatchUpdateNodeModal = () => {
  const { modalState, modalDispatch } = useModalState();
  const { nativeState, nativeDispatch, nativeQueryTool } = useNativeState();
  const { interactNodeDict } = nativeState;
  // 当前选中的节点ID列表
  const [selectedNodeIDObj, setSelectedNodeIDObj] = useState<ISelectedNodeIDs>(
    {}
  );
  // 向前移动的时间
  const [moveForwardTime, setMoveForwardTime] = useState<number>(0);
  // 向后移动的时间
  const [moveBackwardTime, setMoveBackwardTime] = useState<number>(0);
  // 移动方向
  const [moveWay, setMoveWay] = useState<MoveWay>(MoveWay.UNSET);
  // 是否全选
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  // 获取当前交互节点
  const interactDetailNodes: InteractNode[] = nativeQueryTool?.getCurrentInteractNodes();

  // 交互节点排序
  interactDetailNodes.sort((m, n) => {
    if (m.virtualTime < n.virtualTime) {
      return -1;
    }
    if (m.virtualTime > n.virtualTime) {
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    if (modalState.batchUpdateNodeModalVisible) {
      // 展示时 初始化数据
      const selectedObj = {};
      interactDetailNodes.forEach((item) => {
        selectedObj[item.uid] = false;
      });
      setIsAllSelected(false);
      setSelectedNodeIDObj(selectedObj);
      setMoveForwardTime(0);
      setMoveBackwardTime(0);
      setMoveWay(MoveWay.UNSET);
    }
  }, [modalState.batchUpdateNodeModalVisible]);

  useEffect(() => {
    // 监听互动事件列表 确定是否勾上全选
    const selectedNodeIDObjValList = Object.values(selectedNodeIDObj);
    let isAllChoose = true;
    for (let i = 0; i < selectedNodeIDObjValList.length; i++) {
      if (!selectedNodeIDObjValList[i]) {
        isAllChoose = false;
        break;
      }
    }
    isAllChoose && setIsAllSelected(true);
  }, [selectedNodeIDObj]);

  // 弹窗点击OK
  const handleOk = () => {
    const isForward = moveWay === MoveWay.FORWARD;
    const needMoveTime = isForward ? moveForwardTime : moveBackwardTime;
    const needMoveNodeList: InteractNode[] = [];
    const selectedKeys = Object.keys(selectedNodeIDObj);
    for (let i = 0; i < selectedKeys.length; i++) {
      // 选中节点
      const k = selectedKeys[i];
      selectedNodeIDObj[k] && needMoveNodeList.push(interactNodeDict[k]);
    }
    const changedNodeList = needMoveNodeList.map((item) => {
      return {
        ...item,
        virtualTime:
          item.virtualTime + (isForward ? -needMoveTime : needMoveTime),
      };
    });
    nativeDispatch.batchUpdateInteractiveNode(changedNodeList);
    modalDispatch.hideBatchUpdateNodeModal();

    // modalDispatch.showBatchUpdateNodeModal();
  };

  const handleCancel = () => {
    modalDispatch.hideBatchUpdateNodeModal();
  };

  return (
    <Modal
      title="批量移动互动事件"
      visible={modalState.batchUpdateNodeModalVisible}
      className="batch-update-node-modal"
      cancelText="
        取消
      "
      closable={false}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          type="primary"
          key="submit"
          onClick={handleOk}
          disabled={
            moveWay === MoveWay.UNSET ||
            !Object.values(selectedNodeIDObj).includes(true)
          }
        >
          批量移动
        </Button>,
      ]}
    >
      <h5 className="batch-update-sub-title">选择需要移动的互动事件</h5>
      <label className="all-select-wrap" htmlFor="all-select">
        <input
          type="checkbox"
          name="all-select"
          id="all-select"
          checked={isAllSelected}
          onChange={() => {
            // 设置全选 & 反选
            const tempObj = { ...selectedNodeIDObj };
            const selectedKeys = Object.keys(selectedNodeIDObj);
            for (let i = 0; i < selectedKeys.length; i++) {
              const k = selectedKeys[i];
              tempObj[k] = !isAllSelected;
            }
            setSelectedNodeIDObj(tempObj);
            setIsAllSelected(!isAllSelected);
          }}
        />
        <span>全选</span>
      </label>
      <ul className="interact-node-list">
        {interactDetailNodes.map((item, index) => {
          const { node } = item;
          const { type } = node;
          return (
            <li key={item.uid}>
              <label
                className="interact-node-list-item"
                htmlFor={`interactNode_${index}`}
              >
                <img
                  alt=""
                  src={mapInteractTypeToInfo[type]?.img}
                  className="interact-node-list-icon"
                />
                <span className="interact-node-list-desc">
                  {mapInteractTypeToInfo[type]?.text}
                </span>
                {getBatchUpdateMS(item.virtualTime)}
                <input
                  type="checkbox"
                  name="interactNodeList"
                  id={`interactNode_${index}`}
                  className="interact-node-list-checkbox"
                  checked={!!selectedNodeIDObj[item.uid]}
                  onChange={() => {
                    const currSelectedObj = { ...selectedNodeIDObj };
                    const curreSelectStatus = !currSelectedObj[item.uid];
                    currSelectedObj[item.uid] = !currSelectedObj[item.uid];
                    setSelectedNodeIDObj(currSelectedObj);
                    if (!curreSelectStatus && isAllSelected) {
                      // 状态改成未勾选，且当前已经全选
                      setIsAllSelected(false);
                    }
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>

      <h5 className="batch-update-sub-title move-title">移动范围设置</h5>
      <div className="move-wrap">
        <label htmlFor="move-forward" className="move-label">
          <input
            type="radio"
            id="move-forward"
            name="move"
            className="move-radio"
            checked={moveWay === MoveWay.FORWARD}
            onChange={() => {
              setMoveWay(MoveWay.FORWARD);
            }}
          />
          <span className="move-desc">选中事件向前平移</span>
        </label>
        <TimeAndMilliPicker
          value={moveForwardTime}
          onChange={(virtualTime: number) => {
            setMoveWay(MoveWay.FORWARD);
            setMoveForwardTime(virtualTime);
          }}
        />
      </div>
      <div className="move-wrap">
        <label htmlFor="move-afterward" className="move-label">
          <input
            type="radio"
            id="move-afterward"
            name="move"
            className="move-radio"
            checked={moveWay === MoveWay.BACKWORD}
            onChange={() => {
              setMoveWay(MoveWay.BACKWORD);
            }}
          />
          <span className="move-desc">选中事件向后平移</span>
        </label>
        <TimeAndMilliPicker
          value={moveBackwardTime}
          onChange={(virtualTime: number) => {
            setMoveWay(MoveWay.BACKWORD);
            setMoveBackwardTime(virtualTime);
          }}
        />
      </div>
    </Modal>
  );
};

export default BatchUpdateNodeModal;
