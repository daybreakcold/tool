#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/work"
DIST="$ROOT/dist"

rm -rf "$WORK" "$DIST"
mkdir -p "$WORK" "$DIST"

cd "$WORK"
flutter create --org com.daybreakcold --platforms=android push_app_a
flutter create --org com.daybreakcold --platforms=android push_app_b

cp "$ROOT/overrides/app_a/lib/main.dart" "$WORK/push_app_a/lib/main.dart"
cp "$ROOT/overrides/app_a/android/AndroidManifest.xml" "$WORK/push_app_a/android/app/src/main/AndroidManifest.xml"
mkdir -p "$WORK/push_app_a/android/app/src/main/kotlin/com/daybreakcold/push_app_a"
cp "$ROOT/overrides/app_a/android/MainActivity.kt" "$WORK/push_app_a/android/app/src/main/kotlin/com/daybreakcold/push_app_a/MainActivity.kt"

cp "$ROOT/overrides/app_b/lib/main.dart" "$WORK/push_app_b/lib/main.dart"
cp "$ROOT/overrides/app_b/android/AndroidManifest.xml" "$WORK/push_app_b/android/app/src/main/AndroidManifest.xml"
mkdir -p "$WORK/push_app_b/android/app/src/main/kotlin/com/daybreakcold/push_app_b"
cp "$ROOT/overrides/app_b/android/MainActivity.kt" "$WORK/push_app_b/android/app/src/main/kotlin/com/daybreakcold/push_app_b/MainActivity.kt"

(cd "$WORK/push_app_a" && flutter build apk --release)
(cd "$WORK/push_app_b" && flutter build apk --release)

cp "$WORK/push_app_a/build/app/outputs/flutter-apk/app-release.apk" "$DIST/push_app_a-release.apk"
cp "$WORK/push_app_b/build/app/outputs/flutter-apk/app-release.apk" "$DIST/push_app_b-release.apk"

ls -lh "$DIST"
