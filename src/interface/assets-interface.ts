// in assetsStory
import { RedirectStorySegment } from './native-interface';

export interface Asset {
  uid: string;
  path: string;
  isValid: boolean;
  cdnUrl: string;
  name: string;
  size: number;
  isLibrary: boolean;
}

export enum AssetsType {
  VIDEO = 'video',
  AUDIO = 'audio',
  LOTTIE = 'lottie',
  IMAGE = 'image',
}

interface Thumb {
  uid: string;
  path: string;
}

export interface Video extends Asset {
  duration: number;
  pixels: { width: number; height: number };
  next: RedirectStorySegment;
  allowChangeProgress: boolean;
}

export type Lottie = Asset;

export interface Audio extends Asset {
  duration: number;
}

export type Image = Asset;

interface ThumbDict {
  [key: string]: Thumb;
}

export interface VideoDict {
  [key: string]: Video;
}

export interface LottieDict {
  [key: string]: Lottie;
}

export interface AduioDict {
  [key: string]: Audio;
}

export interface ImageDict {
  [key: string]: Image;
}

export interface AssetList {
  videoDict: VideoDict;
  audioDict: AduioDict;
  imageDict: ImageDict;
  lottieDict: LottieDict;
}
