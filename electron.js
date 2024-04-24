// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { format } = require('url');

let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 1200, // 设置最小宽度
    minHeight: 900, // 设置最小高度
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  });
  // 根据开发环境加载不同的URL
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    // format({
    //   pathname: join(__dirname, './build/index.html'),
    //   protocol: 'file:',
    //   slashes: true,
    // })
    mainWindow.loadFile(join(__dirname, './build/index.html'));
    // mainWindow.loadURL('http://localhost:3000/');
  } else {
    mainWindow.loadURL(
      format({
        pathname: join(__dirname, './build/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
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
