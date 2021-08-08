import { useDispatch } from 'react-redux';
import * as _ from 'lodash';
import { message, Modal } from 'antd';
import useAssetsState from './useAssetsState';
import useSystemState from './useSystemState';
import useNativeState from './useNativeState';
import * as fs from '../utils/fs';
import {
  getFileType,
  isUserDataPath,
  getAppResources,
  isScreenshotPath,
} from '../utils/util';
import { actionAddAsset, actionInitialAssets } from '../redux/assetsStore';
import { AssetsType, Video, Audio } from '../interface/assets-interface';
import * as INative from '../interface/native-interface';
import {
  getMediaInfo,
  getVideoIFrames,
  getVideoIFrameByTime,
} from '../utils/ffmpeg';

import {
  videosType,
  audiosType,
  imagesType,
  lottiesType,
  UserDatePath,
} from '../config';
import { store } from '../redux/rootReducer';

const path = require('path');

interface IAddAssetResult {
  type: AssetsType;
  value: {
    uid: string;
    path: string;
    isValid: boolean;
    name: string;
    duration?: number;
  };
}

// 根据素材库名称匹配资源
const mapLibraryAssetsName = {
  aduan_good: {
    fileName: '阿短-太棒啦.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624518924145阿短-太棒啦.mp3',
  },
  aduan_think_more: {
    fileName: '阿短-再想一想吧.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519225450阿短-再想一想吧.mp3',
  },
  codemao_good: {
    fileName: '编程猫-太棒啦.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624518969182编程猫-太棒啦.mp3',
  },
  codemao_try_again: {
    fileName: '编程猫-再试一试吧.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519229566编程猫-再试一试吧.mp3',
  },
  codemao_think_meow: {
    fileName: '编程猫-再想想喵.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519233743编程猫-再想想喵.mp3',
  },
  good: {
    fileName: '不错哦.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519014572不错哦.mp3',
  },
  continue_hardwork: {
    fileName: '继续努力.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519148091继续努力.mp3',
  },
  lovely_cartoon_plant: {
    fileName: '可爱的卡通植物.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519206758可爱的卡通植物.mp3',
  },
  choose_correct_answer: {
    fileName: '快来选一选正确答案吧.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519237995快来选一选正确答案吧.mp3',
  },
  you_are_great: {
    fileName: '你真棒.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519019517你真棒.mp3',
  },
  victory: {
    fileName: '胜利.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519025921胜利.mp3',
  },
  victory_effect: {
    fileName: '胜利音效.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519030514胜利音效.mp3',
  },
  failed_short: {
    fileName: '失败 短.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519161861失败 短.mp3',
  },
  mouse_click: {
    fileName: '鼠标音.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519211108鼠标音.mp3',
  },
  click_correct_juggle: {
    fileName: '小朋友，点一点正确的积木吧！.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519250063小朋友，点一点正确的积木吧！.mp3',
  },
  correct_short: {
    fileName: '正确（短）.mp3',
    cdnUrl:
      'https://online-education.codemao.cn/444/1624519034401正确（短）.mp3',
  },
  bling: {
    fileName: 'bling.mp3',
    cdnUrl: 'https://online-education.codemao.cn/444/1624519048413bling.mp3',
  },
};

