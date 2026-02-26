/**
 * GeoEngage — Main App Entry
 * Firebase Auth + FCM enabled, React Native CLI (Android-first)
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { initAuth } from './src/services/AuthService';

// Configure Google Sign-In once on module load
initAuth();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;

