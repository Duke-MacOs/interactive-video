/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as _ from 'lodash';
import { v4 } from 'uuid';
import * as fs from '../utils/fs';
import * as IITV from '../interface/ITV-interface';
import * as INative from '../interface/native-interface';
import * as IAssets from '../interface/assets-interface';
import { nativeState } from '../boilerplate/nativeStore';
import { MAKERVERSION, ITVVERSION, TANYUE_ITVVERION } from '../config';
import * as nativeTemplate from '../boilerplate/nativeStore';
import { getLocalAssetPath } from '../utils/util';

const DefaultAudioRecord = nativeTemplate.audioRecordTemplate;
const DefaultAutoPause = nativeTemplate.autoPauseTemplate;
const DefaultSimpleSelect = nativeTemplate.getSimpleSelectTemplate();
const DefaultVideoRecord = nativeTemplate.videoRecordTemplater;
const DefaultDragNDrop = nativeTemplate.getDragNDropTemplate();
const DefaultBranchStory = nativeTemplate.getBranchStoryTemplate();

class ITVManager {
  private static instance: ITVManager | null = null;

  static ITVMKey: string[] = ['ITVS', 'ITVDict'];

  private ITVM: IITV.ITVM | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): ITVManager {
    if (ITVManager.instance === null) {
      ITVManager.instance = new ITVManager();
    }
    return ITVManager.instance;
  }

  public initialITVMFile() {
    this.ITVM = nativeState;
    return this;
  }

  public getITVMParse() {
    return this.ITVM;
  }

  public getITVMStringify() {
    return this.ITVM ? JSON.stringify(this.ITVM) : null;
  }

  public isValidITVMFile() {
    const obj = JSON.parse(fs.readFileSync(this.getITVMPath()) ?? {});
    let isValid = true;
    let msg = '';
    let data = obj;
    if (_.isObject(obj)) {
      // ITVM 合法性校验
      // 需兼容旧版 ITVM
      if ((obj as any).stories) {
        const { nativeState, assetsState } = this.transverOldItvToNative(obj);
        data = {
          nativeState,
          assetsState,
        };
      } else {
        // 新版 itvm 文件需要判断资源 path 路径和 work_path 是否一致
        // 有可能项目是在 A 电脑创建，但是复制到 b 电脑上打开，导致路径不一致
        // 需要进行修正
        data.assetsState = this.amendAssetPath(data.assetsState);
      }
    } else {
      isValid = false;
      msg = 'ITVM 文件非法';
    }

    return { isValid, msg, data };
  }

  public getITVMPath() {
    return `${window.__WORK_DIR__ ?? ''}/data.itvm`;
  }

  public generatorITVM(
    nativeState: INative.NativeStore,
    assetsState: IAssets.AssetList
  ) {
    return JSON.stringify({
      nativeState,
      assetsState,
    });
  }

  /**
   * 资源路径修正
   * @param assetsState
   */
  private amendAssetPath(assetsState: IAssets.AssetList) {
    const { videoDict, audioDict, imageDict, lottieDict } = assetsState;

    Object.values(videoDict).forEach((v) => {
      assetsState.videoDict[v.uid].path = getLocalAssetPath(v.path);
    });

    Object.values(audioDict).forEach((a) => {
      assetsState.audioDict[a.uid].path = getLocalAssetPath(a.path);
    });

    Object.values(imageDict).forEach((i) => {
      assetsState.imageDict[i.uid].path = getLocalAssetPath(i.path);
    });

    Object.values(lottieDict).forEach((l) => {
      assetsState.lottieDict[l.uid].path = getLocalAssetPath(l.path);
    });

    return assetsState;
  }

  /**
   * 老版 itvm 转换为 native store
   */
  public transverOldItvToNative(oldData: IITV.OldITVM) {
    const videoDict = {};
    const audioDict = {};
    const imageDict = {};
    const lottieDict = {};
    Object.values(oldData.videos).forEach((video) => {
      if (fs.existsSync(`${window.__WORK_DIR__}/${video.localPath}`)) {
        videoDict[video.md5] = {
          uid: video.md5,
          path: getLocalAssetPath(video.localPath),
          isValid: true,
          cdnUrl: video.cdnUrl,
          name: '',
          size: video.size,
          isLibrary: false,
          duration: video.duration,
          pixels: video.size,
          next: null,
          allowChangeProgress: true,
        };
      }
    });
    Object.values(oldData.audios).forEach((audio) => {
      if (fs.existsSync(`${window.__WORK_DIR__}/${audio.localPath}`)) {
        audioDict[audio.md5] = {
          uid: audio.md5,
          path: getLocalAssetPath(audio.localPath),
          isValid: true,
          cdnUrl: audio.cdnUrl,
          name: '',
          size: audio.size,
          isLibrary: false,
          duration: 0,
        };
      }
    });
    Object.values(oldData.images).forEach((image) => {
      if (fs.existsSync(`${window.__WORK_DIR__}/${image.localPath}`)) {
        imageDict[image.md5] = {
          uid: image.md5,
          path: getLocalAssetPath(image.localPath),
          isValid: true,
          cdnUrl: image.cdnUrl,
          name: '',
          size: image.size,
          isLibrary: false,
        };
      }
    });
    Object.values(oldData.effects).forEach((lottie) => {
      if (fs.existsSync(`${window.__WORK_DIR__}/${lottie.localPath}`)) {
        lottieDict[lottie.md5] = {
          uid: lottie.md5,
          path: getLocalAssetPath(lottie.localPath),
          isValid: true,
          cdnUrl: lottie.cdnUrl,
          name: '',
          size: lottie.size,
          isLibrary: false,
        };
      }
    });
    const assetsList = {
      videoDict,
      audioDict,
      imageDict,
      lottieDict,
    };
    const videoTrackuid = v4();
    const effectTrackuid = v4();
    const nativeState: INative.NativeStore = {
      ITVS: [oldData.courseId],
      ITVDict: {
        [oldData.courseId]: {
          name: '未命名',
          uid: oldData.courseId,
          effectTrack: [effectTrackuid],
          videoTrack: [videoTrackuid],
          segments: [],
        },
      },
      videoTrackDict: {
        [videoTrackuid]: {
          uid: videoTrackuid,
          parentITVId: oldData.courseId,
          videos: [],
        },
      },
      effectTrackDict: {
        [effectTrackuid]: {
          uid: effectTrackuid,
          parentITVId: oldData.courseId,
          interactNodes: [],
        },
      },
      segmentNodeDict: {},
      interactNodeDict: {},
    };

    let prevVideoTotalDuration = 0;
    oldData.stories.forEach((story) => {
      const video = assetsList.videoDict[story.vidFilename];
      video.next = story.next
        ? {
            videoId: story.next?.storyId ?? '',
            segmentNodeId: story.next?.segmentNodeId,
          }
        : null;
      video.allowChangeProgress = story.allowChangeProgress;
      nativeState.videoTrackDict[videoTrackuid].videos.push(story.vidFilename);
      story.timeNodes.forEach((timeNode: IITV.TimeNode) => {
        if (timeNode.type === 'segment') {
          const segmentNode = {
            uid: timeNode.id,
            name: '未命名',
            parentITVId: oldData.courseId,
            type: 'SegmentNodeType' as INative.SegmentNodeType,
            parentVideoId: timeNode.parentStoryId,
            thumbPath: getLocalAssetPath(timeNode.thumb),
            time: timeNode.time,
            next: timeNode.next
              ? {
                  videoId: timeNode.next?.storyId ?? '',
                  segmentNodeId: timeNode.next?.segmentNodeId ?? '',
                }
              : null,
            allowChangeProgress: timeNode.allowChangeProgress,
          };
          nativeState.segmentNodeDict[timeNode.id] = segmentNode;
          nativeState.ITVDict[oldData.courseId]?.segments.push(timeNode.id);
        }
        if (timeNode.type === 'interact') {
          const interactNode = {
            uid: timeNode.id,
            name: '未命名',
            parentITVId: oldData.courseId,
            type: 'InteractNode' as INative.InteractiveNodeType,
            parentTrackId: effectTrackuid,
            virtualTime: (prevVideoTotalDuration + timeNode.time) * 1000,
            node: {},
          };
          if (timeNode.interact?.type === 'audio-record') {
            interactNode.node = {
              type: INative.InteractsType.AUDIO_RECORD,
              duration: timeNode.interact?.duration,
              mode: timeNode.interact?.mode ?? DefaultAudioRecord.mode,
              repeatNum:
                timeNode.interact?.repeatNum ?? DefaultAudioRecord.repeatNum,
              isOpenEffect:
                timeNode.interact?.isOpenEffect ??
                DefaultAudioRecord.isOpenEffect,
              correctSoundFilename:
                timeNode.interact?.correctSetting?.soundFileName ??
                DefaultAudioRecord.correctSoundFilename,
              wrongSoundFilename:
                timeNode.interact?.wrongSetting?.soundFileName ??
                DefaultAudioRecord.wrongSoundFilename,
              correctEffectFileName:
                timeNode.interact?.correctSetting?.effectFileName ??
                DefaultAudioRecord.correctEffectFileName,
              wrongEffectFileName:
                timeNode.interact?.wrongSetting?.effectFileName ??
                DefaultAudioRecord.wrongEffectFileName,
              reward: timeNode.interact?.reward ?? DefaultAudioRecord.reward,
            };
          }
          if (timeNode.interact?.type === 'auto-pause') {
            interactNode.node = {
              type: INative.InteractsType.AUTO_PAUSE,
              operation:
                timeNode.interact?.operation ?? DefaultAutoPause.operation,
              pos: timeNode.interact?.pos ?? DefaultAutoPause.pos,
              size: timeNode.interact?.size ?? DefaultAutoPause.size,
              answerLimitedTime:
                timeNode.interact?.answerLimitedTime ??
                DefaultAutoPause.answerLimitedTime,
            };
          }
          if (timeNode.interact?.type === 'branch-story') {
            interactNode.node = {
              type: INative.InteractsType.BRANCH_STORY,
              loopTime:
                timeNode.interact?.loopTime ?? DefaultBranchStory.loopTime,
              autoLoop:
                timeNode.interact?.autoLoop ?? DefaultBranchStory.autoLoop,
              selections:
                timeNode.interact?.selections.map((select) => {
                  return {
                    ...select,
                    next: select.next
                      ? {
                          videoId: select.next?.storyId,
                          segmentNodeId: select.next?.segmentNodeId,
                        }
                      : null,
                  };
                }) ?? DefaultBranchStory.selections,
              answerLimitedTime:
                timeNode.interact?.answerLimitedTime ??
                DefaultBranchStory.answerLimitedTime,
            };
          }
          if (timeNode.interact?.type === 'drag-n-drop') {
            interactNode.node = {
              type: INative.InteractsType.DRAGNDROP,
              loopTime:
                timeNode.interact?.loopTime ?? DefaultDragNDrop.loopTime,
              autoLoop:
                timeNode.interact?.autoLoop ?? DefaultDragNDrop.autoLoop,
              correctGroups:
                timeNode.interact?.correctGroups ??
                DefaultDragNDrop.correctGroups,
              dragItems:
                timeNode.interact?.dragItems ?? DefaultDragNDrop.dragItems,
              correctSoundFilename:
                timeNode.interact?.correctSoundFilename ??
                DefaultDragNDrop.correctSoundFilename,
              wrongSoundFilename:
                timeNode.interact?.wrongSoundFilename ??
                DefaultDragNDrop.wrongSoundFilename,
              reward: timeNode.interact?.reward ?? DefaultDragNDrop.reward,
              answerLimitedTime:
                timeNode.interact?.answerLimitedTime ??
                DefaultDragNDrop.answerLimitedTime,
            };
          }
          if (timeNode.interact?.type === 'simple-select') {
            interactNode.node = {
              type: INative.InteractsType.SIMPLE_SELECT,
              loopTime:
                timeNode.interact?.loopTime ?? DefaultSimpleSelect.loopTime,
              autoLoop:
                timeNode.interact?.autoLoop ?? DefaultSimpleSelect.autoLoop,
              selections:
                timeNode.interact?.selections ?? DefaultSimpleSelect.selections,
              correctSelectId:
                timeNode.interact?.correctSelectId ??
                DefaultSimpleSelect.correctSelectId,
              correctSoundFilename:
                timeNode.interact?.correctSoundFilename ??
                DefaultSimpleSelect.correctSoundFilename,
              wrongSoundFilename:
                timeNode.interact?.wrongSoundFilename ??
                DefaultSimpleSelect.wrongSoundFilename,
              reward: timeNode.interact?.reward ?? DefaultSimpleSelect.reward,
              answerLimitedTime:
                timeNode.interact?.answerLimitedTime ??
                DefaultSimpleSelect.answerLimitedTime,
            };
          }
          if (timeNode.interact?.type === 'video-record') {
            interactNode.node = {
              type: INative.InteractsType.VIDEO_RECORD,
              autoOff: timeNode.interact?.autoOff ?? DefaultVideoRecord.autoOff,
              duration:
                timeNode.interact?.duration ?? DefaultVideoRecord.duration,
              pos: timeNode.interact?.pos ?? DefaultVideoRecord.pos,
              size: timeNode.interact?.size ?? DefaultVideoRecord.size,
              decorateImage:
                timeNode.interact?.decorateImage ??
                DefaultVideoRecord.decorateImage,
            };
          }
          // @ts-ignore
          nativeState.interactNodeDict[interactNode.uid] = interactNode;
          // @ts-ignore
          nativeState.effectTrackDict[effectTrackuid]?.interactNodes.push(
            interactNode.uid
          );
        }
      });
      prevVideoTotalDuration += video?.duration ?? 0;
    });
    return { assetsState: assetsList, nativeState };
  }

  /**
   * 导出 itv 时转换
   * native Interface -> IItv Interface
   */
  public getTransverRunningMan(
    nativeState: INative.NativeStore,
    assetsState: IAssets.AssetList
  ) {
    const run = () => {
      const { ITVDict } = nativeState;
      return nativeState.ITVS.map((itvId: string) => {
        const itv = ITVDict[itvId];
        console.log('itv: ', itv);
        const transverterStory = getTransverterStory(itv);
        const transverterAssets = getTransverterAssets(assetsState);
        const normal = transverterStory.normalConfig();
        const interactNode = transverterStory.interactConfig();
        const segmentNode = transverterStory.segmentConfig();

        // 将 interactNode 和 segmentNode 合并并排序，适用于 ITV-interface
        const timeNodes: IITV.TimeNode[] = _.filter(
          [...interactNode, ...segmentNode],
          (i) => i !== null && i.time !== null
        );

        const stories = transverterStory.storyConfig().map((story) => {
          story.timeNodes = _.filter(
            timeNodes,
            (node) => node?.parentStoryId === story.id
          );
          return story;
        });
        const result: IITV.ITV = {
          ...normal,
          stories,
          videos: transverterAssets.videos(),
          audios: transverterAssets.audios(),
          images: transverterAssets.images(),
          effects: transverterAssets.effects(),
        };
        return result;
      });
    };
    const getTransverterAssets = (assetsState: IAssets.AssetList) => {
      const transverter = {
        videos: () => {
          const result = {};
          Object.values(assetsState.videoDict).forEach((video) => {
            result[video.uid] = {
              cdnUrl: video.cdnUrl,
              size: video.pixels,
              duration: video.duration,
            };
          });
          return result;
        },
        audios: () => {
          const result = {};
          Object.values(assetsState.audioDict).forEach((audio) => {
            result[audio.uid] = {
              cdnUrl: audio.cdnUrl,
              duration: audio.duration,
            };
          });
          return result;
        },
        images: () => {
          const result = {};
          Object.values(assetsState.imageDict).forEach((image) => {
            result[image.uid] = {
              cdnUrl: image.cdnUrl,
            };
          });
          return result;
        },
        effects: () => {
          const result = {};
          Object.values(assetsState.lottieDict).forEach((effect) => {
            result[effect.uid] = {
              cdnUrl: effect.cdnUrl,
            };
          });
          return result;
        },
      };
      return transverter;
    };
    const getTransverterStory = (itv: INative.ITV) => {
      const {
        videoTrackDict,
        segmentNodeDict,
        interactNodeDict,
        effectTrackDict,
      } = nativeState;
      const { videoDict } = assetsState;
      // 目前只有一条视频轨道
      const videoTrackId = itv.videoTrack[0];
      const videoTrack = videoTrackDict[videoTrackId];
      const videosId = videoTrack.videos;
      const videos = videosId.map((id) => videoDict[id]).filter((v) => v);

      const getRealInteractNode = (
        videos: IAssets.Video[],
        node: INative.InteractNode
      ) => {
        let durationTotal = 0;
        let time = null;
        let parentVideoId = null;
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const prevDurationTotal = durationTotal;
          durationTotal += video.duration;
          if (node.virtualTime <= durationTotal * 1000) {
            parentVideoId = video.uid;
            time = node.virtualTime / 1000 - prevDurationTotal;
            break;
          }
        }
        return { parentVideoId, time };
      };

      const transverter = {
        // 常规配置
        normalConfig: () => {
          itv.name;
          return {
            MakerVersion: MAKERVERSION, // 制课工具版本号
            courseId: itv.uid,
            version: ITVVERSION, // 小火箭 - 版本
            tanyueVersion: TANYUE_ITVVERION, // 探月 - 版本
            name: itv.name,
            sections: [], // 课节数组（一般有且至少有一个课节）
          };
        },

        // story 配置（videoTrack）
        storyConfig: () => {
          return _.flattenDeep(
            itv.videoTrack.map((videoTrackId) => {
              const videoTrack = videoTrackDict[videoTrackId];
              const videos = videoTrack?.videos;
              return videos.map(
                (v, idx): IITV.Story => {
                  const video = videoDict[v];
                  return {
                    id: video.uid,
                    name: video.name,
                    vidFilename: video.uid,
                    timeNodes: [],
                    allowChangeProgress: video.allowChangeProgress,
                    next: video.next
                      ? {
                          storyId: video.next?.videoId ?? '',
                          segmentNodeId: video.next?.segmentNodeId ?? '',
                        }
                      : null,
                  };
                }
              );
            })
          );
        },
        // 分段节点配置（segments, segmentNodeDict）
        segmentConfig: () => {
          return itv.segments.map((i) => {
            const node = segmentNodeDict[i];
            return node
              ? {
                  id: node.uid,
                  type: 'segment',
                  parentStoryId: node.parentVideoId,
                  time: node.time / 1000, // 时间(秒)
                  allowChangeProgress: node.allowChangeProgress, // 允许用户拖动进度条
                  next: node.next,
                  thumb: node.thumbPath,
                }
              : null;
          });
        },
        // 交互节点配置（effectTrack）
        interactConfig: () => {
          return _.flattenDeep(
            itv.effectTrack.map((trackId: string) => {
              const track = effectTrackDict[trackId];
              return track.interactNodes.map((i) => {
                const node = interactNodeDict[i];
                if (!node) return null;
                const { parentVideoId, time } = getRealInteractNode(
                  videos,
                  node
                );
                if (!parentVideoId || !time) return null;
                const result = {
                  id: node.uid,
                  name: node.name,
                  type: 'interact',
                  parentStoryId: parentVideoId,
                  // time: time + 0.004895, // 时间(秒)
                  time,
                  interact: {},
                };
                // 录音节点
                if (node.node.type === INative.InteractsType.AUDIO_RECORD) {
                  result.interact = {
                    type: 'audio-record',
                    duration: node.node.duration,
                    mode: node.node.mode,
                    repeatNum: node.node.repeatNum,
                    isOpenEffect: node.node.isOpenEffect,
                    correctSetting: {
                      soundFileName: node.node.correctSoundFilename,
                      effectFileName: node.node.correctEffectFileName,
                    },
                    wrongSetting: {
                      soundFileName: node.node.wrongSoundFilename,
                      effectFileName: node.node.wrongEffectFileName,
                    },
                    reward: node.node.reward,
                  };
                }
                // 自动暂停
                if (node.node.type === INative.InteractsType.AUTO_PAUSE) {
                  result.interact = {
                    type: 'auto-pause',
                    operation: node.node.operation,
                    pos: node.node.pos,
                    size: node.node.size,
                    answerLimitedTime: node.node.answerLimitedTime,
                  };
                }
                // 分支故事
                if (node.node.type === INative.InteractsType.BRANCH_STORY) {
                  result.interact = {
                    type: 'branch-story', // 类型，固定值
                    loopTime: node.node.loopTime,
                    autoLoop: node.node.autoLoop,
                    selections: node.node.selections.map((select) => {
                      return {
                        ...select,
                        next: select.next
                          ? {
                              storyId: select.next?.videoId ?? '',
                              segmentNodeId: select.next?.segmentNodeId ?? '',
                            }
                          : null,
                      };
                    }),
                    answerLimitedTime: node.node.answerLimitedTime,
                  };
                }
                // 拖拽题
                if (node.node.type === INative.InteractsType.DRAGNDROP) {
                  result.interact = {
                    type: 'drag-n-drop',
                    loopTime: node.node.loopTime,
                    autoLoop: node.node.autoLoop,
                    correctGroups: node.node.correctGroups,
                    dragItems: node.node.dragItems,
                    correctSoundFilename: node.node.correctSoundFilename,
                    wrongSoundFilename: node.node.wrongSoundFilename,
                    reward: node.node.reward,
                    answerLimitedTime: node.node.answerLimitedTime,
                  };
                }
                // 简单选择
                if (node.node.type === INative.InteractsType.SIMPLE_SELECT) {
                  result.interact = {
                    type: 'simple-select', // 类型，固定值
                    loopTime: node.node.loopTime,
                    autoLoop: node.node.autoLoop,
                    selections: node.node.selections,
                    correctSelectId: node.node.correctSelectId,
                    correctSoundFilename: node.node.correctSoundFilename,
                    wrongSoundFilename: node.node.wrongSoundFilename,
                    reward: node.node.reward,
                    answerLimitedTime: node.node.answerLimitedTime,
                  };
                }
                // 视频开窗
                if (node.node.type === INative.InteractsType.VIDEO_RECORD) {
                  result.interact = {
                    type: 'video-record',
                    autoOff: node.node.autoOff,
                    duration: node.node.duration,
                    pos: node.node.pos,
                    size: node.node.size,
                    decorateImage: node.node.decorateImage,
                  };
                }
                return result;
              });
            })
          );
        },
      };
      return transverter;
    };
    return run;
  }
}

export default ITVManager;
