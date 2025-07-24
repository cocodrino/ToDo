export interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export interface TaskResponse {
    data: Task | null;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface TasksResponse {
    data: Task[];
    pagination: PaginationInfo;
}