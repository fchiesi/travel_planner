
import firebase from 'firebase/compat/app';
import { auth } from './firebase.ts';

const googleProvider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<firebase.User | null> => {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error during Google sign-in", error);
        return null;
    }
};

export const signOut = async (): Promise<void> => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error signing out", error);
    }
};

// This is just exporting the onAuthStateChanged function for use in components
export const onAuthStateChanged = (callback: (user: firebase.User | null) => void) => {
    return auth.onAuthStateChanged(callback);
};
