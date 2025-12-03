# Testing Guide

This document describes the testing strategy and practices for Internxt Drive Desktop.

## Table of Contents

- [Overview](#overview)
- [Test Framework](#test-framework)
- [Test Organization](#test-organization)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Patterns](#testing-patterns)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

Internxt Drive Desktop uses **Vitest** as its primary testing framework. Tests are co-located with source files and organized by layer and responsibility.

### Test Types

1. **Unit Tests**: Test individual functions, classes, and components in isolation
2. **Integration Tests**: Test interactions between multiple components
3. **Infrastructure Tests**: Test infrastructure layer components
4. **Renderer Tests**: Test React components and UI logic

## Test Framework

### Vitest

- **Fast**: ESM-first, powered by Vite
- **Compatible**: Jest-compatible API
- **TypeScript**: First-class TypeScript support
- **Mocking**: Built-in mocking utilities
- **Coverage**: Istanbul integration for coverage reports

### Configuration Files

```
vitest.config.base.mts       # Base configuration
vitest.config.mts            # Default configuration
vitest.config.infra.mts      # Infrastructure tests
vitest.config.renderer.mts   # Renderer/UI tests
```

### Key Dependencies

- `vitest`: Test runner
- `@vitest/coverage-istanbul`: Coverage reporting
- `vitest-mock-extended`: Type-safe mocking
- `@testing-library/react`: React component testing
- `@testing-library/jest-dom`: Custom matchers
- `jsdom`: DOM implementation for testing

## Test Organization

### File Naming Convention

- Test files: `*.test.ts` or `*.test.tsx`
- Co-located with source files
- Example: `file-uploader.ts` → `file-uploader.test.ts`

### Directory Structure

```
src/
├── apps/
│   ├── backups/
│   │   ├── folders/
│   │   │   ├── create-folders.ts
│   │   │   └── create-folders.test.ts
│   │   └── backups.test.ts
│   ├── main/
│   ├── renderer/
│   └── sync-engine/
│       └── tests/              # Integration test suite
├── context/
├── infra/
└── node-win/
    ├── virtual-drive.test.ts
    └── watcher/
        └── events/
            ├── on-add.service.test.ts
            └── debounce-on-raw.test.ts
```

### Test Utilities

Located in `tests/vitest/`:
- Shared test helpers
- Mock factories
- Test fixtures

## Running Tests

### All Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test -- --watch

# Run with coverage
npm run test -- --coverage
```

### Infrastructure Tests

```bash
# Run infrastructure tests
npm run test:infra

# Watch mode
npm run test:infra:one <pattern>
```

### Renderer Tests

```bash
# Run renderer tests
npm run test:renderer

# Watch mode
npm run test:renderer:one <pattern>
```

### Single Test File

```bash
# Watch and run related tests
npm run test:one <file-pattern>

# Example
npm run test:one file-uploader
```

### CI Testing

In CI environments, tests run with:
```bash
npm run test -- --coverage
npm run test:infra -- --coverage
npm run test:renderer -- --coverage
```

Coverage reports are merged with `lcov-result-merger`.

## Writing Tests

### Basic Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('FunctionName or ClassName', () => {
  // Setup before each test
  beforeEach(() => {
    // Initialize test state
  });

  // Cleanup after each test
  afterEach(() => {
    // Clean up resources
  });

  it('should describe expected behavior', () => {
    // Arrange: Set up test data
    const input = 'test';

    // Act: Execute the code under test
    const result = functionUnderTest(input);

    // Assert: Verify the result
    expect(result).toBe('expected');
  });
});
```

### Testing with TypeScript

```typescript
import { describe, it, expect } from 'vitest';

interface User {
  id: number;
  name: string;
}

describe('User Service', () => {
  it('should create user with correct type', () => {
    const user: User = createUser({ name: 'John' });
    
    expect(user).toEqual({
      id: expect.any(Number),
      name: 'John',
    });
  });
});
```

### Testing Async Code

```typescript
import { describe, it, expect } from 'vitest';

describe('Async operations', () => {
  it('should handle promises', async () => {
    const result = await fetchData();
    expect(result).toBeDefined();
  });

  it('should handle rejections', async () => {
    await expect(fetchInvalidData()).rejects.toThrow('Error message');
  });
});
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Testing Patterns

### Mocking with Vitest

```typescript
import { vi } from 'vitest';

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked');

// Mock module
vi.mock('./module', () => ({
  functionName: vi.fn(() => 'mocked'),
}));

// Spy on method
const spy = vi.spyOn(object, 'method');
```

### Type-Safe Mocking

```typescript
import { mock } from 'vitest-mock-extended';

interface FileService {
  upload(file: File): Promise<void>;
  download(id: string): Promise<File>;
}

const mockFileService = mock<FileService>();
mockFileService.upload.mockResolvedValue(undefined);
mockFileService.download.mockResolvedValue(new File([''], 'test.txt'));
```

### Testing with Electron APIs

```typescript
import { vi } from 'vitest';

// Mock Electron modules
vi.mock('electron', () => ({
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn(),
    invoke: vi.fn(),
  },
  app: {
    getPath: vi.fn(() => '/mock/path'),
  },
}));
```

### Testing IPC Communication

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ipcRenderer } from 'electron';

vi.mock('electron');

describe('IPC Handler', () => {
  it('should send message through IPC', () => {
    const mockSend = vi.mocked(ipcRenderer.send);
    
    sendMessageToMain('test-channel', { data: 'test' });
    
    expect(mockSend).toHaveBeenCalledWith('test-channel', { data: 'test' });
  });
});
```

### Testing Database Operations

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { DataSource } from 'typeorm';

describe('Database Repository', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    // Use in-memory SQLite for tests
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User],
      synchronize: true,
    });
    await dataSource.initialize();
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should save user to database', async () => {
    const repo = dataSource.getRepository(User);
    const user = await repo.save({ name: 'John' });
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John');
  });
});
```

### Testing File System Operations

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('File Operations', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should create file', async () => {
    const filePath = path.join(tempDir, 'test.txt');
    await fs.writeFile(filePath, 'content');
    
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toBe('content');
  });
});
```

