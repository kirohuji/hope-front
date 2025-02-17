import { JPush } from 'capacitor-plugin-jpush';

export const registerNotificationsByHuawei = async () => {
  // 监听通知事件
  JPush.addListener('notificationOpened', (data) => {
    console.log('notificationOpened', data);
  });

  // 检测是否有通知权限
  JPush.checkPermissions().then(async ({ permission }) => {
    console.log('checkPermissions', permission);
    if (permission !== 'granted') {
      JPush.requestPermissions().then(async (res) => {
        console.log('requestPermissions', res.permission);
        if (res.permission === 'granted') {
          await JPush.startJPush();
        }
      });
    } else {
      await JPush.startJPush();
    }
    await JPush.setDebugMode({ isDebug: true });
    // 初始化极光推送
    setTimeout(() => {
      JPushMethods();
    }, 10000);
  });
};

const JPushMethods = async () => {
   // 设置推送别名
  await JPush.setAlias({
    alias: 'alias',
  });
  const getRegistrationID = await JPush.getRegistrationID();
  console.log('registrationId', JSON.stringify(getRegistrationID));
  alert('registrationId', JSON.stringify(getRegistrationID));
  // 推送事件监听
  const receivedEvent = await JPush.addListener('notificationReceived', (data) => {
    console.log('notificationReceived', data);
  });
};
