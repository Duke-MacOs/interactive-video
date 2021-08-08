import React, { useState, useEffect } from 'react';
import * as _ from 'lodash';
import { Table, Button } from 'antd';
import { AppstoreAddOutlined, UnorderedListOutlined } from '@ant-design/icons';
import * as fs from '../../../utils/fs';
import { UserDatePath } from '../../../config';
import useSystemState from '../../../hooks/useSystemState';
import useAssetsManager from '../../../hooks/useAssetsManager';
import useProjectManager from '../../../hooks/useProjectManager';
import { RecentDoc } from '../../../interface/system-interface';
import { getDValueFormat } from '../../../utils/util';
import placeImg from '../../Main/assets/video-place@3x.png';

const columns = [
  {
    title: '项目名称',
    dataIndex: 'name',
  },
  {
    title: '上次打开时间',
    dataIndex: 'openTime',
    render: (text: number) => {
      return getDValueFormat(text);
    },
  },
];

const RecentList = () => {
  const { systemState, systemDispatch } = useSystemState();
  const { projectManager } = useProjectManager();
  const { assetsManager } = useAssetsManager();

  const [data, setData] = useState<RecentDoc[]>([]);

  const [isFlex, setFlex] = useState<boolean>(false);

  const handlerClick = (record: RecentDoc) => {
    projectManager.openProject(record.path);
  };

  const onRow = (record: RecentDoc) => {
    return {
      onClick: () => handlerClick(record),
    };
  };

  const getImagsData = async (data: RecentDoc[]) => {
    const newData = [];
    for (let i = 0, len = data.length; i < len; i++) {
      const path = `${data[i].path}${UserDatePath}/vframes/`;
      const fileIsExit = await fs.existsSync(data[i].path);
      const regFileType = new RegExp('\\.png$', 'gim');
      if (fileIsExit) {
        let src = '';
        try {
          const files = await fs.getFilesAsync(path, regFileType, true);
          const j = 0;
          src = files[j];
        } catch (error) {
          console.log(error);
        }
        newData.push({ ...data[i], src });
      } else {
        newData.push({ ...data[i] });
      }
    }
    setData(
      [...newData]
        .sort((a: RecentDoc, b: RecentDoc) => b.openTime - a.openTime)
        .slice(0, 10)
    );
  };
  useEffect(() => {
    if (_.isArray(systemState.recent?.items)) {
      const items = systemState.recent?.items ?? [];
      getImagsData(items);
    }
  }, [systemState]);

  return (
    <div className="recent-list">
      <div className="recent-text">
        <div>最近打开的文件夹({data?.length})</div>
        <div>
          <Button
            type="text"
            icon={<AppstoreAddOutlined />}
            size="middle"
            className={!isFlex ? 'active' : 'no-active'}
            onClick={() => {
              setFlex(false);
            }}
          />
          <Button
            type="text"
            icon={<UnorderedListOutlined />}
            className={isFlex ? 'active' : 'no-active'}
            size="middle"
            onClick={() => {
              setFlex(true);
            }}
          />
        </div>
      </div>
      {(isFlex && (
        <Table
          pagination={false}
          columns={columns}
          onRow={onRow}
          dataSource={data}
          size="small"
        />
      )) || (
        <div className="flex-boxs">
          {data.map((ite: RecentDoc) => (
            <div
              key={`${ite.path}`}
              className="box"
              onClick={() => {
                handlerClick(ite);
              }}
            >
              <img src={ite.src || placeImg} alt="" />
              <span className="name">{ite.name}</span>
              <span className="time">{getDValueFormat(ite.openTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentList;
