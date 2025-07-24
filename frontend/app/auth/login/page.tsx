"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
	const { isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		// If user is already signed in, redirect to tasks
		if (isLoaded && isSignedIn) {
			redirect("/tasks");
		}
	}, [isLoaded, isSignedIn]);

	// Show loading while Clerk is loading
	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
					<p className="mt-2 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// If not signed in, Clerk will handle the sign-in UI automatically
	// This component will be replaced by Clerk's sign-in component
	return null;
}
