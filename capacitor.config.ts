import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lourd.hope.app',
  appName: '@minimal-kit/cra-js',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
