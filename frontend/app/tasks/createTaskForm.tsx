"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTask } from "../actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

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
	const [isPending, startTransition] = useTransition();
	const [formError, setFormError] = useState<string | null>(null);

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
		setFormError(null);

		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("title", data.title);
				formData.append("description", data.description);
				formData.append("completed", data.completed.toString());

				await createTask(formData);

				// Show success toast
				toast.success("Task created successfully!");

				// Reset form
				reset();
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to create task.";
				setFormError(errorMessage);
				toast.error("Failed to create task. Please try again.");
				console.error(err);
			}
		});
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

					{formError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{formError}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" disabled={isPending} className="w-full">
						{isPending ? "Creating..." : "Create Task"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
