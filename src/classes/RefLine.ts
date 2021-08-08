/* eslint-disable no-multi-assign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
/**
 * https://github.com/think2011/ref-line/edit/master/src/ref-line.js
 */

import VideoManager from './VideoManager';

interface Conditions {
  [key: string]: any[];
}

const videoManage = VideoManager.getInstance();

export class RefLine {
  private static instance: RefLine | null = null;

  private appendLinesInterval: Timeout | null = null;

  private lineNodes: HTMLDivElement[] = [];

  private lines = {
    xt: null,
    xc: null,
    xb: null,
    yl: null,
    yc: null,
    yr: null,
  };

  options: { gap: number };

  constructor(options = {}) {
    // 置入参考线
    for (const p in this.lines) {
      const node = (this.lines[p] = document.createElement('div'));

      node.id = `${Math.random()}`;
      node.classList.add('ref-line', p);
      node.style.cssText = `display:none;opacity:0.7;position:absolute;background:#4DAEFF;z-index:199111250;${
        p[0] === 'x'
          ? 'width:100%;height:1px;left:0;'
          : 'width:1px;height:100%;top:0;'
      }`;

      // 挂上一些辅助方法
      (node as any).show = function () {
        this.style.display = 'block';
      };
      (node as any).hide = function () {
        this.style.display = 'none';
      };
      (node as any).isShow = function () {
        return this.style.display !== 'none';
      };

      this.lineNodes.push(node);
    }

    if (!this.appendLinesInterval) {
      this.appendLinesInterval = setInterval(() => {
        const videoHTML = document.getElementById(
          'interact-node-preview-container'
        );
        if (videoHTML) {
          this.lineNodes.forEach((n) => {
            videoHTML.appendChild(n);
          });
          clearInterval(this.appendLinesInterval);
        }
      }, 500);
    }

    this.options = { gap: 3, ...options };

    this.uncheck();

    window.addEventListener('mouseup', () => {
      this.uncheck();
    });
  }

  public static getInstance() {
    if (RefLine.instance === null) {
      RefLine.instance = new RefLine();
    }
    return RefLine.instance;
  }

  /**
   * @param dragNode {Element} 拖拽元素的原生node
   * @param checkNodes {String|Element} 选择器 或者 原生node集合
   */
  check(dragNode: HTMLElement, checkNodes: any) {
    checkNodes =
      typeof checkNodes === 'string'
        ? document.querySelectorAll(checkNodes)
        : checkNodes;
    const dragRect = dragNode.getBoundingClientRect();

    const previewVideoMask = document.getElementById(
      'interact-node-preview-container'
    );
    const { x: videoX, y: videoY } = previewVideoMask?.getBoundingClientRect();

    this.uncheck();
    if (!videoManage.paused()) return;
    Array.from(checkNodes).forEach((item: any) => {
      item.classList.remove('ref-line-active');
      if (item === dragNode) return;
      if (!videoX || !videoY) return;
      const {
        top,
        height,
        bottom,
        left,
        width,
        right,
      } = item.getBoundingClientRect();
      const dragWidthHalf = dragRect.width / 2;
      const itemWidthHalf = width / 2;
      const dragHeightHalf = dragRect.height / 2;
      const itemHeightHalf = height / 2;

      const conditions: Conditions = {
        top: [
          // xt-top
          {
            isNearly: this._isNearly(dragRect.top, top),
            lineNode: this.lines.xt,
            lineValue: top - videoY,
            dragValue: top,
          },
          // xt-bottom
          {
            isNearly: this._isNearly(dragRect.bottom, top),
            lineNode: this.lines.xt,
            lineValue: top - videoY,
            dragValue: top - dragRect.height,
          },
          // xc
          {
            isNearly: this._isNearly(
              dragRect.top + dragHeightHalf,
              top + itemHeightHalf
            ),
            lineNode: this.lines.xc,
            lineValue: top + itemHeightHalf - videoY,
            dragValue: top + itemHeightHalf - dragHeightHalf,
          },
          // xb-top
          {
            isNearly: this._isNearly(dragRect.bottom, bottom),
            lineNode: this.lines.xb,
            lineValue: bottom - videoY,
            dragValue: bottom - dragRect.height,
          },
          // xb-bottom
          {
            isNearly: this._isNearly(dragRect.top, bottom),
            lineNode: this.lines.xb,
            lineValue: bottom - videoY,
            dragValue: bottom,
          },
        ],

        left: [
          // yl-left
          {
            isNearly: this._isNearly(dragRect.left, left),
            lineNode: this.lines.yl,
            lineValue: left - videoX,
            dragValue: left,
          },
          // yl-right
          {
            isNearly: this._isNearly(dragRect.right, left),
            lineNode: this.lines.yl,
            lineValue: left - videoX,
            dragValue: left - dragRect.width,
          },
          // yc
          {
            isNearly: this._isNearly(
              dragRect.left + dragWidthHalf,
              left + itemWidthHalf
            ),
            lineNode: this.lines.yc,
            lineValue: left + itemWidthHalf - videoX,
            dragValue: left + itemWidthHalf - dragWidthHalf,
          },
          // yr-left
          {
            isNearly: this._isNearly(dragRect.right, right),
            lineNode: this.lines.yr,
            lineValue: right - videoX,
            dragValue: right - dragRect.width,
          },
          // yr-right
          {
            isNearly: this._isNearly(dragRect.left, right),
            lineNode: this.lines.yr,
            lineValue: right - videoX,
            dragValue: right,
          },
        ],
      };

      for (const key in conditions) {
        // 遍历符合的条件并处理
        conditions[key].forEach((condition) => {
          if (!condition.isNearly) return;

          item.classList.add('ref-line-active');
          // 获取 transform 属性
          const matrix = new WebKitCSSMatrix(dragNode.style.transform);
          const { m41: x, m42: y } = matrix;
          if (key === 'top') {
            dragNode.style.transform = `translate(${x}px, ${
              condition.dragValue - videoY
            }px)`;
          } else if (key === 'left') {
            dragNode.style.transform = `translate(${
              condition.dragValue - videoX
            }px, ${y}px)`;
          }
          condition.lineNode.style[key] = `${condition.lineValue}px`;
          condition.lineNode.show();
        });
      }
    });
  }

  uncheck() {
    Object.values(this.lines).forEach((item) => (item as any).hide());
    Array.from(document.querySelectorAll('.ref-line-active')).forEach((item) =>
      item.classList.remove('ref-line-active')
    );
  }

  _isNearly(dragValue: number, targetValue: number) {
    return Math.abs(dragValue - targetValue) <= this.options.gap;
  }
}
