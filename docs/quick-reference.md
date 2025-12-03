# Developer Quick Reference

Quick reference guide for common development tasks in Internxt Drive Desktop.

## Table of Contents

- [Setup](#setup)
- [Running](#running)
- [Building](#building)
- [Testing](#testing)
- [Debugging](#debugging)
- [Code Quality](#code-quality)
- [Common Tasks](#common-tasks)
- [Useful Commands](#useful-commands)

## Setup

### First Time Setup

```bash
# Clone repository
git clone https://github.com/logic-arts-official/iDrive.git
cd iDrive

# Install Node.js 20
nvm install 20
nvm use 20

# Install dependencies and setup
npm run init:dev

# (Optional) Setup ClamAV
npm run clamav
```

### Quick Start

```bash
# Start development (two terminals)
npm run start              # Terminal 1: Renderer
npm run start:reload       # Terminal 2: Main + Sync Engine
```

## Running

| Command | Description |
|---------|-------------|
| `npm run start` | Start renderer dev server (port 1212) |
| `npm run start:reload` | Start main process + sync engine |
| `npm run start:main` | Start main process only |
| `npm run start:sync-engine` | Build sync engine |
| `npm run start:nodemon` | Start with nodemon (auto-reload) |

## Building

| Command | Description |
|---------|-------------|
| `npm run build` | Build all (main + renderer + sync-engine + preload) |
| `npm run build:main` | Build main process |
| `npm run build:renderer` | Build renderer |
| `npm run build:sync-engine` | Build sync engine |
| `npm run build:preload` | Build preload script |
| `npm run build:dll` | Build development DLL |
| `npm run package` | Build production package |

## Testing

| Command | Description |
|---------|-------------|
| `npm run test` | Run all tests |
| `npm run test -- --watch` | Run tests in watch mode |
| `npm run test -- --coverage` | Run with coverage |
| `npm run test:infra` | Run infrastructure tests |
| `npm run test:renderer` | Run renderer tests |
| `npm run test:one <pattern>` | Watch single test file |

### Test File Pattern

```bash
# Watch specific test
npm run test:one file-uploader

# Watch specific path
npm run test:one src/apps/sync-engine
```

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Renderer",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src",
      "timeout": 30000
    }
  ]
}
```

### Chrome DevTools

Main process debugging:

```bash
# Start with inspect flag
electron --inspect=5858 .
```

Renderer process: F12 or Ctrl+Shift+I in app window

### Logging

```typescript
import { logger } from '@/apps/shared/logger/logger';

logger.debug({ msg: 'Debug message', data });
logger.info({ msg: 'Info message', data });
logger.warn({ msg: 'Warning', data });
logger.error({ msg: 'Error', error, data });
```

Logs location: `%APPDATA%\Internxt\logs`

## Code Quality

### Linting

```bash
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues
```

### Formatting

```bash
npm run format            # Check formatting
npm run format:fix        # Fix formatting
```

### Type Checking

```bash
npm run type-check        # TypeScript type check
```

### Dead Code Detection

```bash
npm run find-deadcode     # Find unused code
```

### All Quality Checks

```bash
npm run lint && npm run format && npm run type-check && npm run test
```

## Common Tasks

### Adding a New Feature

1. Create feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Create feature files:
   ```bash
   # In appropriate directory
   touch my-feature.ts
   touch my-feature.test.ts
   ```

3. Implement and test:
   ```bash
   npm run test:one my-feature
   ```

4. Run quality checks:
   ```bash
   npm run lint:fix
   npm run format:fix
   npm run type-check
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

### Adding a Dependency

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name

# Rebuild native modules if needed
npm run reload-native-deps
```

### Updating Dependencies

```bash
# Check outdated
npm outdated

# Update specific package
npm update package-name

# Update all
npm update

# Rebuild after updates
npm run reload-native-deps
```

### Creating a Migration

```bash
# Create migration directory
mkdir -p src/migrations/v2.7.0

# Create migration file
touch src/migrations/v2.7.0/migration.ts
```

### Adding IPC Handler

**Main Process** (`src/apps/main/ipcs/`):

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('MY_CHANNEL', async (event, arg) => {
  // Handle request
  return result;
});
```

**Renderer** (`src/apps/renderer/api/`):

```typescript
import { ipcRenderer } from 'electron';

export async function myApiCall(data: any) {
  return ipcRenderer.invoke('MY_CHANNEL', data);
}
```

### Adding a Page

1. Create page component:
   ```bash
   touch src/apps/renderer/pages/MyPage.tsx
   ```

2. Add route in App.tsx:
   ```typescript
   <Route path="/my-page" element={<MyPage />} />
   ```

3. Navigate from code:
   ```typescript
   import { useNavigate } from 'react-router-dom';
   
   const navigate = useNavigate();
   navigate('/my-page');
   ```

## Useful Commands

### Git

```bash
# Status and diff
git status
git diff

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Clean untracked files
git clean -fd
```

### npm

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# List installed packages
npm list --depth=0

# Check for security issues
npm audit
npm audit fix
```

### Windows

```bash
# Find process on port
netstat -ano | findstr :1212

# Kill process
taskkill /PID <pid> /F

# Open app data
start %APPDATA%\Internxt

# View logs
notepad %APPDATA%\Internxt\logs\main.log
```

### Electron

```bash
# Clear Electron cache
rm -rf %APPDATA%\Internxt

# Reinstall Electron
node node_modules/electron/install.js
```

## File Locations

### Source Code

| Path | Description |
|------|-------------|
| `src/apps/main/` | Main process |
| `src/apps/renderer/` | React UI |
| `src/apps/sync-engine/` | Sync engine |
| `src/apps/shared/` | Shared code |
| `src/backend/` | Backend features |
| `src/context/` | DDD contexts |
| `src/infra/` | Infrastructure |
| `src/node-win/` | Windows native |

### Build Output

| Path | Description |
|------|-------------|
| `dist/` | Built bundles |
| `build/` | Packaged installer |
| `.erb/dll/` | Development DLL |
| `coverage/` | Test coverage |

### Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript config |
| `.eslintrc.js` | ESLint rules |
| `.prettierrc.js` | Prettier config |
| `tailwind.config.js` | Tailwind config |
| `vitest.config.*.mts` | Test configs |

## Environment Variables

### Development

```bash
# .env file (create in root)
NODE_ENV=development
API_URL=http://localhost:3004
DEBUG=true
```

### Production

Injected by webpack in production build.

## Keyboard Shortcuts (in App)

| Shortcut | Action |
|----------|--------|
| F5 | Reload window |
| F12 | Open DevTools |
| Ctrl+R | Reload window |
| Ctrl+Shift+I | Open DevTools |

## Common Issues

### Port Already in Use

```bash
# Find and kill process on port 1212
netstat -ano | findstr :1212
taskkill /PID <pid> /F
```

### Native Module Error

```bash
npm run reload-native-deps
```

### Build Error

```bash
# Clean and rebuild
rimraf dist node_modules
npm install
npm run init:dev
```

### Type Errors

```bash
# Check types
npm run type-check

# Sometimes helps
rm -rf node_modules/@types
npm install
```

### Test Fails

```bash
# Clear test cache
npm run test -- --clearCache

# Run specific test
npm run test:one <file-name>
```

## Documentation

- [Architecture](../ARCHITECTURE.md) - System design
- [Contributing](../CONTRIBUTING.md) - Development guide
- [API](../API.md) - API reference
- [Testing](../TESTING.md) - Testing guide
- [Security](./security.md) - Security guide
- [Virtual Drive](./virtual-drive.md) - Virtual drive details
- [Deployment](./deployment.md) - Deployment guide

## Tips

- Use `npm run test:one` for faster feedback while developing
- Enable auto-save in your editor for instant updates
- Use React DevTools extension for debugging components
- Keep console open to catch errors early
- Run `npm run type-check` before committing
- Use git stash when switching branches with uncommitted changes

## Quick Troubleshooting

```bash
# Nuclear option: clean everything
rimraf dist build node_modules package-lock.json
npm install
npm run init:dev
npm run start
```

---

For more details, consult the full documentation linked above.
