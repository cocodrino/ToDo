import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Encore + Next.js",
};

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/tasks", label: "Your Tasks" },
];

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { userId } = await auth();

	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${inter.className} text-black bg-white`}>
					<header>
						<nav className="h-navBar bg-black text-white flex items-center justify-between p-5">
							<div className="flex items-center">
								{navLinks.map(({ href, label }) => (
									<Link
										className="mr-8 text-inherit hover:underline"
										key={href}
										href={href}
									>
										{label}
									</Link>
								))}
							</div>
							{(userId && <UserButton />) || <Button>Sign In</Button>}
						</nav>
					</header>

					<main className="flex w-full p-10">{children}</main>
					<Toaster position="top-right" />
				</body>
			</html>
		</ClerkProvider>
	);
}
