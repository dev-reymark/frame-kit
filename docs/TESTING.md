# Automated Testing & Verification Strategy

This document describes the testing architecture, test suites, coverage matrices, and execution guidelines for **FrameKit**.

---

## 1. Testing Philosophy

FrameKit sits as a security container between the operating system and untrusted web content. Its correctness directly impacts Point-of-Sale availability and terminal security.

Testing focuses on:
- **Zero-False-Positive Security Checks**: Strict validation of URLs, origins, protocols, and sender frame boundaries.
- **Fail-Safe Cryptography**: Verification that password hashes are non-deterministic, salted with 32 bytes, and verified with constant-time equality.
- **Resilient Network Handling**: Probe timeouts, redirect loops, and server error detection.
- **Non-Destructive Execution**: All tests use isolated temporary directories and ephemeral ports; no production state is affected.

---

## 2. Test Suite Architecture

```text
tests/
├── unit/
│   ├── url-validation.test.ts       # 10 tests: URL syntax, localhost, LAN IPs, scheme rejection
│   ├── security-hash.test.ts        # 5 tests: PBKDF2-SHA512 hashing, salt uniqueness, rate limiter
│   ├── config-store.test.ts         # 7 tests: Persistence, schema validation, auth-gated updates
│   ├── connection-tester.test.ts    # 4 tests: Mock HTTP server, latency, redirects, unreachable ports
│   └── navigation-rules.test.ts     # 11 tests: Origin evaluation, blocked shortcuts, admin accelerator
└── e2e/
    └── lockdown-smoke.test.ts       # 3 tests: Distribution bundle integrity, IPC isolation, full lifecycle
```

---

## 3. Test Coverage Matrix

| Category | Target Module | Verified Behaviors | Result |
| :--- | :--- | :--- | :---: |
| **URL Validation** | `src/renderer/utils/validation.ts` | • `http://localhost:3000` validation<br>• `http://127.0.0.1:3000` validation<br>• LAN IP `192.168.1.100:3000` validation<br>• Subnet `10.x.x.x` validation<br>• HTTPS validation<br>• Plain HTTP warning generation<br>• Rejection of `javascript:`, `file:`, `ftp:`<br>• Rejection of empty/malformed URLs | **PASSED** (10/10) |
| **Cryptography** | `src/main/config.ts` | • 32-byte unique hex salt generation<br>• 100,000 PBKDF2-SHA512 iterations<br>• Constant-time equality verification (`timingSafeEqual`)<br>• Non-matching password rejection | **PASSED** (5/5) |
| **Rate Limiter** | `src/main/config.ts` | • Success resets failed attempt counter<br>• 4 consecutive failures leave 1 attempt<br>• 5th failure triggers 30-second lockout<br>• Lockout suppresses further evaluation | **PASSED** (Included) |
| **Persistence** | `src/main/config.ts` | • Unconfigured initial state<br>• Atomic write (`.tmp` to `.json`)<br>• Origin extraction to `allowedDomains`<br>• Password length validation (&ge;4 chars)<br>• Re-reading persisted state on new instance | **PASSED** (7/7) |
| **Connection Probe** | `src/main/connection-tester.ts` | • Ephemeral HTTP server probe<br>• Response time latency calculation<br>• Safe redirect resolution (302 &rarr; 200)<br>• Unreachable port detection (`ECONNREFUSED`)<br>• Malformed destination error handling | **PASSED** (4/4) |
| **FrameKit Rules** | `src/main/security.ts` | • Same-origin subpaths & queries allowed<br>• Explicitly whitelisted domains allowed<br>• Unapproved external domains blocked<br>• DevTools shortcuts blocked (`F12`, `Ctrl+Shift+I`)<br>• Reload shortcuts blocked (`F5`, `Ctrl+R`)<br>• Navigation shortcuts blocked (`Alt+Left`, `Ctrl+L`)<br>• Ordinary typing and form keys permitted<br>• Admin shortcut detection (`Ctrl+Shift+Alt+K`) | **PASSED** (11/11) |
| **E2E & IPC** | `src/main/ipc-handlers.ts` & build | • Built bundle verification (`dist/main`, `preload`, `renderer`)<br>• IPC sender rejection for external web frames<br>• Full save &rarr; authenticate &rarr; update cycle | **PASSED** (3/3) |

---

## 4. Running the Tests

### Execute Full Test Suite
```powershell
npm test
```

### Run Tests in Watch Mode (During Development)
```powershell
npx vitest
```

### Run a Specific Test File
```powershell
npx vitest run tests/unit/url-validation.test.ts
```

---

## 5. Build Verification Results

| Target | Artifact Location | Size | Verification Status |
| :--- | :--- | :---: | :---: |
| **Compiled Renderer** | `dist/renderer/index.html` + assets | ~250 KB | Built with Vite |
| **Compiled Main** | `dist/main/index.js` + modules | ~18 KB | Transpiled with tsc |
| **Preload Scripts** | `dist/preload/*.js` | ~2 KB | Sandboxed & verified |
| **Unpacked Desktop App** | `release/win-unpacked/FrameKit.exe` | ~247 MB | Fully executable |
| **Windows NSIS Installer** | `release/FrameKit Setup 1.0.0.exe` | 109 MB | Standalone downloadable installer |
