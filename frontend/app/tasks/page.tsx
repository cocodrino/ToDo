"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import TaskFormEditor from "./TaskFormEditor";
import TaskCard from "../../components/custom/molecules/TaskCard";
import TasksStateMessage from "../../components/custom/molecules/TasksStateMessage";
import { redirect } from "next/navigation";
import type { types } from "../lib/client";

export default function Tasks() {
	const { userId, isLoaded } = useAuth();
	const { data: tasks, isLoading, error } = useTasks();
	const [editingTask, setEditingTask] = useState<types.Task | null>(null);

	// Handle authentication
	if (isLoaded && !userId) {
		redirect("/auth/unauthenticated?from=%2Ftasks");
	}

	const handleEditTask = (task: types.Task) => {
		setEditingTask(task);
	};

	const handleCancelEdit = () => {
		setEditingTask(null);
	};

	if (!isLoaded || isLoading) {
		return <TasksStateMessage type="loading" />;
	}

	if (error) {
		return <TasksStateMessage type="error" message={error.message} />;
	}

	return (
		<section className="max-w-4xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Your Tasks</h1>

			{editingTask ? (
				<div className="mb-8">
					<TaskFormEditor
						formType="editForm"
						task={editingTask}
						onCancel={handleCancelEdit}
					/>
				</div>
			) : (
				<div className="mb-8">
					<TaskFormEditor formType="newForm" />
				</div>
			)}

			<div className="mt-8">
				{!tasks || tasks.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-muted-foreground">
							No tasks found. Create one above!
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{tasks.map((task) => (
							<TaskCard key={task.id} task={task} onEdit={handleEditTask} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
