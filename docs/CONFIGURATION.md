# Configuration Reference & Administration

This guide describes the configuration schema, storage location, launch modes, allowed origin rules, and emergency recovery procedures for **FrameKit**.

---

## 1. Storage Location & Schema

FrameKit persists its configuration locally without requiring an external database, cloud service, or internet connection.

### File Location
```text
Windows: %APPDATA%\framekit\framekit-config.json
(Full path: C:\Users\<Username>\AppData\Roaming\framekit\framekit-config.json)
```

### JSON Schema
```json
{
  "appName": "Kofi POS Terminal",
  "targetUrl": "http://localhost:3000/pos",
  "launchMode": "kiosk",
  "launchOnStartup": true,
  "rememberConfig": true,
  "adminPasswordHash": "7f8b94...64-byte-hex-hash...",
  "adminPasswordSalt": "2c3a5e...32-byte-hex-salt...",
  "allowedDomains": [
    "http://localhost:3000",
    "http://192.168.1.100:8000"
  ],
  "adminShortcut": "CommandOrControl+Shift+Alt+K",
  "createdAt": "2026-10-19T09:30:00.000Z",
  "updatedAt": "2026-10-19T09:30:00.000Z"
}
```

### Property Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `appName` | string | Display name on the application window title and Windows taskbar. |
| `targetUrl` | string (URL) | The primary website or web application URL to load. |
| `launchMode` | string | Window launch mode: `'windowed'`, `'fullscreen'`, or `'kiosk'`. |
| `launchOnStartup` | boolean | Configures Windows Run key (`openAtLogin`) to launch automatically upon login. |
| `rememberConfig` | boolean | If `true`, launches directly into target website on subsequent starts. If `false`, opens configuration screen. |
| `adminPasswordHash` | string (hex) | PBKDF2-SHA512 hash derived from administrator password and salt. |
| `adminPasswordSalt` | string (hex) | Cryptographically secure 32-byte salt unique to this device. |
| `allowedDomains` | string[] | Array of approved origins and domains allowed for navigation/redirection. |
| `adminShortcut` | string | Keyboard accelerator that summons the administrator authentication modal. |

---

## 2. Launch Modes

### A. Kiosk Mode (`kiosk`) - Recommended for POS & Kiosks
- Runs borderless fullscreen.
- Electron flags: `setKiosk(true)`, `setAlwaysOnTop(true, 'screen-saver')`.
- Suppresses default menu bar and window controls.
- Locks the window to the current display.

### B. Fullscreen Mode (`fullscreen`)
- Runs borderless across the full display dimensions.
- Electron flags: `setFullScreen(true)`.
- Allows window minimization if managed by supervisor.

### C. Windowed Mode (`windowed`)
- Runs as a standard, resizable desktop application window (default: 1280x800).
- Electron flags: `autoHideMenuBar: true`, `Menu.setApplicationMenu(null)`.
- Features standard title bar and window minimize/maximize buttons, but contains no browser address bar or menus. Ideal for back-office or manager workstations.

---

## 3. Allowed Domains & Navigation Rules

When a target URL is configured, its origin is automatically extracted and whitelisted:
- Target: `http://localhost:3000/kiosk/order` &rarr; Whitelisted: `http://localhost:3000`
- Any internal link to `http://localhost:3000/orders`, `http://localhost:3000/api/...`, or `http://localhost:3000/checkout` is automatically permitted.
- Navigating to an unapproved external domain (e.g. `https://google.com` or `https://malicious.com`) is blocked at the main process level.
- To allow external payment gateways or CDN assets, additional domains can be specified in `allowedDomains` (e.g. `https://paymongo.com` or `https://api.payment.com`).

---

## 4. Administrator Access & Shortcuts

### Default Shortcut
Press:
$$\text{Ctrl} + \text{Shift} + \text{Alt} + \text{K}$$

### Unlock Flow
1. Pressing the shortcut opens a secure, centered modal dialog running in an isolated local frame.
2. The administrator enters their password.
3. Upon authentication:
   - Change target website URL.
   - Switch launch mode (e.g., from Kiosk to Windowed).
   - Set a new administrator password.
   - Reload the application.
   - Exit Kiosk Mode.
   - Exit Application.

---

## 5. Emergency Recovery Procedure

If an administrator password is forgotten or lost:
1. Terminate the application via Task Manager or administrative command prompt:
   ```powershell
   taskkill /F /IM "FrameKit.exe"
   ```
2. Delete the local configuration file:
   ```powershell
   Remove-Item "$env:APPDATA\framekit\framekit-config.json" -Force
   ```
3. Relaunch FrameKit. The application will start clean in first-time setup mode, prompting for a new target URL and new administrator password.
