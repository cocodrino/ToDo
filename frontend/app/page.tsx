import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
	const { userId } = await auth();

	return (
		<section className="flex w-full flex-col justify-center items-center min-h-[calc(100vh-165px)]">
			<div className="text-center space-y-6">
				<h1 className="text-7xl font-montserrat font-bold italic text-black">
					MyTodoTasks
				</h1>

				<h2 className="text-5xl font-ephesis text-muted-foreground">
					The Only ToDo App that you need!!!
				</h2>

				<div className="pt-10">
					{userId ? (
						<Link href="/tasks">
							<Button size="lg" className="text-lg px-8 py-3">
								Check my Tasks
							</Button>
						</Link>
					) : (
						<Link href="/auth/login">
							<Button size="lg" className="text-lg px-8 py-3">
								Sign in Now
							</Button>
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}
