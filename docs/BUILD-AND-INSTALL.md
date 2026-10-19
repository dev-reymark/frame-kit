# Build & Installation Guide

This guide details the procedure for developing, testing, building, and deploying the **FrameKit** on Windows 10 and Windows 11.

---

## 1. Prerequisites

Before building, verify the following prerequisites are installed:
- **Operating System**: Windows 10 or Windows 11 (64-bit architecture)
- **Node.js**: Version 20.x or higher (LTS recommended)
- **Package Manager**: npm 9.x or higher
- **Git** (optional, for version control)

Check versions:
```powershell
node -v
npm -v
```

---

## 2. Development Setup

### A. Clone & Install Dependencies
```powershell
cd C:\rm\framekit
npm install
```

### B. Running in Development Mode
During development, the React configuration UI runs with hot-reloading via Vite, and Electron points to `http://localhost:5173`.

```powershell
# In Terminal 1: Start Vite development server
npm run dev:renderer

# In Terminal 2: Launch Electron main process
$env:NODE_ENV="development"
npm start
```

---

## 3. Automated Verification & Testing

Run the Vitest test suite to verify unit logic, password cryptography, URL classification, navigation restrictions, and end-to-end integration:

```powershell
npm test
```

Expected output:
```text
✓ tests/unit/url-validation.test.ts (10 tests)
✓ tests/unit/navigation-rules.test.ts (11 tests)
✓ tests/unit/connection-tester.test.ts (4 tests)
✓ tests/unit/security-hash.test.ts (5 tests)
✓ tests/unit/config-store.test.ts (7 tests)
✓ tests/e2e/lockdown-smoke.test.ts (3 tests)

Test Files  6 passed (6)
     Tests  40 passed (40)
```

---

## 4. Production Compilation & Packaging

### A. Production Build Pipeline
The build pipeline compiles the React frontend to `dist/renderer` and transpile the TypeScript main/preload scripts to `dist/main` and `dist/preload`:

```powershell
npm run build
```

### B. Unpacked Directory Packaging (`npm run pack`)
Packages the Electron runtime, native dependencies, assets, and compiled code into an unpacked directory for immediate local verification:

```powershell
npm run pack
```
Artifacts are generated in:
```text
release/win-unpacked/
├── FrameKit.exe     # Standalone portable executable
├── resources/
│   └── app.asar             # Encapsulated application bundle
└── ... Chromium and V8 runtime DLLs
```

Run directly:
```powershell
& ".\release\win-unpacked\FrameKit.exe"
```

### C. Downloadable Windows Installer (`npm run dist`)
Generates a signed/packaged NSIS installer executable (.exe) for distribution:

```powershell
npm run dist
```
Output artifacts in `release/`:
- `release\FrameKit Setup 1.0.0.exe` (~109 MB complete installer)
- `release\FrameKit Setup 1.0.0.exe.blockmap`

---

## 5. End-User Installation & Mass Deployment

### A. Interactive GUI Installation
Double-click `FrameKit Setup 1.0.0.exe`:
1. Choose installation folder (default: `%LOCALAPPDATA%\Programs\FrameKit`).
2. The installer automatically registers:
   - Desktop shortcut (`FrameKit`)
   - Start Menu program group (`FrameKit`)
   - Windows Add/Remove Programs uninstaller
3. Click **Finish** to immediately launch the configuration screen.

### B. Unattended / Silent Mass Deployment (Enterprise / POS Fleets)
For mass deployment across hundreds of POS terminals using Microsoft Intune, SCCM, or PowerShell:

```powershell
# Silent installation without prompts
Start-Process -FilePath ".\release\FrameKit Setup 1.0.0.exe" -ArgumentList "/S" -Wait
```

### C. Clean Uninstallation
Run the uninstaller via Windows Settings > Apps & features, or invoke silently:
```powershell
# Silent uninstallation
$uninstaller = "$env:LOCALAPPDATA\Programs\FrameKit\Uninstall FrameKit.exe"
if (Test-Path $uninstaller) {
    Start-Process -FilePath $uninstaller -ArgumentList "/S" -Wait
}
```
