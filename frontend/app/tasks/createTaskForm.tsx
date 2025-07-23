"use client";

import { useState, useTransition } from "react";
import { createTask } from "../actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateTaskForm() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("title", title);
				formData.append("description", description);

				await createTask(formData);

				// Clear form on success
				setTitle("");
				setDescription("");
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to create task.");
				console.error(err);
			}
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New Task</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input
							type="text"
							id="title"
							value={title}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setTitle(e.target.value)
							}
							required
							disabled={isPending}
							placeholder="Enter task title..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setDescription(e.target.value)
							}
							disabled={isPending}
							placeholder="Enter task description (optional)..."
							rows={3}
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<Button
						type="submit"
						disabled={isPending || !title.trim()}
						className="w-full"
					>
						{isPending ? "Creating..." : "Create Task"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
