# Deployment Guide

This guide covers building, packaging, and deploying iDrive Desktop for production.

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). Deployment documentation adapted from original project.*

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Packaging](#packaging)
- [Code Signing](#code-signing)
- [Auto-Updates](#auto-updates)
- [Release Process](#release-process)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment

Same as development setup:
- Node.js 20+
- Python 3.10
- Visual Studio with C++ tools
- node-gyp

### Additional for Production

- **Code Signing Certificate**: For Windows code signing
- **Release Credentials**: For auto-update server
- **SonarCloud Token**: For code quality analysis (CI)

## Build Process

### Clean Build

Start with a clean environment:

```bash
# Remove artifacts
rimraf dist build node_modules

# Fresh install
npm ci --ignore-scripts
node node_modules/electron/install.js

# Rebuild native dependencies
npm run reload-native-deps
```

### Production Build

Build all components:

```bash
npm run build
```

This runs:
1. `build:main` - Main process bundle
2. `build:renderer` - Renderer process bundle
3. `build:sync-engine` - Sync engine bundle
4. `build:preload` - Preload script bundle

**Output**: `dist/` directory

### Build Configuration

Production builds use webpack with optimizations:

**Main Process** (`.erb/configs/webpack.config.main.prod.ts`):
- Minification with Terser
- Source maps for debugging
- Tree shaking
- External native modules

**Renderer** (`.erb/configs/webpack.config.renderer.prod.ts`):
- CSS optimization
- Code splitting
- Asset optimization
- HTML minification

## Packaging

### Create Installer

Package the application:

```bash
npm run package
```

This:
1. Runs production build
2. Packages with electron-builder
3. Creates installer in `build/` directory

### electron-builder Configuration

From `package.json`:

```json
{
  "build": {
    "productName": "iDrive",
    "appId": "com.logicarts.idrive",
    "asar": true,
    "asarUnpack": "**\\*.{node,dll}",
    "files": [
      "dist",
      "node_modules",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "verifyUpdateCodeSignature": false,
      "artifactName": "iDrive-Setup-${version}.${ext}"
    },
    "directories": {
      "buildResources": "assets",
      "output": "build"
    },
    "extraResources": [
      "./assets/**",
      "./clamAV/**"
    ]
  }
}
```

### Build Artifacts

After packaging:

```
build/
├── iDrive-Setup-2.6.3.exe         # Windows installer
├── win-unpacked/                  # Unpacked application
├── builder-debug.yml              # Build debug info
└── builder-effective-config.yaml  # Effective config
```

## Code Signing

### Windows Code Signing

**Requirements**:
- Code signing certificate (.pfx or .p12)
- Certificate password

**Setup**:

```bash
# Set environment variables
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password

# Or use electron-builder config
```

**Configuration**:

```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password",
    "signingHashAlgorithms": ["sha256"],
    "signDlls": true
  }
}
```

**Verify Signature**:

```powershell
# Check signature
Get-AuthenticodeSignature iDrive-Setup-2.6.3.exe

# Should show:
# Status: Valid
# SignerCertificate: CN=YourCompany
```

## Auto-Updates

### electron-updater Configuration

Auto-updates handled by `electron-updater`:

```typescript
import { autoUpdater } from 'electron-updater';

// Configure
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://your-update-server.com/idrive-desktop',
});

// Check for updates
autoUpdater.checkForUpdates();

// Listen for events
autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  // Prompt user to restart
});

autoUpdater.on('error', (error) => {
  console.error('Update error:', error);
});
```

### Update Server

**Requirements**:
- Hosting for update files
- HTTPS enabled
- CORS configured

**File Structure**:

```
your-update-server.com/idrive-desktop/
├── latest.yml                     # Update metadata
├── iDrive-Setup-2.6.3.exe        # Latest installer
└── iDrive-Setup-2.6.3.exe.blockmap  # Delta updates
```

**latest.yml Example**:

```yaml
version: 2.6.3
releaseDate: '2024-01-15T10:00:00.000Z'
files:
  - url: iDrive-Setup-2.6.3.exe
    sha512: abc123...
    size: 123456789
path: iDrive-Setup-2.6.3.exe
sha512: abc123...
releaseNotes: |
  - New feature X
  - Bug fix Y
  - Performance improvements
```

### Testing Updates

```bash
# Build with update config
npm run package

# Deploy to test server
# Test update flow
```

## Release Process

### 1. Version Bump

Update version in `package.json`:

```json
{
  "version": "2.6.4"
}
```

Update lock file:

```bash
npm install
```

### 2. Changelog

Update `CHANGELOG.md` (if exists) or create release notes.

### 3. Git Tag

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to 2.6.4"
git tag v2.6.4
git push origin main --tags
```

### 4. Build Release

```bash
# Clean build
rimraf dist build node_modules
npm ci

# Build and package
npm run package

# Verify installer
build/iDrive-Setup-2.6.4.exe
```

### 5. Code Signing

Sign the installer (see [Code Signing](#code-signing)).

### 6. Test Installer

- Install on clean Windows machine
- Verify application starts
- Test core functionality
- Verify auto-update works

### 7. Deploy

Upload to:
- Update server
- GitHub releases
- Distribution channels

### 8. Announce

- Update website
- Notify users
- Post on social media
- Update documentation

## CI/CD

### GitHub Actions Workflows

Located in `.github/workflows/`:

**Build and Release** (`windows-build-release.yml`):

```yaml
name: Windows Build Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm run init:ci
      
      - name: Build
        run: npm run build
      
      - name: Package
        run: npm run package
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v2
        with:
          name: installer
          path: build/*.exe
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

**Pull Request Checks** (`windows-pull-request.yml`):

```yaml
name: Windows Pull Request

on:
  pull_request:
    branches: [main, develop]

jobs:
  check:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install
        run: npm run init:ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Test
        run: npm run test -- --coverage
      
      - name: Build
        run: npm run build
```

### SonarCloud Analysis

**Configuration** (`sonar-project.properties`):

```properties
# Note: Update these settings for your own SonarCloud project
sonar.projectKey=your-org_idrive-desktop
sonar.organization=your-org
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx
```

**Workflow** (`windows-sonar-analysis.yml`):

Runs SonarCloud analysis on every PR and push to main.

## Environment Variables

### Build-time Variables

Set in webpack configs or `.env`:

```bash
NODE_ENV=production
API_URL=https://your-api-server.com
SENTRY_DSN=https://...
```

### Runtime Variables

Injected by webpack:

```typescript
// webpack.config.prod.ts
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env.API_URL': JSON.stringify(process.env.API_URL),
});
```

## Troubleshooting

### Build Fails

**Issue**: Native modules fail to build

**Solution**:
```bash
# Rebuild native modules
npm run reload-native-deps

# Or manually
npm run electron-rebuild
```

**Issue**: Out of memory during build

**Solution**:
```bash
# Increase Node memory
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Package Fails

**Issue**: ASAR packaging issues

**Solution**: Check `asarUnpack` configuration for native modules

**Issue**: Missing dependencies in package

**Solution**: Review `files` array in build config

### Code Signing Fails

**Issue**: Certificate not found

**Solution**: Verify `CSC_LINK` and `CSC_KEY_PASSWORD` are set correctly

**Issue**: Signature invalid

**Solution**: Use trusted certificate, check certificate expiration

### Installer Issues

**Issue**: Installer won't run

**Solution**: Check Windows Defender SmartScreen, verify signature

**Issue**: Application won't start

**Solution**: Check logs in `%APPDATA%\iDrive\logs`

## Best Practices

### Pre-Release Checklist

- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Code signed
- [ ] Installer tested
- [ ] Update mechanism tested
- [ ] Documentation updated

### Security

- Store certificates securely
- Use environment variables for secrets
- Never commit credentials
- Verify signatures
- Test on clean machines

### Quality

- Run full test suite
- Check SonarCloud reports
- Review security alerts
- Test on multiple Windows versions
- Verify performance

## Resources

- [electron-builder Documentation](https://www.electron.build/)
- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Windows Code Signing Guide](https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For deployment issues:
1. Check logs in `build/` directory
2. Review CI/CD logs
3. Consult electron-builder documentation
4. Ask team for help

---

**Note**: Always test releases thoroughly before deploying to users. A bad release can cause significant issues for users.
