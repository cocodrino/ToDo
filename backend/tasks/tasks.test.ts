import { describe, expect, test, vi, beforeEach } from 'vitest';
import * as auth from '~encore/auth';
import { createMockTask, createMockAuthData, createMockTasks } from '../test-utils';

// Define mocks using vi.hoisted to ensure they're available before imports
const mocks = vi.hoisted(() => {
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

    return {
        mockPrisma,
        PrismaClient: vi.fn().mockImplementation(() => mockPrisma)
    };
});

// Mock the PrismaClient constructor using proper Vitest pattern
vi.mock('@prisma/client', () => ({
    PrismaClient: mocks.PrismaClient
}));

// Import the functions after mocking
import { createTask, getTasks, getTask, updateTask, toggleTask, deleteTask } from './tasks';

describe('Tasks Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Authentication Tests', () => {
        test('should throw UNAUTHENTICATED error when auth data is null', async () => {
            // Arrange
            const params = { title: 'Test Task' };
            vi.mocked(auth.getAuthData).mockReturnValue(null);

            // Act & Assert
            await expect(createTask(params)).rejects.toThrow('Unauthenticated');
        });

        test('should use user ID from auth data for all operations', async () => {
            // Arrange
            const mockAuthData = createMockAuthData({ userID: 'custom-user-id' });
            const mockTask = createMockTask({ userId: 'custom-user-id' });
            const params = { title: 'Test Task' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(mockTask);

            // Act
            await createTask(params);

            // Assert
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'custom-user-id'
                })
            });
        });
    });

    describe('Data Validation Tests', () => {
        test('should handle empty title gracefully', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { title: '' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(createMockTask({ title: '' }));

            // Act
            const result = await createTask(params);

            // Assert
            expect(result.data).toBeDefined();
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: ''
                })
            });
        });

        test('should handle very long titles', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const longTitle = 'A'.repeat(1000);
            const params = { title: longTitle };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(createMockTask({ title: longTitle }));

            // Act
            const result = await createTask(params);

            // Assert
            expect(result.data).toBeDefined();
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: longTitle
                })
            });
        });

        test('should handle special characters in title and description', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const specialTitle = 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
            const specialDescription = 'Description with emojis: 🚀 📝 ✅';
            const params = { title: specialTitle, description: specialDescription };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(createMockTask({
                title: specialTitle,
                description: specialDescription
            }));

            // Act
            const result = await createTask(params);

            // Assert
            expect(result.data).toBeDefined();
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: specialTitle,
                    description: specialDescription
                })
            });
        });

        test('should handle undefined description', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { title: 'Task 2' }; // undefined description

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(createMockTask());

            // Act & Assert
            await expect(createTask(params)).resolves.toBeDefined();
        });
    });

    describe('createTask', () => {
        test('should create a task successfully', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const mockTask = createMockTask();
            const params = { title: 'Test Task', description: 'Test Description' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(mockTask);

            // Act
            const result = await createTask(params);

            // Assert
            expect(result.data).toEqual(mockTask);
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: {
                    title: params.title,
                    description: params.description,
                    completed: true, // default value
                    userId: mockAuthData.userID,
                },
            });
        });

        test('should throw error when user is not authenticated', async () => {
            // Arrange
            const params = { title: 'Test Task' };
            vi.mocked(auth.getAuthData).mockReturnValue(null);

            // Act & Assert
            await expect(createTask(params)).rejects.toThrow('Unauthenticated');
        });

        test('should handle missing optional parameters', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const mockTask = createMockTask({ title: 'Minimal Task' });
            const params = { title: 'Minimal Task' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.create.mockResolvedValue(mockTask);

            // Act
            const result = await createTask(params);

            // Assert
            expect(result.data).toEqual(mockTask);
            expect(mocks.mockPrisma.task.create).toHaveBeenCalledWith({
                data: {
                    title: params.title,
                    description: undefined,
                    completed: true,
                    userId: mockAuthData.userID,
                },
            });
        });
    });

    describe('getTasks', () => {
        test('should get tasks with default pagination', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const mockTasks = createMockTasks(5);
            const params = {};

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.count.mockResolvedValue(5);
            mocks.mockPrisma.task.findMany.mockResolvedValue(mockTasks);

            // Act
            const result = await getTasks(params);

            // Assert
            expect(result.data).toEqual(mockTasks);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 5,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
            });
        });

        test('should apply text search filter', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const mockTasks = createMockTasks(2);
            const params = { text: 'search term' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.count.mockResolvedValue(2);
            mocks.mockPrisma.task.findMany.mockResolvedValue(mockTasks);

            // Act
            await getTasks(params);

            // Assert
            expect(mocks.mockPrisma.task.findMany).toHaveBeenCalledWith({
                where: {
                    userId: mockAuthData.userID,
                    title: {
                        contains: 'search term',
                        mode: 'insensitive',
                    },
                },
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'asc' }
                ],
                skip: 0,
                take: 10,
            });
        });

        test('should apply completion status filter', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { filter: 'done' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.count.mockResolvedValue(0);
            mocks.mockPrisma.task.findMany.mockResolvedValue([]);

            // Act
            await getTasks(params);

            // Assert
            expect(mocks.mockPrisma.task.findMany).toHaveBeenCalledWith({
                where: {
                    userId: mockAuthData.userID,
                    completed: true,
                },
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'asc' }
                ],
                skip: 0,
                take: 10,
            });
        });

        test('should handle pagination correctly', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { page: 2, limit: 5 };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.count.mockResolvedValue(15);
            mocks.mockPrisma.task.findMany.mockResolvedValue([]);

            // Act
            const result = await getTasks(params);

            // Assert
            expect(result.pagination).toEqual({
                page: 2,
                limit: 5,
                total: 15,
                totalPages: 3,
                hasNext: true,
                hasPrev: true,
            });
            expect(mocks.mockPrisma.task.findMany).toHaveBeenCalledWith({
                where: { userId: mockAuthData.userID },
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'asc' }
                ],
                skip: 5,
                take: 5,
            });
        });
    });

    describe('getTask', () => {
        test('should get a single task successfully', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const mockTask = createMockTask({ id: 1 });
            const params = { id: '1' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(mockTask);

            // Act
            const result = await getTask(params);

            // Assert
            expect(result.data).toEqual(mockTask);
            expect(mocks.mockPrisma.task.findFirst).toHaveBeenCalledWith({
                where: { id: 1, userId: mockAuthData.userID },
            });
        });

        test('should return null when task not found', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { id: '999' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(null);

            // Act
            const result = await getTask(params);

            // Assert
            expect(result.data).toBeNull();
        });
    });

    describe('updateTask', () => {
        test('should update a task successfully', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const existingTask = createMockTask({ id: 1 });
            const updatedTask = createMockTask({ id: 1, title: 'Updated Task' });
            const params = { id: '1', title: 'Updated Task' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(existingTask);
            mocks.mockPrisma.task.update.mockResolvedValue(updatedTask);

            // Act
            const result = await updateTask(params);

            // Assert
            expect(result.data).toEqual(updatedTask);
            expect(mocks.mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { title: 'Updated Task' },
            });
        });

        test('should return null when task not found', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { id: '999', title: 'Updated Task' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(null);

            // Act
            const result = await updateTask(params);

            // Assert
            expect(result.data).toBeNull();
            expect(mocks.mockPrisma.task.update).not.toHaveBeenCalled();
        });
    });

    describe('toggleTask', () => {
        test('should toggle task completion from false to true', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const existingTask = createMockTask({ id: 1, completed: false });
            const updatedTask = createMockTask({ id: 1, completed: true });
            const params = { taskId: '1' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(existingTask);
            mocks.mockPrisma.task.update.mockResolvedValue(updatedTask);

            // Act
            const result = await toggleTask(params);

            // Assert
            expect(result.data).toEqual(updatedTask);
            expect(mocks.mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { completed: true },
            });
        });

        test('should toggle task completion from true to false', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const existingTask = createMockTask({ id: 1, completed: true });
            const updatedTask = createMockTask({ id: 1, completed: false });
            const params = { taskId: '1' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(existingTask);
            mocks.mockPrisma.task.update.mockResolvedValue(updatedTask);

            // Act
            const result = await toggleTask(params);

            // Assert
            expect(result.data).toEqual(updatedTask);
            expect(mocks.mockPrisma.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { completed: false },
            });
        });

        test('should return null when task not found', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { taskId: '999' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(null);

            // Act
            const result = await toggleTask(params);

            // Assert
            expect(result.data).toBeNull();
            expect(mocks.mockPrisma.task.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        test('should delete a task successfully', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const existingTask = createMockTask({ id: 1 });
            const deletedTask = createMockTask({ id: 1 });
            const params = { id: '1' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(existingTask);
            mocks.mockPrisma.task.delete.mockResolvedValue(deletedTask);

            // Act
            const result = await deleteTask(params);

            // Assert
            expect(result.data).toEqual(deletedTask);
            expect(mocks.mockPrisma.task.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        test('should return null when task not found', async () => {
            // Arrange
            const mockAuthData = createMockAuthData();
            const params = { id: '999' };

            vi.mocked(auth.getAuthData).mockReturnValue(mockAuthData);
            mocks.mockPrisma.task.findFirst.mockResolvedValue(null);

            // Act
            const result = await deleteTask(params);

            // Assert
            expect(result.data).toBeNull();
            expect(mocks.mockPrisma.task.delete).not.toHaveBeenCalled();
        });
    });
}); 