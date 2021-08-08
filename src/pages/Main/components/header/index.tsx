/* eslint-disable no-await-in-loop */
import React from 'react';
import UploadModal from '../../../../components/upload-modal';

import logo from '../../assets/logo-makermao.png';

const Header = () => {
  return (
    <div className="header-wrap">
      <div className="left">
        <img className="logo" src={logo} alt="" />
      </div>

      <div className="right">
        {/* 预览 */}
        <UploadModal />
      </div>
    </div>
  );
};

export default Header;
