import React, { useRef, useEffect, useState } from 'react';
import * as INative from '../../../../../interface/native-interface';
import useSystemState from '../../../../../hooks/useSystemState';
import useNativeState from '../../../../../hooks/useNativeState';

interface IProps {
  node: INative.InteractNode | undefined;
}

const CommonNameSetting: React.FC<IProps> = ({ node }) => {
  const { systemState } = useSystemState();
  const { nativeDispatch } = useNativeState();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && node) {
      inputRef.current.value = node?.name;
    }
  }, [node]);

  const handleChange = (e) => {
    const { value } = e.target;
    node && nativeDispatch.updateInteractiveNode({ ...node, name: value });
  };

  return node ? (
    <div style={{ display: 'flex', marginBottom: '20px' }}>
      <span
        style={{ marginRight: '10px' }}
        className="gray horizontal-verticality-center"
      >
        事件名称
      </span>
      <input
        ref={inputRef}
        className="input-name"
        style={{ flex: 1 }}
        onBlur={handleChange}
      />
    </div>
  ) : null;
};

export default CommonNameSetting;
