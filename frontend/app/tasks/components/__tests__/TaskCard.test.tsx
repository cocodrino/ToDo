import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TaskCard from "../TaskCard";

// Mock the hooks
vi.mock("@/app/hooks/useTasks", () => ({
	useToggleTask: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
		isPending: false,
	}),
	useDeleteTask: () => ({
		mutateAsync: vi.fn().mockResolvedValue({}),
		isPending: false,
	}),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
	default: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Create a wrapper for React Query
const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("TaskCard", () => {
	const mockTask = {
		id: 1,
		userId: "test-user-id",
		title: "Test Task",
		description: "Test Description",
		completed: false,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const mockOnEdit = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render task information correctly", () => {
		// Arrange & Act
		render(<TaskCard task={mockTask} onEdit={mockOnEdit} />, {
			wrapper: createWrapper(),
		});

		// Assert
		expect(screen.getByText("Test Task")).toBeInTheDocument();
		expect(screen.getByText("Test Description")).toBeInTheDocument();
	});

	test("should render completed task with correct styling", () => {
		// Arrange
		const completedTask = { ...mockTask, completed: true };

		// Act
		render(<TaskCard task={completedTask} onEdit={mockOnEdit} />, {
			wrapper: createWrapper(),
		});

		// Assert
		expect(screen.getByText("Test Task")).toBeInTheDocument();
	});

	test("should call onEdit when edit button is clicked", () => {
		// Arrange & Act
		render(<TaskCard task={mockTask} onEdit={mockOnEdit} />, {
			wrapper: createWrapper(),
		});

		const editButton = screen.getByLabelText("Edit task");
		fireEvent.click(editButton);

		// Assert
		expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
	});

	test("should render delete button with correct aria-label", () => {
		// Arrange & Act
		render(<TaskCard task={mockTask} onEdit={mockOnEdit} />, {
			wrapper: createWrapper(),
		});

		// Assert
		expect(screen.getByLabelText("Delete task")).toBeInTheDocument();
	});
});
