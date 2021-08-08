import React from 'react';
import moment from 'moment';
import useSystemState from '../../hooks/useSystemState';

const TIME_FORMAT = 'HH:mm:ss';

const TitleBar: React.FC = () => {
  const { systemState } = useSystemState();
  const { autoSaveTime, projectName } = systemState;
  return (
    <div className="titlebar">
      <span style={{ marginLeft: '70px', marginBottom: '4px' }}>
        {moment(autoSaveTime).format(TIME_FORMAT)} 自动保存成功
      </span>
      <span style={{ marginBottom: '4px' }}>{projectName}</span>
      <span />
    </div>
  );
};

export default TitleBar;
