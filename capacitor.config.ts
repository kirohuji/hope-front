import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: 'HopeHome',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
