import { Suspense } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Routes, Route, Navigate } from 'react-router-dom'
import { routes_auth, routes_private, routes_public } from './routes.js'
import { SpinnerLoading } from '../components/SpinnerLoading.jsx'
import { PATH_ROUTES } from '../common/const/pauthRoute-const.js'
import { RedirectIfAuthenticated, ProtectedRoute } from './Protected.routes.jsx'

export function RoutesConfig() {
	return (
		<Suspense
			fallback={
				<div className='flex h-screen items-center justify-center'>
					<SpinnerLoading />
				</div>
			}>
			<Routes>
				<Route path={`/${PATH_ROUTES.HOME}`} element={<Layout />}>
					{routes_public.map(({ path, element: Element }) => (
						<Route key={path} path={path} element={<Element />} />
					))}

					{routes_auth.map(({ path, element: Element }) => (
						<Route
							key={path}
							path={path}
							element={
								<RedirectIfAuthenticated>
									<Element />
								</RedirectIfAuthenticated>
							}
						/>
					))}

					{routes_private.map(({ path, element: Element, requiredRoles }) => (
						<Route
							key={path}
							path={path}
							element={
								<ProtectedRoute requiredRoles={requiredRoles}>
									<Element />
								</ProtectedRoute>
							}
						/>
					))}

					<Route path='*' element={<Navigate to={`/${PATH_ROUTES.HOME}`} replace />} />
				</Route>
			</Routes>
		</Suspense>
	)
}
