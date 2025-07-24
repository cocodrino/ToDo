import { describe, expect, test, vi, beforeEach } from 'vitest';
import { taskKeys } from '../useTasks';

describe('useTasks Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('taskKeys', () => {
        test('should generate correct query keys', () => {
            // Arrange & Act
            const baseKeys = taskKeys.all;
            const listKeys = taskKeys.lists();
            const filteredKeys = taskKeys.list({ text: 'test', filter: 'pending', page: 1, limit: 10 });
            const detailKeys = taskKeys.detail('task-123');

            // Assert
            expect(baseKeys).toEqual(['tasks']);
            expect(listKeys).toEqual(['tasks', 'list']);
            expect(filteredKeys).toEqual(['tasks', 'list', { text: 'test', filter: 'pending', page: 1, limit: 10 }]);
            expect(detailKeys).toEqual(['tasks', 'detail', 'task-123']);
        });

        test('should handle different filter combinations', () => {
            // Arrange & Act
            const allTasksKey = taskKeys.list({});
            const pendingTasksKey = taskKeys.list({ filter: 'pending' });
            const searchKey = taskKeys.list({ text: 'search term' });
            const paginatedKey = taskKeys.list({ page: 2, limit: 5 });

            // Assert
            expect(allTasksKey).toEqual(['tasks', 'list', {}]);
            expect(pendingTasksKey).toEqual(['tasks', 'list', { filter: 'pending' }]);
            expect(searchKey).toEqual(['tasks', 'list', { text: 'search term' }]);
            expect(paginatedKey).toEqual(['tasks', 'list', { page: 2, limit: 5 }]);
        });
    });
});
