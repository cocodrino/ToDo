import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import getRequestClient from "../lib/getRequestClient";
import type { types } from "../lib/client";
import CreateTaskForm from "./createTaskForm";

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
		<section>
			<h1 className="text-3xl">Your Tasks</h1>
			<br />
			<CreateTaskForm />
			<br />
			{!response || response.data.length === 0 ? (
				<p>No tasks found. Create one above!</p>
			) : (
				<ul>
					{response.data.map((task: types.Task) => (
						<li key={task.id}>
							<h3>{task.title}</h3>
							<p>{task.description}</p>
							<p>Completed: {task.completed ? "Yes" : "No"}</p>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
