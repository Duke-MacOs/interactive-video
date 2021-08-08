import React, { useState, useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import useSystemState from '../../hooks/useSystemState';

const DeleteNode = () => {
  const { systemState } = useSystemState();
  const { deleteIconVisible } = systemState;

  const [visible, setVisible] = useState<boolean>(true);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  useEffect(() => {
    const hanldeMouseMove = (e) => {
      setX(e.clientX);
      setY(e.clientY);
    };

    window.addEventListener('mousemove', hanldeMouseMove);

    return () => {
      window.removeEventListener('mousemove', hanldeMouseMove);
    };
  }, []);

  const customStyle = {
    position: 'fixed',
    left: x,
    top: y,
    width: '64px',
    height: '64px',
  };

  return <>{visible && <DeleteOutlined style={customStyle} />}</>;
};

export default DeleteNode;