### Testing with React Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';

describe('useCounter Hook', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Testing Error Cases

```typescript
import { describe, it, expect } from 'vitest';

describe('Error handling', () => {
  it('should throw error for invalid input', () => {
    expect(() => processData(null)).toThrow('Input cannot be null');
  });

  it('should return error result', async () => {
    const result = await processDataSafe(invalidData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## Coverage

### Generating Coverage Reports

```bash
# Run tests with coverage
npm run test -- --coverage

# Coverage for specific test suite
npm run test:infra -- --coverage
npm run test:renderer -- --coverage
```

### Merge Coverage Reports

```bash
npm run coverage:merge
```

This merges coverage from all test suites into a single `coverage/lcov.info` file.

### Coverage Reports Location

```
coverage/
├── main/           # Main process coverage
├── infra/          # Infrastructure coverage
├── renderer/       # Renderer coverage
└── lcov.info       # Merged coverage
```

### Coverage Goals

- **Minimum**: 70% overall coverage
- **Target**: 80% coverage for new code
- **Critical paths**: 90%+ coverage

## Best Practices

### DO

✅ **Co-locate tests with source files**
```
file-uploader.ts
file-uploader.test.ts
```

✅ **Use descriptive test names**
```typescript
it('should upload file successfully when size is under limit', () => {
  // Test implementation
});
```

✅ **Follow Arrange-Act-Assert pattern**
```typescript
it('should calculate total', () => {
  // Arrange
  const items = [1, 2, 3];
  
  // Act
  const result = sum(items);
  
  // Assert
  expect(result).toBe(6);
});
```

✅ **Test edge cases**
```typescript
describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should reject email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });
});
```

✅ **Clean up after tests**
```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup(); // For React Testing Library
});
```

✅ **Use type-safe mocks**
```typescript
const mockService = mock<IFileService>();
```

### DON'T

❌ **Don't test implementation details**
```typescript
// Bad
expect(component.state.count).toBe(1);

// Good
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

❌ **Don't write flaky tests**
```typescript
// Bad - timing dependent
await new Promise(resolve => setTimeout(resolve, 1000));

// Good - use waitFor
await waitFor(() => expect(element).toBeVisible());
```

❌ **Don't forget to handle async**
```typescript
// Bad
it('should fetch data', () => {
  fetchData(); // Promise not awaited
  expect(data).toBeDefined(); // Will fail
});

// Good
it('should fetch data', async () => {
  await fetchData();
  expect(data).toBeDefined();
});
```

❌ **Don't test external libraries**
```typescript
// Don't test React, Electron, or third-party libraries
// Only test your code that uses them
```

❌ **Don't share state between tests**
```typescript
// Bad
let sharedState = {};

it('test 1', () => {
  sharedState.value = 1;
});

it('test 2', () => {
  // Depends on test 1
  expect(sharedState.value).toBe(1);
});
```

### Test Independence

Each test should:
- Run independently
- Not depend on execution order
- Clean up after itself
- Not affect other tests

### Test Naming

Use clear, descriptive names that explain:
- What is being tested
- Under what conditions
- What the expected outcome is

Format: `should [expected behavior] when [condition]`

Example:
```typescript
describe('FileUploader', () => {
  it('should reject file when size exceeds limit', () => {});
  it('should accept file when size is within limit', () => {});
  it('should throw error when file type is invalid', () => {});
});
```

## Debugging Tests

### Run Single Test

```bash
npm run test:one <pattern>
```

### Use `.only` for Focus

```typescript
it.only('should focus on this test', () => {
  // Only this test will run
});
```

### Use `.skip` to Skip

```typescript
it.skip('should skip this test', () => {
  // This test will be skipped
});
```

### Debug Output

```typescript
it('should debug', () => {
  console.log('Debug value:', value);
  // Or use debugger
  debugger;
});
```

## Continuous Integration

Tests run automatically in CI on:
- Pull requests
- Pushes to main branches
- Release builds

CI configuration: `.github/workflows/windows-pull-request.yml`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Effective Testing](https://testingjavascript.com/)

## Getting Help

- Check test examples in the codebase
- Review existing test patterns
- Ask in pull request comments
- Consult team members

Happy Testing! 🧪
