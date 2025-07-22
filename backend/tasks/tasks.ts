
import { api } from "encore.dev/api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a task
export const createTask = api(
  {
    expose: true,
    method: "POST",
    path: "/api/tasks",
  },
  async (params: { title: string; description?: string; userId: number }) => {
    const { title, description, userId } = params;
    return await prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });
  }
);

// Get all tasks
export const getTasks = api(
  {
    expose: true,
    method: "GET",
    path: "/api/tasks",
  },
  async () => {
    return await prisma.task.findMany();
  }
);

// Get a single task
export const getTask = api(
  {
    expose: true,
    method: "GET",
    path: "/api/tasks/:id",
  },
  async (params: { id: string }) => {
    const { id } = params;
    return await prisma.task.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }
);

// Update a task
export const updateTask = api(
  {
    expose: true,
    method: "PUT",
    path: "/api/tasks/:id",
  },
  async (params: { id: string; title?: string; description?: string; completed?: boolean }) => {
    const { id, ...data } = params;
    return await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data,
    });
  }
);

// Delete a task
export const deleteTask = api(
  {
    expose: true,
    method: "DELETE",
    path: "/api/tasks/:id",
  },
  async (params: { id: string }) => {
    const { id } = params;
    return await prisma.task.delete({
      where: { id: parseInt(id, 10) },
    });
  }
);


