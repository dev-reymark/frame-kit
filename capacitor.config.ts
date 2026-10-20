import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.framekit.app',
  appName: 'FrameKit',
  webDir: 'dist/renderer',
  server: {
    // Allows loading LAN HTTP URLs (e.g. 192.168.1.100:3000, localhost:3000)
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;