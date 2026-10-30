// Runs after `npx cap add android`. Applies the app icon, dark splash/theme colours and
// status bar colours to the generated Android project.
const fs = require('fs'), path = require('path');
const res = path.join('android', 'app', 'src', 'main', 'res');
function write(p, t) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t); }

// 1. icons
const iconRoot = path.join('resources', 'android');
for (const dir of fs.readdirSync(iconRoot)) {
  const from = path.join(iconRoot, dir), to = path.join(res, dir);
  if (!fs.statSync(from).isDirectory()) continue;
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
}
write(path.join(res, 'values', 'hs_colors.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="hs_icon_bg">#0E0406</color>\n</resources>\n');
const adaptive = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@color/hs_icon_bg"/>\n  <foreground android:drawable="@mipmap/hs_foreground"/>\n</adaptive-icon>\n';
write(path.join(res, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptive);
write(path.join(res, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), adaptive);

// 2. theme / splash
const stylesPath = path.join(res, 'values', 'styles.xml');
if (fs.existsSync(stylesPath)) {
  let s = fs.readFileSync(stylesPath, 'utf8');
  s = s.replace(/@drawable\/splash/g, '@color/hs_icon_bg');
  s = s.replace(/(<item name="windowSplashScreenBackground">)[^<]*(<\/item>)/g, '$1@color/hs_icon_bg$2');
  const ITEMS = { 'android:statusBarColor': '@color/hs_icon_bg', 'android:navigationBarColor': '@color/hs_icon_bg', 'android:windowOptOutEdgeToEdgeEnforcement': 'true',
    'android:windowLayoutInDisplayCutoutMode': 'shortEdges', // landscape: draw up to the camera notch instead of leaving a grey bar
    'android:windowBackground': '@color/hs_icon_bg' };
  s = s.replace(/(<style name="AppTheme[^"]*"[^>]*>)([\s\S]*?)(<\/style>)/g, function (m, open, body, close) { // add each item a style does not have yet (a duplicate would fail the build)
    let add = ''; for (const k in ITEMS) if (body.indexOf('name="' + k + '"') < 0) add += '\n        <item name="' + k + '">' + ITEMS[k] + '</item>';
    return open + add + body + close; });
  fs.writeFileSync(stylesPath, s);
  console.log('styles.xml patched');
} else console.warn('WARNING: styles.xml not found');
// 3. let embedded Twitch/YouTube players share the sign-in cookie (needed for 18+ streams)
const javaDir = path.join('android', 'app', 'src', 'main', 'java', 'com', 'hunterseriph', 'app');
write(path.join(javaDir, 'MainActivity.java'), `package com.hunterseriph.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // landscape: the app runs right up to the camera notch. Only the status bar, the navigation bar and the
        // keyboard push the page in; the notch does not (it used to leave a grey, then black, strip down that side).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        View content = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(content, (v, wi) -> {
            Insets b = wi.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.ime());
            v.setPadding(b.left, b.top, b.right, b.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(getBridge().getWebView(), true);
    }
    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }
}
`);
// 4. fixed signing key + rising version number so new builds install OVER the old app
fs.writeFileSync(path.join('android', 'app', 'hs-debug.keystore'), Buffer.from('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', 'base64'));
const gp = path.join('android', 'app', 'build.gradle');
let g = fs.readFileSync(gp, 'utf8');
g = g.replace(/android\s*\{/, `android {
    signingConfigs {
        debug {
            storeFile file('hs-debug.keystore')
            storePassword 'android'
            keyAlias 'hsdebug'
            keyPassword 'android'
        }
    }`);
// The repo was recreated in Oct 2026 and its build counter restarted at 1, but phones already had build 39
// from the old repo. Android refuses to install a lower version over a higher one, so add 1000.
g = g.replace(/versionCode\s+\d+/, 'versionCode (1000 + Integer.parseInt(System.getenv("GITHUB_RUN_NUMBER") ?: "1"))');
if (!g.includes('hs-debug.keystore') || !g.includes('GITHUB_RUN_NUMBER')) throw new Error('build.gradle patch failed');
fs.writeFileSync(gp, g);
console.log('android project patched');
