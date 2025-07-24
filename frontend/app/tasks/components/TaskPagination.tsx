"use client";

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

interface TaskPaginationProps {
	pagination: PaginationInfo;
	onPageChange: (page: number) => void;
}

export default function TaskPagination({
	pagination,
	onPageChange,
}: TaskPaginationProps) {
	const { page, total, totalPages, hasNext, hasPrev } = pagination;

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			onPageChange(newPage);
		}
	};

	// Generate page numbers to show
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show smart pagination with ellipsis
			if (page <= 3) {
				// Near the beginning
				for (let i = 1; i <= 4; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			} else if (page >= totalPages - 2) {
				// Near the end
				pages.push(1);
				pages.push("ellipsis");
				for (let i = totalPages - 3; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// In the middle
				pages.push(1);
				pages.push("ellipsis");
				for (let i = page - 1; i <= page + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return (
		<div className="flex flex-col items-center gap-4 py-4">
			<div className="text-sm text-muted-foreground">
				Showing page {page} of {totalPages} ({total} total tasks)
			</div>

			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (hasPrev) handlePageChange(page - 1);
							}}
							className={!hasPrev ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>

					{getPageNumbers().map((pageNum) => (
						<PaginationItem key={`page-${pageNum}`}>
							{pageNum === "ellipsis" ? (
								<span className="flex h-9 w-9 items-center justify-center text-sm">
									...
								</span>
							) : (
								<PaginationLink
									href="#"
									isActive={pageNum === page}
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(pageNum as number);
									}}
								>
									{pageNum}
								</PaginationLink>
							)}
						</PaginationItem>
					))}

					<PaginationItem>
						<PaginationNext
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (hasNext) handlePageChange(page + 1);
							}}
							className={!hasNext ? "pointer-events-none opacity-50" : ""}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
