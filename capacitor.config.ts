import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.jiamai.app',
  appName: '佳麦',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      version: '1.0.1',
    },
    // CordovaPlugins: [
    //   "cordova-plugin-purchase"
    // ],
    // JPush: {
    //   // your application appKey on JPush
    //   appKey: 'd6d9cce02a95b530d76d076e',
    //   channel: 'developer-default',
    // },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true, // 自动隐藏启动画面
      launchShowDuration: 0, // 设置显示时长为0，启动画面不会出现
      showSpinner: false, // 不显示加载指示器
      splashFullScreen: false, // 关闭全屏启动画面
      splashImmersive: false, // 关闭沉浸式启动画面
    },
  },
  // bundledWebRuntime: false,
  webDir: 'build',
  server: {
    // 局域网 Live Reload 配置：
    // 1. 先运行 yarn dev:host 启动开发服务器
    // 2. 将下方 url 改为你电脑的局域网 IP（如 http://192.168.x.x:3000）
    // 3. 运行 npx cap run android 或 npx cap run ios
    // url: 'http://192.168.x.x:3000',
    cleartext: true,
    androidScheme: 'https',
  }
};

export default config;
