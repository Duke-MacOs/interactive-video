/* eslint-disable no-restricted-globals */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
/* eslint-disable no-multi-assign */
/* eslint-disable no-nested-ternary */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import useSystemState from '../../../../hooks/useSystemState';
import useNativeState from '../../../../hooks/useNativeState';
import { DefaultGap, TrackNameWidth } from '../../../../config';
import { getPxToMs, getDurationFormatMS } from '../../../../utils/util';
import VideoManager from '../../../../classes/VideoManager';
import MenuLeft from '../menu/menu-left';

const videoManager = VideoManager.getInstance();
const gap = DefaultGap;

const ProgressBar = () => {
  const { systemState, systemDispatch } = useSystemState();
  const { nativeState, nativeQueryTool } = useNativeState();
  const { progressBar, isPlaying } = systemState;
  const { videoTrackDict } = nativeState;
  const { scale, pxToMs } = progressBar;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlayingRef = useRef<boolean>(false);
  const progressBarContainerRef = useRef<HTMLDivElement>(null);
  const mouseDownIsPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const generator = () => {
    if (!canvasRef.current) return;
    const containerWidth = progressBarContainerRef.current
      ? progressBarContainerRef.current.getBoundingClientRect().width
      : 0;
    const containerHeight = progressBarContainerRef.current
      ? progressBarContainerRef.current.getBoundingClientRect().height
      : 0;
    const c = canvasRef.current;
    const canvasHeight = containerHeight;

    const totalDuration = nativeQueryTool.getCurrentVideosDuration();

    console.log('totalDuration: ', totalDuration);

    const canvasWidth = Math.max(totalDuration / pxToMs + 200, containerWidth);
    // const canvasWidth = containerWidth + 1000;
    c.width = canvasWidth;
    c.height = canvasHeight;

    const ctx = c.getContext('2d');
    if (!ctx) return;
    // 绘制背景区域
    ctx.fillStyle = '#1D1D1D';
    // ctx.fillRect(0, 0, 1386, 59);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const drawLine = (ctx: CanvasRenderingContext2D) => {
      const lineNum = Math.ceil(canvasWidth / 10);
      const bHeight = 20;
      const mHeight = 15;
      const sHeight = 10;
      const pillarWidth = 2;
      let x = 1;
      const y = canvasHeight / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = pillarWidth;
      ctx.strokeStyle = '#787878';

      for (let i = 0; i <= lineNum; i++) {
        const pillarIndex = i % 10;

        const h =
          pillarIndex === 0 ? bHeight : pillarIndex === 5 ? mHeight : sHeight;

        ctx.lineTo(x, y - h);
        x += gap;
        ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawFont = (ctx: CanvasRenderingContext2D) => {
      const formatDate = (s: number) => {
        let h;
        let m;
        h = m = 0;
        m = (s / 60) >> 0;
        s %= 60;
        h = (m / 60) >> 0;
        m %= 60;
        return `${m >= 10 ? '' : '0'}${m}:${s >= 10 ? '' : '0'}${s}.00`;
      };

      let x = 0;
      const gap = 10;
      const fontSize = 12;
      const y = canvasHeight / 2 + fontSize + 5;
      const pillarLen = 10 * gap;
      const bPillarNum = Math.ceil(canvasWidth / 100);
      ctx.font = `normal normal 100 ${fontSize}px arial`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 1;
      for (let i = 0; i <= bPillarNum; i++) {
        ctx.strokeText(formatDate(i * scale), x, y);
        x += pillarLen;
      }
    };

    // 绘制线条
    drawLine(ctx);
    drawFont(ctx);
  };

  const generator_ = useCallback(generator, [scale]);

  // 窗口改变时重绘
  useEffect(() => {
    window.onresize = () => {
      generator_();
      // setSizeChange(Math.random());
    };
  }, [generator_]);

  // 缩放时或容器初始化时或当前视频时长改变时重绘
  useEffect(() => {
    generator_();
  }, [scale, progressBarContainerRef.current]);

  useEffect(() => {
    console.log('videoTrackDict change: ', videoTrackDict);
    generator_();
  }, [videoTrackDict]);

  const handleClickCanvas = useCallback(
    (e) => {
      console.log('!!!!');
      const virtualTime =
        (e.clientX - TrackNameWidth + progressBar.scrollLeft) *
        progressBar.pxToMs;
      !isNaN(virtualTime) && systemDispatch.setVirtualTime(virtualTime);
      setTimeout(() => {
        mouseDownIsPlayingRef.current && videoManager.play();
      }, 200);
    },
    [progressBar]
  );

  const handleMouseDown = () => {
    // 由于 MouseDown 和 click 事件触发间距时间太短
    // AMF 执行时，可能 state 还没改变，导致页面闪烁
    // 所以这里需要先手动执行改变状态，不要等待 video pause 时再改变
    systemDispatch.setVideoPause();
    mouseDownIsPlayingRef.current = isPlayingRef.current;
    videoManager.pause();
  };

  return (
    <div className="progress-bar">
      <div
        id="progressBarContainer"
        className="main"
        ref={progressBarContainerRef}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          onClick={handleClickCanvas}
          onMouseDown={handleMouseDown}
        />
        <Vernier />
      </div>
    </div>
  );
};

export const Vernier = () => {
  const { systemState, systemDispatch } = useSystemState();
  const {
    virtualTime,
    progressBar: { pxToMs, scale, scrollLeft },
  } = systemState;

  const [top, setTop] = useState<number>(0);
  const [left, setLeft] = useState<number>(TrackNameWidth);

  const moveLockRef = useRef<boolean>(true);
  const preIsPaused = useRef<boolean>(true);

  const getTop = () => {
    const ele = document
      .getElementById('progressBarContainer')
      ?.getBoundingClientRect();
    console.log('ele: ', ele);
    ele && setTop(ele.top);
  };

  useEffect(() => {
    getTop();
  }, []);

  useEffect(() => {
    const hanldeLockMove = () => {
      // 拖动状态松开，才执行判断
      if (!moveLockRef.current) {
        moveLockRef.current = true;
        if (!preIsPaused.current) videoManager.play();
      }
    };
    window.addEventListener('mouseup', hanldeLockMove);

    return () => {
      window.removeEventListener('mouseup', hanldeLockMove);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  // 时间轴缩放时，游标移动
  useEffect(() => {
    setLeft(virtualTimeToLeft());
  }, [pxToMs]);

  // 滚动进度条时，游标移动
  useEffect(() => {
    setLeft(virtualTimeToLeft());
  }, [scrollLeft]);

  // 时间变化时，游标移动
  useEffect(() => {
    setLeft(virtualTimeToLeft());
  }, [virtualTime]);

  const handleMove = useCallback(
    (e) => {
      if (!moveLockRef.current) {
        if (e.clientX >= TrackNameWidth - scrollLeft) {
          const virtualTime = leftToVirtualTime(e.clientX);
          systemDispatch.setVirtualTime(virtualTime);
        } else {
          systemDispatch.setVirtualTime(0);
        }
      }
    },
    [scrollLeft]
  );

  const handleMouseDown = () => {
    systemDispatch.setVideoPause();
    preIsPaused.current = videoManager.paused();
    videoManager.pause();
    moveLockRef.current = false;
  };

  // useCallback + useRef : https://zhuanlan.zhihu.com/p/86211675
  const virtualTimeToLeftRef = useRef<any>();
  virtualTimeToLeftRef.current = () => {
    const left = TrackNameWidth - scrollLeft + virtualTime / pxToMs;
    return left;
  };
  const virtualTimeToLeft = useCallback(() => {
    return virtualTimeToLeftRef.current();
  }, [virtualTime, pxToMs, scrollLeft]);

  const leftToVirtualTimeRef = useRef<any>();
  leftToVirtualTimeRef.current = (clientX = left) => {
    const virtualTime = (clientX - TrackNameWidth + scrollLeft) * pxToMs;
    return virtualTime;
  };
  const leftToVirtualTime = useCallback(
    (clientX = left) => {
      return leftToVirtualTimeRef.current(clientX);
    },
    [left, pxToMs, scrollLeft]
  );

  return (
    <div style={{ top, left }} className="vernier-container">
      <div
        className="vernier-time user-unselect horizontal-verticality-center"
        onMouseDown={handleMouseDown}
      >
        {getDurationFormatMS(virtualTime)}
      </div>
    </div>
  );
};

const ProgressBarContainer = () => {
  const { systemDispatch } = useSystemState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const scrollListener = () => {
      console.log('progress-container: ', containerRef.current?.scrollLeft);
      systemDispatch.setProgressBarScrollLeft(
        containerRef.current?.scrollLeft ?? 0
      );
    };
    containerRef.current?.addEventListener('scroll', scrollListener);

    return () => {
      containerRef.current?.removeEventListener('scroll', scrollListener);
    };
  }, []);

  return (
    <div ref={containerRef} className="progress-container">
      <ProgressBar />
    </div>
  );
};

export default ProgressBarContainer;
