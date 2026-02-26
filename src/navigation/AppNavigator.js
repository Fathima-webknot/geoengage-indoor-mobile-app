import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import AuthScreen from '../screens/AuthScreen';
import MapScreen from '../screens/MapScreen';
import { setupNotificationHandlers } from '../services/FCMService';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const navigationRef = useRef(null);
    // null = still checking, true = signed in, false = signed out
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    // ── Auth state listener ───────────────────────────────────────────────────
    // Fires once on mount with the current auth state, then on every sign-in/out.
    // This is the single source of truth for which screen to show first.
    useEffect(() => {
        const unsubscribeAuth = auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            if (initializing) setInitializing(false);
        });
        return unsubscribeAuth;
    }, []);

    // ── Notification handlers ────────────────────────────────────────────────
    // Set up after navigator is mounted so navigationRef.current is available.
    useEffect(() => {
        const unsubscribeFCM = setupNotificationHandlers(navigationRef.current);
        return unsubscribeFCM;
    }, []);

    if (initializing) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#e94560" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={user ? 'MapScreen' : 'AuthScreen'}>
                <Stack.Screen name="AuthScreen" component={AuthScreen} />
                <Stack.Screen name="MapScreen" component={MapScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0d0d1a',
    },
});
