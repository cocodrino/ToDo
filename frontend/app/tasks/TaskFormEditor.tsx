"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import type { types } from "../lib/client";
import { useEffect } from "react";

// Validation schema
const taskSchema = z.object({
	title: z
		.string()
		.min(3, "Title is required and must be at least 3 characters"),
	description: z
		.string()
		.min(1, "Description is required and must be at least 1 character"),
	completed: z.boolean(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormEditorProps {
	formType: "newForm" | "editForm";
	task?: types.Task;
	onCancel?: () => void;
}

export default function TaskFormEditor({
	formType,
	task,
	onCancel,
}: TaskFormEditorProps) {
	const createTaskMutation = useCreateTask();
	const updateTaskMutation = useUpdateTask();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
			completed: false,
		},
	});

	const completed = watch("completed");
	const isPending =
		createTaskMutation.isPending || updateTaskMutation.isPending;

	// Populate form with task data when editing
	useEffect(() => {
		if (formType === "editForm" && task) {
			reset({
				title: task.title,
				description: task.description || "",
				completed: task.completed,
			});
		}
	}, [formType, task, reset]);

	const onSubmit = async (data: TaskFormData) => {
		try {
			if (formType === "newForm") {
				await createTaskMutation.mutateAsync(data);
				toast.success("Task created successfully!");
				reset();
			} else if (formType === "editForm" && task) {
				await updateTaskMutation.mutateAsync({
					taskId: task.id.toString(),
					data: {
						title: data.title,
						description: data.description,
						completed: data.completed,
					},
				});
				toast.success("Task updated successfully!");
				onCancel?.();
			}
		} catch (error) {
			const action = formType === "newForm" ? "create" : "update";
			toast.error(`Failed to ${action} task. Please try again.`);
			console.error(error);
		}
	};

	const handleCancel = () => {
		if (formType === "newForm") {
			reset();
		} else {
			onCancel?.();
		}
	};

	return (
		<Card className="min-w-[300px] md:min-w-[600px]">
			<CardHeader>
				<CardTitle>
					{formType === "newForm" ? "Create New Task" : "Edit Task"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							type="text"
							id="title"
							{...register("title")}
							disabled={isPending}
							placeholder="Enter task title..."
							className={errors.title ? "border-destructive" : ""}
						/>
						{errors.title && (
							<p className="text-sm text-destructive">{errors.title.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							{...register("description")}
							disabled={isPending}
							placeholder="Enter task description..."
							rows={3}
							className={errors.description ? "border-destructive" : ""}
						/>
						{errors.description && (
							<p className="text-sm text-destructive">
								{errors.description.message}
							</p>
						)}
					</div>

					<div className="flex items-center space-x-3">
						<Label htmlFor="completed">Is completed?</Label>
						<Switch
							id="completed"
							checked={completed}
							onCheckedChange={(checked: boolean) =>
								setValue("completed", checked)
							}
							disabled={isPending}
						/>
					</div>

					{(createTaskMutation.isError || updateTaskMutation.isError) && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{createTaskMutation.error?.message ||
									updateTaskMutation.error?.message ||
									"Failed to save task"}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex space-x-2">
						<Button type="submit" disabled={isPending} className="flex-1">
							{isPending
								? formType === "newForm"
									? "Creating..."
									: "Saving..."
								: formType === "newForm"
									? "Create Task"
									: "Save Changes"}
						</Button>
						{formType === "editForm" && (
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isPending}
							>
								Cancel
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
