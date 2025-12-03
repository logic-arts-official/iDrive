# Contributing to Internxt Drive Desktop

Thank you for your interest in contributing to Internxt Drive Desktop! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

Please be respectful and considerate in your interactions with the community. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Operating System**: Windows (macOS/Linux support coming soon)
- **Node.js**: Version 20.19.0 or higher
- **npm**: Version 10.0.0 or higher
- **NVM**: [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows)
- **Python**: 3.10 (required for node-gyp)
- **node-gyp**: Global installation required
- **Visual Studio**: Full Visual Studio (not VS Code) with C++ build tools

### Visual Studio Configuration

When installing Visual Studio, ensure you include:
- Desktop development with C++
- Windows 10/11 SDK
- C++ CMake tools for Windows

See the images in `public/` directory for reference.

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/logic-arts-official/iDrive.git
cd iDrive
```

### 2. Install Node.js 20

```bash
nvm install 20
nvm use 20
```

### 3. Install node-gyp Globally

```bash
npm install -g node-gyp
```

### 4. Initialize Development Environment

```bash
npm run init:dev
```

This command will:
- Install all dependencies
- Install Electron
- Build development DLL files
- Rebuild native dependencies

### 5. (Optional) Setup ClamAV Antivirus

```bash
npm run clamav
```

This runs a PowerShell script to set up ClamAV integration for virus scanning.

### 6. Start the Application

```bash
npm run start
```

This starts the renderer development server. In a separate terminal, run:

```bash
npm run start:reload
```

This starts the main process and sync engine.

## Development Workflow

### Project Scripts

#### Building

```bash
# Build all components
npm run build

# Build specific components
npm run build:main        # Main process
npm run build:renderer    # Renderer (UI)
npm run build:sync-engine # Sync engine
npm run build:preload     # Preload script
```

#### Running

```bash
# Start development server (renderer only)
npm run start

# Start with auto-reload (main + sync engine)
npm run start:reload

# Start specific components
npm run start:main        # Main process only
npm run start:renderer    # Renderer only
npm run start:sync-engine # Sync engine only
```

#### Testing

```bash
# Run all tests
npm run test

# Run infrastructure tests
npm run test:infra

# Run renderer tests
npm run test:renderer

# Watch mode for a single test file
npm run test:one <pattern>
```

#### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Fix formatting issues
npm run format:fix

# Type check
npm run type-check

# Find dead code
npm run find-deadcode
```

#### Native Dependencies

```bash
# Rebuild native dependencies
npm run reload-native-deps
```

### Making Changes

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**

   ```bash
   npm run type-check
   npm run lint
   npm run format
   npm run test
   ```

4. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Avoid `any` types; use `unknown` when necessary
- Define proper interfaces and types
- Use discriminated unions for complex types

### React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for prop types
- Implement proper error boundaries

### Naming Conventions

- **Files**: kebab-case (e.g., `file-uploader.ts`)
- **Classes**: PascalCase (e.g., `FileUploader`)
- **Functions/Variables**: camelCase (e.g., `uploadFile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces**: PascalCase, prefixed with 'I' if needed (e.g., `IFileMetadata`)
- **Types**: PascalCase (e.g., `FileMetadata`)

### Code Organization

- Keep files focused and single-purpose
- Co-locate tests with source files (`.test.ts` suffix)
- Group related functionality in directories
- Use index files for clean exports

### Imports

Imports are automatically sorted by `@trivago/prettier-plugin-sort-imports`:

1. External dependencies
2. Internal absolute imports (`@/...`)
3. Relative imports
4. Type imports

### Comments

- Write self-documenting code when possible
- Add comments for complex logic
- Document public APIs with JSDoc
- Explain "why" rather than "what"

### Error Handling

- Use try-catch blocks appropriately
- Log errors with context
- Provide meaningful error messages
- Don't swallow errors silently

## Testing

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions/classes
2. **Integration Tests**: Test component interactions
3. **Renderer Tests**: Test React components

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test:one <file-pattern>

# Run with coverage
npm run test -- --coverage
```

### Mocking

Use `vitest-mock-extended` for type-safe mocks:

```typescript
import { mock } from 'vitest-mock-extended';

const mockService = mock<ServiceInterface>();
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ TypeScript type check passes
4. ✅ No new warnings (or documented exceptions)
5. ✅ Documentation is updated
6. ✅ Commit messages follow convention

### PR Guidelines

1. **Title**: Use conventional commit format
   - Example: `feat: add file upload progress indicator`

2. **Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes
   - Breaking changes (if any)

3. **Size**: Keep PRs focused and reasonably sized
   - Large PRs may be rejected with a request to split

4. **Reviews**: Address all review comments
   - Mark resolved conversations
   - Respond to feedback promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated (if applicable)
- [ ] No new console warnings or errors
- [ ] Builds successfully in production mode
- [ ] Tested on Windows
- [ ] Self-reviewed the code changes

### CI Checks

Your PR must pass:
- ✅ Linting
- ✅ Type checking
- ✅ Tests
- ✅ Build
- ✅ SonarCloud analysis
- ✅ Dead code detection
- ✅ PR size check

## Project Structure

```
iDrive/
├── .erb/                 # Electron React Boilerplate configs
├── .github/              # GitHub workflows and configs
├── assets/               # Application assets
├── clamAV/               # Antivirus integration
├── packages/             # Local packages
│   └── addon/            # Native Windows addon
├── public/               # Public assets
├── release/              # Release scripts
├── src/
│   ├── apps/
│   │   ├── backups/      # Backup functionality
│   │   ├── main/         # Main Electron process
│   │   ├── renderer/     # React UI
│   │   ├── shared/       # Shared utilities
│   │   ├── sync-engine/  # Sync engine process
│   │   └── utils/        # Utility functions
│   ├── backend/          # Backend features
│   ├── context/          # DDD contexts
│   ├── core/             # Core utilities
│   ├── features/         # Feature modules
│   ├── infra/            # Infrastructure layer
│   ├── migrations/       # Database migrations
│   ├── node-win/         # Windows integration
│   └── types/            # TypeScript types
├── tests/                # Test utilities
└── [config files]        # Various configuration files
```

## Common Issues

### Native Dependencies Fail to Build

**Solution**: Ensure Visual Studio is installed with C++ build tools

```bash
npm run reload-native-deps
```

### Electron Installation Issues

**Solution**: Manually install Electron

```bash
node node_modules/electron/install.js
```

### Build Errors

**Solution**: Clean and rebuild

```bash
rm -rf node_modules dist build
npm run init:dev
```

### Type Errors

**Solution**: Rebuild after updating dependencies

```bash
npm run reload-native-deps
npm run type-check
```

## Getting Help

- Check existing [Issues](https://github.com/logic-arts-official/iDrive/issues)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Ask questions in issue comments
- Read the [README.md](./README.md)

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Internxt Drive Desktop! 🚀
