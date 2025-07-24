# Backend Testing Guide

This document explains how to run and write tests for the backend services using Vitest and Encore's testing utilities.

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests for a specific service
npm test tasks

# Run tests matching a pattern
npm test -- --grep "createTask"

# Run tests in a specific file
npm test tasks/tasks.test.ts
```

## 📁 Test Organization

Tests are organized using **co-location** pattern, meaning test files are placed next to the code they test:

```
backend/
├── tasks/
│   ├── tasks.ts              # Service implementation
│   ├── tasks.test.ts         # Tests for tasks service
│   └── encore.service.ts
├── auth/
│   ├── auth.ts               # Service implementation
│   ├── auth.test.ts          # Tests for auth service
│   └── encore.service.ts
└── test-utils.ts             # Shared test utilities
```

## 🧪 Writing Tests

### Test Structure

Each test file should follow this structure:

```typescript
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { APIError, ErrCode } from 'encore.dev/api';
import * as auth from '~encore/auth';
import { yourFunction } from './your-service';
import { createMockTask, createMockAuthData } from '../test-utils';

describe('Service Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    test('should do something when condition', async () => {
      // Arrange - Set up test data and mocks
      const mockAuthData = createMockAuthData();
      vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);

      // Act - Call the function being tested
      const result = await yourFunction(params);

      // Assert - Verify the expected behavior
      expect(result).toEqual(expectedValue);
    });
  });
});
```

### Test Patterns

#### 1. Authentication Tests

```typescript
test('should throw error when user is not authenticated', async () => {
  // Arrange
  vi.mocked(auth.getAuthData).mockReturnValue(null);

  // Act & Assert
  await expect(yourFunction(params)).rejects.toThrow(APIError);
  await expect(yourFunction(params)).rejects.toMatchObject({
    code: ErrCode.Unauthenticated,
    message: 'Unauthenticated'
  });
});
```

#### 2. Database Operation Tests

```typescript
test('should create resource successfully', async () => {
  // Arrange
  const mockAuthData = createMockAuthData();
  const mockResult = createMockTask();
  
  vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
  mockPrisma.task.create.mockResolvedValue(mockResult);

  // Act
  const result = await createTask(params);

  // Assert
  expect(result.data).toEqual(mockResult);
  expect(mockPrisma.task.create).toHaveBeenCalledWith(expectedParams);
});
```

#### 3. Error Handling Tests

```typescript
test('should handle database errors gracefully', async () => {
  // Arrange
  const mockAuthData = createMockAuthData();
  vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
  mockPrisma.task.create.mockRejectedValue(new Error('Database error'));

  // Act & Assert
  await expect(createTask(params)).rejects.toThrow();
});
```

## 🛠️ Test Utilities

### Mock Data Creation

Use the utilities in `test-utils.ts` to create consistent mock data:

```typescript
import { 
  createMockTask, 
  createMockAuthData, 
  createMockTasks,
  createMockPagination 
} from '../test-utils';

// Create a single mock task
const task = createMockTask({ title: 'Custom Title' });

// Create multiple mock tasks
const tasks = createMockTasks(5, { completed: true });

// Create mock auth data
const authData = createMockAuthData({ userID: 'custom-user-id' });
```

### Mocking Dependencies

#### Prisma Client

```typescript
const mockPrisma = {
  task: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  }
};

vi.mocked(PrismaClient).mockImplementation(() => mockPrisma as unknown as PrismaClient);
```

#### Authentication

```typescript
import * as auth from '~encore/auth';

// Mock authenticated user
vi.mocked(auth.getAuthData).mockReturnValue(createMockAuthData());

// Mock unauthenticated user
vi.mocked(auth.getAuthData).mockReturnValue(null);
```

## 📊 Test Coverage

### Running Coverage

```bash
npm run test:coverage
```

This will generate a coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Coverage Targets

Aim for the following coverage levels:
- **CRUD Operations**: 100%
- **Authentication**: 100%
- **Error Handling**: 90%+
- **Business Logic**: 95%+
- **Overall**: 90%+

## 🔧 Configuration

### Vitest Configuration

The test configuration is in `vitest.config.ts`:

- **Environment**: Node.js
- **Setup Files**: `test-setup.ts`
- **Coverage**: V8 provider
- **Aliases**: Configured for Encore imports

### Test Setup

Global test configuration is in `test-setup.ts`:

- Environment variables
- Console mocking
- Global mocks for dependencies
- Test lifecycle hooks

## 🚨 Best Practices

### 1. Test Organization
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking
- Mock external dependencies
- Use consistent mock data
- Reset mocks between tests

### 3. Assertions
- Test both success and failure cases
- Verify function calls with correct parameters
- Test error conditions and edge cases

### 4. Performance
- Keep tests fast and focused
- Avoid unnecessary async operations
- Use appropriate timeouts

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test in debug mode
npm test -- --inspect-brk --grep "test name"
```

### Verbose Output

```bash
# Show detailed test output
npm test -- --reporter=verbose

# Show console output
npm test -- --reporter=verbose --silent=false
```

## 📝 Adding New Tests

When adding new functionality:

1. **Write tests first** (TDD approach)
2. **Test all code paths** including error cases
3. **Use descriptive test names**
4. **Add tests for edge cases**
5. **Update this documentation** if needed

## 🔗 Related Documentation

- [Encore Testing Guide](https://encore.dev/docs/ts/develop/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://encore.dev/docs/ts/develop/testing#best-practices) 