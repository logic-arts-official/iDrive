# Architecture Documentation

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). Technical architecture documentation preserved from original project.*

## Overview

iDrive Desktop is an Electron-based desktop application that provides seamless file synchronization between local systems and cloud storage. The application uses a virtual drive approach with real-time synchronization capabilities.

## Technology Stack

- **Framework**: Electron 29.4.6
- **UI**: React 17 with TypeScript
- **Styling**: TailwindCSS
- **Build System**: Webpack 5
- **Testing**: Vitest
- **Database**: SQLite (via better-sqlite3)
- **ORM**: TypeORM
- **State Management**: Zustand
- **API Client**: openapi-fetch
- **Package Manager**: npm (>=10.0.0)
- **Node Version**: 20.19.0+

## Architecture Overview

The application follows a multi-process Electron architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                   Main Process                          │
│  (Node.js Environment - Full System Access)            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Auth       │  │  Auto Launch │  │   Database   ││
│  │  Handlers    │  │   Manager    │  │   (SQLite)   ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  IPC Main    │  │    Tray      │  │  Virtual     ││
│  │  Handlers    │  │   Manager    │  │   Drive      ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                    IPC Communication
                          │
┌─────────────────────────────────────────────────────────┐
│                 Renderer Process                        │
│      (Chromium Environment - UI Layer)                 │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │    React     │  │   Router     │  │   React      ││
│  │     UI       │  │   (Pages)    │  │   Query      ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                    IPC Communication
                          │
┌─────────────────────────────────────────────────────────┐
│               Sync Engine Process                       │
│        (Background Sync Operations)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  File        │  │  Bindings    │  │  Virtual     ││
│  │  Watcher     │  │  Manager     │  │  Drive Ops   ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Main Process (`src/apps/main/`)

The main process is the entry point of the application and handles:

- **Application Lifecycle**: Manages app initialization, window creation, and shutdown
- **Authentication** (`auth/`): User login, token management, and session handling
- **Auto Launch** (`auto-launch/`): System startup integration
- **Database** (`database/`): SQLite database management with TypeORM
- **Device Management** (`device/`): Device registration and identification
- **IPC Handlers** (`ipcs/`): Inter-process communication endpoints
- **Tray Integration** (`tray/`): System tray icon and menu
- **Window Management** (`windows/`): Creates and manages different app windows
- **Background Processes** (`background-processes/`):
  - Sync engine orchestration
  - Backup management
  - Issue tracking and resolution

### 2. Renderer Process (`src/apps/renderer/`)

The renderer process handles the user interface:

- **Pages**:
  - `Login`: Authentication interface
  - `Settings`: User preferences and configuration
  - `Widget`: Main dashboard/status widget
  - `Issues`: Problem tracking and resolution
  - `Onboarding`: First-time user experience

- **Features**: Business logic organized by domain
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for state and effects
- **Context**: React context providers for global state
- **API**: HTTP client for backend communication

### 3. Sync Engine (`src/apps/sync-engine/`)

A dedicated process for file synchronization:

- **BindingManager**: Manages file system bindings and virtual drive operations
- **File Explorer State**: Tracks file/folder states
- **Callbacks**: Handles file operation callbacks from virtual drive
- **Dangled Files**: Manages orphaned file references
- **Content Download**: Handles file downloads from cloud storage
- **Refresh Placeholders**: Updates file placeholder states

### 4. Backend Features (`src/backend/features/`)

Domain-driven backend logic:

- **Auth**: Authentication and authorization
- **Backups**: Backup scheduling and management
- **Cleaner**: Cleanup operations for temporary files
- **Device**: Device-specific operations
- **Local Sync**: Local file system synchronization
- **Remote Sync**: Cloud storage synchronization
- **Remote Notifications**: Push notification handling

### 5. Context Layer (`src/context/`)

Domain-Driven Design (DDD) context boundaries:

- **Local Context** (`local/`):
  - `localFile`: File operations
  - `localFolder`: Folder operations
  - `localTree`: File tree management

- **Virtual Drive Context** (`virtual-drive/`):
  - `boundaryBridge`: Bridge between local and virtual contexts
  - `contents`: Content management
  - `files`: File operations
  - `folders`: Folder operations
  - `items`: Generic item operations

- **Shared Context** (`shared/`):
  - Common domain models
  - Shared infrastructure

### 6. Infrastructure Layer (`src/infra/`)

Technical infrastructure and external service integrations:

- **Device** (`device/`): Device-specific implementations
- **Drive Server** (`drive-server-wip/`): API client for Internxt backend
- **File System** (`file-system/`): File system abstraction layer
- **InxtJS** (`inxt-js/`): 
  - Content downloader
  - File uploader
- **Node-Win** (`node-win/`): Windows-specific native integrations
- **SQLite** (`sqlite/`): Database layer with IPC communication

### 7. Shared Utilities (`src/apps/shared/`)

Cross-cutting concerns:

- **HttpClient**: REST API client with schema validation
- **IPC**: Inter-process communication utilities
- **Locale**: Internationalization (i18n)
- **Crypto**: Encryption and decryption utilities
- **File System** (`fs/`): File system utilities
- **Logger**: Application-wide logging
- **Types**: Shared TypeScript types

## Data Flow

### File Upload Flow

```
User adds file to sync folder
         ↓
File Watcher detects change
         ↓
Sync Engine processes event
         ↓
File is chunked and encrypted
         ↓
Upload to Internxt cloud via InxtJS
         ↓
Database updated with file metadata
         ↓
Virtual Drive placeholder created
```

