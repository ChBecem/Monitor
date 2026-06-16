import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.devoteam.babymonitor',
  appName: 'Baby Monitor',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
