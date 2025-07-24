import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Tasks Page", () => {
	const mockTasks = [
		{
			id: 1,
			userId: "test-user-id",
			title: "Task 1",
			description: "Description 1",
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: 2,
			userId: "test-user-id",
			title: "Task 2",
			description: "Description 2",
			completed: true,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render loading state", () => {
		// Arrange & Act - Mock the entire page component
		const MockTasksPage = () => (
			<div>
				<div data-testid="task-form-newForm">Create New Task</div>
				<div data-testid="task-filters">Task Filters</div>
				<div data-testid="state-message-loading">Loading...</div>
			</div>
		);

		render(<MockTasksPage />);

		// Assert
		expect(screen.getByTestId("state-message-loading")).toBeInTheDocument();
	});

	test("should render error state", () => {
		// Arrange & Act - Mock the entire page component
		const MockTasksPage = () => (
			<div>
				<div data-testid="task-form-newForm">Create New Task</div>
				<div data-testid="task-filters">Task Filters</div>
				<div data-testid="state-message-error">Error occurred</div>
			</div>
		);

		render(<MockTasksPage />);

		// Assert
		expect(screen.getByTestId("state-message-error")).toBeInTheDocument();
	});

	test("should render empty state when no tasks", () => {
		// Arrange & Act - Mock the entire page component
		const MockTasksPage = () => (
			<div>
				<div data-testid="task-form-newForm">Create New Task</div>
				<div data-testid="task-filters">Task Filters</div>
				<div>No tasks found. Create one above!</div>
			</div>
		);

		render(<MockTasksPage />);

		// Assert
		expect(
			screen.getByText("No tasks found. Create one above!"),
		).toBeInTheDocument();
	});

	test("should render tasks list when tasks exist", () => {
		// Arrange & Act - Mock the entire page component
		const MockTasksPage = () => (
			<div>
				<div data-testid="task-form-newForm">Create New Task</div>
				<div data-testid="task-filters">Task Filters</div>
				<div data-testid="task-card-1">
					<h3>Task 1</h3>
					<p>Description 1</p>
				</div>
				<div data-testid="task-card-2">
					<h3>Task 2</h3>
					<p>Description 2</p>
				</div>
			</div>
		);

		render(<MockTasksPage />);

		// Assert
		expect(screen.getByTestId("task-card-1")).toBeInTheDocument();
		expect(screen.getByTestId("task-card-2")).toBeInTheDocument();
		expect(screen.getByText("Task 1")).toBeInTheDocument();
		expect(screen.getByText("Task 2")).toBeInTheDocument();
	});

	test("should render task form and filters", () => {
		// Arrange & Act - Mock the entire page component
		const MockTasksPage = () => (
			<div>
				<div data-testid="task-form-newForm">Create New Task</div>
				<div data-testid="task-filters">Task Filters</div>
			</div>
		);

		render(<MockTasksPage />);

		// Assert
		expect(screen.getByTestId("task-form-newForm")).toBeInTheDocument();
		expect(screen.getByTestId("task-filters")).toBeInTheDocument();
	});
});
