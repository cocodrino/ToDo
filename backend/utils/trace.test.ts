import { describe, expect, test, vi, beforeEach } from 'vitest';

describe('Trace Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should trace synchronous function execution', async () => {
        // Arrange
        const testFn = vi.fn().mockReturnValue('test result');

        // Act
        const { trace } = await import('./trace');
        const result = trace('test-sync', testFn);

        // Assert
        expect(result).toBe('test result');
        expect(testFn).toHaveBeenCalledOnce();
    });

    test('should trace asynchronous function execution', async () => {
        // Arrange
        const testFn = vi.fn().mockResolvedValue('async result');

        // Act
        const { trace } = await import('./trace');
        const result = await trace('test-async', testFn);

        // Assert
        expect(result).toBe('async result');
        expect(testFn).toHaveBeenCalledOnce();
    });

    test('should trace asynchronous function that throws error', async () => {
        // Arrange
        const testError = new Error('Test error');
        const testFn = vi.fn().mockRejectedValue(testError);

        // Act & Assert
        const { trace } = await import('./trace');
        await expect(trace('test-async-error', testFn)).rejects.toThrow('Test error');
    });

    test('should handle different return types', async () => {
        // Arrange
        const stringFn = vi.fn().mockReturnValue('string result');
        const numberFn = vi.fn().mockReturnValue(42);
        const objectFn = vi.fn().mockReturnValue({ id: 1, name: 'test' });

        // Act
        const { trace } = await import('./trace');
        const stringResult = trace('test-string', stringFn);
        const numberResult = trace('test-number', numberFn);
        const objectResult = trace('test-object', objectFn);

        // Assert
        expect(stringResult).toBe('string result');
        expect(numberResult).toBe(42);
        expect(objectResult).toEqual({ id: 1, name: 'test' });
    });
}); 