import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getClientRequestClient from "../lib/getClientRequestClient";
import type { types } from "../lib/client";
import { useAuth } from "@clerk/nextjs";

/**
 * Query keys for React Query cache management.
 * These keys allow for granular cache invalidation and data sharing between components.
 *
 * Structure:
 * - all: Base key for all task-related queries
 * - lists: For task list queries (without specific filters)
 * - list: For filtered task list queries
 * - details: For individual task detail queries
 * - detail: For a specific task by ID
 */
export const taskKeys = {
    all: ["tasks"] as const,
    lists: () => [...taskKeys.all, "list"] as const,
    list: (filters: {
        text?: string;
        filter?: string;
        page?: number;
        limit?: number;
    }) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, "detail"] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

interface UseTasksOptions {
    text?: string;
    filter?: "all" | "done" | "pending";
    page?: number;
    limit?: number;
}

// Get all tasks with pagination
export function useTasks(options: UseTasksOptions = {}) {
    const defaultLimit = Number.parseInt(
        process.env.NEXT_PUBLIC_PAGINATION_TASKS_LIMIT || "10",
        10,
    );
    const { text, filter, page = 1, limit = defaultLimit } = options;
    const { userId, isLoaded } = useAuth();

    return useQuery({
        queryKey: taskKeys.list({ text, filter, page, limit }),
        queryFn: async () => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.getTasks({
                text,
                filter,
                page,
                limit,
            });
            // Ensure we return a plain object that can be serialized
            return {
                tasks: response.data || [],
                pagination: response.pagination,
            };
        },
        enabled: isLoaded && !!userId,
    });
}

// Get single task
export function useTask(taskId: string) {
    const { userId, isLoaded } = useAuth();

    return useQuery({
        queryKey: taskKeys.detail(taskId),
        queryFn: async () => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.getTask(taskId);
            // Ensure we return a plain object that can be serialized
            return response.data;
        },
        enabled: isLoaded && !!userId && !!taskId,
    });
}

// Create task mutation
export function useCreateTask() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            description: string;
            completed: boolean;
        }) => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.createTask(data);
            if (!response.data) {
                throw new Error("Failed to create task");
            }
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch all tasks lists (with any filters)
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

// Update task mutation
export function useUpdateTask() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: async ({
            taskId,
            data,
        }: {
            taskId: string;
            data: { title?: string; description?: string; completed?: boolean };
        }) => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.updateTask(taskId, data);
            if (!response.data) {
                throw new Error("Failed to update task");
            }
            return response.data;
        },
        onSuccess: (
            _data: types.Task,
            variables: {
                taskId: string;
                data: { title?: string; description?: string; completed?: boolean };
            },
        ) => {
            // Invalidate specific task and all tasks lists (with any filters)
            queryClient.invalidateQueries({
                queryKey: taskKeys.detail(variables.taskId),
            });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

// Toggle task mutation
export function useToggleTask() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: async (taskId: string) => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.toggleTask(taskId);
            if (!response.data) {
                throw new Error("Failed to toggle task");
            }
            return response.data;
        },
        onSuccess: (_data: types.Task, taskId: string) => {
            // Invalidate specific task and all tasks lists (with any filters)
            queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}

// Delete task mutation
export function useDeleteTask() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: async (taskId: string) => {
            if (!userId) {
                throw new Error("Unauthenticated");
            }
            const client = getClientRequestClient();
            const response = await client.tasks.deleteTask(taskId);
            if (!response.data) {
                throw new Error("Failed to delete task");
            }
            return response.data;
        },
        onSuccess: (_data: types.Task, taskId: string) => {
            // Remove task from cache and invalidate list
            queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        },
    });
}
