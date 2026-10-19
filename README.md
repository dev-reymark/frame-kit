# FrameKit

> **Any website. Your app.**  
> A lightweight, cross-platform application that transforms websites into standalone, native-looking experiences.

---

## 1. Overview

**FrameKit** converts any local or cloud web application into a distraction-free, native desktop and mobile experience across **Windows**, **macOS**, and **Android**.

It eliminates standard browser chrome (address bars, navigation buttons, bookmarks, tabs, and developer tools) and encapsulates web applications into a dedicated native container with configurable display modes and hardware security.

### Target URL Support
- **Localhost Development**: `http://localhost:3000`, `http://127.0.0.1:8000`
- **Private LAN Terminals**: `http://192.168.1.100:3000`, `http://10.0.0.50:8080`
- **Cloud & Production POS**: `https://pos.yourdomain.com`

---

## 2. FrameKit Identity & Architectural Standards

- **Design System**: Square corners, flat surfaces, thin 1px borders, Inter typography, and a lightweight custom SVG icon system.
- **Frontend Architecture**: React 19 + TypeScript, using shared modular UI primitives.
- **Desktop Engine**: Electron 44 for Windows and macOS with main-process boundary isolation.
- **Mobile Engine**: Capacitor with native Android WebView and Lock Task Mode pinning.
- **Display Modes**:
  - `Standard`: Framed native window with titlebar and window controls.
  - `Fullscreen`: Edge-to-edge borderless display.
  - `Kiosk`: Maximum containment (pins window on top and suppresses OS navigation).
- **Configuration & Scope**: Support for localhost, private LAN IPs, and public HTTPS domains.
- **Distribution**: Windows installer (`.exe`), macOS application (`.dmg`/`.zip`), and Android package (`.apk`/`.aab`).

---

## 3. Repository Structure

```text
frame-kit/
├── src/
│   ├── main/                 # Electron main process (lifecycle, security, window manager)
│   ├── preload/              # Isolated contextBridge preload scripts
│   ├── renderer/             # React 19 + TypeScript setup and diagnostics UI
│   └── types/                # Domain & configuration TypeScript contracts
├── landing/                  # Vercel-ready marketing landing page & docs viewer
│   ├── vercel.json           # Vercel deployment configuration & security headers
│   └── src/                  # React + Vite landing page with light/dark theme
├── docs/                     # Technical specifications & deployment guides
│   ├── ARCHITECTURE.md       # Multi-platform architecture & process isolation
│   ├── SECURITY.md           # Threat model, PBKDF2 cryptography & CVE mitigations
│   ├── BUILD-AND-INSTALL.md  # Multi-platform build & silent fleet rollout guide
│   ├── CONFIGURATION.md      # Configuration schema & emergency reset flags
│   └── TESTING.md            # Automated testing strategy & audit benchmarks
├── capacitor.config.ts       # Android Capacitor configuration
└── package.json              # Project scripts & electron-builder configuration
```

---

## 4. Quick Start

### Installation
```bash
git clone https://github.com/dev-reymark/frame-kit.git
cd frame-kit
npm install
```

### Desktop Development Mode
```bash
# Terminal 1: Start Vite renderer
npm run dev:renderer

# Terminal 2: Launch Electron desktop app
npm start
```

### Landing Page Development Mode (Vercel)
```bash
# Run local preview of the landing page
npm run landing:dev
```

### Run Tests
```bash
npm test
```

### Packaging & Production Builds
```bash
# Build desktop assets
npm run build

# Package Windows NSIS installer (.exe)
npm run dist:win

# Package macOS application (.dmg and .zip)
npm run dist:mac

# Build both Windows and macOS distributions
npm run dist:all
```

---

## 5. Security & Containment Architecture

> [!IMPORTANT]
> **Application-Level Kiosk vs. Operating System Kiosk Lockdown:**  
> FrameKit provides robust **application-level** containment: it removes browser navigation controls, blocks popup windows, filters destructive shortcuts, and restricts domain access via main-process interceptors.
> 
> In public unattended kiosk environments where users must be completely prevented from accessing the OS desktop:
> - **Windows**: Pair FrameKit with **Windows Assigned Access (Kiosk Mode)** or **Shell Launcher**.
> - **macOS**: Enable **macOS Single App Mode** via Mobile Device Management (MDM).
> - **Android**: FrameKit activates Android's native **Lock Task Mode** to disable Home and Recents buttons.

---

## 6. License

MIT License. Built for modern point-of-sale, self-service kiosks, and dedicated workstation deployments.