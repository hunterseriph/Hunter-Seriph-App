# Hunter Seriph App

This is my Android app. It's got my Twitch stream, my YouTube videos, my merch store, the dev logs for what I'm working on, and the games I've been making, all in the black and red look I use everywhere else.

## Install it

1. Go to the **Releases** page on the right side of this repo.
2. Open the newest release on your Android phone and download **Hunter-Seriph.apk**.
3. Tap it to install. Android will probably ask you to allow installs from your browser, so say yes.

## PC version

Every release also has **Hunter-Seriph-PC.exe** for Windows. Download it and double-click it, no install needed. To update, download the newer one and replace the old file. Your game saves carry over.

Windows may say it protected your PC because the app isn't signed. Click **More info**, then **Run anyway**.

On PC: arrow keys or WASD to move, Space/Z to jump, X to attack, C for specials, F11 for fullscreen. Gamepads work in the games too.

Both versions are direct downloads rather than something from the Play Store.

## What's in it

- **Live:** watch my Twitch stream and chat without leaving the app
- **Videos:** my latest YouTube uploads
- **Games:** the games I make, which all work offline
- **Projects:** dev logs and updates on what I'm building
- **Shop:** my Fourthwall merch

## Coding used

The whole app is plain HTML, CSS and JS in `www/`, wrapped into an Android app with Capacitor and a Windows app with Electron (`desktop/`). The games are in `www/games/`. A GitHub Action builds the APK and the PC app every time something is pushed. You can also run it by hand from the **Actions** tab.

There are no API keys or secrets in this repo or in the app. Twitch uses their public embeds and YouTube comes from my channel's public feed.

## Find me

- YouTube: [@hunterseriph](https://youtube.com/@hunterseriph)
- Twitch: [hunterseriph](https://twitch.tv/hunterseriph)
- Merch: [hunter-seriph-shop.fourthwall.com](https://hunter-seriph-shop.fourthwall.com)
