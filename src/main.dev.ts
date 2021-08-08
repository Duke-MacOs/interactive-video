/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, Menu, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import MenuBuilder from './menu';
import { videosType, audiosType, imagesType, lottiesType } from './config';

const ipc = require('electron').ipcMain;
const { dialog } = require('electron');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let canQuit = true;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    // await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    fullscreen: false,
    icon: getAssetPath('icon.png'),
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#/`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  mainWindow.on('close', (event: any) => {
    mainWindow?.webContents.send('changeWin', { closeMainWindow: true });
    if (!canQuit) {
      event.preventDefault();
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Redux-devtools
  // installExtension(REDUX_DEVTOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log('An error occurred: ', err));

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('browser-window-focus', () => {
  console.log('app 激活了');
  mainWindow?.webContents.send('browser-window-focus');
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipc.on('open-dir-dialog', (event) => {
  if (mainWindow) {
    const files = dialog.showOpenDialogSync(mainWindow, {
      title: '打开文件夹',
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    });
    // eslint-disable-next-line prefer-destructuring
    event.returnValue = files ? files[0] : undefined;
  }
});

ipc.on('open-file-dialog', (event, arg: string[] = []) => {
  let extensions: string[] = [];
  if (arg.includes('audio')) {
    extensions = [...extensions, ...audiosType];
  } else if (arg.includes('image')) {
    extensions = [...extensions, ...imagesType];
  } else if (arg.includes('video')) {
    extensions = [...extensions, ...videosType];
  } else if (arg.includes('effect')) {
    extensions = [...extensions, ...lottiesType];
  } else if (arg.length === 0) {
    extensions = [...imagesType, ...videosType, ...lottiesType, ...audiosType];
  }
  if (mainWindow) {
    const files = dialog.showOpenDialogSync(mainWindow, {
      title: '添加资源',
      filters: [
        {
          name: 'Alls',
          extensions,
        },
      ],
      properties: ['openFile'],
    });
    if (files) {
      // eslint-disable-next-line prefer-destructuring
      event.returnValue = files[0];
    } else {
      event.returnValue = undefined;
    }
  }
});

ipc.on('add-recent-doc', (event, recentPath) => {
  app.addRecentDocument(recentPath);
  event.reply('async-add-recent-doc-reply', recentPath);
});

ipc.on('async-clear-recent-doc-message', (event, arg) => {
  event.reply('async-clear-recent-doc-reply', arg);
});

ipc.on('async-get-electron-path-message', (event) => {
  event.reply('async-get-electron-path-reply', app.getPath('userData'));
});

ipcMain.on('sendmsg', (event, arg: { canQuit: boolean }) => {
  // 这里是渲染进程发送来的消息
  console.log(arg);
  const { canQuit: IcanQuit } = arg;
  canQuit = IcanQuit;
});
