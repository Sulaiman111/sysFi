import cron from 'node-cron';
import { scheduleSubscriptionExpirationNotices } from '../services/notification.service';

/**
 * جدولة مهمة cron لإرسال إشعارات انتهاء الاشتراك
 * تعمل كل يوم في الساعة 8 صباحًا
 */
export const startSubscriptionNotificationCron = (): void => {
  // تشغيل المهمة كل يوم في الساعة 8 صباحًا
  cron.schedule('0 8 * * *', async () => {
    console.log('Running subscription notification cron job...');
    try {
      await scheduleSubscriptionExpirationNotices();
      console.log('Subscription notification cron job completed successfully');
    } catch (error) {
      console.error('Error in subscription notification cron job:', error);
    }
  });
  
  console.log('Subscription notification cron job scheduled');
};