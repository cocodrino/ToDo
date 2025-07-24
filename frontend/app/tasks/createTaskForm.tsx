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
import { useCreateTask } from "../hooks/useTasks";

// Validation schema
const createTaskSchema = z.object({
	title: z
		.string()
		.min(3, "Title is required and must be at least 3 characters"),
	description: z
		.string()
		.min(1, "Description is required and must be at least 1 character"),
	completed: z.boolean(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export default function CreateTaskForm() {
	const createTaskMutation = useCreateTask();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<CreateTaskFormData>({
		resolver: zodResolver(createTaskSchema),
		defaultValues: {
			title: "",
			description: "",
			completed: false,
		},
	});

	const completed = watch("completed");

	const onSubmit = async (data: CreateTaskFormData) => {
		try {
			await createTaskMutation.mutateAsync(data);

			// Show success toast
			toast.success("Task created successfully!");

			// Reset form
			reset();
		} catch (error) {
			toast.error("Failed to create task. Please try again.");
			console.error(error);
		}
	};

	return (
		<Card className="min-w-[300px] md:min-w-[600px]">
			<CardHeader>
				<CardTitle>Create New Task</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							type="text"
							id="title"
							{...register("title")}
							disabled={createTaskMutation.isPending}
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
							disabled={createTaskMutation.isPending}
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
							disabled={createTaskMutation.isPending}
						/>
					</div>

					{createTaskMutation.isError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{createTaskMutation.error?.message || "Failed to create task"}
							</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						disabled={createTaskMutation.isPending}
						className="w-full"
					>
						{createTaskMutation.isPending ? "Creating..." : "Create Task"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
