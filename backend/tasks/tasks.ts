import { api, APIError, ErrCode } from "encore.dev/api";

import { PrismaClient } from "@prisma/client";
import { getAuthData } from "~encore/auth";
import type { Task, TaskResponse, TasksResponse } from "../types/tasks";

const prisma = new PrismaClient();

// Create a task
export const createTask = api(
  {
    expose: true,
    method: "POST",
    path: "/api/tasks",
    auth: true,
  },
  async (params: { title: string; description?: string }): Promise<TaskResponse> => {
    const { title, description } = params;
    const auth = getAuthData();

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: auth.userID,
      },
    });

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
  async (): Promise<TasksResponse> => {
    const auth = getAuthData();
    console.log("auth", auth);

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    const tasks = await prisma.task.findMany({
      where: { userId: auth.userID },
    });

    return { data: tasks };
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

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    const task = await prisma.task.findFirst({
      where: { id: Number.parseInt(id, 10), userId: auth.userID },
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

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id: Number.parseInt(id, 10), userId: auth.userID },
    });
    if (!task) {
      return { data: null };
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number.parseInt(id, 10) },
      data,
    });

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

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id: Number.parseInt(taskId, 10), userId: auth.userID },
    });
    if (!task) {
      return { data: null };
    }

    // Toggle the completed status
    const updatedTask = await prisma.task.update({
      where: { id: Number.parseInt(taskId, 10) },
      data: { completed: !task.completed },
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

    if (!auth) {
      throw new APIError(ErrCode.Unauthenticated, "Unauthenticated");
    }

    // First, verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id: Number.parseInt(id, 10), userId: auth.userID },
    });
    if (!task) {
      return { data: null };
    }

    const deletedTask = await prisma.task.delete({
      where: { id: Number.parseInt(id, 10) },
    });

    return { data: deletedTask };
  },
);
