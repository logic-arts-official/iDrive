# Virtual Drive Implementation

This document details the Windows virtual drive implementation using Cloud Filter APIs.

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). Virtual drive documentation preserved from original project.*

## Overview

The virtual drive feature allows iDrive Desktop to present cloud files as if they were local, without actually downloading them until needed. This is achieved using Windows Cloud Filter Driver APIs.

## Architecture

```
┌─────────────────────────────────────────┐
│         User Application                │
│   (Windows Explorer, Apps, etc.)        │
└────────────────┬────────────────────────┘
                 │ File System Operations
                 ↓
┌─────────────────────────────────────────┐
│       Windows File System               │
│     (NTFS with Cloud Filter)            │
└────────────────┬────────────────────────┘
                 │ Cloud Filter Callbacks
                 ↓
┌─────────────────────────────────────────┐
│      iDrive Desktop                     │
│      (Native Addon + Sync Engine)       │
└────────────────┬────────────────────────┘
                 │ Fetch/Store
                 ↓
┌─────────────────────────────────────────┐
│         Cloud Storage                   │
└─────────────────────────────────────────┘
```

## Key Concepts

### Placeholders

**Placeholders** are special file entries that:
- Appear in the file system as regular files/folders
- Contain metadata (name, size, timestamps)
- Don't contain actual file data initially
- Trigger download when accessed

### Hydration

**Hydration** is the process of:
1. User accesses a placeholder file
2. Cloud filter driver intercepts the access
3. Callback triggers file download
4. File content is written to disk
5. Placeholder becomes a full file

### Dehydration

**Dehydration** is the reverse process:
1. File is fully downloaded (hydrated)
2. User or system decides to free space
3. File content is removed from disk
4. Metadata is retained as placeholder
5. File remains visible but takes no space

## Implementation

### Native Addon (`packages/addon/`)

The native addon is a C++ Node.js addon that wraps Windows Cloud Filter APIs.

**Location**: `packages/addon/`

**Compiled**: Pre-built as `@packages/addon` .tgz package

**Platform**: Windows only (requires Windows 10 1809+ or Windows Server 2019+)

### Virtual Drive Class (`src/node-win/virtual-drive.ts`)

TypeScript wrapper around the native addon.

```typescript
class VirtualDrive {
  // Initialize sync root
  static async createSyncRootFolder(options: {
    rootPath: string;
  }): Promise<void>;

  // Register file/folder placeholder
  static async registerPlaceholder(options: {
    path: string;
    size: number;
    isDirectory: boolean;
    modifiedTime?: Date;
  }): Promise<void>;

  // Download file content (hydrate)
  static async hydratePlaceholder(options: {
    path: string;
    onProgress?: (progress: number) => void;
  }): Promise<void>;

  // Remove file content (dehydrate)
  static async dehydratePlaceholder(options: {
    path: string;
  }): Promise<void>;

  // Update placeholder metadata
  static async updatePlaceholder(options: {
    path: string;
    size?: number;
    modifiedTime?: Date;
  }): Promise<void>;

  // Delete placeholder
  static async deletePlaceholder(options: {
    path: string;
  }): Promise<void>;
}
```

### Addon Schema (`src/node-win/addon/addon-zod.ts`)

Type-safe schema definitions using Zod for addon API validation.

### File Watcher (`src/node-win/watcher/`)

Monitors file system changes in the sync root folder.

**Key Components**:

- `watcher.ts`: Main watcher implementation using Chokidar
- `events/`: Event handlers for different file operations
  - `on-add.service.ts`: Handle file additions
  - `on-add-dir.service.ts`: Handle folder additions
  - `on-raw.service.ts`: Handle raw file system events
  - `debounce-on-raw.ts`: Debounce frequent events

## File Operations

### Creating Placeholders

When a remote file is discovered:

```typescript
// 1. Create parent folders if needed
await VirtualDrive.registerPlaceholder({
  path: '/SyncFolder/Documents',
  size: 0,
  isDirectory: true,
});

// 2. Create file placeholder
await VirtualDrive.registerPlaceholder({
  path: '/SyncFolder/Documents/file.pdf',
  size: 1024000, // 1MB
  isDirectory: false,
  modifiedTime: new Date('2024-01-01'),
});
```

### Handling File Access

When user opens a placeholder file:

```typescript
// Callback triggered by Cloud Filter Driver
async function onHydrationRequested(path: string) {
  // 1. Get file metadata from database
  const file = await getFileMetadata(path);
  
  // 2. Download file from cloud
  await contentsDownloader.download({
    fileId: file.remoteId,
    destination: path,
    onProgress: (progress) => {
      VirtualDrive.updateProgress(path, progress);
    },
  });
  
  // 3. Hydration complete
  // File is now accessible
}
```

