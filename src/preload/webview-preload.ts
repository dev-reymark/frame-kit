// Minimal isolated preload for untrusted external web content.
// Per Section 7 (Security Requirements):
// - nodeIntegration: false
// - contextIsolation: true
// - sandbox: true
// - No arbitrary Node.js access
// - No unsafe IPC endpoints exposed to loaded websites

// Prevent malicious iframe window.opener tampering
try {
  if (window.opener) {
    try {
      window.opener = null;
    } catch {
      // ignore
    }
  }
} catch {
  // ignore
}
