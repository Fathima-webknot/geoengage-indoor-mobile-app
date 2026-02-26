import messaging from '@react-native-firebase/messaging';

/**
 * Requests Android notification permission (mandatory on Android 13+).
 * @returns {boolean} true if permission was granted, false otherwise
 */
export const requestFCMPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return granted;
};

/**
 * Retrieves the FCM device token for this app installation.
 * This token uniquely identifies the device for push delivery.
 * Only call this AFTER requestFCMPermission() returns true.
 *
 * IMPORTANT: The backend NEVER generates this token.
 * The mobile app generates it here and sends it to the backend via POST /register-device.
 *
 * @returns {string} FCM token string (~150 chars)
 */
export const getFCMToken = async () => {
    const token = await messaging().getToken();
    console.log('[FCMService] Token generated:', token);
    return token;
};

/**
 * Listens for FCM token refresh events.
 * Tokens can be rotated by Firebase — always re-register with the backend when this fires.
 *
 * Usage: const unsubscribe = onTokenRefresh(newToken => registerDevice(newToken));
 *        call unsubscribe() in cleanup.
 */
export const onTokenRefresh = (callback) => {
    return messaging().onTokenRefresh((newToken) => {
        console.log('[FCMService] Token refreshed:', newToken);
        callback(newToken);
    });
};

/**
 * Sets up notification handlers for all three app states.
 *
 * Must be called in App.tsx inside useEffect AFTER NavigationContainer is ready.
 * Returns an unsubscribe function — call it in the useEffect cleanup.
 *
 * @param {object} navigation - React Navigation ref (navigationRef.current)
 */
export const setupNotificationHandlers = (navigation) => {
    // ─── FOREGROUND ─────────────────────────────────────────────────────────────
    // When app is open and active, FCM does NOT show a system notification automatically.
    // We receive it here and can show an in-app alert or a local notification.
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('[FCMService] Foreground message:', remoteMessage);
        // TODO: Replace with a proper in-app notification UI (e.g. react-native-push-notification)
        const { Alert } = require('react-native');
        Alert.alert(
            remoteMessage.notification?.title ?? 'New Offer',
            remoteMessage.notification?.body ?? '',
        );
    });

    // ─── BACKGROUND (app open but not in foreground) ─────────────────────────
    // System tray shows the notification automatically.
    // This fires when user TAPS the notification.
    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('[FCMService] Background notification tapped:', remoteMessage);
        const campaignId = remoteMessage.data?.campaign_id;
        if (campaignId && navigation) {
            // Track the click (import APIService inline to avoid circular deps)
            import('./APIService').then(({ trackNotificationClick }) => {
                trackNotificationClick(campaignId).catch(console.warn);
            });
            navigation.navigate('MapScreen');
        }
    });

    // ─── KILLED STATE (app was not running) ──────────────────────────────────
    // System tray shows the notification. This runs once on every app launch.
    // Check if the app was opened by tapping a notification.
    messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
            if (remoteMessage) {
                console.log('[FCMService] App opened from killed state via notification:', remoteMessage);
                const campaignId = remoteMessage.data?.campaign_id;
                if (campaignId && navigation) {
                    import('./APIService').then(({ trackNotificationClick }) => {
                        trackNotificationClick(campaignId).catch(console.warn);
                    });
                    // Small delay to let the navigator mount fully before navigating
                    setTimeout(() => navigation.navigate('MapScreen'), 500);
                }
            }
        });

    // Return the foreground unsubscribe fn for useEffect cleanup
    return unsubscribeForeground;
};
