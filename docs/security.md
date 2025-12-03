# Security Guide

This document outlines security practices and considerations for iDrive Desktop.

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). Security architecture preserved from original project.*

## Table of Contents

- [Security Architecture](#security-architecture)
- [Encryption](#encryption)
- [Authentication](#authentication)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Secure Storage](#secure-storage)
- [Antivirus Integration](#antivirus-integration)
- [Best Practices](#best-practices)
- [Security Auditing](#security-auditing)

## Security Architecture

### Defense in Depth

iDrive Desktop implements multiple layers of security:

```
┌────────────────────────────────────────┐
│     Application Layer Security         │
│  - Input validation                    │
│  - Output encoding                     │
│  - Session management                  │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│     Transport Layer Security           │
│  - HTTPS/TLS 1.2+                     │
│  - Certificate validation              │
│  - Secure WebSocket                    │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│     Data Layer Security                │
│  - End-to-end encryption              │
│  - Encrypted storage                   │
│  - Secure key management               │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│     System Layer Security              │
│  - OS-level encryption                 │
│  - Secure file permissions             │
│  - Antivirus integration               │
└────────────────────────────────────────┘
```

## Encryption

### End-to-End Encryption (E2EE)

All files are encrypted **before** leaving the user's device:

```typescript
import { encryptFile } from '@internxt/sdk';

// Note: Uses original Internxt SDK for compatibility
// 1. Generate encryption key from user password
const encryptionKey = await deriveKey(userPassword);

// 2. Encrypt file
const encryptedStream = await encryptFile(
  fileStream,
  encryptionKey
);

// 3. Upload encrypted data
await uploadFile(encryptedStream);
```

**Key Properties**:
- Files encrypted client-side
- Servers cannot decrypt files (zero-knowledge architecture)
- AES-256 encryption

### Encryption Libraries

**OpenPGP** (openpgp v5.11.3):
```typescript
import * as openpgp from 'openpgp';

// Generate key pair
const { privateKey, publicKey } = await openpgp.generateKey({
  type: 'rsa',
  rsaBits: 4096,
  userIDs: [{ name: 'User', email: 'user@example.com' }],
});

// Encrypt message
const encrypted = await openpgp.encrypt({
  message: await openpgp.createMessage({ text: 'secret' }),
  encryptionKeys: publicKey,
});

// Decrypt message
const decrypted = await openpgp.decrypt({
  message: await openpgp.readMessage({ armoredMessage: encrypted }),
  decryptionKeys: privateKey,
});
```

### Encryption at Rest

**Local Database**:
- SQLite database encrypted using `better-sqlite3`
- Sensitive fields double-encrypted
- Encryption keys stored in OS keychain

**Configuration Storage**:
- `electron-store` with encryption enabled
- Auth tokens encrypted
- User credentials never stored in plaintext

### Key Management

**Key Derivation**:
```typescript
import { pbkdf2 } from 'crypto';

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}
```

**Key Storage**:
- Master key derived from password
- Never stored in memory longer than necessary
- Cleared from memory after use
- OS keychain for persistent storage

### Cryptographic Best Practices

✅ **DO**:
- Use established libraries (OpenPGP, Node crypto)
- Generate strong random keys (crypto.randomBytes)
- Use authenticated encryption (AES-GCM)
- Validate all inputs before encryption
- Use proper key derivation (PBKDF2, Argon2)

❌ **DON'T**:
- Implement custom crypto algorithms
- Store keys in source code or config files
- Use weak passwords or keys
- Reuse IVs or nonces
- Log sensitive data or keys

## Authentication

### User Authentication

**Login Flow**:
```typescript
interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

// 1. Hash password client-side
const hashedPassword = await hashPassword(credentials.password);

// 2. Send to server
const { token, refreshToken } = await authenticate({
  email: credentials.email,
  password: hashedPassword,
  twoFactorCode: credentials.twoFactorCode,
});

// 3. Store tokens securely
await storeTokens({ token, refreshToken });
```

### Token Management

**JWT Tokens**:
```typescript
import jwt from 'jsonwebtoken';

// Decode token (validation done server-side)
const decoded = jwt.decode(token) as {
  userId: string;
  email: string;
  exp: number;
};

// Check expiration
if (decoded.exp * 1000 < Date.now()) {
  // Token expired, refresh
  await refreshAuthToken();
}
```

**Token Storage**:
- Stored in encrypted `electron-store`
- Never logged or exposed in UI
- Cleared on logout
- Auto-refresh before expiration

**Token Refresh**:
```typescript
async function refreshAuthToken(): Promise<string> {
  const refreshToken = electronStore.get('refreshToken');
  
  const { token, refreshToken: newRefreshToken } = 
    await authService.refreshToken(refreshToken);
  
  electronStore.set('token', token);
  electronStore.set('refreshToken', newRefreshToken);
  
  return token;
}
```

### Two-Factor Authentication (2FA)

```typescript
interface TwoFactorAuth {
  enabled: boolean;
  method: 'totp' | 'sms';
}

// Enable 2FA
async function enable2FA(method: 'totp' | 'sms') {
  const secret = await authService.generate2FASecret();
  
  // Show QR code for TOTP
  if (method === 'totp') {
    const qrCode = await generateQRCode(secret);
    showQRCode(qrCode);
  }
  
  // Verify code
  const code = await promptForCode();
  await authService.verify2FA(code);
}
```

### Session Management

- Session timeout: 24 hours
- Auto-refresh: 1 hour before expiration
- Concurrent session limit: 5 devices
- Force logout on password change

## Data Protection

### Input Validation

```typescript
import { z } from 'zod';

// Validate file upload
const FileUploadSchema = z.object({
  path: z.string().min(1).max(4096),
  size: z.number().min(0).max(5 * 1024 * 1024 * 1024), // 5GB
  name: z.string().min(1).max(255),
  parentId: z.string().uuid(),
});

function validateFileUpload(data: unknown) {
  return FileUploadSchema.parse(data);
}
```

### Output Encoding

```typescript
// Sanitize file names
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid chars
    .replace(/\.\./g, '_') // Prevent directory traversal
    .substring(0, 255); // Limit length
}

// Sanitize paths
function sanitizePath(path: string): string {
  const normalized = normalize(path);
  const resolved = resolve(syncRoot, normalized);
  
  // Ensure path is within sync root
  if (!resolved.startsWith(syncRoot)) {
    throw new Error('Path traversal attempt detected');
  }
  
  return resolved;
}
```

### Memory Safety

```typescript
// Clear sensitive data from memory
function clearSensitiveData(buffer: Buffer) {
  if (buffer) {
    buffer.fill(0);
  }
}

// Example usage
async function processEncryptionKey(key: Buffer) {
  try {
    await useKey(key);
  } finally {
    clearSensitiveData(key);
  }
}
```

## Network Security

### HTTPS/TLS

**All API communication uses HTTPS**:

```typescript
// API client configuration (example)
// Note: Update baseUrl to your own API endpoint
const apiClient = createClient({
  baseUrl: 'https://your-api-server.com',
  timeout: 30000,
  validateStatus: (status) => status < 500,
  // TLS configuration
  httpsAgent: new https.Agent({
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  }),
});
```

### Certificate Validation

```typescript
import { checkServerIdentity } from 'tls';

// Custom certificate validation
function validateCertificate(cert: any, host: string) {
  // Validate certificate chain
  const error = checkServerIdentity(host, cert);
  if (error) {
    throw new Error(`Certificate validation failed: ${error.message}`);
  }
  
  // Additional checks
  if (cert.valid_to < Date.now()) {
    throw new Error('Certificate expired');
  }
  
  // Check certificate pinning (if configured)
  if (pinnedCertificates[host]) {
    const fingerprint = getCertificateFingerprint(cert);
    if (fingerprint !== pinnedCertificates[host]) {
      throw new Error('Certificate pinning validation failed');
    }
  }
}
```

### Request Security

**CSRF Protection**:
- Origin validation
- Request signing
- Token-based authentication

**Rate Limiting**:
```typescript
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  minTime: 100, // Minimum 100ms between requests
  maxConcurrent: 5,
  reservoir: 100, // Max 100 requests
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000, // Per minute
});

// Wrap API calls
const rateLimitedRequest = limiter.wrap(apiRequest);
```

## Secure Storage

### Electron Store Configuration

```typescript
import Store from 'electron-store';

const store = new Store({
  name: 'config',
  encryptionKey: getEncryptionKey(), // Derived from OS keychain
  clearInvalidConfig: true,
  schema: {
    token: {
      type: 'string',
    },
    refreshToken: {
      type: 'string',
    },
    // ... other schema
  },
});
```

### SQLite Database Security

```typescript
import Database from 'better-sqlite3';

// Open encrypted database
const db = new Database('data.db', {
  // Enable encryption
  key: getDbEncryptionKey(),
  // Read-only for workers
  readonly: false,
  // Enable WAL mode for better concurrency
  wal: true,
});

// Set secure pragmas
db.pragma('journal_mode = WAL');
db.pragma('cipher_compatibility = 4');
```

### File Permissions

```typescript
import { chmod, chown } from 'fs/promises';

// Set secure file permissions (Unix)
async function secureFile(path: string) {
  await chmod(path, 0o600); // Owner read/write only
}

// Windows ACLs
import { exec } from 'child_process';

async function secureFileWindows(path: string) {
  // Grant access only to current user
  await exec(`icacls "${path}" /inheritance:r /grant:r "%USERNAME%:(R,W)"`);
}
```

## Antivirus Integration

### ClamAV Setup

Located in `clamAV/` directory, configured via PowerShell script.

**Setup**:
```bash
npm run clamav
```

**Integration**:
```typescript
import { scanFile } from '@internxt/scan';

async function scanFileForViruses(filePath: string): Promise<ScanResult> {
  try {
    const result = await scanFile(filePath);
    
    if (result.isInfected) {
      logger.warn(`Virus detected in ${filePath}: ${result.virusName}`);
      // Quarantine file
      await quarantineFile(filePath);
      // Notify user
      notifyUser('Virus detected', result.virusName);
    }
    
    return result;
  } catch (error) {
    logger.error('Virus scan failed:', error);
    // Continue with caution or block
    return { isInfected: false, error };
  }
}
```

### Scan Policies

**When to Scan**:
- Before upload
- After download
- On file modification (optional)
- Scheduled scans (optional)

**Scan Configuration**:
```typescript
interface ScanConfig {
  enabled: boolean;
  scanOnUpload: boolean;
  scanOnDownload: boolean;
  scanSchedule?: string; // Cron expression
  maxFileSize: number; // Skip very large files
}
```

## Best Practices

### For Developers

1. **Never Log Sensitive Data**
   ```typescript
   // ❌ Bad
   logger.debug('User credentials:', { password, token });
   
   // ✅ Good
   logger.debug('User authenticated:', { userId: user.id });
   ```

2. **Validate All Inputs**
   ```typescript
   // Always validate before use
   const validated = FileUploadSchema.parse(untrustedInput);
   ```

3. **Use Prepared Statements**
   ```typescript
   // ❌ Bad (SQL injection)
   db.exec(`SELECT * FROM users WHERE id = ${userId}`);
   
   // ✅ Good
   db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
   ```

4. **Clear Sensitive Data**
   ```typescript
   try {
     const key = deriveKey(password);
     await useKey(key);
   } finally {
     key.fill(0); // Clear from memory
   }
   ```

5. **Handle Errors Securely**
   ```typescript
   // Don't expose internal details
   try {
     await sensitiveOperation();
   } catch (error) {
     logger.error('Operation failed:', error);
     throw new Error('Operation failed'); // Generic message
   }
   ```

### For Users

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Unique password

2. **Enable 2FA**
   - Use authenticator app
   - Save backup codes securely

3. **Keep Software Updated**
   - Install updates promptly
   - Security patches are critical

4. **Verify Downloads**
   - Only download from official sources
   - Verify installer signatures

5. **Secure Your Device**
   - Use full disk encryption
   - Keep OS and antivirus updated
   - Use strong device password

## Security Auditing

### Code Review

**Security Checklist**:
- [ ] No secrets in code
- [ ] Input validation present
- [ ] Output encoding applied
- [ ] Proper error handling
- [ ] Secure defaults
- [ ] Dependencies up to date
- [ ] No SQL injection vectors
- [ ] No XSS vectors
- [ ] CSRF protection
- [ ] Authentication required

### Dependency Scanning

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Static Analysis

**SonarCloud Integration**:
- Automatic code quality checks
- Security hotspot detection
- Vulnerability scanning
- Technical debt tracking

### Penetration Testing

Regular security assessments include:
- Authentication bypass attempts
- Authorization checks
- Input validation testing
- Session management review
- Encryption validation
- Network security testing

## Vulnerability Reporting

### Report Security Issues

**Do NOT** open public issues for security vulnerabilities.

**Contact**: Use GitHub Security Advisories for this repository

**Include**:
- Detailed description
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Responsible Disclosure

1. Report vulnerability privately
2. Allow reasonable time for fix (90 days)
3. Coordinate disclosure timing
4. Receive credit in security advisories

## Security Updates

### Update Policy

- **Critical**: Patched within 24 hours
- **High**: Patched within 7 days
- **Medium**: Patched within 30 days
- **Low**: Patched in next release

### Notification

Users notified of security updates via:
- In-app notifications
- Email (if opted in)
- Release notes
- Security advisories

## Compliance

### Data Protection

- **GDPR**: EU data protection compliance
- **CCPA**: California privacy compliance
- **Data Minimization**: Collect only necessary data
- **Right to Deletion**: Users can delete data
- **Data Portability**: Users can export data

### Audit Logging

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure';
  metadata?: any;
}

function logAudit(log: AuditLog) {
  auditLogger.info({
    ...log,
    // Don't log sensitive data
    metadata: sanitizeMetadata(log.metadata),
  });
}
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

## Getting Help

For security questions or concerns:
1. Review this security guide
2. Check code review comments
3. Consult security team
4. Report vulnerabilities responsibly

Remember: Security is everyone's responsibility! 🔒
