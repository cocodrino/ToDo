"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { useToggleTask, useDeleteTask } from "@/app/hooks/useTasks";
import type { types } from "@/app/lib/client";
import toast from "react-hot-toast";

interface TaskCardProps {
	task: types.Task;
}

export default function TaskCard({ task }: TaskCardProps) {
	const [isCompleted, setIsCompleted] = useState(task.completed);

	const toggleTaskMutation = useToggleTask();
	const deleteTaskMutation = useDeleteTask();

	const handleToggleComplete = async (checked: boolean) => {
		setIsCompleted(checked);

		try {
			await toggleTaskMutation.mutateAsync(task.id.toString());
			toast.success(
				checked ? "Task marked as completed!" : "Task marked as pending!",
			);
		} catch (error) {
			// Revert the state if the update fails
			setIsCompleted(!checked);
			toast.error("Failed to update task status");
			console.error("Failed to toggle task:", error);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteTaskMutation.mutateAsync(task.id.toString());
			toast.success("Task deleted successfully!");
		} catch (error) {
			toast.error("Failed to delete task");
			console.error("Failed to delete task:", error);
		}
	};

	const isPending =
		toggleTaskMutation.isPending || deleteTaskMutation.isPending;

	return (
		<Card className="relative">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-3 flex-1">
						<Checkbox
							checked={isCompleted}
							onCheckedChange={handleToggleComplete}
							disabled={isPending}
							className="mt-1"
						/>
						<div className="flex-1">
							<h3
								className={`text-lg font-semibold ${
									isCompleted ? "line-through text-red-500" : "text-foreground"
								}`}
							>
								{task.title}
							</h3>
							{task.description && (
								<p
									className={`text-sm text-muted-foreground mt-1 ${
										isCompleted ? "line-through" : ""
									}`}
								>
									{task.description}
								</p>
							)}
						</div>
					</div>
					<button
						type="button"
						onClick={handleDelete}
						disabled={isPending}
						className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted"
						aria-label="Delete task"
					>
						<Trash2 size={16} />
					</button>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>Status: {isCompleted ? "Completed" : "Pending"}</span>
				</div>
			</CardContent>
		</Card>
	);
}
