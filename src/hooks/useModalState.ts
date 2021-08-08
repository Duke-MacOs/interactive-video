import * as _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import useNativeState from './useNativeState';
import { RootState } from '../redux/rootReducer';
import { InteractNode } from '../interface/native-interface';
import {
  actionSetReduxToolModalVisible,
  actionSetBatchUpdateNodeModalVisible,
  actionSetSegmentNodeModalVisible,
  actionSetShortcutInfoModalVisible,
} from '../redux/systemStore';

interface ModalDispatch {
  showReduxToolModal: () => ModalDispatch;
  hideReduxToolModal: () => ModalDispatch;
  showSegmentNodeModal: () => ModalDispatch;
  hideSegmentNodeModal: () => ModalDispatch;
  showBatchUpdateNodeModal: () => ModalDispatch;
  hideBatchUpdateNodeModal: () => ModalDispatch;
  showShortcutInfoModal: () => ModalDispatch;
  hideShortcutInfoModal: () => ModalDispatch;
}

const useModalState = () => {
  const dispatch = useDispatch();
  const systemState = useSelector((state: RootState) => state.systemState);
  const { nativeQueryTool } = useNativeState();

  const { modal: modalState } = systemState;

  const modalDispatch: ModalDispatch = {
    showReduxToolModal: () => {
      dispatch(actionSetReduxToolModalVisible(true));
      return modalDispatch;
    },
    hideReduxToolModal: () => {
      dispatch(actionSetReduxToolModalVisible(false));
      return modalDispatch;
    },
    showSegmentNodeModal: () => {
      dispatch(actionSetSegmentNodeModalVisible(true));
      return modalDispatch;
    },
    hideSegmentNodeModal: () => {
      dispatch(actionSetSegmentNodeModalVisible(false));
      return modalDispatch;
    },
    showBatchUpdateNodeModal: () => {
      const interactDetailNodes: InteractNode[] = nativeQueryTool?.getCurrentInteractNodes();
      // 交互节点为空时不弹弹窗
      interactDetailNodes &&
        interactDetailNodes.length !== 0 &&
        dispatch(actionSetBatchUpdateNodeModalVisible(true));
      return modalDispatch;
    },
    hideBatchUpdateNodeModal: () => {
      dispatch(actionSetBatchUpdateNodeModalVisible(false));
      return modalDispatch;
    },
    showShortcutInfoModal: () => {
      dispatch(actionSetShortcutInfoModalVisible(true));
      return modalDispatch;
    },
    hideShortcutInfoModal: () => {
      dispatch(actionSetShortcutInfoModalVisible(false));
      return modalDispatch;
    },
  };

  return { modalState, modalDispatch };
};

export default useModalState;
