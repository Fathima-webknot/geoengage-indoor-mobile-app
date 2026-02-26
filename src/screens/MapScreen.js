import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    StatusBar,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { getCurrentUser, signOut } from '../services/AuthService';

export default function MapScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser({
                name: currentUser.displayName ?? 'User',
                email: currentUser.email ?? '',
                photoURL: currentUser.photoURL,
            });
        }
    }, []);

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                        navigation.replace('AuthScreen');
                    } catch (err) {
                        Alert.alert('Error', 'Failed to sign out. Please try again.');
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f3460" />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.topBarTitle}>GeoEngage</Text>
                    <Text style={styles.topBarSubtitle}>Ground Floor</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => { }}>
                    <Text style={styles.notifIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* User card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name ?? 'Loading...'}</Text>
                        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
                    </View>
                </View>

                {/* Map placeholder */}
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapIcon}>🗺️</Text>
                    <Text style={styles.mapPlaceholderText}>Floor Plan</Text>
                    <Text style={styles.mapPlaceholderSub}>
                        IndoorAtlas SDK integration{'\n'}will render the floor plan here
                    </Text>
                </View>

                {/* Status cards */}
                <View style={styles.statusRow}>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusIcon}>✅</Text>
                        <Text style={styles.statusLabel}>Firebase Auth</Text>
                        <Text style={styles.statusValue}>Active</Text>
                    </View>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusIcon}>📡</Text>
                        <Text style={styles.statusLabel}>FCM</Text>
                        <Text style={styles.statusValue}>Registered</Text>
                    </View>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusIcon}>📍</Text>
                        <Text style={styles.statusLabel}>IndoorAtlas</Text>
                        <Text style={styles.statusValue}>Pending</Text>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0d1a',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0f3460',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    topBarSubtitle: {
        fontSize: 12,
        color: '#8899cc',
    },
    notifBtn: {
        padding: 8,
    },
    notifIcon: {
        fontSize: 22,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 16,
        gap: 14,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#0f3460',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#e94560',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    userEmail: {
        fontSize: 13,
        color: '#8899aa',
        marginTop: 2,
    },
    mapPlaceholder: {
        backgroundColor: '#16213e',
        borderRadius: 20,
        height: 260,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#0f3460',
        borderStyle: 'dashed',
        gap: 10,
    },
    mapIcon: {
        fontSize: 48,
    },
    mapPlaceholderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    mapPlaceholderSub: {
        fontSize: 13,
        color: '#8899aa',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#16213e',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        gap: 6,
    },
    statusIcon: {
        fontSize: 22,
    },
    statusLabel: {
        fontSize: 11,
        color: '#8899aa',
        fontWeight: '600',
        textAlign: 'center',
    },
    statusValue: {
        fontSize: 12,
        color: '#4ade80',
        fontWeight: '700',
    },
    logoutBtn: {
        backgroundColor: '#7f1d1d',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fca5a5',
        fontWeight: '700',
        fontSize: 15,
    },
});
