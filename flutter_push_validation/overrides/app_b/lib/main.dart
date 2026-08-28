import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const PushAppB());
}

class PushAppB extends StatelessWidget {
  const PushAppB({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Push App B',
      theme: ThemeData(colorSchemeSeed: Colors.green, useMaterial3: true),
      home: const BHomePage(),
    );
  }
}

class BHomePage extends StatefulWidget {
  const BHomePage({super.key});

  @override
  State<BHomePage> createState() => _BHomePageState();
}

class _BHomePageState extends State<BHomePage> {
  static const _channel = MethodChannel('push_validation/app_b');
  String _uri = '直接启动 B（没有收到跳转 URI）';

  @override
  void initState() {
    super.initState();
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onNewUri') {
        setState(() => _uri = (call.arguments as String?) ?? '');
      }
    });
    _loadInitialUri();
  }

  Future<void> _loadInitialUri() async {
    final value = await _channel.invokeMethod<String>('getLaunchUri');
    if (!mounted) return;
    if (value != null && value.isNotEmpty) setState(() => _uri = value);
  }

  String get _source {
    final parsed = Uri.tryParse(_uri);
    return parsed?.queryParameters['source'] ?? 'unknown';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('App B - 已被拉起')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.check_circle, size: 72),
            const SizedBox(height: 16),
            const Text('B 已成功启动', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Text('source: $_source', style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 12),
            const Text('完整 URI：', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SelectableText(_uri),
            const SizedBox(height: 24),
            const Text('source=in_app_message：场景 1\nsource=notification_via_a：场景 2\nsource=notification_direct_b：场景 3'),
          ],
        ),
      ),
    );
  }
}
