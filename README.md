# Internxt Drive Desktop

<div align="center">

[![node](https://img.shields.io/badge/node-20-iron)](https://nodejs.org/download/release/latest-iron/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)](https://github.com/logic-arts-official/iDrive)

</div>

Internxt Drive Desktop is a secure, privacy-focused desktop application that seamlessly synchronizes your files between your local system and Internxt cloud storage using virtual drive technology.

## ✨ Features

- 🔒 **End-to-End Encryption**: All files are encrypted client-side before upload
- 💾 **Virtual Drive**: Access cloud files without downloading them (Windows Cloud Filter API)
- 🔄 **Real-time Sync**: Automatic synchronization of local and cloud changes
- 🎯 **On-Demand Download**: Files download only when you need them
- 🛡️ **Antivirus Integration**: Optional ClamAV integration for file scanning
- 🔐 **Zero-Knowledge Architecture**: Your data is yours alone
- ⚡ **High Performance**: Optimized sync engine with chunked uploads/downloads

## 🏗️ Technology Stack

- **Electron** 29.4.6 - Cross-platform desktop framework
- **React** 17 - UI framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Vitest** - Modern testing framework
- **Webpack** 5 - Module bundling
- **SQLite** + TypeORM - Local database

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System architecture and design patterns |
| [Contributing](./CONTRIBUTING.md) | Development guidelines and workflow |
| [API Documentation](./API.md) | API interfaces and module documentation |
| [Testing Guide](./TESTING.md) | Testing strategies and best practices |
| [Virtual Drive](./docs/virtual-drive.md) | Windows Cloud Filter implementation details |
| [Security Guide](./docs/security.md) | Security architecture and best practices |

## 🚀 Quick Start

### Prerequisites

**System Requirements**:
- Windows 10 (1809+) or Windows 11
- NTFS file system
- 4GB RAM minimum, 8GB recommended

**Software Requirements**:
- [Node Version Manager (NVM)](https://github.com/coreybutler/nvm-windows)
- [Python 3.10](https://apps.microsoft.com/detail/9pjpw5ldxlz5?hl=en-US&gl=ES) (for node-gyp)
- [Visual Studio](https://visualstudio.microsoft.com/es/downloads) with C++ build tools (not VS Code)

### Installation

1. **Install Node.js 20**
   ```bash
   nvm install 20
   nvm use 20
   ```

2. **Install node-gyp**
   ```bash
   npm install -g node-gyp
   ```

3. **Configure Visual Studio**
   
   During installation, ensure you select:
   - Desktop development with C++
   - Windows 10/11 SDK
   - C++ CMake tools for Windows
   
   ![Visual Studio Configuration](public/image-1.png)
   ![Visual Studio Components](public/image.png)

4. **Clone and Setup**
   ```bash
   git clone https://github.com/logic-arts-official/iDrive.git
   cd iDrive
   npm run init:dev
   ```

5. **(Optional) Setup Antivirus**
   ```bash
   npm run clamav
   ```

6. **Start Development**
   ```bash
   npm run start
   ```

   In a separate terminal:
   ```bash
   npm run start:reload
   ```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start              # Start renderer dev server
npm run start:reload       # Start main + sync engine

# Building
npm run build              # Build all components
npm run build:main         # Build main process
npm run build:renderer     # Build renderer
npm run build:sync-engine  # Build sync engine

# Testing
npm run test               # Run all tests
npm run test:infra         # Run infrastructure tests
npm run test:renderer      # Run renderer tests
npm run test -- --coverage # Run with coverage

# Code Quality
npm run lint               # Lint code
npm run lint:fix           # Fix linting issues
npm run format             # Check formatting
npm run format:fix         # Fix formatting
npm run type-check         # TypeScript type checking
npm run find-deadcode      # Find unused code

# Production
npm run package            # Build production package
```

### Project Structure

```
iDrive/
├── src/
│   ├── apps/
│   │   ├── main/          # Electron main process
│   │   ├── renderer/      # React UI
│   │   ├── sync-engine/   # Sync engine process
│   │   └── shared/        # Shared utilities
│   ├── backend/           # Backend features
│   ├── context/           # DDD contexts
│   ├── infra/             # Infrastructure layer
│   └── node-win/          # Windows native integration
├── tests/                 # Test utilities
├── packages/              # Local packages
└── docs/                  # Additional documentation
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

For more details, see [TESTING.md](./TESTING.md).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Code standards
- Development workflow
- Pull request process
- Testing requirements

## 🔐 Security

Security is our top priority. For details on our security architecture and best practices, see [Security Guide](./docs/security.md).

**Report vulnerabilities**: security@internxt.com (Do NOT use public issues)

## 📊 Code Quality

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=coverage)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=internxt_drive-desktop&metric=bugs)](https://sonarcloud.io/summary/new_code?id=internxt_drive-desktop)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Internxt Website](https://internxt.com)
- [Internxt Drive](https://drive.internxt.com)
- [Internxt Blog](https://blog.internxt.com)
- [Support](https://help.internxt.com)

## 💬 Community

- [Discord](https://discord.gg/internxt)
- [Twitter](https://twitter.com/Internxt)
- [GitHub Issues](https://github.com/logic-arts-official/iDrive/issues)

## 🙏 Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- And many other amazing open-source projects

---

<div align="center">
Made with ❤️ by the Internxt team
</div>
