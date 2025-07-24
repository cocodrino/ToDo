"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Pencil } from "lucide-react";
import { useToggleTask, useDeleteTask } from "@/app/hooks/useTasks";
import type { types } from "@/app/lib/client";
import toast from "react-hot-toast";
import logger from "@/lib/logger";

interface TaskCardProps {
	task: types.Task;
	onEdit?: (task: types.Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
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
			logger.error("Failed to toggle task:", error);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteTaskMutation.mutateAsync(task.id.toString());
			toast.success("Task deleted successfully!");
		} catch (error) {
			toast.error("Failed to delete task");
			logger.error("Failed to delete task:", error);
		}
	};

	const handleEdit = () => {
		onEdit?.(task);
	};

	const isPending =
		toggleTaskMutation.isPending || deleteTaskMutation.isPending;

	return (
		<Card className="relative">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3 flex-1">
						<Checkbox
							checked={isCompleted}
							onCheckedChange={handleToggleComplete}
							disabled={isPending}
							className="mt-1"
						/>
						<h3
							className={`text-lg font-semibold ${
								isCompleted ? "line-through text-red-500" : "text-foreground"
							}`}
						>
							{task.title}
						</h3>
					</div>
					<div className="flex items-center space-x-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleEdit}
										disabled={isPending}
										className="h-8 w-8 p-0"
										aria-label="Edit task"
									>
										<Pencil size={14} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Edit</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleDelete}
										disabled={isPending}
										className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
										aria-label="Delete task"
									>
										<Trash2 size={14} />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Delete</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{task.description && (
					<p
						className={`text-sm text-muted-foreground mb-3 ${
							isCompleted ? "line-through" : ""
						}`}
					>
						{task.description}
					</p>
				)}
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>Status: {isCompleted ? "Completed" : "Pending"}</span>
				</div>
			</CardContent>
		</Card>
	);
}
