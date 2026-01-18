// =====================================================
// Firebase Configuration & Push Notification Helpers
// =====================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase Configuration
// PENTING: Ganti dengan konfigurasi dari Firebase Console
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

// Initialize Firebase only on client side
export function initializeFirebase(): FirebaseApp | null {
    if (typeof window === 'undefined') return null;

    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    return app;
}

// Get Firebase Messaging instance
export function getFirebaseMessaging(): Messaging | null {
    if (typeof window === 'undefined') return null;
    if (!app) initializeFirebase();
    if (!app) return null;

    if (!messaging) {
        messaging = getMessaging(app);
    }

    return messaging;
}

// Request permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
    try {
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            // Permission denied - no action needed
            return null;
        }

        const messaging = getFirebaseMessaging();
        if (!messaging) return null;

        // VAPID key from Firebase Console > Project Settings > Cloud Messaging
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

        const token = await getToken(messaging, { vapidKey });

        return token;
    } catch (error) {
        console.error('Error getting notification permission:', error);
        return null;
    }
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: any) => void): () => void {
    const messaging = getFirebaseMessaging();
    if (!messaging) return () => { };

    return onMessage(messaging, (payload) => {
        callback(payload);
    });
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
    return typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator;
}

// Get current notification permission status
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
}
