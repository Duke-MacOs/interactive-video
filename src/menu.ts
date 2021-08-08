import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    // if (
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.DEBUG_PROD === 'true'
    // ) {
    //   this.setupDevelopmentEnvironment();
    // }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDarwinTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: '互动视频制课工具',
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'Command+N',
          click: (menuItem, currentWindow) => {
            currentWindow?.webContents.send('open_project');
          },
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'Command+Z',
          click: () => {
            this.mainWindow?.webContents.send('shortcutEvent', {
              type: 'undo',
            });
          },
        },
        {
          label: '重做',
          accelerator: 'Command+Shift+Z',
          click: () => {
            this.mainWindow?.webContents.send('shortcutEvent', {
              type: 'redo',
            });
          },
        },
        {
          label: '键盘快捷键和菜单',
          accelerator: 'Command+Shift+Option+Z',
          click: () => {
            this.mainWindow?.webContents.send('shortcutEvent', {
              type: 'shortcutModal',
            });
          },
        },
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: '帮助',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/master/docs#readme'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewDev;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuHelp];
  }
}
