import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: '佳麦',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
    },
    JPush: {
      // your application appKey on JPush
      appKey: 'd6d9cce02a95b530d76d076e',
      channel: 'developer-default',
    },
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
  bundledWebRuntime: false,
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
