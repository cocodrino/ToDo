"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { debounce } from "lodash";

interface TaskFiltersProps {
	onFiltersChange: (filters: {
		text?: string;
		filter?: "all" | "done" | "pending";
	}) => void;
}

export default function TaskFilters({ onFiltersChange }: TaskFiltersProps) {
	const [searchText, setSearchText] = useState("");
	const [activeFilter, setActiveFilter] = useState<"all" | "done" | "pending">(
		"all",
	);

	// Debounced search function to avoid excessive API calls
	const debouncedSearch = useMemo(
		() =>
			debounce((text: string, filter: "all" | "done" | "pending") => {
				// When "all" is selected, don't pass the filter parameter (or pass undefined)
				const filterValue = filter === "all" ? undefined : filter;
				onFiltersChange({
					text: text.trim() || undefined,
					filter: filterValue,
				});
			}, 500),
		[onFiltersChange],
	);

	const handleSearchChange = (value: string) => {
		setSearchText(value);
		debouncedSearch(value, activeFilter);
	};

	const handleFilterChange = (value: "all" | "done" | "pending") => {
		if (value) {
			setActiveFilter(value);
			// When "all" is selected, don't pass the filter parameter (or pass undefined)
			const filterValue = value === "all" ? undefined : value;
			onFiltersChange({
				text: searchText.trim() || undefined,
				filter: filterValue,
			});
		}
	};

	const handleResetFilters = () => {
		setSearchText("");
		setActiveFilter("all");
		onFiltersChange({ text: undefined, filter: undefined });
	};

	return (
		<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search tasks..."
					value={searchText}
					onChange={(e) => handleSearchChange(e.target.value)}
					className="pl-10"
				/>
			</div>

			<ToggleGroup
				type="single"
				value={activeFilter}
				onValueChange={handleFilterChange}
				className="flex-shrink-0"
			>
				<ToggleGroupItem value="all" aria-label="Show all tasks">
					All
				</ToggleGroupItem>
				<ToggleGroupItem value="pending" aria-label="Show pending tasks">
					Pending
				</ToggleGroupItem>
				<ToggleGroupItem value="done" aria-label="Show completed tasks">
					Completed
				</ToggleGroupItem>
			</ToggleGroup>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleResetFilters}
				className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
			>
				<RotateCcw className="h-4 w-4" />
				Reset Filters
			</Button>
		</div>
	);
}