const useAssetsManager = () => {
  const dispatch = useDispatch();
  const { systemDispatch } = useSystemState();
  const { nativeDispatch, nativeQueryTool } = useNativeState();
  const { assetsQueryTool, assetsDispatch } = useAssetsState();

  // isLibrary: 表示是否是素材库的素材
  const handleAssetsType = async (
    type: string,
    path: string,
    isLibrary: boolean
  ) => {
    let result;
    if (videosType.includes(type)) {
      result = await assetsManager.addAsset(AssetsType.VIDEO, path, isLibrary);
    } else if (imagesType.includes(type)) {
      result = await assetsManager.addAsset(AssetsType.IMAGE, path, isLibrary);
    } else if (audiosType.includes(type)) {
      result = await assetsManager.addAsset(AssetsType.AUDIO, path, isLibrary);
    } else if (lottiesType.includes(type)) {
      result = await assetsManager.addAsset(AssetsType.LOTTIE, path, isLibrary);
    }
    return result;
  };

  const getFiles = () => {
    return new Promise((resolve, reject) => {
      if (window.__WORK_DIR__) {
        fs.getFiles(
          window.__WORK_DIR__,
          async (err: any, results: string[]) => {
            for (let i = 0; i < results?.length; i++) {
              // eslint-disable-next-line no-await-in-loop
              const type = await getFileType(results[i]);
              // eslint-disable-next-line no-await-in-loop
              await handleAssetsType(type, results[i], false);
            }
            resolve('done');
          }
        );
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('遍历文件出错，无法获取 __WORK_DIR__');
      }
    });
  };

  const hasVideoVFrames = (id: string) => {
    const path = `${window.__WORK_DIR__}${UserDatePath}/vframes/${id}`;
    return fs.existsSync(path);
  };

  const handleUnExistAsset = async (id: string, type: AssetsType) => {
    // 删除 assetStore
    assetsDispatch.deleteAsset(type, id);

    // 视频资源检测
    if (type === AssetsType.VIDEO) {
      // 检查所有视频轨
      const videoTracks = nativeQueryTool.getAllVideoTracks();
      videoTracks.forEach((track) => {
        const idx = track.videos.indexOf(id);
        if (idx !== -1) {
          nativeDispatch.deleteVideoOnVideoTrackId(
            track.videos[idx],
            track.uid
          );
        }
      });
    }

    // 音频资源检测
    if (type === AssetsType.AUDIO) {
      const interactNodes = nativeQueryTool.getAllInteractNodes();

      // 节点使用情况检测
      interactNodes.forEach((node) => {
        if (
          node.node.type === INative.InteractsType.SIMPLE_SELECT ||
          node.node.type === INative.InteractsType.DRAGNDROP ||
          node.node.type === INative.InteractsType.AUDIO_RECORD
        ) {
          if (node.node.correctSoundFilename === id) {
            const _node = _.cloneDeep(node);
            (_node.node as any).correctSoundFilename = '';
            nativeDispatch.updateInteractiveNode(_node);
          } else if (node.node.wrongSoundFilename === id) {
            const _node = _.cloneDeep(node);
            (_node.node as any).correctSoundFilename = '';
            nativeDispatch.updateInteractiveNode(_node);
          }
        }
      });
    }

    // 图片资源检测
    if (type === AssetsType.IMAGE) {
      const interactNodes = nativeQueryTool.getAllInteractNodes();
      interactNodes.forEach((node) => {
        if (node.node.type === INative.InteractsType.DRAGNDROP) {
          const _node = _.cloneDeep(node);
          (_node.node as INative.DragNDrop).dragItems.forEach((item) => {
            if (item.imgFilename === id) {
              item.imgFilename = '';
            }
          });
          nativeDispatch.updateInteractiveNode(_node);
        }
        if (node.node.type === INative.InteractsType.VIDEO_RECORD) {
          if (node.node.decorateImage.imgFilename === id) {
            const _node = _.cloneDeep(node);
            (_node.node as INative.VideoRecord).decorateImage.imgFilename = '';
            nativeDispatch.updateInteractiveNode(_node);
          }
        }
      });
    }

    // 动效资源检测
    if (type === AssetsType.LOTTIE) {
      const interactNodes = nativeQueryTool.getAllInteractNodes();
      interactNodes.forEach((node) => {
        if (node.node.type === INative.InteractsType.AUDIO_RECORD) {
          if (node.node.correctEffectFileName === id) {
            const _node = _.cloneDeep(node);
            (_node.node as INative.AudioRecord).correctEffectFileName = '';
            nativeDispatch.updateInteractiveNode(_node);
          }
          if (node.node.wrongEffectFileName === id) {
            const _node = _.cloneDeep(node);
            (_node.node as INative.AudioRecord).wrongEffectFileName = '';
            nativeDispatch.updateInteractiveNode(_node);
          }
        }
      });
    }
  };

  const assetsManager = {
    initialAssetsState: async () => {
      assetsManager.cleanAssets();
      await getFiles();
    },
    cleanAssets: () => {
      dispatch(actionInitialAssets());
      return assetsManager;
    },
    copyFile: async (src: string): Promise<IAddAssetResult | undefined> => {
      const name = src.split('/').pop();
      const path = `${window.__WORK_DIR__}/${name}`;
      const type = await getFileType(src);
      let result;
      if (fs.existsSync(src)) {
        if (!fs.existsSync(path)) {
          fs.copyFile(src, path);
          // 由于复制视频到系统后，系统需要隔一段时间才能读取到文件
          const wait = () => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                const result = handleAssetsType(type, path, false);
                resolve(result);
              }, 500);
            });
          };
          result = await wait();
        } else {
          const value = assetsQueryTool.getAssetByPath(path);
          if (value) {
            result = {
              type,
              value,
            };
          }
        }
      }
      return result;
    },
    addAsset: async (type: AssetsType, path: string, isLibrary: boolean) => {
      // 应用生成的用户数据不纳入资源计算范围，例如：视频帧
      if (isUserDataPath(path) || isScreenshotPath(path)) return undefined;

      console.log('path: ', path);
      const md5 = fs.getFileMd5(path);
      console.log('md5: ', md5);
      const name = path.split('/').pop() ?? '';

      const { size } = fs.statSync(path);
      let libraryValues = {};
      if (isLibrary) {
        const findKey = name.split('.')[0];
        const { fileName, cdnUrl } = mapLibraryAssetsName[findKey] || {};
        if (!cdnUrl) return;
        libraryValues = {
          name: fileName,
          cdnUrl,
        };
      }
      // state 里面有值的话，覆盖属性
      const assetState = assetsQueryTool.getAssetByMd5(md5);
      const value = {
        uid: md5,
        path,
        isValid: true,
        name,
        cdnUrl: assetState?.cdnUrl ?? '',
        duration: 0,
        size,
        pixels: { width: 0, height: 0 },
        isLibrary,
        ...libraryValues,
        next: assetState?.next ?? null,
        allowChangeProgress: assetState?.allowChangeProgress ?? true,
      };
      const params = {
        type,
        value,
      };

      if (type === AssetsType.VIDEO) {
        const metadata = await getMediaInfo(path);
        console.log('metadata: ', metadata);
        const meta = metadata.streams.filter(
          (item) => item.codec_type === 'video'
        );
        const { duration } = metadata.format;
        const { width, height } = meta[0];

        if (width && height && duration) {
          params.value.duration = Number(duration);
          params.value.pixels = { width, height };
          // 获取视频帧
          await assetsManager.getVideosIFrams([value]);
        } else {
          message.warning('非法资源，已自动删除');
          assetsDispatch.deleteAsset(type, md5);
          fs.deleteFile(path);
          return;
        }
      } else if (type === AssetsType.AUDIO) {
        const metadata = await getMediaInfo(path);
        const { duration = 0 } = metadata.streams[0];
        params.value.duration = Number(duration);
        delete params.value.pixels;
        delete params.value.next;
        delete params.value.allowChangeProgress;
      } else {
        delete params.value.duration;
        delete params.value.pixels;
        delete params.value.next;
        delete params.value.allowChangeProgress;
      }
      console.log('params: ', params);

      dispatch(actionAddAsset(params));

      return params;
    },
    /**
     * 获取视频缩略图
     * id: video md5
     * index: 缩略图下标
     */
    getVideoVFramePath: (id: string, index: number) => {
      if (!hasVideoVFrames(id)) {
        message.warning('获取视频 vframes 失败');
        return '';
      }
      const path = `${window.__WORK_DIR__}${UserDatePath}/vframes/${id}/index-${index}.png`;
      return fs.existsSync(path) ? path : '';
    },
    getVideosIFrams: async (videos: Video[]) => {
      console.log('videos:', videos);
      const getItemIFrames = async () => {
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const folder = `${window.__WORK_DIR__}/.userData/vframes/${video.uid}`;
          await getVideoIFrameByTime(
            video?.path,
            `index-${i + 1}.png`,
            1,
            folder
          );
        }
      };
      await getItemIFrames();
    },
    /**
     * App 激活时，检测所有资源
     */
    checkAllAssets: async () => {
      // 遍历工程文件夹下所有资源，以更新资源；
      await getFiles();

      const {
        videoDict,
        imageDict,
        audioDict,
        lottieDict,
      } = assetsQueryTool.getAllAssets();

      const videos = Object.values(videoDict);
      const audios = Object.values(audioDict);
      const images = Object.values(imageDict);
      const lotties = Object.values(lottieDict);

      // 检测资源丢失情况
      // 视频资源检测
      console.log('准备进行资源丢失检测');
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const isExist = await fs.exists(video.path);
        console.info(video.path, ':', isExist);
        !isExist && handleUnExistAsset(video.uid, AssetsType.VIDEO);
      }

      for (let i = 0; i < audios.length; i++) {
        const audio = audios[i];
        const isExist = await fs.exists(audio.path);
        !isExist && handleUnExistAsset(audio.uid, AssetsType.AUDIO);
      }

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const isExist = await fs.exists(image.path);
        !isExist && handleUnExistAsset(image.uid, AssetsType.IMAGE);
      }

      for (let i = 0; i < lotties.length; i++) {
        const lottie = lotties[i];
        const isExist = await fs.exists(lottie.path);
        !isExist && handleUnExistAsset(lottie.uid, AssetsType.LOTTIE);
      }
    },
    /**
     * 获取素材库文件
     */
    getLibraryFiles: () => {
      return new Promise((resolve, reject) => {
        const dirPath =
          process.env.NODE_ENV === 'production'
            ? `${getAppResources()}/src${path.sep}assets`
            : path.join(__dirname, './assets');
        fs.getFiles(dirPath, async (err: any, results: string[]) => {
          for (let i = 0; i < results?.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            const type = await getFileType(results[i]);
            // 这里拿到的是素材库的素材
            // eslint-disable-next-line no-await-in-loop
            await handleAssetsType(type, results[i], true);
          }
          resolve('done');
        });
      });
    },
  };

  /**
   * 获取所有未上传本地资源
   */
  const getLocalAssets = () => {
    const {
      videoDict,
      audioDict,
      imageDict,
      lottieDict,
    } = store.getState().assetsState;

    const filteredVideos = _.filter(videoDict, (asset) => !asset.cdnUrl);
    const filteredAudios = _.filter(audioDict, (asset) => !asset.cdnUrl);
    const filteredImages = _.filter(imageDict, (asset) => !asset.cdnUrl);
    const filteredlotties = _.filter(lottieDict, (asset) => !asset.cdnUrl);

    return {
      filteredVideos,
      filteredAudios,
      filteredImages,
      filteredlotties,
    };
  };

  /**
   * 检测未上传资源都存在本地
   */
  const checkAllAssetExist = () => {
    const {
      filteredVideos,
      filteredAudios,
      filteredImages,
      filteredlotties,
    } = getLocalAssets();

    // 检测是否所有需要上传的文件都存在
    let isAllExists = true;
    const isNotExistsFileName: string[] = [];
    const handleCheckExists = (path: string) => {
      if (!fs.existsSync(path)) {
        isNotExistsFileName.push(`${path}; `);
        isAllExists = false;
      }
    };
    for (let i = 0; i < filteredVideos.length; i++) {
      const video = filteredVideos[i];
      handleCheckExists(video.path);
    }
    for (let i = 0; i < filteredAudios.length; i++) {
      const audio = filteredAudios[i];
      handleCheckExists(audio.path);
    }
    for (let i = 0; i < filteredImages.length; i++) {
      const image = filteredImages[i];
      handleCheckExists(image.path);
    }
    for (let i = 0; i < filteredlotties.length; i++) {
      const lottie = filteredlotties[i];
      handleCheckExists(lottie.path);
    }
    if (!isAllExists) {
      Modal.warning({
        title: '以下资源丢失',
        content: isNotExistsFileName,
      });
    }
  };

  return { assetsManager, getLocalAssets, checkAllAssetExist };
};

export default useAssetsManager;
