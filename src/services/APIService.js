import axios from 'axios';
import { getFirebaseIdToken } from './AuthService';

// ─── Axios instance ──────────────────────────────────────────────────────────
// Replace BASE_URL with your backend URL when ready.
// For Phase 1 (auth-only), API calls will fail gracefully — that's expected.
const BASE_URL = 'https://api.geoengage.com'; // TODO: replace with real backend URL

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Automatically attaches a fresh Firebase ID token to every outgoing request.
// The backend verifies this token via Firebase Admin SDK to authenticate the user.
api.interceptors.request.use(
    async (config) => {
        try {
            const idToken = await getFirebaseIdToken();
            config.headers.Authorization = `Bearer ${idToken}`;
        } catch (err) {
            console.warn('[APIService] Could not attach auth token:', err.message);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        console.error('[APIService] Request failed:', status, error?.response?.data ?? error.message);
        return Promise.reject(error);
    },
);

// ─── API Methods ─────────────────────────────────────────────────────────────

/**
 * Registers or updates the device's FCM token on the backend.
 * Called once after Google Sign-In + FCM permission granted.
 *
 * Backend stores this token in users.fcm_token to deliver push notifications.
 * The backend NEVER generates this token — it only stores what the app sends.
 *
 * @param {string} fcmToken - the token from messaging().getToken()
 */
export const registerDevice = async (fcmToken) => {
    const response = await api.post('/register-device', { fcm_token: fcmToken });
    return response.data;
};

/**
 * Fetches the current user's profile from the backend.
 */
export const getMyProfile = async () => {
    const response = await api.get('/me');
    return response.data;
};

/**
 * Logs a zone-entry event and triggers a campaign notification if one is active.
 * Called by GeofenceManager when IndoorAtlas fires didEnterRegion.
 *
 * @param {string} zoneName - exact zone name (case-sensitive, matches IndoorAtlas region name)
 * @param {number} floorId  - ID of the floor
 */
export const logZoneEntry = async (zoneName, floorId) => {
    const response = await api.post('/event', { zone_name: zoneName, floor_id: floorId });
    return response.data;
};

/**
 * Tracks a notification tap for CTR analytics.
 * Called when user opens a push notification (background or killed state).
 *
 * @param {string|number} campaignId
 */
export const trackNotificationClick = async (campaignId) => {
    const response = await api.post('/notification-click', {
        campaign_id: parseInt(campaignId, 10),
    });
    return response.data;
};

/**
 * Fetches notification history for the logged-in user.
 */
export const getNotifications = async ({ limit = 50, offset = 0 } = {}) => {
    const response = await api.get('/notifications', { params: { limit, offset } });
    return response.data;
};
