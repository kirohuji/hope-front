import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { messagingService, versionService } from 'src/composables/context-provider';

// 状态管理
let updateData = { version: -1 };

// 更新设备状态
const updateDeviceStatus = async (deviceId, status) => {
  try {
    await messagingService.updateDeviceStatus({
      deviceId,
      status,
    });
  } catch (error) {
    console.error('更新设备状态失败:', error);
  }
};

// 检查并下载新版本
const checkAndDownloadUpdate = async (currentVersion, config) => {
  const version = `${config.majorVersion}.${config.minorVersion}.${config.patchVersion}`;
  
  if (currentVersion.bundle.version === version || !config.majorVersion) {
    console.log('当前安装包已经是最新的了');
    return null;
  }

  console.log('从后台拿到的安装包URL开始下载', config);
  if (!config.file) {
    console.log('后台没有配置安装包');
    return null;
  }

  try {
    const data = await CapacitorUpdater.download({
      version,
      url: config.file,
    });
    console.log('从后台下载好的安装包', data);
    return data;
  } catch (error) {
    console.error('下载更新包失败:', error);
    return null;
  }
};

// 安装更新包
const installUpdate = async (data, currentVersion) => {
  if (!data || data.version === '' || data.version === -1 || currentVersion.version === data.version) {
    return;
  }

  console.log('安装包安装状态');
  try {
    console.log('安装包bundle list', await CapacitorUpdater.list());
    await CapacitorUpdater.set(data);
    console.log('安装包安装安好了');
  } catch (error) {
    console.error('安装包安装失败:', error);
  }
};

// 处理应用状态变化
const handleAppStateChange = async (state) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const current = await CapacitorUpdater.current();
  const deviceId = await Device.getId();

  if (state.isActive) {
    await updateDeviceStatus(deviceId, 'active');
    const config = await versionService.getActive();
    const newData = await checkAndDownloadUpdate(current, config);
    if (newData) {
      updateData = newData;
    }
  } else {
    await updateDeviceStatus(deviceId, 'deactive');
    await installUpdate(updateData, current);
  }
};

// 初始化自动更新功能
export const initializeAutoUpdate = () => {
  try {
    CapacitorUpdater.notifyAppReady();
    App.addListener('appStateChange', handleAppStateChange);
  } catch (error) {
    console.error('初始化自动更新失败:', error);
  }
}; 