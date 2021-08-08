import React, { useRef, useEffect, useState } from 'react';
import { Modal, Button, message } from 'antd';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import ITVManager from '../../classes/ITVManager';
import useAssetsManager from '../../hooks/useAssetsManager';
import useNativeState from '../../hooks/useNativeState';
import useAssetsState from '../../hooks/useAssetsState';
import useProjectManager from '../../hooks/useProjectManager';
import {
  Asset,
  AssetsType,
  AssetList as IAssetList,
} from '../../interface/assets-interface';
import * as INative from '../../interface/native-interface';
import useUploadAssets from '../../hooks/useUploadAssets';
import IconPreview from '../../pages/Main/assets/ico_preview.png';
import { actionUpdateAsset } from '../../redux/assetsStore';
import * as IITV from '../../interface/ITV-interface';
import { submitPreviewData } from '../../api';
import * as fs from '../../utils/fs';
import './index.scss';

import IconExport from '../../pages/Main/assets/ico_export.png';

interface AssetUpload extends Asset {
  progress?: number;
}
type AssetList = {
  [key in AssetsType]?: AssetUpload[] | Asset[];
};
const DefaultFiles = {};
_.map(AssetsType, (key) => {
  DefaultFiles[key] = [];
});

const itvManage = ITVManager.getInstance();

/**
 * 设备预览
 */
