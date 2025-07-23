"use client";

import { useState, useTransition } from "react";
import { createTask } from "../actions/tasks";

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
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700"
				>
					Title
				</label>
				<input
					type="text"
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					disabled={isPending}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-700"
				>
					Description
				</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					disabled={isPending}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
			{error && <p className="text-red-500 text-sm">{error}</p>}
			<button
				type="submit"
				disabled={isPending}
				className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
			>
				{isPending ? "Creating..." : "Create Task"}
			</button>
		</form>
	);
}
