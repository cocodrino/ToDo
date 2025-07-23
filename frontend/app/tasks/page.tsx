import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import getRequestClient from "../lib/getRequestClient";
import type { types } from "../lib/client";
import CreateTaskForm from "./createTaskForm";
import TaskCard from "../../components/custom/molecules/TaskCard";

export default async function Tasks() {
	const { userId } = await auth();

	if (!userId) {
		redirect("/auth/unauthenticated?from=%2Ftasks");
	}

	let response: types.TasksResponse | undefined;
	let error: unknown;

	try {
		// Use the configured Encore RPC client
		const client = getRequestClient();
		response = await client.tasks.getTasks();
	} catch (err) {
		error = err;
	}

	if (error) {
		throw error;
	}

	return (
		<section className="max-w-4xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Your Tasks</h1>
			<CreateTaskForm />

			<div className="mt-8">
				{!response || response.data.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-muted-foreground">
							No tasks found. Create one above!
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{response.data.map((task: types.Task) => (
							<TaskCard key={task.id} task={task} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
