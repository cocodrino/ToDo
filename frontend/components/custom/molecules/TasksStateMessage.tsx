import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TasksStateMessageProps {
	type: "loading" | "error";
	message?: string;
}

export default function TasksStateMessage({
	type,
	message,
}: TasksStateMessageProps) {
	return (
		<section className="max-w-4xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Your Tasks</h1>
			<div className="text-center py-8">
				{type === "loading" ? (
					<div className="flex flex-col items-center space-y-2">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						<p className="text-muted-foreground">Loading tasks...</p>
					</div>
				) : (
					<Alert variant="destructive" className="max-w-md mx-auto">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{message || "Error loading tasks"}
						</AlertDescription>
					</Alert>
				)}
			</div>
		</section>
	);
}
