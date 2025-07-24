import { describe, expect, test, vi, beforeEach } from 'vitest';
import { APIError } from 'encore.dev/api';

// Mock Clerk before any imports
vi.mock('@clerk/clerk-sdk-node', () => ({
    Clerk: vi.fn()
}));

// Mock Encore auth
const mockAuthHandler = vi.fn();
vi.mock('encore.dev/auth', () => ({
    authHandler: mockAuthHandler
}));

describe('Auth Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should create auth handler with proper validation', async () => {
        // Arrange
        const mockHandler = vi.fn();
        mockAuthHandler.mockReturnValue(mockHandler);

        // Act
        await import('./auth');

        // Assert
        expect(mockAuthHandler).toHaveBeenCalled();
        const handlerFunction = mockAuthHandler.mock.calls[0][0];
        expect(typeof handlerFunction).toBe('function');
    });

    test('should create gateway with auth handler', async () => {
        // Act
        const { gateway } = await import('./auth');

        // Assert
        expect(gateway).toBeDefined();
        expect(typeof gateway).toBe('object');
    });
}); 