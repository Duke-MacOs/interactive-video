import Axios from 'axios';
import { MlzResponse, UploadRes } from './type';

/**
 * 获取七牛云批量上传token
 * @param tokenCount token数量
 * @param type 文件类型/扩展名
 */
export const getUploadToken = (
  tokenCount: number,
  type: string
): MlzResponse<UploadRes> =>
  Axios({
    url: `https://codecamp-admin.codemao.cn/cdn/qiniu/token/${tokenCount}?prefix=codecamp&type=${type}`,
    timeout: 20000,
    method: 'GET',
  });

/**
 * 提交预览数据
 * @param data
 */
export const submitPreviewData = async (data: string) => {
  try {
    const result = await Axios({
      url:
        'https://codecamp-admin.codemao.cn/common/upload/interact-video/config',
      method: 'POST',
      timeout: 1000 * 20,
      data: {
        timeout: 60 * 60 * 24 * 20, // 20天
        data,
      },
    });
    if (!result.data) {
      throw Error();
    }
    return result.data as string;
  } catch (e) {
    throw Error('SUBMIT_PREVIEW_ERROR');
  }
};
