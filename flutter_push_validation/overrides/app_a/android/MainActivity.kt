package com.daybreakcold.push_app_a

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    companion object {
        private const val CHANNEL = "push_validation/app_a"
        private const val NOTIFICATION_CHANNEL_ID = "push_validation"
        private const val NOTIFICATION_CHANNEL_NAME = "Push Validation"
        private const val REQ_NOTIFICATION_PERMISSION = 901
        private const val EXTRA_OPEN_B = "open_b_after_a"
        private const val EXTRA_SOURCE = "source"
    }

    private var consumedLaunchIntent = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannel()
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "openB" -> result.success(openB("in_app_message"))
                    "showNotificationOpenAThenB" -> result.success(showNotification(openAFirst = true))
                    "showNotificationDirectB" -> result.success(showNotification(openAFirst = false))
                    else -> result.notImplemented()
                }
            }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        consumedLaunchIntent = false
    }

    override fun onResume() {
        super.onResume()
        if (!consumedLaunchIntent && intent?.getBooleanExtra(EXTRA_OPEN_B, false) == true) {
            consumedLaunchIntent = true
            val source = intent?.getStringExtra(EXTRA_SOURCE) ?: "notification_via_a"
            intent?.removeExtra(EXTRA_OPEN_B)
            Handler(Looper.getMainLooper()).postDelayed({ openB(source) }, 250)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            )
            channel.description = "A -> B basic validation notifications"
            manager.createNotificationChannel(channel)
        }
    }

    private fun ensureNotificationPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQ_NOTIFICATION_PERMISSION)
            return false
        }
        return true
    }

    private fun showNotification(openAFirst: Boolean): String {
        if (!ensureNotificationPermission()) {
            return "已申请通知权限；授权后请再点一次按钮"
        }

        val now = System.currentTimeMillis()
        val pendingIntent = if (openAFirst) {
            val launchA = Intent(this, MainActivity::class.java).apply {
                putExtra(EXTRA_OPEN_B, true)
                putExtra(EXTRA_SOURCE, "notification_via_a")
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }
            PendingIntent.getActivity(this, 2001, launchA,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        } else {
            val directB = Intent(Intent.ACTION_VIEW).apply {
                component = ComponentName(
                    "com.daybreakcold.push_app_b",
                    "com.daybreakcold.push_app_b.MainActivity"
                )
                data = Uri.parse("pushb://open?source=notification_direct_b&ts=$now")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            PendingIntent.getActivity(this, 2002, directB,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        val notificationBuilder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        val title = if (openAFirst) "场景 2：先 A 后 B" else "场景 3：直接打开 B"
        val text = if (openAFirst) {
            "点击：系统通知 -> A -> 自动打开 B"
        } else {
            "点击：系统通知 -> B（不经过 A Activity）"
        }

        val notification = notificationBuilder
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(text)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(if (openAFirst) 3001 else 3002, notification)
        return "通知已生成，请回桌面/下拉通知栏点击验证"
    }

    private fun openB(source: String): String {
        val now = System.currentTimeMillis()
        val intentB = Intent(Intent.ACTION_VIEW).apply {
            component = ComponentName(
                "com.daybreakcold.push_app_b",
                "com.daybreakcold.push_app_b.MainActivity"
            )
            data = Uri.parse("pushb://open?source=$source&ts=$now")
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }

        return try {
            startActivity(intentB)
            "已发送 Intent 拉起 B，source=$source"
        } catch (e: Exception) {
            "拉起 B 失败：${e.javaClass.simpleName}；请确认 B 已安装"
        }
    }
}
