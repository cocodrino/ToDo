import { api, APIError, ErrCode } from "encore.dev/api";
import log from "encore.dev/log";

import { PrismaClient } from "@prisma/client";
import { getAuthData } from "~encore/auth";
import type { Task, TaskResponse, TasksResponse } from "../types/tasks";
import { trace } from "../utils/trace";

const prisma = new PrismaClient();

// Create a task
export const createTask = api(
  {
    expose: true,
    method: "POST",
    path: "/api/tasks",
    auth: true,
  },
  async (params: { title: string; description?: string; completed?: boolean }): Promise<TaskResponse> => {
    const { title, description, completed = true } = params;
    const auth = getAuthData();

    log.info("Creating new task", {
      title,
      userId: auth?.userID,
      completed
    });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    const task = await trace("createTask", () =>
      prisma.task.create({
        data: {
          title,
          description,
          completed,
          userId: auth.userID,
        },
      })
    );

    log.info("Task created successfully", { taskId: task.id });

    return { data: task };
  },
);

// Get all tasks
export const getTasks = api(
  {
    expose: true,
    method: "GET",
    path: "/api/tasks",
    auth: true,
  },
  async (params: { text?: string; filter?: string; page?: number; limit?: number }): Promise<TasksResponse> => {
    const { text, filter, page = 1, limit = 10 } = params;
    const auth = getAuthData();
    log.info("Getting tasks for user", { userId: auth?.userID, text, filter });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // Build where clause
    const whereClause: { userId: string; title?: { contains: string; mode: 'insensitive' }; completed?: boolean } = { userId: auth.userID };

    // Add text search filter
    if (text?.trim()) {
      whereClause.title = {
        contains: text.trim(),
        mode: 'insensitive' as const, // Case insensitive search
      };
    }

    // Add completion status filter
    if (filter === 'done') {
      whereClause.completed = true;
    } else if (filter === 'pending') {
      whereClause.completed = false;
    }
    // If filter is 'all' or undefined, no additional filter is applied

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = limit;

    // Get total count for pagination
    const total = await trace("getTasksCount", () =>
      prisma.task.count({
        where: whereClause,
      })
    );

    // Get paginated tasks
    const tasks = await trace("getTasks", () =>
      prisma.task.findMany({
        where: whereClause,
        orderBy: [
          { createdAt: 'desc' }, // Most recent first
          { id: 'asc' } // Then by ID for consistency
        ],
        skip,
        take,
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    log.info("Tasks retrieved successfully", {
      count: tasks.length,
      total,
      page,
      limit,
      totalPages,
      text,
      filter
    });

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      }
    };
  },
);

// Get a single task
export const getTask = api(
  {
    expose: true,
    method: "GET",
    path: "/api/tasks/:id",
    auth: true,
  },
  async (params: { id: string }): Promise<TaskResponse> => {
    const { id } = params;
    const auth = getAuthData();

    log.info("Getting single task", { taskId: id, userId: auth?.userID });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    const task = await trace("getTask", () =>
      prisma.task.findFirst({
        where: { id: Number.parseInt(id, 10), userId: auth.userID },
      })
    );

    log.info("Single task query completed", {
      taskId: id,
      found: !!task
    });

    return { data: task };
  },
);

// Update a task
export const updateTask = api(
  {
    expose: true,
    method: "PUT",
    path: "/api/tasks/:id",
    auth: true,
  },
  async (params: {
    id: string;
    title?: string;
    description?: string;
    completed?: boolean;
  }): Promise<TaskResponse> => {
    const { id, ...data } = params;
    const auth = getAuthData();

    log.info("Updating task", { taskId: id, userId: auth?.userID, updates: data });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await trace("findTaskForUpdate", () =>
      prisma.task.findFirst({
        where: { id: Number.parseInt(id, 10), userId: auth.userID },
      })
    );
    if (!task) {
      log.warn("Task not found or not owned by user", { taskId: id, userId: auth.userID });
      return { data: null };
    }

    const updatedTask = await trace("updateTask", () =>
      prisma.task.update({
        where: { id: Number.parseInt(id, 10) },
        data,
      })
    );

    log.info("Task updated successfully", { taskId: id });

    return { data: updatedTask };
  },
);

// Toggle task completion status
export const toggleTask = api(
  {
    expose: true,
    method: "PATCH",
    path: "/api/tasks/:taskId/toggle",
    auth: true,
  },
  async (params: { taskId: string }): Promise<TaskResponse> => {
    const { taskId } = params;
    const auth = getAuthData();

    log.info("Toggling task completion", { taskId, userId: auth?.userID });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await trace("findTaskForToggle", () =>
      prisma.task.findFirst({
        where: { id: Number.parseInt(taskId, 10), userId: auth.userID },
      })
    );
    if (!task) {
      log.warn("Task not found or not owned by user", { taskId, userId: auth.userID });
      return { data: null };
    }

    // Toggle the completed status
    const updatedTask = await trace("toggleTask", () =>
      prisma.task.update({
        where: { id: Number.parseInt(taskId, 10) },
        data: { completed: !task.completed },
      })
    );

    log.info("Task completion toggled successfully", {
      taskId,
      newStatus: updatedTask.completed
    });

    return { data: updatedTask };
  },
);

// Delete a task
export const deleteTask = api(
  {
    expose: true,
    method: "DELETE",
    path: "/api/tasks/:id",
    auth: true,
  },
  async (params: { id: string }): Promise<TaskResponse> => {
    const { id } = params;
    const auth = getAuthData();

    log.info("Deleting task", { taskId: id, userId: auth?.userID });

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await trace("findTaskForDelete", () =>
      prisma.task.findFirst({
        where: { id: Number.parseInt(id, 10), userId: auth.userID },
      })
    );
    if (!task) {
      log.warn("Task not found or not owned by user", { taskId: id, userId: auth.userID });
      return { data: null };
    }

    const deletedTask = await trace("deleteTask", () =>
      prisma.task.delete({
        where: { id: Number.parseInt(id, 10) },
      })
    );

    log.info("Task deleted successfully", { taskId: id });

    return { data: deletedTask };
  },
);
