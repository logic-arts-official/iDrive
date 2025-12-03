# API Documentation

This document provides an overview of the key APIs, interfaces, and modules in iDrive Desktop.

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). API documentation preserved from original project.*

## Table of Contents

- [IPC Communication](#ipc-communication)
- [Main Process APIs](#main-process-apis)
- [Sync Engine APIs](#sync-engine-apis)
- [Virtual Drive APIs](#virtual-drive-apis)
- [Database APIs](#database-apis)
- [Encryption APIs](#encryption-apis)
- [Backend Services](#backend-services)

## IPC Communication

Inter-Process Communication (IPC) enables communication between Electron processes.

### IPC Channels

Located in `src/apps/shared/IPC/`:

#### Main → Renderer

```typescript
// Send to renderer
mainWindow.webContents.send('CHANNEL_NAME', data);

// Common channels:
'USER_LOGGED_IN'
'USER_LOGGED_OUT'
'SYNC_STATUS_UPDATE'
'UPLOAD_PROGRESS'
'DOWNLOAD_PROGRESS'
```

#### Renderer → Main

```typescript
import { ipcRenderer } from 'electron';

// Send message
ipcRenderer.send('CHANNEL_NAME', data);

// Invoke with response
const result = await ipcRenderer.invoke('CHANNEL_NAME', data);

// Common channels:
'LOGIN'
'LOGOUT'
'OPEN_FOLDER'
'GET_SYNC_STATUS'
'PAUSE_SYNC'
'RESUME_SYNC'
```

#### Main → Sync Engine

```typescript
// Set configuration
syncEngineProcess.send('SET_CONFIG', config);

// Update process
syncEngineProcess.send('UPDATE_SYNC_ENGINE_PROCESS');
```

### IPC Handler Registration

**Main Process** (`src/apps/main/ipcs/`):

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('CHANNEL_NAME', async (event, arg) => {
  // Handle request
  return result;
});

ipcMain.on('CHANNEL_NAME', (event, arg) => {
  // Handle event (no response expected)
});
```

**Renderer Process** (`src/apps/renderer/api/`):

```typescript
export const apiClient = {
  async invokeMain(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args);
  },
  
  sendToMain(channel: string, ...args: any[]) {
    ipcRenderer.send(channel, ...args);
  },
};
```

## Main Process APIs

### Authentication (`src/apps/main/auth/`)

#### Login

```typescript
interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

interface LoginResult {
  user: User;
  token: string;
  newToken: string;
}

// IPC Handler
ipcMain.handle('LOGIN', async (event, credentials: LoginCredentials) => {
  const result = await authService.login(credentials);
  return result;
});
```

#### Check Login Status

```typescript
// IPC Handler
ipcMain.handle('CHECK_IS_LOGGED_IN', async () => {
  return checkIfUserIsLoggedIn();
});
```

#### Logout

```typescript
// IPC Handler
ipcMain.handle('LOGOUT', async () => {
  await authService.logout();
  setIsLoggedIn(false);
});
```

### Device Management (`src/apps/main/device/`)

```typescript
interface Device {
  id: string;
  name: string;
  platform: string;
  lastActivity: Date;
}

// IPC Handlers
ipcMain.handle('GET_DEVICE_INFO', async () => {
  return deviceService.getDeviceInfo();
});

ipcMain.handle('REGISTER_DEVICE', async (event, deviceName: string) => {
  return deviceService.register(deviceName);
});
```

### Tray API (`src/apps/main/tray/`)

```typescript
import { setupTrayIcon, getTray, setTrayStatus } from './tray/tray';

// Setup tray
setupTrayIcon();

// Get tray instance
const tray = getTray();

// Update status
setTrayStatus('syncing' | 'idle' | 'error' | 'paused');
```

### Window Management (`src/apps/main/windows/`)

```typescript
// Auth window
import { createAuthWindow, getAuthWindow } from './windows/auth';

const authWindow = createAuthWindow();
authWindow.show();

// Settings window
import { createSettingsWindow } from './windows/settings';

const settingsWindow = createSettingsWindow();

// Widget window
import { getOrCreateWidged } from './windows/widget';

const widget = getOrCreateWidged();
```

## Sync Engine APIs

### BindingsManager (`src/apps/sync-engine/BindingManager.ts`)

Manages virtual drive bindings and file system operations.

```typescript
class BindingsManager {
  /**
   * Start the bindings manager
   */
  static async start(options: { ctx: ProcessSyncContext }): Promise<void>;

  /**
   * Start watching for file system changes
   */
  static watch(options: { ctx: ProcessSyncContext }): void;

  /**
   * Stop watching
   */
  static stopWatching(): void;
}
```

### File Upload

```typescript
interface UploadOptions {
  filePath: string;
  fileSize: number;
  parentId: string;
  onProgress?: (progress: number) => void;
}

// Usage in sync engine
const result = await ctx.fileUploader.uploadFile(options);
```

### Content Download

```typescript
interface DownloadOptions {
  fileId: string;
  destination: string;
  onProgress?: (progress: number) => void;
}

// Usage in sync engine
await ctx.contentsDownloader.download(options);
```

### Sync Engine Configuration

```typescript
interface Config {
  userId: string;
  workspaceId: string;
  workspaceToken: string;
  rootPath: string;
  bucket: string;
}

// Set configuration
setConfig(config);

// Get current configuration
const config = getConfig();
```

## Virtual Drive APIs

### VirtualDrive (`src/node-win/virtual-drive.ts`)

Windows Cloud Filter Driver integration.

```typescript
class VirtualDrive {
  /**
   * Create sync root folder
   */
  static async createSyncRootFolder(options: {
    rootPath: string;
  }): Promise<void>;

  /**
   * Register placeholder
   */
  static async registerPlaceholder(options: {
    path: string;
    size: number;
    isDirectory: boolean;
  }): Promise<void>;

  /**
   * Hydrate placeholder (download file content)
   */
  static async hydratePlaceholder(options: {
    path: string;
  }): Promise<void>;

  /**
   * Dehydrate file (convert to placeholder)
   */
  static async dehydratePlaceholder(options: {
    path: string;
  }): Promise<void>;

  /**
   * Update placeholder metadata
   */
  static async updatePlaceholder(options: {
    path: string;
    size?: number;
    modifiedTime?: Date;
  }): Promise<void>;
}
```

### File Watcher (`src/node-win/watcher/`)

```typescript
interface WatcherEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: fs.Stats;
}

class Watcher {
  /**
   * Start watching directory
   */
  watch(rootPath: string, callbacks: WatcherCallbacks): void;

  /**
   * Stop watching
   */
  stop(): void;
}

interface WatcherCallbacks {
  onAdd?: (path: string, stats: fs.Stats) => void;
  onChange?: (path: string, stats: fs.Stats) => void;
  onUnlink?: (path: string) => void;
  onAddDir?: (path: string, stats: fs.Stats) => void;
  onUnlinkDir?: (path: string) => void;
}
```

## Database APIs

### TypeORM Data Source (`src/apps/main/database/data-source.ts`)

```typescript
import { AppDataSource } from './database/data-source';

// Initialize database
await AppDataSource.initialize();

// Get repository
const userRepo = AppDataSource.getRepository(User);

// Query
const users = await userRepo.find();

// Save
await userRepo.save(userData);

// Close connection
await AppDataSource.destroy();
```

### Entity Repositories

```typescript
// Example: File entity
interface FileEntity {
  id: string;
  name: string;
  size: number;
  path: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}

const fileRepo = AppDataSource.getRepository(FileEntity);

// Find by path
const file = await fileRepo.findOne({ where: { path: '/folder/file.txt' } });

// Update sync status
await fileRepo.update({ id: fileId }, { syncStatus: 'synced' });
```

### SQLite IPC (`src/infra/sqlite/ipc/`)

For accessing database from renderer process:

```typescript
// Renderer side
const result = await ipcRenderer.invoke('SQLITE_QUERY', {
  query: 'SELECT * FROM files WHERE parentId = ?',
  params: [parentId],
});

// Main side handler
ipcMain.handle('SQLITE_QUERY', async (event, { query, params }) => {
  const repo = AppDataSource.getRepository(FileEntity);
  return repo.query(query, params);
});
```

## Encryption APIs

### Crypto Utilities (`src/apps/shared/crypto/`)

```typescript
import { encrypt, decrypt } from '@/apps/shared/crypto';

// Encrypt data
const encrypted = await encrypt(plaintext, password);

// Decrypt data
const plaintext = await decrypt(encrypted, password);
```

### File Encryption (via @internxt/sdk)

*Note: Uses original Internxt SDK for encryption compatibility*

```typescript
import { encryptFile, decryptFile } from '@internxt/sdk';

// Encrypt file
const encryptedStream = await encryptFile(
  fileStream,
  encryptionKey
);

// Decrypt file
const decryptedStream = await decryptFile(
  encryptedStream,
  encryptionKey
);
```

## Backend Services

### Drive Server Client (`src/infra/drive-server-wip/`)

HTTP client for Internxt backend API.

```typescript
import { driveServerWipModule } from '@/infra/drive-server-wip';

// Get workspace credentials
const { data } = await driveServerWipModule.workspaces.getCredentials({
  workspaceId: 'workspace-id',
});

// Upload file
const fileData = await driveServerWipModule.files.upload({
  parentId: 'parent-folder-id',
  file: fileBuffer,
  fileName: 'document.pdf',
});

// Download file
const fileContent = await driveServerWipModule.files.download({
  fileId: 'file-id',
});

// List folder contents
const items = await driveServerWipModule.folders.getContents({
  folderId: 'folder-id',
});

// Create folder
const folder = await driveServerWipModule.folders.create({
  parentId: 'parent-id',
  name: 'New Folder',
});

// Delete file
await driveServerWipModule.files.delete({
  fileId: 'file-id',
});

// Move file
await driveServerWipModule.files.move({
  fileId: 'file-id',
  destinationFolderId: 'destination-id',
});
```

### Authentication Service

```typescript
interface AuthService {
  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Promise<LoginResult>;

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Promise<TokenResult>;

  /**
   * Logout and clear tokens
   */
  logout(): Promise<void>;

  /**
   * Verify 2FA code
   */
  verify2FA(code: string): Promise<boolean>;
}
```

### Backup Service (`src/backend/features/backups/`)

```typescript
interface BackupService {
  /**
   * Start backup process
   */
  startBackup(options: BackupOptions): Promise<void>;

  /**
   * Get backup status
   */
  getStatus(): Promise<BackupStatus>;

  /**
   * Pause backup
   */
  pause(): Promise<void>;

  /**
   * Resume backup
   */
  resume(): Promise<void>;

  /**
   * Cancel backup
   */
  cancel(): Promise<void>;
}

interface BackupOptions {
  sourcePath: string;
  destinationFolderId: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

interface BackupStatus {
  isRunning: boolean;
  isPaused: boolean;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  errors: BackupError[];
}
```

## Context APIs

### Local File Context (`src/context/local/localFile/`)

```typescript
interface LocalFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
  hash: string;
}

class LocalFileRepository {
  /**
   * Get file information
   */
  getFile(path: string): Promise<LocalFile>;

  /**
   * Save file metadata
   */
  saveFile(file: LocalFile): Promise<void>;

  /**
   * Delete file
   */
  deleteFile(path: string): Promise<void>;

  /**
   * List files in directory
   */
  listFiles(directoryPath: string): Promise<LocalFile[]>;
}
```

### Virtual Drive Context (`src/context/virtual-drive/`)

Domain models and operations for virtual drive:

```typescript
interface VirtualItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VirtualFile extends VirtualItem {
  type: 'file';
  contentId: string;
  hash: string;
}

interface VirtualFolder extends VirtualItem {
  type: 'folder';
}
```

## Error Handling

### Error Types

```typescript
class SyncError extends Error {
  code: string;
  details?: any;
}

class NetworkError extends SyncError {
  constructor(message: string) {
    super(message);
    this.code = 'NETWORK_ERROR';
  }
}

class AuthenticationError extends SyncError {
  constructor(message: string) {
    super(message);
    this.code = 'AUTH_ERROR';
  }
}

class FileSystemError extends SyncError {
  constructor(message: string) {
    super(message);
    this.code = 'FS_ERROR';
  }
}
```

### Error Handling Pattern

```typescript
try {
  await operation();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network error
    logger.error('Network error:', error);
    await retry(operation);
  } else if (error instanceof AuthenticationError) {
    // Handle auth error
    logger.error('Auth error:', error);
    await refreshToken();
  } else {
    // Handle unknown error
    logger.error('Unknown error:', error);
    throw error;
  }
}
```

## Event System

### Event Bus (`src/apps/main/event-bus.ts`)

```typescript
import eventBus from './event-bus';

// Emit event
eventBus.emit('sync:started', { folderId: 'folder-id' });

// Listen to event
eventBus.on('sync:completed', (data) => {
  console.log('Sync completed:', data);
});

// Common events:
'sync:started'
'sync:completed'
'sync:paused'
'sync:error'
'file:uploaded'
'file:downloaded'
'user:loggedIn'
'user:loggedOut'
```

## Logging

### Logger API (`src/apps/shared/logger/`)

```typescript
import { logger } from '@/apps/shared/logger/logger';

// Log levels
logger.debug({ msg: 'Debug message', data });
logger.info({ msg: 'Info message', data });
logger.warn({ msg: 'Warning message', data });
logger.error({ msg: 'Error message', error, data });

// Create tagged logger
const taggedLogger = createLogger({ tag: 'SYNC-ENGINE', workspaceId });
```

## Configuration

### Electron Store (`src/apps/main/config/`)

```typescript
import { electronStore } from './config';

// Get value
const value = electronStore.get('key');

// Set value
electronStore.set('key', value);

// Delete value
electronStore.delete('key');

// Clear all
electronStore.clear();

// Common keys:
'user'
'token'
'syncFolder'
'preferences'
```

## Resources

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/api/ipc-main)
- [TypeORM Documentation](https://typeorm.io/)
- [Internxt SDK](https://github.com/internxt/sdk)

## Getting Help

For questions about specific APIs:
1. Check the source code with inline documentation
2. Look for usage examples in tests
3. Refer to the ARCHITECTURE.md document
4. Ask in pull request or issue comments
