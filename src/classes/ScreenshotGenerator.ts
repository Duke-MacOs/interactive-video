/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as _ from 'lodash';
import * as fs from '../utils/fs';

interface IVideoDict {
  [key: string]: {
    time: number;
    canvasId: string;
  }[];
}

type ICanvasItem = {
  time: number;
  canvasId: string;
};

class ScreenshowGenerator {
  private static instance: ScreenshowGenerator | null = null;

  private currentVideoSrc = '';

  private videoElement: HTMLVideoElement;

  private videoDict: IVideoDict = {};

  private canvasId = '';

  private rato = 0;

  constructor() {
    this.videoElement = document.createElement('video');
    this.videoElement.muted = true;
    this.videoElement.autoplay = false;

    this.videoElement.onloadedmetadata = () => {
      this.rato = this.videoElement.videoWidth / this.videoElement.videoHeight;
    };

    this.videoElement.ontimeupdate = () => {
      console.log('videoDict: ', this.videoDict);

      if (this.videoElement.currentTime === 0) {
        this.videoElement.currentTime = 0.1;
        return;
      }
      this.draw(this.canvasId);

      console.log('path: ', this.videoElement.src);
      console.log('currentTime: ', this.videoElement.currentTime);

      const list = this.videoDict[this.currentVideoSrc];
      if (list) {
        const idx = _.findIndex(list, ['canvasId', this.canvasId]);
        const next = list[idx + 1];
        console.log('next: ', next);
        if (next) {
          const { time, canvasId } = next;
          this.canvasId = canvasId;
          this.videoElement.currentTime = time;
        } else {
          // 切换到下一个视频
          const keys = Object.keys(this.videoDict);
          const idx = keys.indexOf(this.currentVideoSrc);
          const nextVideoPath = keys[idx + 1];
          console.log('切换到下一个视频：', idx, keys, this.currentVideoSrc);

          if (idx !== -1 && nextVideoPath) {
            this.setVideoSrc(nextVideoPath);
          }
        }
      }
    };
  }

  public static getInstance(): ScreenshowGenerator {
    if (ScreenshowGenerator.instance === null) {
      ScreenshowGenerator.instance = new ScreenshowGenerator();
    }
    return ScreenshowGenerator.instance;
  }

  private setVideoFirstCanvasId(path: string) {
    const item = this.videoDict[path];
    if (item && item.length !== 0) {
      this.canvasId = item[0].canvasId;
    }
  }

  private setVideoSrc(path: string) {
    if (fs.existsSync(path)) {
      // 切换视频源的同时，要更新 canvasId，以便 ontimeupdate 时，draw 是最新的 canvas
      this.setVideoFirstCanvasId(path);
      this.currentVideoSrc = path;
      this.videoElement.src = path;
      this.videoElement.pause();
      return true;
    }
    return false;
  }

  private draw(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      const context = canvas.getContext('2d');
      context?.fillRect(0, 0, canvas.width, canvas.height);
      context?.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    }
  }

  initialData(videoSrc: string, items: ICanvasItem[]) {
    this.videoDict[videoSrc] = items;

    console.log('canvas data: ', this.videoDict);

    return ScreenshowGenerator.instance;
  }

  removeData(videoSrc: string) {
    delete this.videoDict[videoSrc];
  }

  run() {
    console.log('screenshot run');
    if (!_.isEmpty(this.videoDict)) {
      const path = Object.keys(this.videoDict)[0];
      if (path) {
        this.setVideoSrc(path);
      }
    }
  }
}

export default ScreenshowGenerator;
