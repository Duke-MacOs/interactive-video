import qiniu from 'qiniu';
import { getUploadToken } from '../api';
import { Asset } from '../interface/assets-interface';
import { AssetType } from '../interface/ITV-interface';

const config = new qiniu.conf.Config();
const resumeUploader = new qiniu.resume_up.ResumeUploader(config);

let cancel = false;
// 当前任务key，用于标记取消任务
let currentTask = 0;

const useUploadAssets = () => {
  /**
   * 批量上传本地素材
   * @param assets 本地资源
   * @param type 资源类型
   * @param onUploaded 回调函数
   */
  const uploadLocalAssets = async (
    assets: Asset[],
    type: AssetType,
    // index 当前资源下标
    onProgress?: (progress: number, index: number, type: AssetType) => void,
    onUploaded?: (cdnUrl: string, index: number, type: AssetType) => void
  ) => {
    if (!assets.length) return;

    cancel = false;
    currentTask = new Date().getTime();

    const tokenCount = assets.length;
    const { name } = assets[0];
    // 文件拓展名
    const ext = name.substr(name.lastIndexOf('.'));

    // 获取上传token
    const res = await getUploadToken(tokenCount, ext);
    if (res.status !== 200 || !res.data) {
      throw Error();
    }

    const { bucket_url: bucketUrl, data } = res.data;
    if (data.length !== tokenCount) {
      throw Error('Err:Token数量不匹配');
    }
    await Promise.all(
      data.map(async (fileInfo, index) => {
        if (cancel) return;

        const { token, filename } = fileInfo;
        const localFile = assets[index].path;

        onProgress?.(0, index, type);

        const result = await uploadCdn(
          token,
          filename,
          localFile,
          (progress) => {
            // 上传进度回调
            const schedule = Math.floor((progress / assets[index].size) * 100);
            onProgress?.(schedule, index, type);
          }
        );
        const fileUrl = `${bucketUrl}${result.key}`;
        // 上传成功回调
        onUploaded && onUploaded(fileUrl, index, type);

        return fileUrl;
      })
    );
  };

  /**
   * 七牛上传
   */
  const uploadCdn = async (
    uploadToken: string,
    key: string,
    localFile: string,
    onProgress?: (progress: number) => void
  ): Promise<{ hash: string; key: string }> =>
    new Promise((resolve, reject) => {
      // 此次任务key
      const task = currentTask;

      const handleProgress = (e: any) => {
        if (task !== currentTask) return;
        if (cancel) {
          reject(new Error('cancel'));
          return;
        }
        onProgress && onProgress(e);
      };

      const putExtra = new qiniu.resume_up.PutExtra(
        undefined,
        undefined,
        undefined,
        undefined,
        handleProgress
      );
      resumeUploader.putFile(
        uploadToken,
        key,
        localFile,
        putExtra,
        (
          respErr: any,
          respBody: { hash: string; key: string },
          respInfo: any
        ) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo?.statusCode === 200) {
            resolve(respBody);
          } else {
            reject(respInfo);
          }
        }
      );
    });

  const onCancel = () => {
    cancel = true;
  };

  return { uploadLocalAssets, uploadCdn, onCancel };
};

export default useUploadAssets;
