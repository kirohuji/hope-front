import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: '希望之家',
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
    },
  },
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
