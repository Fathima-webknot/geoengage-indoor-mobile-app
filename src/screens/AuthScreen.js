import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    StatusBar,
    SafeAreaView,
    Image,
} from 'react-native';
import { signInWithGoogle } from '../services/AuthService';
import { requestFCMPermission, getFCMToken } from '../services/FCMService';
import { registerDevice } from '../services/APIService';

export default function AuthScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        if (loading) return;
        setLoading(true);
        try {
            // ── Step 1: Firebase Google Sign-In ──────────────────────────────────
            await signInWithGoogle();

            // ── Step 2: Request Android notification permission ───────────────────
            // Prompt appears here (after sign-in) — not on cold start.
            const permissionGranted = await requestFCMPermission();

            // ── Step 3: Get FCM token (only if permission granted) ────────────────
            // The app — not the backend — is responsible for generating this token.
            let fcmToken = null;
            if (permissionGranted) {
                fcmToken = await getFCMToken();
            }

            // ── Step 4: Register device with backend ──────────────────────────────
            // Sends Firebase ID token (auth) + FCM token (push delivery) to backend.
            if (fcmToken) {
                try {
                    await registerDevice(fcmToken);
                    console.log('[AuthScreen] Device registered with backend.');
                } catch (apiErr) {
                    // Backend may not be ready yet (Phase 1). Log and continue.
                    console.warn('[AuthScreen] Backend registration failed (expected if server not ready):', apiErr.message);
                }
            }

            // ── Step 5: Navigate to main screen ──────────────────────────────────
            navigation.replace('MapScreen');
        } catch (error) {
            console.error('[AuthScreen] Sign-in error:', error);
            Alert.alert('Sign-In Failed', error.message ?? 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

            {/* Branding */}
            <View style={styles.hero}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>📍</Text>
                </View>
                <Text style={styles.appName}>GeoEngage</Text>
                <Text style={styles.tagline}>Indoor Location-Based Engagement</Text>
            </View>

            {/* Sign-In */}
            <View style={styles.bottom}>
                <TouchableOpacity
                    style={[styles.googleButton, loading && styles.googleButtonDisabled]}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                    activeOpacity={0.85}>
                    {loading ? (
                        <ActivityIndicator color="#4285F4" size="small" />
                    ) : (
                        <>
                            <Text style={styles.googleIcon}>G</Text>
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        justifyContent: 'space-between',
    },
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#16213e',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        elevation: 8,
        shadowColor: '#0f3460',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    logoText: {
        fontSize: 48,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.5,
    },
    tagline: {
        fontSize: 14,
        color: '#8899aa',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    bottom: {
        paddingHorizontal: 32,
        paddingBottom: 40,
        gap: 16,
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: '100%',
        gap: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    googleButtonDisabled: {
        opacity: 0.7,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3c4043',
    },
    disclaimer: {
        fontSize: 11,
        color: '#556677',
        textAlign: 'center',
    },
});
