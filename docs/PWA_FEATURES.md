# PWA (Progressive Web App) Features Added

## ✨ What's New

Your Guidance Center app now has **Progressive Web App (PWA)** capabilities! This means users can install the app directly from their browser and use it like a native mobile app.

## 🚀 Features Added

### 1. **App Installation**

- **Install Button**: Added on both the landing page and top navigation
- **Browser Prompt**: Automatically shows install prompt when available
- **Cross-Platform**: Works on desktop, mobile, and tablet devices

### 2. **Offline Support**

- **Service Worker**: Caches app resources for offline access
- **Google Fonts Caching**: Optimized caching for Google Fonts
- **Asset Caching**: Images, CSS, and JavaScript files cached automatically

### 3. **Native App Experience**

- **Standalone Mode**: Runs without browser UI when installed
- **Custom Icons**: Dedicated PWA icons (192x192 and 512x512)
- **Theme Colors**: Consistent branding with your app colors
- **Splash Screen**: Automatic splash screen generation

### 4. **Enhanced Meta Tags**

- **Apple Touch Icons**: Support for iOS home screen installation
- **Theme Colors**: Proper status bar styling
- **App Manifest**: Complete web app manifest configuration

## 📱 How to Install

### For Users:

1. **On Landing Page**: Click the "Install App" button in the hero section
2. **In Navigation**: Click the "Install App" button in the top navigation (desktop only)
3. **Browser Prompt**: Accept the browser's install prompt when it appears
4. **Manual Installation**: Use browser menu → "Install [App Name]"

### Installation Methods by Platform:

#### **Desktop (Chrome/Edge)**:

- Install button in address bar
- Browser menu → "Install Guidance Center"
- Custom install button in app

#### **Mobile (Android)**:

- "Add to Home Screen" banner
- Browser menu → "Add to Home Screen"
- Custom install button

#### **iOS (Safari)**:

- Share button → "Add to Home Screen"
- (Note: iOS has limited PWA support)

## 🔧 Technical Implementation

### Files Added/Modified:

1. **`vite.config.ts`** - PWA plugin configuration
2. **`index.html`** - PWA meta tags
3. **`src/components/atoms/InstallAppButton.tsx`** - Install button component
4. **`public/pwa-*.png`** - PWA icons
5. **Auto-generated files**:
   - `manifest.webmanifest`
   - `sw.js` (service worker)
   - `registerSW.js`

### PWA Configuration:

```typescript
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Guidance Center",
    short_name: "Guidance Center",
    description: "Mental Health Support and Guidance Application",
    theme_color: "#3B82F6",
    background_color: "#ffffff",
    display: "standalone",
    // ... icons and other config
  },
  workbox: {
    // Caching strategies for optimal performance
  },
});
```

## 🎯 Benefits

1. **Faster Loading**: Cached resources load instantly
2. **Offline Access**: Basic functionality works without internet
3. **Native Feel**: Launches like a native app
4. **Better Engagement**: Home screen icon increases usage
5. **Reduced Friction**: No app store download required
6. **Cross-Platform**: One codebase, works everywhere

## 🔍 Testing

To test PWA features:

1. **Build the app**: `npm run build`
2. **Serve production build**: `npm run preview` or deploy to a server
3. **Open in browser**: Visit the deployed URL
4. **Check PWA readiness**: Use Chrome DevTools → Application → Manifest
5. **Test installation**: Look for install prompts and buttons

## 📊 PWA Audit

You can audit PWA compliance using:

- Chrome DevTools → Lighthouse → Progressive Web App
- Should score 100% on PWA checklist

## 🔄 Updates

The app uses `autoUpdate` strategy, so:

- New versions are automatically downloaded
- Users are notified of updates
- No manual refresh required

---

**Note**: PWA features work best on HTTPS in production. For development, they work on localhost.
