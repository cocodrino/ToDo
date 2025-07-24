import type { Task } from './types/tasks';

/**
 * Create a mock task with default values
 */
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    userId: 'test-user-id',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides
});

/**
 * Create mock pagination metadata
 */
export const createMockPagination = (overrides: Record<string, unknown> = {}) => ({
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false,
    ...overrides
});

/**
 * Create mock auth data
 */
export const createMockAuthData = (overrides: Record<string, unknown> = {}) => ({
    userID: 'test-user-id',
    userEmail: 'test@example.com',
    ...overrides
});

/**
 * Mock API error for testing
 */
export const createMockAPIError = (code: string, message: string) => ({
    code,
    message,
    name: 'APIError'
});

/**
 * Helper to wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to create multiple mock tasks
 */
export const createMockTasks = (count: number, overrides: Partial<Task> = {}) => {
    return Array.from({ length: count }, (_, index) =>
        createMockTask({
            id: index + 1,
            title: `Test Task ${index + 1}`,
            ...overrides
        })
    );
}; 