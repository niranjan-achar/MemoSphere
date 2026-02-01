import webpush from 'web-push';
import { NotificationPayload } from '@/types';

// Configure web push
const initializeWebPush = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@memosphere.app';

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured. Push notifications will not work.');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
};

/**
 * Sends a push notification to a user
 * @param subscription - Push subscription object
 * @param payload - Notification payload
 */
export async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  payload: NotificationPayload
): Promise<void> {
  try {
    if (!initializeWebPush()) {
      throw new Error('Web push not initialized');
    }

    await webpush.sendNotification(
      subscription as any,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
}

/**
 * Client-side: Requests notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Client-side: Subscribes to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('VAPID public key not configured');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription error:', error);
    return null;
  }
}

/**
 * Client-side: Unsubscribes from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return false;
  }
}

/**
 * Utility: Converts VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Client-side: Displays a local notification
 */
export function showLocalNotification(payload: NotificationPayload): void {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      data: payload.data,
      // actions are only supported in service worker notifications
    });
  }
}
