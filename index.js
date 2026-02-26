/**
 * @format
 */
import 'react-native-gesture-handler';  // MUST be the first import

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// ─── FCM Background Handler ────────────────────────────────────────────────
// This MUST be registered at the top level of index.js, outside any component.
// Handles data-only messages when the app is in background or killed state.
// The system notification (if any) is shown automatically by FCM.
// Here we only handle silent/data messages or can log analytics.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage);
    // No UI updates here — just process data silently
    // e.g. update AsyncStorage, schedule a local notification, etc.
});

AppRegistry.registerComponent(appName, () => App);

