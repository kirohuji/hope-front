/* eslint-disable import/no-extraneous-dependencies */
const { app, ipcMain, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const { join } = require('path');
// const { format } = require('url');

// autoUpdater.setFeedURL("xxxx")
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'kirohuji',
  repo: 'hope-front',
  token: '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',
  // 根据你的发布策略设置分支
  // 此处的分支名需与 GitHub 上对应的发布分支名一致
  // 如果是正式发布，可以使用 master 分支
  // 如果是测试发布，可以使用 beta 或其他自定义分支
  // 如果你有多个发布分支，也可以在更新时根据需要选择
  // 参考文档：https://www.electron.build/auto-update#update-channel
  // channel: 'beta',
});
autoUpdater.autoDownload = false

const isDevelopment = process.env.NODE_ENV === 'development';
let mainWindow = null;


autoUpdater.on("error", (error) => {
  printUpdaterMessage('error');
  mainWindow.webContents.send("updateError", error);
});


autoUpdater.on("checking-for-update", () => {
  printUpdaterMessage('checking');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('updateDownloaded');
  ipcMain.on('updateNow', (e, arg) => {
    autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("update-available", (info) => {
  printUpdaterMessage('updateAvailable');
  mainWindow.webContents.send("updateAvailable", info);
});

autoUpdater.on("update-not-available", (info) => {
  printUpdaterMessage('updateNotAvailable');
});

autoUpdater.on("download-progress", (progressObj) => {
  printUpdaterMessage('downloadProgress');
  mainWindow.webContents.send("downloadProgress", progressObj);
});


function printUpdaterMessage(arg) {
  const message = {
    error: '更新出错',
    checking: '正在检查更新',
    updateAvailable: '检测到新版本',
    downloadProgress: '下载中',
    updateNotAvailable: '无新版本',
  };
  mainWindow.webContents.send('printUpdaterMessage', message[arg] ?? arg);
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1200, // 设置最小宽度
    minHeight: 900, // 设置最小高度
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:3000/');
  } else {
    mainWindow.loadFile(join(__dirname, './build/index.html'));
    // mainWindow.loadURL(
    //   format({
    //     pathname: join(__dirname, './build/index.html'),
    //     protocol: 'file:',
    //     slashes: true,
    //   })
    // );
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('comfirmUpdate', () => {
  autoUpdater.downloadUpdate()
})

