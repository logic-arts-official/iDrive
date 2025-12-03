# Documentation Index

Welcome to the iDrive Desktop documentation!

*Note: This is a fork of [Internxt Drive Desktop](https://github.com/internxt/drive-desktop). Documentation adapted from original project.*

## 📖 Main Documentation

### [README.md](../README.md)
Project overview, quick start guide, and basic information.

### [ARCHITECTURE.md](../ARCHITECTURE.md)
Comprehensive system architecture documentation covering:
- Technology stack
- Multi-process architecture
- Core components
- Data flow
- Database schema
- Security overview
- Performance considerations

### [CONTRIBUTING.md](../CONTRIBUTING.md)
Guidelines for contributing to the project:
- Development setup
- Development workflow
- Code standards
- Testing requirements
- Pull request process
- Common issues

### [API.md](../API.md)
API reference documentation:
- IPC communication
- Main process APIs
- Sync engine APIs
- Virtual drive APIs
- Database APIs
- Encryption APIs
- Backend services

### [TESTING.md](../TESTING.md)
Testing guide and best practices:
- Test framework (Vitest)
- Test organization
- Running tests
- Writing tests
- Testing patterns
- Coverage reporting

## 📚 Detailed Guides

### [Virtual Drive Implementation](./virtual-drive.md)
Deep dive into Windows Cloud Filter integration:
- Architecture and concepts
- Placeholder system
- Hydration/dehydration
- File operations
- Performance optimization
- Troubleshooting

### [Security Guide](./security.md)
Security architecture and best practices:
- Defense in depth
- End-to-end encryption
- Authentication & authorization
- Data protection
- Network security
- Antivirus integration
- Vulnerability reporting

### [Deployment Guide](./deployment.md)
Production deployment documentation:
- Build process
- Packaging
- Code signing
- Auto-updates
- Release process
- CI/CD pipelines
- Troubleshooting

### [Quick Reference](./quick-reference.md)
Developer cheat sheet:
- Common commands
- Keyboard shortcuts
- File locations
- Quick troubleshooting
- Useful tips

## 🎯 Getting Started

### For New Developers

1. Read [README.md](../README.md) for project overview
2. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) setup instructions
3. Review [ARCHITECTURE.md](../ARCHITECTURE.md) to understand the system
4. Check [Quick Reference](./quick-reference.md) for common commands
5. Start coding!

### For Contributors

