import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const PushAppA());
}

class PushAppA extends StatelessWidget {
  const PushAppA({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Push App A',
      theme: ThemeData(colorSchemeSeed: Colors.blue, useMaterial3: true),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  static const _channel = MethodChannel('push_validation/app_a');
  String _status = '等待操作';

  Future<void> _call(String method) async {
    try {
      final result = await _channel.invokeMethod<String>(method);
      if (!mounted) return;
      setState(() => _status = result ?? '已执行');
    } on PlatformException catch (e) {
      if (!mounted) return;
      setState(() => _status = '失败: ${e.code} ${e.message ?? ''}');
    }
  }

  Widget _caseCard({
    required String title,
    required String desc,
    required String buttonText,
    required VoidCallback onPressed,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(desc),
            const SizedBox(height: 12),
            FilledButton(onPressed: onPressed, child: Text(buttonText)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('App A - 推送拉起 B 验证')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            '先安装 B，再安装 A。Android 13+ 第一次创建通知时会申请通知权限，授权后再点一次场景 2/3。',
            style: TextStyle(fontSize: 15),
          ),
          const SizedBox(height: 16),
          _caseCard(
            title: '场景 1：A 应用内消息 → 打开 B',
            desc: '模拟 A 已经拿到一条消息，用户在 A 内点击消息后，通过显式 Intent 拉起 B。',
            buttonText: '打开 B',
            onPressed: () => _call('openB'),
          ),
          _caseCard(
            title: '场景 2：系统通知 → 打开 A → 自动打开 B',
            desc: 'A 创建一条系统通知。点击通知后先进入 A，A 在 onResume 检测标记，然后立即拉起 B。',
            buttonText: '生成场景 2 通知',
            onPressed: () => _call('showNotificationOpenAThenB'),
          ),
          _caseCard(
            title: '场景 3：系统通知 → 直接打开 B',
            desc: 'A 创建系统通知，但通知 PendingIntent 直接指向 B 的 MainActivity，不经过 A Activity。',
            buttonText: '生成场景 3 通知',
            onPressed: () => _call('showNotificationDirectB'),
          ),
          const SizedBox(height: 8),
          Text('状态：$_status'),
          const SizedBox(height: 20),
          const Text(
            '说明：当前 APK 用“本地系统通知”模拟收到推送后的通知点击链路，避免 Firebase 项目配置影响基础验证。接入 FCM 后只需把收到消息后的逻辑复用到同一套通知/跳转方法。',
            style: TextStyle(color: Colors.black54),
          ),
        ],
      ),
    );
  }
}
