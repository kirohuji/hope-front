import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: '希望之家',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
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