### Handling File Modifications

When user modifies a file:

```typescript
// Watcher detects change
watcher.on('change', async (path, stats) => {
  // 1. Read modified file
  const content = await fs.readFile(path);
  
  // 2. Upload to cloud
  const newVersion = await fileUploader.upload({
    filePath: path,
    fileSize: stats.size,
    parentId: file.parentId,
  });
  
  // 3. Update metadata
  await updateFileMetadata(path, {
    remoteId: newVersion.id,
    size: stats.size,
    modifiedTime: stats.mtime,
  });
});
```

### Handling Deletions

When user deletes a file:

```typescript
watcher.on('unlink', async (path) => {
  // 1. Get file metadata
  const file = await getFileMetadata(path);
  
  // 2. Delete from cloud
  await driveServerWipModule.files.delete({
    fileId: file.remoteId,
  });
  
  // 3. Remove from database
  await deleteFileMetadata(path);
});
```

## Sync Root Folder

### Registration

The sync root folder is a special folder registered with Windows:

```typescript
await VirtualDrive.createSyncRootFolder({
  rootPath: 'C:\\Users\\Username\\iDrive',
});
```

**Requirements**:
- Must be an empty folder or non-existent
- Must be on an NTFS volume
- Cannot be a system folder
- User must have write permissions

### Sync Root Properties

Once registered, the folder:
- Shows cloud overlay icons
- Supports on-demand file hydration
- Tracks file states (placeholder, hydrated, etc.)
- Integrates with Windows Explorer

## File States

Files in the sync root can be in different states:

### 1. Placeholder (Not Hydrated)

- File exists in file system
- Contains metadata only
- Size: minimal (few KB)
- Icon: Shows cloud overlay
- Access: Triggers download

### 2. Hydrated (Fully Downloaded)

- File exists with full content
- Size: actual file size
- Icon: Shows synced checkmark
- Access: Immediate

### 3. Partially Hydrated

- File download in progress
- Some content available
- Icon: Shows progress indicator
- Access: May block until complete

### 4. Pinned

- File forced to stay hydrated
- Won't be automatically dehydrated
- Always available offline
- Icon: Shows pin indicator

## Context Menu Integration

Windows Explorer context menu additions:

### Available Actions

**For Files**:
- "Always keep on this device" (Pin)
- "Free up space" (Dehydrate)
- "View online"
- "Share"

**For Folders**:
- "Always keep on this device" (Pin recursively)
- "Free up space" (Dehydrate recursively)
- "View online"

### Implementation

Context menu actions are detected by the watcher:

```typescript
// Detect context menu action
const action = detectContextMenuAction(event);

if (action === 'PIN') {
  // Pin file/folder
  await pinItem(path);
} else if (action === 'DEHYDRATE') {
  // Free up space
  await VirtualDrive.dehydratePlaceholder({ path });
}
```

## Performance Considerations

### Debouncing

File system events are debounced to prevent excessive operations:

```typescript
const debouncedOnRaw = debounce((events) => {
  // Process batched events
  processEvents(events);
}, 300); // 300ms debounce
```

### Chunked Downloads

Large files are downloaded in chunks:

```typescript
const chunkSize = 5 * 1024 * 1024; // 5MB chunks

for (let offset = 0; offset < fileSize; offset += chunkSize) {
  const chunk = await downloadChunk(fileId, offset, chunkSize);
  await writeChunk(path, offset, chunk);
  
  // Update progress
  const progress = (offset + chunk.length) / fileSize;
  VirtualDrive.updateProgress(path, progress);
}
```

### Background Sync

Changes are synchronized in the background:

```typescript
// Queue for background sync
const syncQueue = new Queue<SyncOperation>();

// Process queue with rate limiting
const limiter = new Bottleneck({
  minTime: 100, // Minimum 100ms between operations
  maxConcurrent: 5, // Max 5 concurrent operations
});

while (syncQueue.length > 0) {
  const operation = syncQueue.dequeue();
  await limiter.schedule(() => performSync(operation));
}
```

## Error Handling

### Common Errors

**Access Denied**:
```typescript
try {
  await VirtualDrive.registerPlaceholder(options);
} catch (error) {
  if (error.code === 'EACCES') {
    logger.error('Access denied to sync root folder');
    // Notify user
  }
}
```