### File Download Flow

```
Remote change detected
         ↓
Sync Engine receives notification
         ↓
Content downloaded via InxtJS
         ↓
File decrypted and written locally
         ↓
Virtual Drive updated
         ↓
Database updated
```

### Authentication Flow

```
User enters credentials in Renderer
         ↓
IPC to Main Process
         ↓
Auth Handler validates with backend
         ↓
Token stored in electron-store
         ↓
Auth state broadcast to all processes
         ↓
Sync Engine initialized with token
```

## Database Schema

The application uses SQLite with TypeORM for data persistence:

- **User Data**: Encrypted user credentials and settings
- **Sync State**: File and folder synchronization status
- **Device Info**: Device registration and metadata
- **File Metadata**: Local file information and hashes
- **Backup Records**: Backup history and status

## Security

### Encryption

- **End-to-End Encryption**: Files are encrypted before upload
- **OpenPGP**: Used for file encryption (via openpgp library)
- **Token Storage**: Secure token storage using electron-store

### Antivirus Integration

- **ClamAV**: Optional antivirus scanning integration
- Located in `clamAV/` directory
- PowerShell script for setup: `release/clamAV.ps1`

## Windows Integration

### Virtual Drive (`src/node-win/`)

Native Windows integration for virtual file system:

- **Addon**: Native Node.js addon for Windows API
- **Virtual Drive**: Cloud filter driver integration
- **Watcher**: File system event monitoring
- **Placeholder Management**: On-demand file hydration

### Package Structure

The `@packages/addon` contains the native Windows addon compiled as a `.tgz` package.

## Build Process

### Development Build

```bash
npm run init:dev
npm run start
```

This runs:
1. Installs dependencies
2. Builds development DLL
3. Rebuilds native dependencies
4. Starts webpack dev server for renderer
5. Starts Electron main process

### Production Build

```bash
npm run build
npm run package
```

This:
1. Builds main, renderer, sync-engine, and preload bundles
2. Packages with electron-builder
3. Creates installer in `build/` directory

## Testing Strategy

### Unit Tests (Vitest)

- **Main Process Tests**: Test main process logic
- **Infrastructure Tests**: Test infra layer (`vitest.config.infra.mts`)
- **Renderer Tests**: Test React components (`vitest.config.renderer.mts`)

### Test Locations

- Co-located with source files (`.test.ts`, `.test.tsx`)
- Test utilities in `tests/vitest/`

## Configuration

### Environment Configuration

- **Production**: Variables injected via webpack in production
- **Development**: `.env` files loaded via `dotenv`

### Electron Store

Configuration persisted via `electron-store`:
- User preferences
- Sync settings
- Window bounds
- Auth tokens (encrypted)

## Dependencies

### Key Production Dependencies

- `@internxt/drive-desktop-core`: Core synchronization logic (from original project)
- `@internxt/sdk`: Internxt API SDK (from original project)
- `@internxt/inxt-js`: File operations (from original project)
- `better-sqlite3`: Database
- `chokidar`: File watching
- `electron-updater`: Auto-updates
- `typeorm`: Database ORM
- `openpgp`: Encryption

### Key Development Dependencies

- `webpack`: Bundling
- `electron-builder`: Packaging
- `vitest`: Testing
- `eslint`: Linting
- `prettier`: Code formatting
- `typescript`: Type checking

## Code Quality

### Linting

- ESLint with custom configuration
- Plugins: unicorn, sonarjs, tanstack/query
- Currently allows max 383 warnings (being reduced)

### Formatting

- Prettier with Tailwind plugin
- Import sorting via @trivago/prettier-plugin-sort-imports

### Type Checking

- Strict TypeScript configuration
- No implicit any, returns, or this

### Dead Code Detection

- Knip for finding unused code

## CI/CD

GitHub Actions workflows:

- `windows-pull-request.yml`: PR validation
- `windows-build-release.yml`: Release builds
- `windows-sonar-analysis.yml`: Code quality analysis
- `addon-sonar-analysis.yml`: Native addon analysis
- `windows-find-deadcode.yml`: Dead code detection
- `stale-prs.yml`: Stale PR management
- `check-pr-size.yml`: PR size validation

## Migration System

Located in `src/migrations/`, version-specific migrations handle:

- Database schema updates
- Data transformations
- Configuration migrations

Versions: v2.5.1, v2.5.6, v2.5.7, v2.6.3

## Performance Considerations

### Sync Engine

- Debounced file system events to prevent excessive operations
- Bottleneck rate limiting for API calls
- Chunked file uploads for large files

### Database

- SQLite for efficient local storage
- Indexed queries for fast lookups
- Connection pooling

### Memory Management

- Proper cleanup of file watchers
- Abort controllers for cancellable operations
- Stream-based file processing

## Future Architecture Considerations

1. **Modularity**: Continue extracting shared logic to `@internxt/drive-desktop-core`
2. **Type Safety**: Complete migration to strict TypeScript
3. **Testing**: Increase test coverage
4. **Documentation**: Keep this architecture doc updated with changes
5. **Performance**: Profile and optimize sync engine
6. **Cross-Platform**: Prepare for macOS/Linux support

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Internxt SDK](https://github.com/internxt/sdk)
- [TypeORM Documentation](https://typeorm.io/)
- [Vitest Documentation](https://vitest.dev/)
