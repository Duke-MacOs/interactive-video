// 左侧一级菜单栏
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { MenuListId } from '../../../../interface/system-interface';
import useSyatemState from '../../../../hooks/useSystemState';

const MenuList = [
  {
    key: 1,
    id: MenuListId.MATERIAL,
    text: '素材',
  },
  {
    key: 2,
    id: MenuListId.INTERACTIVE,
    text: '互动',
  },
  {
    key: 3,
    id: MenuListId.REWARD,
    text: '奖励',
  },
];

const MenuLeft = () => {
  const { systemDispatch, systemState } = useSyatemState();
  const { activeMenu } = systemState;

  const handleClickItem = (id: MenuListId) => {
    systemDispatch.setActiveMenu(id);
  };

  return (
    <div className="left">
      {MenuList.map((i, idx) => {
        return (
          <div
            className={classNames('list-item', {
              'list-item-active': activeMenu === i.id,
            })}
            onClick={() => {
              handleClickItem(i.id);
            }}
            key={i.key}
          >
            <span>{i.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MenuLeft;
