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
		// Scroll to top when editing a task
		window.scrollTo({ top: 0, behavior: "smooth" });
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
		<section className="mx-auto p-6">
			<div className="flex flex-col xl:flex-row gap-4">
				<div>
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
				</div>
				<div className="sm:min-w-[500px] h-[calc(100vh-145px)] overflow-y-auto">
					{!tasks || tasks.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">
								No tasks found. Create one above!
							</p>
						</div>
					) : (
						<div className="space-y-4 pr-2">
							{tasks.map((task) => (
								<TaskCard key={task.id} task={task} onEdit={handleEditTask} />
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
