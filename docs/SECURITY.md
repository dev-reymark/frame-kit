# Security Architecture & Hardening Guide

This document specifies the security model, defense-in-depth mitigations, credential cryptography, IPC isolation, and operating-system deployment guidelines for **FrameKit**.

---

## 1. Threat Model & Security Posture

### A. The Core Principle: Treat All Loaded Content as Untrusted
The target web application (even when hosted on `localhost` or an internal LAN IP) must be treated as **untrusted web content**. If a web vulnerability exists on the target site (such as Cross-Site Scripting [XSS] or an open redirect), an attacker must not be able to compromise the underlying Windows desktop operating system or access Electron/Node.js host capabilities.

### B. Security Boundaries
1. **Desktop Host vs. Web Content**: The web application runs in an unprivileged, sandboxed Chromium renderer with zero access to Node.js APIs (`fs`, `child_process`, `net`, etc.).
2. **Local Admin UI vs. External Content**: The administrator configuration interface runs under strict local `file://` origin with a Content Security Policy (CSP). External websites cannot invoke administrator IPC channels.
3. **Application Layer vs. Operating System Layer**: Kiosk window flags and shortcut filters protect the application workspace; operating-system policies protect the underlying hardware.

---

## 2. Electron Hardening Checklist Implementation

| Security Requirement | Status | Implementation Mechanism |
| :--- | :---: | :--- |
| `nodeIntegration: false` | Verified | Enforced on all `BrowserWindow` and `webPreferences` instances. |
| `contextIsolation: true` | Verified | Scripts run in separate JavaScript contexts; prototype pollution prevented. |
| `sandbox: true` | Verified | Chromium sandboxing active for untrusted website rendering. |
| Web Security Active | Verified | `webSecurity: true`, `allowRunningInsecureContent: false`. |
| Block New Windows | Verified | `setWindowOpenHandler` denies all window/tab creation (`{ action: 'deny' }`). |
| In-Page Navigation Guard | Verified | `will-navigate` blocks unapproved external domains and dangerous schemes (`javascript:`, `file:`). |
| Redirect Guard | Verified | `will-redirect` inspects target redirect URLs and blocks unapproved domains. |
| Disable `<webview>` tags | Verified | `will-attach-webview` calls `event.preventDefault()`. |
| Disable Context Menu | Verified | `context-menu` event suppressed to prevent developer inspect element. |
| Strict Input/Shortcut Guard | Verified | `before-input-event` intercepts DevTools (`F12`, `Ctrl+Shift+I`) and browser shortcuts. |
| IPC Sender Validation | Verified | `isTrustedSender()` validates `senderFrame.url` matches internal app resources. |
| TLS Certificate Validation | Verified | `app.on('certificate-error')` rejects invalid certificates; never ignored. |
| Content Security Policy | Verified | Local HTML specifies strict CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';`. |

---

## 3. Credential Cryptography & Admin Protection

### A. Salted PBKDF2 Hashing
Administrator credentials are never stored in plaintext:
- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Digest**: SHA-512
- **Iterations**: 100,000 iterations
- **Key Length**: 64 bytes (128 hex characters)
- **Salt**: 32 cryptographically secure random bytes generated via `crypto.randomBytes(32)` (64 hex characters) per configuration
- **Comparison**: `crypto.timingSafeEqual()` prevents timing analysis attacks.

### B. Brute-Force Rate Limiter
The main process enforces an in-memory `AdminRateLimiter`:
- Tracks consecutive failed authentication attempts.
- Up to **5 consecutive attempts** are permitted.
- After 5 consecutive failures, the administrator interface locks down for **30 seconds** (`LOCKOUT_DURATION_MS = 30000`).
- During lockout, any further attempts are immediately rejected without performing PBKDF2 computation.

---

## 4. Network Security & HTTP Policies

- **HTTPS by Default**: Recommended for all public internet endpoints.
- **HTTP Policy**: Plain HTTP (`http://`) is permitted for `localhost`, `127.0.0.1`, `::1`, and private LAN subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `.local`).
- **HTTP Warning**: When plain HTTP is configured on a non-private domain, the setup screen highlights an amber warning: *"Warning: Plain HTTP is unencrypted. HTTPS is strongly recommended for public domains."*
- **Strict TLS Enforcement**: Self-signed or expired certificates on HTTPS endpoints trigger strict TLS rejections. Certificates are never bypassed silently.

---

## 5. Application-Level Lockdown vs. OS-Enforced Lockdown

> [!WARNING]
> **Understanding the Boundary Between Application and Operating System:**
> No user-mode desktop application (Electron, C++, WPF, or Java) can intercept or suppress low-level Windows kernel secure attention sequences (`Ctrl+Alt+Delete`), system access keys, or task switching if the operating system grants the user shell access.
> 
> FrameKit provides comprehensive **application-level** lockdown. To achieve an **airtight, tamper-proof hardware kiosk**, pair FrameKit with Windows Operating System Lockdown mechanisms.

### Recommended OS Deployment Modes for Windows 10/11 Pro & Enterprise:

### Option A: Windows Assigned Access (Recommended for POS Terminals)
Windows Assigned Access locks the device to a single dedicated user account running a single designated desktop application:
1. Open Windows **Settings** > **Accounts** > **Other users** > **Set up a kiosk**.
2. Select **Assigned access**.
3. Create a local restricted kiosk user account (e.g., `KioskUser`).
4. Select `FrameKit.exe` as the kiosk application.
5. Windows will automatically disable `Ctrl+Alt+Delete` options (Task Manager, Switch User, Lock), suppress the Windows Taskbar, and restart the application automatically if closed.

### Option B: Windows Shell Launcher
For advanced unattended installations:
Replace `explorer.exe` as the default Windows shell for the dedicated kiosk account with `FrameKit.exe`:
```powershell
# Set FrameKit as the default shell for KioskUser via registry or WMI
Set-ItemProperty -Path "HKLM:\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -Value "C:\Program Files\FrameKit\FrameKit.exe"
```

### Option C: Group Policy Restrictions (GPO)
If using standard Windows desktop accounts, enable the following local group policies (`gpedit.msc`):
- `User Configuration > Administrative Templates > System > Ctrl+Alt+Del Options`:
  - **Remove Task Manager**: Enabled
  - **Remove Lock Computer**: Enabled
  - **Remove Change Password**: Enabled
- `User Configuration > Administrative Templates > Start Menu and Taskbar`:
  - **Prevent access to the command prompt**: Enabled
  - **Prevent access to registry editing tools**: Enabled
