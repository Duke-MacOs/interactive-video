import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useSystemState from '../../../../hooks/useSystemState';
import useAssetsState from '../../../../hooks/useAssetsState';
import ScreenshowGenerator from '../../../../classes/ScreenshotGenerator';

const screenshotGenerator = ScreenshowGenerator.getInstance();

interface IProps {
  videoId: string;
}

type ICanvasItem = {
  time: number;
  canvasId: string;
};

const CanvasWidth = 50;
const CanvasHeight = 38;

const CanvasItem = (props: { id: string }) => {
  const { id } = props;

  const customStyle = {
    width: CanvasWidth,
    height: CanvasHeight,
  };

  return <canvas id={id} key={id} style={customStyle} />;
};

const PreviewVideo = (props: IProps) => {
  const { videoId } = props;

  const { assetsQueryTool } = useAssetsState();
  const { systemState } = useSystemState();
  const {
    progressBar: { pxToMs },
  } = systemState;

  const [items, setItems] = useState<ICanvasItem[]>([]);

  useEffect(() => {
    return () => {
      const video = assetsQueryTool.getVideoById(videoId);
      video && screenshotGenerator.removeData(video.path);
    };
  }, []);

  useEffect(() => {
    const video = assetsQueryTool.getVideoById(videoId);
    if (video) {
      const { duration } = video;

      // 一个 canvas 宽度表示的视频时长(s)
      const canvasUnit = (pxToMs * CanvasWidth) / 1000;
      const canvasNum = Math.ceil(duration / canvasUnit);
      const items = [];
      for (let i = 0; i < canvasNum; i++) {
        items.push({
          time: i * canvasUnit,
          canvasId: `${video.uid}-preview-${i}`,
        });
      }
      setItems(items);
    }
  }, [pxToMs]);

  useEffect(() => {
    console.log('items: ', items);
    const video = assetsQueryTool.getVideoById(videoId);
    screenshotGenerator.initialData(video?.path, items);
    setTimeout(() => {
      screenshotGenerator.run();
    }, 0);
  }, [items]);

  return (
    <>
      {items.map((item) => {
        return <CanvasItem id={item.canvasId} key={item.canvasId} />;
      })}
    </>
  );
};

const PreviewVideoPure = (props: IProps) => {
  return useMemo(() => {
    return <PreviewVideo videoId={props.videoId} />;
  }, [props.videoId]);
};

// export default useCallback(PreviewVideo, []);
export default PreviewVideoPure;
