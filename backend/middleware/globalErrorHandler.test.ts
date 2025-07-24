import { describe, expect, test, vi, beforeEach } from 'vitest';
import { APIError, ErrCode } from 'encore.dev/api';
import { Prisma } from '@prisma/client';
import { handleApiError } from './errorHandler';
import { globalErrorHandler } from './globalErrorHandler';

// Mock the errorHandler module for middleware tests only
vi.mock('./errorHandler', () => ({
    handleApiError: vi.fn()
}));

describe('Global Error Handler Middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should pass through successful requests', async () => {
        // Arrange
        const mockRequest = {} as any;
        const mockNext = vi.fn().mockResolvedValue({ success: true });
        const mockHandleApiError = vi.mocked(handleApiError);

        // Act
        const result = await globalErrorHandler(mockRequest, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(mockRequest);
        expect(result).toEqual({ success: true });
        expect(mockHandleApiError).not.toHaveBeenCalled();
    });

    test('should handle errors and call handleApiError', async () => {
        // Arrange
        const mockRequest = {} as any;
        const testError = new Error('Test error');
        const mockNext = vi.fn().mockRejectedValue(testError);
        const mockHandleApiError = vi.mocked(handleApiError);
        const expectedApiError = new APIError(ErrCode.Internal, 'Test error');
        mockHandleApiError.mockReturnValue(expectedApiError);

        // Act & Assert
        await expect(globalErrorHandler(mockRequest, mockNext)).rejects.toThrow(expectedApiError);
        expect(mockNext).toHaveBeenCalledWith(mockRequest);
        expect(mockHandleApiError).toHaveBeenCalledWith(testError);
    });

    test('should handle Prisma errors through middleware', async () => {
        // Arrange
        const mockRequest = {} as any;
        const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
            code: 'P2025',
            clientVersion: '5.0.0'
        });
        const mockNext = vi.fn().mockRejectedValue(prismaError);
        const mockHandleApiError = vi.mocked(handleApiError);
        const expectedApiError = new APIError(ErrCode.NotFound, 'Resource not found');
        mockHandleApiError.mockReturnValue(expectedApiError);

        // Act & Assert
        await expect(globalErrorHandler(mockRequest, mockNext)).rejects.toThrow(expectedApiError);
        expect(mockHandleApiError).toHaveBeenCalledWith(prismaError);
    });

    test('should handle API errors without modification', async () => {
        // Arrange
        const mockRequest = {} as any;
        const existingApiError = new APIError(ErrCode.PermissionDenied, 'Access denied');
        const mockNext = vi.fn().mockRejectedValue(existingApiError);
        const mockHandleApiError = vi.mocked(handleApiError);
        mockHandleApiError.mockReturnValue(existingApiError);

        // Act & Assert
        await expect(globalErrorHandler(mockRequest, mockNext)).rejects.toThrow(existingApiError);
        expect(mockHandleApiError).toHaveBeenCalledWith(existingApiError);
    });
}); 