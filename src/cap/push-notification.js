import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { messagingService } from 'src/composables/context-provider';

export const registerNotifications = async () => {
  try {
    // 首先检查权限
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    // 注册监听器
    await PushNotifications.addListener('registration', async token => {
      try {
        console.info('Registration token: ', token.value);
        const device = await Device.getInfo();
        const deviceId = await Device.getId(); 
        await messagingService.savePushNotificationToken({
          token: token.value,
          device,
          deviceId
        });
      } catch (error) {
        console.error('Error saving push notification token:', error);
      }
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

    // 注册推送通知
    await PushNotifications.register();
    console.log('Push notifications registered successfully');
  } catch (error) {
    console.error('Error registering push notifications:', error);
    throw error;
  }
}

export const getDeliveredNotifications = async () => {
  try {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
    return notificationList;
  } catch (error) {
    console.error('Error getting delivered notifications:', error);
    throw error;
  }
}

export const clearAllNotifications = async () => {
  try {
    // 检查推送通知是否已注册
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      throw new Error('Push notifications not registered. Please register first.');
    }

    await PushNotifications.removeAllDeliveredNotifications();
    console.log('所有通知已清空');
  } catch (error) {
    console.error('清空通知时出错:', error);
    throw error;
  }
};