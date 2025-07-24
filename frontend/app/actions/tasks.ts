"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import getRequestClient from "../lib/getRequestClient";

export async function createTask(formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const completed = formData.get("completed") === "true";

    if (!title.trim()) {
        throw new Error("Title is required");
    }

    if (!description.trim()) {
        throw new Error("Description is required");
    }

    try {
        // Use the configured Encore RPC client
        const client = getRequestClient();
        await client.tasks.createTask({
            title: title.trim(),
            description: description.trim(),
            completed
        });

        revalidatePath("/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error creating task:", error);
        throw new Error("Failed to create task");
    }
}

export async function updateTask(taskId: string, formData: FormData) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const completed = formData.get("completed") === "true";

    try {
        // Use the configured Encore RPC client
        const client = getRequestClient();
        await client.tasks.updateTask(taskId, { title, description, completed });

        revalidatePath("/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        throw new Error("Failed to update task");
    }
}

export async function toggleTask(taskId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    try {
        // Use the configured Encore RPC client
        const client = getRequestClient();
        await client.tasks.toggleTask(taskId);

        revalidatePath("/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error toggling task:", error);
        throw new Error("Failed to toggle task");
    }
}

export async function deleteTask(taskId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthenticated");
    }

    try {
        // Use the configured Encore RPC client
        const client = getRequestClient();
        await client.tasks.deleteTask(taskId);

        revalidatePath("/tasks");
        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        throw new Error("Failed to delete task");
    }
} 