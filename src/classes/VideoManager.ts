/* eslint-disable @typescript-eslint/no-unused-expressions */
/**
 * VideoManage
 * 在这里统一管理video组件状态，可以添加播放状态的标记等
 */

class VideoManager {
  private static instance: VideoManager | null = null;

  private videoEle: HTMLVideoElement | null = null;

  private constructor() {
    this.videoEle = null;
  }

  public static getInstance(): VideoManager {
    if (VideoManager.instance === null) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  public bindVideoElement(ele: HTMLVideoElement): void {
    if (this.videoEle !== ele) {
      this.videoEle = ele;
    }
  }

  public getVideoEle(): HTMLVideoElement | null {
    return this.videoEle;
  }

  public getBoundingClientRect(): DOMRect {
    if (!this.videoEle) return new DOMRect();
    return this.videoEle.getBoundingClientRect();
  }

  public getCurrentTime(): number {
    return this.videoEle ? this.videoEle.currentTime : 0;
  }

  public setCurrentTime(time: number): void {
    this.videoEle && (this.videoEle.currentTime = time);
  }

  public getDuration(): number {
    return this.videoEle ? this.videoEle.duration : 0;
  }

  public pause(): void {
    this.videoEle && this.videoEle.src && this.videoEle.pause();
  }

  public play(): void {
    this.videoEle && this.videoEle.src && this.videoEle.play();
  }

  public toggle(): void {
    if (this.videoEle && this.videoEle.getAttribute('src')) {
      if (this.videoEle.paused) {
        this.videoEle?.play();
      } else {
        this.videoEle.pause();
      }
    }
  }

  public load(): void {
    this.videoEle && this.videoEle.load();
  }

  public setOnTimeUpdateListener(callBack: null | (() => void)): void {
    this.videoEle && (this.videoEle.ontimeupdate = callBack);
  }

  public setOnLoadedDataListener(callBack: null | (() => void)): void {
    this.videoEle && (this.videoEle.onloadeddata = callBack);
  }

  public getSrc(): string {
    return this.videoEle ? this.videoEle.src : '';
  }

  public setSrc(src: string): void {
    this.videoEle && (this.videoEle.src = src);
  }

  public paused(): boolean {
    return this.videoEle ? this.videoEle.paused : true;
  }
}
export default VideoManager;
