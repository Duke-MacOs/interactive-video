import React from 'react';
import ReduxToolModal from './reduxToolModal';
import BatchUpdateNodeModal from './batchUpdateNodeModal';
import SegmentNodeModal from './segmentNodeModal';
import ShortcutInfoModal from './shortcutInfoModal';
import { ConfirmClose } from './confirmClose';

const ModalMain = () => {
  return (
    <>
      <ReduxToolModal />
      <BatchUpdateNodeModal />
      <SegmentNodeModal />
      <ShortcutInfoModal />
      <ConfirmClose />
    </>
  );
};

export default ModalMain;
