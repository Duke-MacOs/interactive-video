import * as INative from './native-interface';

export interface IActionUpdateVideosOnVideoTrackId {
  videos: string[];
  videoTrackId: string;
}

export interface IActionAddVideo {
  videoId: string;
  videoTrackId: string;
  idx?: number;
}

export interface IActionDeleteVideoOnVideoTrackId {
  videoId: string;
  videoTrackId: string;
}

export interface IActionAddInteractiveNode {
  effectTrackId: string;
  node: INative.InteractNode;
}

export interface IActionUpdateInteractiveNode {
  node: INative.InteractNode;
}

export interface IActionBatchUpdateInteractiveNode {
  nodeList: INative.InteractNode[];
}

export interface IActionDeleteInteractiveNode {
  interactiveNodeId: string;
}

export interface IActionAddSegmentNode {
  node: INative.SegmentNode;
}

export interface IActionUpdateSegmentNode {
  node: INative.SegmentNode;
}

export interface IActionDeleteSegmentNode {
  nodeId: string;
}

export interface IActionUpdateItv {
  itvId: string;
  itv: INative.ITV;
}
