import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: '希望之家',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LiveUpdates: {
      appId: '60545bb2',
      channel: 'Production',
      autoUpdateMethod: 'background',
      maxVersions: 2
    }
  }
};

export default config;
