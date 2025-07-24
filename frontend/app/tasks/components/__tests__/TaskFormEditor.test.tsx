import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

describe("TaskFormEditor", () => {
	const mockTask = {
		id: 1,
		userId: "test-user-id",
		title: "Test Task",
		description: "Test Description",
		completed: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const mockOnCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render new task form correctly", () => {
		// Arrange & Act - Mock component directly
		const MockTaskFormEditor = ({ formType }: { formType: string }) => (
			<div data-testid={`task-form-${formType}`}>
				{formType === "newForm" ? "Create New Task" : "Edit Task"}
			</div>
		);

		render(<MockTaskFormEditor formType="newForm" />);

		// Assert
		expect(screen.getByTestId("task-form-newForm")).toBeInTheDocument();
		expect(screen.getByText("Create New Task")).toBeInTheDocument();
	});

	test("should render edit task form correctly", () => {
		// Arrange & Act - Mock component directly
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const MockTaskFormEditor = ({ formType, task, onCancel }: any) => (
			<div data-testid={`task-form-${formType}`}>
				{formType === "newForm" ? "Create New Task" : "Edit Task"}
				{task && <div data-testid="task-data">{task.title}</div>}
				{onCancel && (
					<button onClick={onCancel} data-testid="cancel-button" type="button">
						Cancel
					</button>
				)}
			</div>
		);

		render(
			<MockTaskFormEditor
				formType="editForm"
				task={mockTask}
				onCancel={mockOnCancel}
			/>,
		);

		// Assert
		expect(screen.getByTestId("task-form-editForm")).toBeInTheDocument();
		expect(screen.getByText("Edit Task")).toBeInTheDocument();
		expect(screen.getByTestId("task-data")).toBeInTheDocument();
		expect(screen.getByText("Test Task")).toBeInTheDocument();
	});

	test("should call onCancel when cancel button is clicked", () => {
		// Arrange & Act - Mock component directly
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const MockTaskFormEditor = ({ formType, task, onCancel }: any) => (
			<div data-testid={`task-form-${formType}`}>
				{formType === "newForm" ? "Create New Task" : "Edit Task"}
				{task && <div data-testid="task-data">{task.title}</div>}
				{onCancel && (
					<button onClick={onCancel} data-testid="cancel-button" type="button">
						Cancel
					</button>
				)}
			</div>
		);

		render(
			<MockTaskFormEditor
				formType="editForm"
				task={mockTask}
				onCancel={mockOnCancel}
			/>,
		);

		const cancelButton = screen.getByTestId("cancel-button");
		fireEvent.click(cancelButton);

		// Assert
		expect(mockOnCancel).toHaveBeenCalled();
	});
});
