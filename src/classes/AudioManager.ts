/* eslint-disable @typescript-eslint/no-unused-expressions */
class AudioManager {
  private static instance: AudioManager | null = null;

  private audioEle: HTMLAudioElement | null = null;

  private constructor() {
    this.audioEle = null;
  }

  public static getInstance(): AudioManager {
    if (AudioManager.instance === null) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public bindAudioElement(ele: HTMLAudioElement): void {
    if (this.audioEle !== ele) {
      this.audioEle = ele;
    }
  }

  public setSrc(src: string): void {
    this.audioEle && (this.audioEle.src = src);
  }

  public pause(): void {
    this.audioEle && this.audioEle.pause();
  }

  public play(): void {
    this.audioEle && this.audioEle.play();
  }
}

export default AudioManager;
