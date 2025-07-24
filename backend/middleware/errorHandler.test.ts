import { describe, expect, test, vi, beforeEach } from 'vitest';
import { APIError, ErrCode } from 'encore.dev/api';
import { handleApiError } from './errorHandler';

describe('Error Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should handle timeout errors', () => {
        // Arrange
        const error = new Error('ETIMEDOUT');

        // Act
        const result = handleApiError(error);

        // Assert
        expect(result).toBeInstanceOf(APIError);
        expect(result.code).toBe(ErrCode.DeadlineExceeded);
        expect(result.message).toBe('Request timed out');
    });

    test('should propagate existing APIError without modification', () => {
        // Arrange
        const existingError = new APIError(ErrCode.PermissionDenied, 'Custom permission error');

        // Act
        const result = handleApiError(existingError);

        // Assert
        expect(result).toBe(existingError);
        expect(result.code).toBe(ErrCode.PermissionDenied);
        expect(result.message).toBe('Custom permission error');
    });

    test('should handle unknown error types', () => {
        // Arrange
        const error = new Error('Unknown error');

        // Act
        const result = handleApiError(error);

        // Assert
        expect(result).toBeInstanceOf(APIError);
        expect(result.code).toBe(ErrCode.Internal);
        expect(result.message).toBe('An unexpected error occurred');
    });
}); 