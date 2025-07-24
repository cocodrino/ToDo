import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
});

afterAll(() => {
    // Clean up after all tests
});

beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
});

afterEach(() => {
    // Clean up after each test
    vi.clearAllTimers();
});

// Mock Encore auth module
vi.mock('~encore/auth', () => ({
    getAuthData: vi.fn()
}));

// Mock Prisma client with error classes
vi.mock('@prisma/client', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        PrismaClient: vi.fn().mockImplementation(() => ({
            task: {
                create: vi.fn(),
                findMany: vi.fn(),
                findFirst: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
                count: vi.fn()
            }
        }))
    };
});

// Mock Encore logging
vi.mock('encore.dev/log', () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));

// Mock trace utility
vi.mock('./utils/trace', () => ({
    trace: vi.fn((name, fn) => fn())
})); 