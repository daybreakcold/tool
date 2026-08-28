# Flutter Android A -> B Push Validation

两个最小 Flutter Android Demo，用于验证：

1. A 应用内查看消息，点击后打开 B。
2. A 收到“推送通知”后，点击系统通知先打开 A，A 再自动打开 B。
3. A 收到“推送通知”后，点击系统通知直接打开 B，不经过 A Activity。

> 当前包用 Android 本地系统通知模拟“推送到达后的通知阶段”。这样可以先把 Android 跨 App 拉起链路验证清楚，不依赖 Firebase 项目、google-services.json 或服务端。真实 FCM 接入后，只需要复用 A 原生侧的通知 PendingIntent 逻辑。

## 包名

- A: `com.daybreakcold.push_app_a`
- B: `com.daybreakcold.push_app_b`
- B Deep Link: `pushb://open`

## 安装顺序

先 B，后 A：

```bash
adb install -r push_app_b-release.apk
adb install -r push_app_a-release.apk
```

Android 13+ 首次测试场景 2/3 时需要允许 A 的通知权限；授权后再点一次对应按钮生成通知。

## 验证

### 场景 1

打开 A -> 点“打开 B”。

B 页面应显示：

`source=in_app_message`

### 场景 2

打开 A -> 点“生成场景 2 通知” -> 回桌面/下拉通知栏 -> 点击通知。

预期：A 被打开，然后约 250ms 后 B 被打开。

B 页面显示：

`source=notification_via_a`

### 场景 3

打开 A -> 点“生成场景 3 通知” -> 回桌面/下拉通知栏 -> 点击通知。

预期：通知 PendingIntent 直接指向 B 的 MainActivity，B 直接被打开。

B 页面显示：

`source=notification_direct_b`

## ADB 额外验证 B

```bash
adb shell am start \
  -a android.intent.action.VIEW \
  -d 'pushb://open?source=adb_test' \
  com.daybreakcold.push_app_b
```

## 真实 FCM 下一步

真实推送需要给 A 配置 Firebase Android App / `google-services.json` 和服务端发送凭证。基础验证通过后，把 FCM 收到的 data 映射到：

- `open_mode=a_then_b` -> 场景 2 的 PendingIntent
- `open_mode=direct_b` -> 场景 3 的 PendingIntent

即可验证真实远程推送链路。