1. Understand [Code Standards](../CONTRIBUTING.md#code-standards)
2. Learn [Testing Practices](../TESTING.md)
3. Follow [Pull Request Process](../CONTRIBUTING.md#pull-request-process)
4. Review [Security Guidelines](./security.md)

### For Maintainers

1. Review [Deployment Guide](./deployment.md)
2. Understand [Release Process](./deployment.md#release-process)
3. Monitor [CI/CD Pipelines](./deployment.md#cicd)
4. Handle [Security Reports](./security.md#vulnerability-reporting)

## 📋 By Topic

### Setup & Development

- [Development Setup](../CONTRIBUTING.md#development-setup)
- [Development Workflow](../CONTRIBUTING.md#development-workflow)
- [Quick Reference](./quick-reference.md)

### Architecture & Design

- [System Architecture](../ARCHITECTURE.md)
- [Technology Stack](../ARCHITECTURE.md#technology-stack)
- [Data Flow](../ARCHITECTURE.md#data-flow)

### Testing

- [Testing Guide](../TESTING.md)
- [Writing Tests](../TESTING.md#writing-tests)
- [Testing Patterns](../TESTING.md#testing-patterns)

### Security

- [Security Architecture](./security.md#security-architecture)
- [Encryption](./security.md#encryption)
- [Authentication](./security.md#authentication)
- [Best Practices](./security.md#best-practices)

### APIs & Integration

- [IPC Communication](../API.md#ipc-communication)
- [Main Process APIs](../API.md#main-process-apis)
- [Sync Engine APIs](../API.md#sync-engine-apis)
- [Virtual Drive APIs](../API.md#virtual-drive-apis)

### Deployment

- [Build Process](./deployment.md#build-process)
- [Packaging](./deployment.md#packaging)
- [Release Process](./deployment.md#release-process)

## 🔍 Finding Information

### By Component

**Main Process**: [Architecture - Main Process](../ARCHITECTURE.md#1-main-process-srcappsmain)

**Renderer**: [Architecture - Renderer Process](../ARCHITECTURE.md#2-renderer-process-srcappsrenderer)

**Sync Engine**: [Architecture - Sync Engine](../ARCHITECTURE.md#3-sync-engine-srcappssync-engine)

**Virtual Drive**: [Virtual Drive Guide](./virtual-drive.md)

**Backend**: [Architecture - Backend Features](../ARCHITECTURE.md#4-backend-features-srcbackendfeatures)

### By Task

**Running the app**: [Quick Reference - Running](./quick-reference.md#running)

**Building**: [Quick Reference - Building](./quick-reference.md#building)

**Testing**: [Quick Reference - Testing](./quick-reference.md#testing)

**Debugging**: [Quick Reference - Debugging](./quick-reference.md#debugging)

**Adding features**: [Quick Reference - Common Tasks](./quick-reference.md#common-tasks)

### Troubleshooting

**Common Issues**: [Contributing - Common Issues](../CONTRIBUTING.md#common-issues)

**Quick Fixes**: [Quick Reference - Troubleshooting](./quick-reference.md#quick-troubleshooting)

**Build Problems**: [Deployment - Troubleshooting](./deployment.md#troubleshooting)

## 📊 Diagrams & Visuals

### Architecture Diagrams

- [Multi-Process Architecture](../ARCHITECTURE.md#architecture-overview)
- [Data Flow - Upload](../ARCHITECTURE.md#file-upload-flow)
- [Data Flow - Download](../ARCHITECTURE.md#file-download-flow)
- [Authentication Flow](../ARCHITECTURE.md#authentication-flow)

### Security Diagrams

- [Security Layers](./security.md#security-architecture)
- [Encryption Flow](./security.md#end-to-end-encryption-e2ee)

### Virtual Drive Diagrams

- [Virtual Drive Architecture](./virtual-drive.md#architecture)
- [File Operations](./virtual-drive.md#file-operations)

## 🔗 External Resources

### Electron

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [IPC Communication](https://www.electronjs.org/docs/latest/api/ipc-main)

### React

- [React Documentation](https://react.dev/)
- [React TypeScript](https://react.dev/learn/typescript)
- [Testing Library](https://testing-library.com/react)

### TypeScript

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Testing

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Windows Development

- [Windows Cloud Filter API](https://docs.microsoft.com/en-us/windows/win32/cfapi/cloud-files-api-portal)
- [Windows Code Signing](https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool)

## 💬 Getting Help

### Documentation Issues

Found an issue in the documentation? Please:
1. Check if it's already reported in [Issues](https://github.com/logic-arts-official/iDrive/issues)
2. Open a new issue with label `documentation`
3. Submit a PR to fix it

### Questions

For questions about:
- **Usage**: Check [README.md](../README.md)
- **Development**: Check [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Architecture**: Check [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Security**: Check [Security Guide](./security.md)

Still need help?
- Open a [GitHub Issue](https://github.com/logic-arts-official/iDrive/issues)
- Ask in pull request comments
- Contact the team

## 📝 Contributing to Documentation

Documentation improvements are always welcome!

### Guidelines

- Keep explanations clear and concise
- Include code examples where helpful
- Add diagrams for complex concepts
- Link to related documentation
- Test all commands and code samples
- Follow Markdown best practices

### Process

1. Fork the repository
2. Make your changes
3. Test your changes
4. Submit a pull request
5. Address review feedback

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full details.

## 📅 Documentation Updates

Documentation is updated with each release. Check the commit history for recent changes.

### Recent Updates

- Added comprehensive architecture documentation
- Added security guide
- Added deployment guide
- Added quick reference guide
- Enhanced README with better structure

---

## 🗺️ Quick Navigation

| I want to... | Go to... |
|--------------|----------|
| Get started | [README.md](../README.md) |
| Set up development | [CONTRIBUTING.md](../CONTRIBUTING.md#development-setup) |
| Understand architecture | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| Learn the APIs | [API.md](../API.md) |
| Write tests | [TESTING.md](../TESTING.md) |
| Check security | [Security Guide](./security.md) |
| Deploy to production | [Deployment Guide](./deployment.md) |
| Find quick answers | [Quick Reference](./quick-reference.md) |

---

<div align="center">

**Happy coding! 🚀**

If you have suggestions for improving this documentation, please open an issue or PR.

</div>
