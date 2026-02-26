import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { configureGoogleSignIn } from '../config/googleAuth';

// Call once on app startup
export const initAuth = () => {
    configureGoogleSignIn();
};

/**
 * Triggers the Google Sign-In flow and signs the user into Firebase.
 * @returns {FirebaseUser} the signed-in Firebase user object
 */
export const signInWithGoogle = async () => {
    // Ensure Google Play Services are available on the device
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Open Google account picker → get Google ID token
    const userInfo = await GoogleSignin.signIn();

    // Exchange Google token for a Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);

    // Sign into Firebase with that credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    return userCredential.user;
};

/**
 * Returns a fresh Firebase ID token for the current user.
 * Pass this as `Authorization: Bearer <token>` in every backend API call.
 * Force-refresh ensures the token is not expired.
 */
export const getFirebaseIdToken = async () => {
    const user = auth().currentUser;
    if (!user) {
        throw new Error('No user is currently signed in.');
    }
    return await user.getIdToken(/* forceRefresh */ true);
};

/**
 * Returns the currently authenticated Firebase user, or null if not signed in.
 */
export const getCurrentUser = () => auth().currentUser;

/**
 * Signs out from both Google and Firebase.
 */
export const signOut = async () => {
    await GoogleSignin.signOut();
    await auth().signOut();
};
