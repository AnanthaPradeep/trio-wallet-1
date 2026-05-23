import { Outlet } from 'react-router-dom'

export function AppLayout() {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
			<div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
			<div className="pointer-events-none absolute -right-40 top-36 h-112 w-md rounded-full bg-amber-500/20 blur-3xl" />

			<main className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
				<Outlet />
			</main>
		</div>
	)
}