**Network Errors**:
```typescript
try {
  await hydratePlaceholder(path);
} catch (error) {
  if (error instanceof NetworkError) {
    // Retry with exponential backoff
    await retryWithBackoff(() => hydratePlaceholder(path));
  }
}
```

**Disk Space**:
```typescript
const availableSpace = await getAvailableSpace(syncRoot);

if (fileSize > availableSpace) {
  logger.warn('Insufficient disk space');
  // Dehydrate some files or notify user
}
```

## Monitoring and Diagnostics

### Placeholder Status

```typescript
interface PlaceholderInfo {
  path: string;
  isPlaceholder: boolean;
  isHydrated: boolean;
  isPinned: boolean;
  size: number;
  onDiskSize: number;
  progress: number; // 0-100 for partial hydration
}

async function getPlaceholderInfo(path: string): Promise<PlaceholderInfo> {
  return VirtualDrive.getInfo(path);
}
```

### Sync Statistics

```typescript
interface SyncStats {
  totalFiles: number;
  totalFolders: number;
  hydrated: number;
  placeholders: number;
  syncedBytes: number;
  pendingBytes: number;
  errors: number;
}

async function getSyncStats(): Promise<SyncStats> {
  const files = await getAllFiles();
  
  return files.reduce((stats, file) => ({
    totalFiles: stats.totalFiles + 1,
    hydrated: stats.hydrated + (file.isHydrated ? 1 : 0),
    placeholders: stats.placeholders + (file.isPlaceholder ? 1 : 0),
    syncedBytes: stats.syncedBytes + file.onDiskSize,
    pendingBytes: stats.pendingBytes + (file.size - file.onDiskSize),
  }), {
    totalFiles: 0,
    totalFolders: 0,
    hydrated: 0,
    placeholders: 0,
    syncedBytes: 0,
    pendingBytes: 0,
    errors: 0,
  });
}
```

## Testing

Virtual drive functionality is tested in:
- `src/node-win/virtual-drive.test.ts`: Unit tests
- `src/node-win/watcher/*.test.ts`: Watcher tests

### Test Patterns

```typescript
describe('VirtualDrive', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempSyncRoot();
    await VirtualDrive.createSyncRootFolder({ rootPath: tempDir });
  });

  afterEach(async () => {
    await cleanupSyncRoot(tempDir);
  });

  it('should create placeholder', async () => {
    const path = join(tempDir, 'test.txt');
    
    await VirtualDrive.registerPlaceholder({
      path,
      size: 1000,
      isDirectory: false,
    });
    
    const info = await VirtualDrive.getInfo(path);
    expect(info.isPlaceholder).toBe(true);
    expect(info.size).toBe(1000);
  });
});
```

## Limitations

### Windows Version Requirements

- Minimum: Windows 10 version 1809 (October 2018 Update)
- Recommended: Windows 10 version 2004 or later
- Server: Windows Server 2019 or later

### File System Requirements

- Must be NTFS volume
- ReFS not currently supported
- Network drives not supported

### Performance Limitations

- Large folder listings may be slow on first access
- Hydration speed limited by network bandwidth
- Concurrent hydrations limited to prevent resource exhaustion

## Future Enhancements

1. **Selective Sync**: Allow users to choose which folders to sync
2. **Smart Dehydration**: Automatically dehydrate least-used files
3. **Offline Mode**: Better handling of offline scenarios
4. **Conflict Resolution**: Improved conflict resolution UI
5. **Progress Indicators**: Better progress feedback in Explorer

## Resources

- [Windows Cloud Filter Documentation](https://docs.microsoft.com/en-us/windows/win32/cfapi/cloud-files-api-portal)
- [Node.js Native Addons](https://nodejs.org/api/addons.html)
- [Chokidar File Watcher](https://github.com/paulmillr/chokidar)

## Debugging

### Enable Debug Logging

```typescript
// Set log level
logger.setLevel('debug');

// Enable verbose logging for virtual drive
process.env.DEBUG_VIRTUAL_DRIVE = 'true';
```

### Common Issues

1. **Sync Root Creation Fails**
   - Check folder permissions
   - Ensure folder is empty
   - Verify NTFS volume

2. **Hydration Hangs**
   - Check network connectivity
   - Verify authentication token
   - Check available disk space

3. **Changes Not Syncing**
   - Verify watcher is running
   - Check event debouncing settings
   - Review sync queue status

## Support

For issues or questions:
1. Check logs in: `%APPDATA%\iDrive\logs`
2. Enable debug mode
3. Report issues with log excerpts
4. Include Windows version and disk type
