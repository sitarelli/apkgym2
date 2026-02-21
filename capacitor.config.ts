import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workouttracker.app',
  appName: 'Vitto Gym Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a1a",
      showSpinner: false,
    },
  },
};

export default config;
