# 佳麦权限申请及使用情况说明

为保障佳麦能实现与安全稳定运行之目的，我们可能会申请或使用操作系统的相关权限
为保障您的知情权，我们通过下列列表将产品可能申请、使用的相关操作系统权限进行展示，您可以根据实际需要对相关权限进行管理
根据产品的升级，申请、使用权限的类型与目的可能会有变动，我们将及时根据这些变动对列表进行调整，以确保您及时获悉权限的申请与使用情况
请您知悉，我们为业务与产品的功能与安全需要，我们可能也会使用第三方SDK，这些第三方也可能会申请或使用相关操作系统权限
在使用产品的过程中，您可能会使用第三方开发的H5页面或小程序，这些第三方开发开发的插件或小程序也可能因业务功能所必需而申请或使用相关操作系统权限。 

## Android 应用权限列表

| 权限名称 | 权限功能 | 使用场景及目的 | 备注 |
|---------|---------|--------------|------|
| android.permission.CAMERA | 使用拍摄照片和视频、完成扫描二维码 | 是为了使您可以使用摄像头进行扫码、拍摄，用于实现登录、图片反馈及上传头像的功能 | |
| android.permission.READ_EXTERNAL_STORAGE | 提供读取手机储存空间SD卡内数据的功能 | 允许 App 读取手机存储中的图片和文件，主要用于帮助您发布信息，上传头像、图片，以及在手机本地记录崩溃日志的功能 | |
| android.permission.WRITE_EXTERNAL_STORAGE | 提供写入外部储存SD卡功能 | 允许 App 写入/下载/保存/缓存/修改/删除图片、文件、崩溃日志 | |
| android.permission.RECORD_AUDIO | 使用麦克风录制音频 | 用于帮助您实现跟读发音、录音反馈意见建议的功能 | |
| android.permission.READ_CALENDAR | 读取系统中的日历活动 | 用于帮助您设置与完成活动预约提醒功能 | |
| android.permission.WRITE_CALENDAR | 添加或修改系统中的日历活动 | 用于帮助您设置与完成活动预约提醒功能 | |
| android.permission.BLUETOOTH | 允许应用连接蓝牙设备 | 适配蓝牙设备 | |
| android.permission.INTERNET | 访问网络权限 | 实现应用程序联网 | |
| android.permission.ACCESS_WIFI_STATE | 获取WiFi状态权限 | 监控网络变化，提示用户当前网络环境 | |
| android.permission.ACCESS_NETWORK_STATE | 获取网络状态权限 | 监控网络变化，提示用户当前网络环境 | |
| android.permission.WAKE_LOCK | 唤醒锁定权限 | 允许程序在手机屏幕关闭后后台进程仍然运行，保持屏幕唤醒 | |
| android.permission.CHANGE_NETWORK_STATE | 改变网络连接状态 | 允许应用改变网络连接状态（手机号一键登录、支付） | |
| android.permission.GET_TASKS | 获取当前运行的任务信息的权限 | 判断联运 App 是否在主进程初始化，避免初始化进程错误导致不可用 | 仅 vivo 联运渠道需要 |
| android.permission.REQUEST_INSTALL_PACKAGES | 安装应用权限 | 允许应用安装程序（华为渠道自动更新、vivo 渠道安装安全插件） | 仅华为、vivo 联运渠道需要 |
| android.permission.QUERY_ALL_PACKAGES | 读取已安装的应用列表权限 | 用于判断服务安全插件是否已安装（Android 11及以上必须添加此权限才能获取 vivo 服务安全插件安装包的状态） | 仅 vivo 联运渠道需要 |
| android.permission.GET_ACCOUNTS | 获取设备上的帐号列表 | 当用户使用小米账号授权登录时使用 | 仅小米联运渠道需要 |
| android.permission.POST_NOTIFICATIONS | 通知的运行时权限 | Android 13 引入的新的权限，用于从应用内发送通知（用于推送和事件提醒） | |
| android.permission.FOREGROUND_SERVICE | 前台服务权限 | 允许应用使用前台服务（通知中心播放条播放音频需要） | |

## iOS 应用权限列表

| 权限名称 | 权限功能 | 使用场景及目的 |
|---------|---------|--------------|
| NSCalendarsUsageDescription | 访问系统中的日历活动 | 用于帮助您设置、完成或修改活动预约提醒功能 |
| NSPhotoLibraryAddUsageDescription | 向相册中添加内容 | 允许App写入/下载/保存/修改/删除图片、文件、崩溃日志 |
| NSPhotoLibraryUsageDescription | 读取相册中内容 | 允许 App 读取存储中的图片、文件内容，主要用于帮助您发布信息、上传头像 |
| NSCameraUsageDescription | 使用摄像头 | 是为了使您可以使用摄像头进行扫码、拍摄，用于实现登录、图片反馈及上传头像的功能 |
| NSMicrophoneUsageDescription | 使用麦克风 | 用于帮助您实现跟读发音、录音反馈意见建议的功能 |

## 鸿蒙 应用权限列表

| 权限名称 | 权限功能 | 使用场景及目的 |
|---------|---------|--------------|
| ohos.permission.INTERNET | 使用 Internet 网络 | 允许应用程序联网和发送推送数据的权限，以便提供消息推送服务 |
| ohos.permission.GET_NETWORK_INFO | 获取数据网络信息 | 检测在网络异常状态下避免数据发送，节省流量 |
| ohos.permission.APP_TRACKING_CONSENT | 读取开放匿名设备标识符 | 提供统计分析服务 |
| ohos.permission.READ_PASTEBOARD | 读取剪贴板 | 应用需要读取剪贴板中特定格式口令，自动打开应用内对应页面 |
| ohos.permission.CAMERA | 使用相机 | 是为了使您可以使用摄像头进行扫码、拍摄，用于实现登录、图片反馈及上传头像的功能 |
| ohos.permission.MICROPHONE | 使用麦克风 | 用于帮助您实现跟读发音、录音反馈意见建议的功能 |
| ohos.permission.READ_CALENDAR | 读取日历信息 | 用于帮助您设置与完成活动预约提醒功能 |
| ohos.permission.WRITE_CALENDAR | 添加、移除或更改日历活动 | 用于帮助您设置与完成活动预约提醒功能 |
