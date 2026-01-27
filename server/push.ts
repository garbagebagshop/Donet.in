import webpush from 'web-push';
import { logger } from './logger.js';

// Configure web-push with VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:' + process.env.EMAIL_USER!,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions (in production, use database)
const subscriptions = new Map<string, webpush.PushSubscription>();

export const pushService = {
  // Subscribe a user for push notifications
  subscribe: (userId: string, subscription: webpush.PushSubscription) => {
    subscriptions.set(userId, subscription);
    logger.info(`User ${userId} subscribed to push notifications`);
  },

  // Unsubscribe a user
  unsubscribe: (userId: string) => {
    subscriptions.delete(userId);
    logger.info(`User ${userId} unsubscribed from push notifications`);
  },

  // Send notification to a specific user
  sendToUser: async (userId: string, payload: any) => {
    const subscription = subscriptions.get(userId);
    if (!subscription) {
      logger.warn(`No subscription found for user ${userId}`);
      return;
    }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      logger.info(`Push notification sent to user ${userId}`);
    } catch (error) {
      logger.error(`Failed to send push notification to user ${userId}:`, error);
      // Remove invalid subscription
      subscriptions.delete(userId);
    }
  },

  // Send notification to all subscribers
  sendToAll: async (payload: any) => {
    const promises = Array.from(subscriptions.entries()).map(([userId, subscription]) =>
      webpush.sendNotification(subscription, JSON.stringify(payload))
        .catch((error) => {
          logger.error(`Failed to send push notification to user ${userId}:`, error);
          subscriptions.delete(userId);
        })
    );

    await Promise.allSettled(promises);
    logger.info(`Push notification sent to ${promises.length} subscribers`);
  },

  // Send booking notification
  sendBookingNotification: async (userId: string, booking: any) => {
    await pushService.sendToUser(userId, {
      title: 'New Booking Request',
      body: `You have a new booking request from ${booking.customerName}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: `/bookings/${booking.id}`,
        bookingId: booking.id,
      },
    });
  },

  // Send booking confirmation
  sendBookingConfirmation: async (userId: string, booking: any) => {
    await pushService.sendToUser(userId, {
      title: 'Booking Confirmed',
      body: `Your booking with ${booking.driverName} has been confirmed`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: `/bookings/${booking.id}`,
        bookingId: booking.id,
      },
    });
  },

  // Send driver status update
  sendDriverStatusUpdate: async (userId: string, driver: any) => {
    await pushService.sendToUser(userId, {
      title: 'Driver Update',
      body: `${driver.name} is now ${driver.status}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: `/drivers/${driver.id}`,
        driverId: driver.id,
      },
    });
  },
};

export { vapidKeys };