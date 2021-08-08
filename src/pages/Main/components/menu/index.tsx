import React from 'react';
import MenuLeft from './menu-left';
import useSyatemState from '../../../../hooks/useSystemState';
import { MenuListId } from '../../../../interface/system-interface';
import MenuInteractive from './menu-interactive';
import MenuMaterial from './menu-material';
import MenuReward from './menu-reward';

const Menu = () => {
  const { systemDispatch, systemState } = useSyatemState();
  const { activeMenu } = systemState;

  return (
    <div className="menu-container">
      <MenuLeft />
      <div className="right">
        {activeMenu === MenuListId.MATERIAL && <MenuMaterial />}
        {activeMenu === MenuListId.INTERACTIVE && <MenuInteractive />}
        {activeMenu === MenuListId.REWARD && <MenuReward />}
      </div>
    </div>
  );
};

export default Menu;
