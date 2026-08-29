import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindmate.ner',
  appName: 'MindMate NER',
  webDir: 'dist',
  server: {
    url: 'http://192.168.29.8:5174',
    cleartext: true
  }
};

export default config;
