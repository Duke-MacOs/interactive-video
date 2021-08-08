import React, { useState, useEffect } from 'react';
import { Modal, Divider } from 'antd';
import useModalState from '../../hooks/useModalState';
import useSystemState from '../../hooks/useSystemState';
import useNativeState from '../../hooks/useNativeState';
import useAssetsState from '../../hooks/useAssetsState';

const ReduxToolModal = () => {
  const { systemState } = useSystemState();
  const { modalState, modalDispatch } = useModalState();
  const { nativeState } = useNativeState();
  const { assetsState } = useAssetsState();

  const handleOk = () => {
    modalDispatch.showReduxToolModal();
  };

  const handleCancel = () => {
    modalDispatch.hideReduxToolModal();
  };

  const printSystemState = () => {
    console.log('systemState: ', systemState);
  };

  const printAssetsState = () => {
    console.log('assetsState: ', assetsState);
  };

  const printNativeState = () => {
    console.log('nativeState: ', nativeState);
  };

  const printVersionLog = () => {
    const data = [
      {
        '0.1.2': [
          '1.展示素材库时，不显示添加按钮',
          '2.隐藏答题限时设置',
          '3.获取视频资源属性报“非法资源”问题',
          '4.旧版制课工具项目打开',
          '5.预览功能',
          '6.添加视频时，UI 没有新增',
          '7.获取视频帧报错',
        ],
        '0.1.3': [
          '1.拖拽题吸附线配置',
          '2.移除视频时，当 videos 为空时，video-element 没有置空',
          '3.lottie 动效预览',
        ],
        '0.1.4': [
          '1.节点选中时删除报错',
          '2.视频轨提示文案',
          '3.交互节点鼠标悬停时显示名称',
          '4.视频轨移动视频，但是 currentvideo 没有改变时，currenttime 没有变化',
          '5.录音节点添加动效组件',
          '6.快捷键补充',
          '7.拖拽题在给选项添加图片时，字段数量发生异常',
        ],
        '0.1.5': ['1.拖拽题预览效果修复', '2.预览模式下无法编辑节点属性'],
        '0.1.6': [
          '1.自动暂停、录音节点、视频节点预览修复',
          '2.导出 .itv 前先执行上传操作',
          '3.时间轨可以点击切换时间',
          '4.点击添加图片成功后，图片未添加到题目位置',
          '5.分支故事选项添加清空跳转按钮',
          '6.分支故事跳转效果修正',
        ],
        '0.1.7': [
          '1.新增资源检测功能（当 APP 重新激活时，进行资源检测）',
          '2.删除 itv 时，切换 itv 错误',
          '3.新增视频编辑和分段节点捕获跳转',
          '4.新增显示进度条选项',
          '5.修复获取节点状态错误',
          '6.切换 itv 时，清空节点和当前编辑视频',
          '7.播放状态下移动游标，先将 isplaying 设为 false，防止闪烁',
          '8.新增简单选择，拖拽，分支点击按钮继续播放热区',
        ],
        '0.1.8': [
          '1.快捷键撤回重复执行',
          '2.录音节点碰撞检测导致节点无法添加',
          '3.点击锚点修改节点开始时间时，拖拽区域未重新判断是否显示',
          '4.新建 itv 时命名规则修改',
          '5.点击新增交互节点',
        ],
        '0.1.9': [
          '1.启动 APP 时全屏 && titlebar 自定义',
          '2.素材字体减小',
          '3.录音节点碰撞检测导致节点无法添加',
          '4.新增录音节点是否开启动效开关',
          '5.新增节点时，自动选中到新增节点',
        ],
        '0.1.10': [
          '1.视频开窗装饰图层级调整',
          '2.分段节点添加时检测是否有重复',
          '3.分段节点展示区分 itvid',
          '4.点击循环播放逻辑修改',
          '5.喵币奖励添加录音节点',
          '6.录音节点动效删除失败',
          '7.批量移动时，没有选中节点时按钮应置灰',
          '8.快捷键删除节点',
          '9.快捷键切换节点',
          '10.拖动时间帧到视频轨开头位置，经常出现无法回到0',
          '11.系统菜单栏可打开新项目',
          '12.旧版 itv 文件向下兼容',
        ],
        '0.1.11': [
          '1.添加视频/调整视频轨上的视频顺序，其他视频位置异常移动',
          '2.统一在 openproject 时设置项目名',
          '3.添加资源时如果原来有值的，不要将原有值覆盖掉',
          '4.点击喵币时报错',
        ],
        '0.1.12': [
          '1.视频添加时，不在释放区域时不修改 state',
          '2.添加视频/调整视频轨上的视频顺序，其他视频位置异常移动',
          '3.样式主色修改',
        ],
        '0.1.13': [
          '1.节点清理函数',
          '2.拖拽题正确答案数组组合错误',
          '3.分段节点转换时时间单位错误',
          '4.首页点击选择文件夹弹窗后点取消卡死',
        ],
        '0.1.14': [
          '1.导入/导出 时，next字段名称错误',
          '2.旧数据兼容，path 地址',
        ],
        '0.1.15': [
          '1.拖拽资源到视频轨时，数据错误',
          '2.视频帧预览方案修改',
          '3.视频资源存储帧从100张改为10张',
          '4.素材库未加载',
        ],
        '0.1.16': ['1.删除多余代码', '2.二维码样式'],
        '0.1.17': ['1.一些已知 BUG'],
        '0.1.18': ['1.视频首帧截取地址错误', '2.拖拽题预览错误'],
        '0.1.19': ['1.canvs 绘制时 key 设置错误'],
        '0.1.20': [
          '1.拖拽题热区回弹 BUG',
          '2.视频开窗自动结束后视频播放时间异常',
          '3.thumb 文件夹不纳入资源区',
          '4.获取视频时长错误',
        ],
      },
    ];
    console.log('版本修改记录：', data);
  };

  return (
    <Modal
      title="Redux Dev Tool"
      visible={modalState.reduxToolModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <div onClick={printSystemState}>systemState</div>
      <Divider />
      <div onClick={printAssetsState}>assetsState</div>
      <Divider />
      <div onClick={printNativeState}>nativeState</div>
      <Divider />
      <div onClick={printVersionLog}>版本修改记录</div>
    </Modal>
  );
};

export default ReduxToolModal;
