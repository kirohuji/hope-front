import { PushNotifications } from '@capacitor/push-notifications';
import { messagingService } from 'src/composables/context-provider';
export const addListeners = async () => {
  await PushNotifications.addListener('registration', token => {
    console.info('Registration token: ', token.value);
    messagingService.savePushNotificationToken({
      token: token.value
    })
  });

  await PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
  });
}

export const registerNotifications = async () => {
  PushNotifications.addListener('registration', token => {
    console.info('Registration token: ', token.value);
    messagingService.savePushNotificationToken({
      token: token.value
    })
  });
  PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
  });
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
}

export const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications();
  console.log('delivered notifications', notificationList);
}
// 清空所有已交付的通知
export const clearAllNotifications = async () => {
  try {
    await PushNotifications.removeAllDeliveredNotifications();
    console.log('所有通知已清空');
  } catch (error) {
    console.error('清空通知时出错:', error);
  }
};