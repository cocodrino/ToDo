import "./globals.css";
import type { Metadata } from "next";
import { Inter, Montserrat, Ephesis } from "next/font/google";
import Link from "next/link";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["600"],
	style: ["normal", "italic"],
	variable: "--font-montserrat",
});
const ephesis = Ephesis({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-ephesis",
});

export const metadata: Metadata = {
	title: "MyTodo - The Only ToDo App that you need!!!",
};

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/tasks", label: "My Tasks" },
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
				<body
					className={`${inter.className} ${montserrat.variable} ${ephesis.variable} text-black bg-white`}
				>
					<Providers>
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
								{(userId && <UserButton />) || (
									<Link href="/auth/login">
										<Button>Sign In</Button>
									</Link>
								)}
							</nav>
						</header>

						<main className="flex w-full p-10">{children}</main>
						<Toaster position="top-right" />
					</Providers>
				</body>
			</html>
		</ClerkProvider>
	);
}
