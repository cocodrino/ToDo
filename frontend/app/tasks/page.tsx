"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import TaskFormEditor from "./components/TaskFormEditor";
import TaskCard from "./components/TaskCard";
import TaskFilters from "./components/TaskFilters";
import TaskPagination from "./components/TaskPagination";
import TasksStateMessage from "./components/TasksStateMessage";
import { redirect } from "next/navigation";
import type { types } from "../lib/client";

export default function Tasks() {
	const { userId, isLoaded } = useAuth();
	const defaultLimit = Number.parseInt(
		process.env.NEXT_PUBLIC_PAGINATION_TASKS_LIMIT || "10",
		10,
	);
	const [filters, setFilters] = useState<{
		text?: string;
		filter?: "all" | "done" | "pending";
		page?: number;
		limit?: number;
	}>({ filter: undefined, page: 1, limit: defaultLimit }); // Start with no filter to show all tasks
	const { data, isLoading, error } = useTasks(filters);
	const tasks = data?.tasks || [];
	const pagination = data?.pagination;
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

	const handleFiltersChange = (newFilters: {
		text?: string;
		filter?: "all" | "done" | "pending";
	}) => {
		// Reset to page 1 when filters change
		setFilters({ ...newFilters, page: 1, limit: defaultLimit });
	};

	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	// Remove the early returns for loading and error states
	// We'll handle them inside the tasks section

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
				<div className="sm:min-w-[500px] ">
					{/* Filters bar */}
					<div className="mb-4">
						<TaskFilters onFiltersChange={handleFiltersChange} />
					</div>

					<div className="h-[calc(100vh-210px)] overflow-y-auto">
						{!isLoaded || isLoading ? (
							<TasksStateMessage type="loading" />
						) : error ? (
							<TasksStateMessage type="error" message={error.message} />
						) : !tasks || tasks.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									No tasks found. Create one above!
								</p>
							</div>
						) : (
							<>
								<div className="space-y-4 pr-2">
									{tasks.map((task) => (
										<TaskCard
											key={task.id}
											task={task}
											onEdit={handleEditTask}
										/>
									))}
								</div>

								{pagination && (
									<TaskPagination
										pagination={pagination}
										onPageChange={handlePageChange}
									/>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
