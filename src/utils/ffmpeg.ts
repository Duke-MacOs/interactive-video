import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { thumbPath } from '../config';

const fs = require('fs');
const genThumbnail = require('simple-thumbnail');

let ffmpegpath = require('ffmpeg-static-electron').path.replace(
  'app.asar',
  'app.asar.unpacked'
);
let ffprobepath = require('ffprobe-static-electron').path.replace(
  'app.asar',
  'app.asar.unpacked'
);

// 打包时引用 dist 里的路径
if (process.env.NODE_ENV === 'production') {
  // unix、Linux与win路径分隔符的兼容
  ffmpegpath = ffmpegpath.replace(
    `app${path.sep}bin${path.sep}`,
    `app${path.sep}dist${path.sep}bin${path.sep}`
  );
  ffprobepath = ffprobepath.replace(
    `app${path.sep}bin${path.sep}`,
    `app${path.sep}dist${path.sep}bin${path.sep}`
  );
} else {
  ffmpegpath = ffmpegpath.replace(`/src`, ``);
  ffprobepath = ffprobepath.replace(`/src`, ``);
}

fs.chmodSync(ffmpegpath, '777');
fs.chmodSync(ffprobepath, '777');
ffmpeg.setFfmpegPath(ffmpegpath);
ffmpeg.setFfprobePath(ffprobepath);

export const getMediaInfo = async (
  path: string
): Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    console.log('getMediaInfo: ', path);
    ffmpeg.ffprobe(path, (err: any, metadata: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
};

export const getMediaDuration = async (path: string) => {
  const data = await getMediaInfo(path);
  return data.format?.duration;
};

/**
 * 获取视频 10 张截图
 * @param path 路径
 * @param id 视频 MD5 值
 */
export const getVideoIFrames = (path: string, id: string) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('ffmpeg path: ', path);
      ffmpeg(path)
        .screenshots({
          count: 10,
          // filename: 'thumbnail-at-%s-seconds.png',
          filename: 'index-%i.png',
          folder: `${window.__WORK_DIR__}/.userData/vframes/${id}`,
          size: '320x?',
        })
        .on('end', (err) => {
          console.log('on end error: ', err);
          if (err) {
            reject(err);
          }
          resolve('IFrames done');
        })
        .on('error', (err) => {
          console.log('error: ', err);

          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 获取精确时间的视频帧
 * @param path 视频地址
 * @param time 截图时间帧
 */
export const getVideoIFrameByTime = (
  path: string,
  fileName: string,
  time: number,
  folder?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) {
      const resultPath = `${window.__WORK_DIR__}/${thumbPath}/${fileName}.png`;
      ffmpeg(path)
        .screenshots({
          timestamps: [Math.floor(time / 1000)],
          filename: fileName,
          folder: folder ?? `${window.__WORK_DIR__}/${thumbPath}`,
          size: '320x?',
        })
        .on('end', (err) => {
          if (err) {
            reject(err);
          }
          resolve(resultPath);
        })
        .on('error', (err) => {
          reject(err);
        });
    } else {
      reject(new Error('视频地址不存在'));
    }
  });
};
