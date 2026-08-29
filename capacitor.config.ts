import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindmate.ner',
  appName: 'MindMate NER',
  webDir: 'dist',
  server: {
    url: 'https://mindmate-blue-five.vercel.app/',
    allowNavigation: ['mindmate-blue-five.vercel.app']
  }
};

export default config;