const UploadModal: React.FC = () => {
  const { nativeState, nativeQueryTool } = useNativeState();
  const { assetsState } = useAssetsState();
  const { projectManager } = useProjectManager();

  const [visible, setVisible] = useState<boolean>(false);
  // 资源总数
  const [totalCount, setTotalCount] = useState<number>(0);
  // 当前资源上传数量
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [qrcodeVisible, setQrcodeVisible] = useState<boolean>(false);
  const [qrcodeData, setQrcodeData] = useState<any>({});
  const [uploadFiles, setUploadFiles] = useState<AssetList>(DefaultFiles);

  const { uploadLocalAssets, onCancel } = useUploadAssets();
  const { checkAllAssetExist, getLocalAssets } = useAssetsManager();
  const dispatch = useDispatch();

  const nativeStateRef = useRef<INative.NativeStore>();
  const assetsStateRef = useRef<IAssetList>();

  useEffect(() => {
    nativeStateRef.current = nativeState;
  }, [nativeState]);

  useEffect(() => {
    assetsStateRef.current = assetsState;
  }, [assetsState]);

  /**
   * 上传本地资源至cdn
   */
  const uploadAssets = async () => {
    try {
      const {
        filteredVideos,
        filteredAudios,
        filteredImages,
        filteredlotties,
      } = getLocalAssets();

      // 初始化数据
      const uploadTasks: Promise<void>[] = [];
      let count = 0;
      setUploadFiles(DefaultFiles);
      setCurrentCount(0);

      const totalFileCount =
        filteredVideos.length +
        filteredAudios.length +
        filteredImages.length +
        filteredlotties.length;

      setTotalCount(totalFileCount);

      const onProgress = (
        progress: number,
        index: number,
        type: AssetsType
      ) => {
        // 上传文件列表中已有文件数
        const tempFiles: AssetUpload[] = uploadFiles ? uploadFiles[type] : [];
        tempFiles[index] = {
          ...tempFiles[index],
          progress,
        };
        setUploadFiles({
          ...uploadFiles,
          [type]: tempFiles,
        });
      };
      const onUploaded = (cdnUrl: string, index: number, type: AssetsType) => {
        count++;
        setCurrentCount(count);

        const files: Asset[] = uploadFiles[type] || [];
        const result = {
          ...files[index],
          cdnUrl,
        };
        dispatch(actionUpdateAsset({ type, uid: result.uid, value: result }));
      };

      const upload = async (assets: Asset[] | AssetUpload[], type: string) => {
        uploadFiles[type] = assets;

        uploadTasks.push(
          uploadLocalAssets(assets, type, onProgress, onUploaded)
        );
      };

      await upload(filteredVideos, AssetsType.VIDEO);
      await upload(filteredAudios, AssetsType.AUDIO);
      await upload(filteredImages, AssetsType.IMAGE);
      await upload(filteredlotties, AssetsType.LOTTIE);

      // 显示弹窗，进行上传
      setVisible(true);
      await Promise.all(uploadTasks);

      message.success('所有资源已上传完毕');
      return true;
    } catch (e) {
      if (e.toString() === 'Error: cancel') return;
      Modal.warning({
        title: '上传资源失败',
        content: e.toString(),
      });
    } finally {
      onClose();
    }
  };

  /**
   * 展示预览二维码弹窗
   */
  const genQrcode = async () => {
    // 保存当前状态到 .itvm
    projectManager.saveProject();

    // 1. 上传所有未上传的文件
    // 检测未上传资源是否存在于本机
    checkAllAssetExist();

    // 上传资源
    const isDone = await uploadAssets();

    if (isDone && nativeStateRef.current && assetsStateRef.current) {
      const run = itvManage.getTransverRunningMan(
        nativeStateRef.current,
        assetsStateRef.current
      );
      const currentItvId = nativeQueryTool.getCurrentItvId();
      const data = _.find(run(), (d) => d.courseId === currentItvId);
      console.log('before data: ', data);
      if (data) {
        const res = await submitPreviewData(JSON.stringify(data));
        setQrcodeData(res);
        setQrcodeVisible(true);
      }
    }
  };

  const handleExport = async () => {
    projectManager.saveProject();
    try {
      // 1. 上传所有未上传的文件
      // 检测未上传资源是否存在于本机
      checkAllAssetExist();

      // 上传资源
      console.log('上传资源');
      const isDone = await uploadAssets();
      if (isDone && nativeStateRef.current && assetsStateRef.current) {
        console.log('转换 itv');
        const run = itvManage.getTransverRunningMan(
          nativeStateRef.current,
          assetsStateRef.current
        );
        const itvs = run();
        itvs.forEach((itv) => {
          const name = itv.name ?? itv.courseId;
          fs.createFile(`${name}.itv`, JSON.stringify(itv));
        });
      }
    } catch (error) {
      message.error('itv 导出失败');
    }
    message.success('itv 导出成功');
  };

  // 取消上传，关闭弹窗
  const onClose = () => {
    onCancel();
    setVisible(false);
    setQrcodeVisible(false);
  };

  const renderUploader = (assets: AssetUpload[]) =>
    assets.map((item: AssetUpload) => (
      <li key={item.uid}>
        <p className="name">
          <span>{item.name}</span>
          <span>{item.progress}%</span>
        </p>
        <div className="progress">
          <div className="active" style={{ width: `${item.progress}%` }} />
        </div>
      </li>
    ));
  return (
    <>
      <div style={{ display: 'flex' }}>
        <div className="icon-preview-wrap" onClick={genQrcode}>
          <img src={IconPreview} alt="" className="icon-preview" />
          <span>预览</span>
        </div>
        <div className="icon-export-wrap" onClick={handleExport}>
          <img src={IconExport} alt="" className="icon-export" />
          导出
        </div>
      </div>

      <Modal
        footer={<Button onClick={onClose}>取消上传</Button>}
        visible={visible}
        onCancel={onClose}
      >
        <div className="upload-wrap">
          <p className="title">
            正在上传文件（{currentCount}/{totalCount}）
          </p>
          <ul>
            {_.map(
              uploadFiles,
              (list) => list && renderUploader(list as AssetUpload[])
            )}
          </ul>
        </div>
      </Modal>

      <Modal footer={null} visible={qrcodeVisible} onCancel={onClose}>
        <p>作品二维码</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              padding: '20px',
              background: 'white',
              width: '250px',
              display: 'flex',
              justifyContent: 'center',
              borderRadius: '20px',
            }}
          >
            <QRCode
              value={JSON.stringify({ data: qrcodeData, mode: 'VIDEO' })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UploadModal;
