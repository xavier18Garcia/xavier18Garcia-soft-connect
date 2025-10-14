import { Navigate } from 'react-router-dom'
import { useAuth } from '../stores/authStore.js'
import { SpinnerLoading } from '../components/SpinnerLoading.jsx'
import { PATH_ROUTES } from '../common/const/pauthRoute-const.js'

// Redirige al home si el usuario ya está autenticado
export function RedirectIfAuthenticated({ children }) {
	const { isAuthenticated, loading, isInitialized } = useAuth()

	if (loading || !isInitialized) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoading />
			</div>
		)
	}

	if (isAuthenticated) return <Navigate to={`/${PATH_ROUTES.HOME}`} replace />

	return children
}

// Redirige al login si el usuario no está autenticado
export function RedirectIfNotAuthenticated({ children }) {
	const { isAuthenticated, loading, isInitialized } = useAuth()

	if (loading || !isInitialized) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoading />
			</div>
		)
	}

	if (!isAuthenticated) return <Navigate to={`/${PATH_ROUTES.AUTH.SIGNIN}`} replace />

	return children
}

// Redirige si el usuario no tiene el rol requerido
export function RedirectIfNotAuthorized({ children, requiredRoles = [] }) {
	const { isAuthenticated, loading, isInitialized, getUserRole } = useAuth()

	if (loading || !isInitialized) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoading />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to={`/${PATH_ROUTES.AUTH.SIGNIN}`} replace />
	}

	if (requiredRoles.length > 0) {
		const userRole = getUserRole()
		const hasRequiredRole = userRole && requiredRoles.includes(userRole)

		if (!hasRequiredRole) {
			return <Navigate to={`/${PATH_ROUTES.HOME}`} replace />
		}
	}

	return children
}

// Combinación: Verifica autenticación Y roles
export function ProtectedRoute({ children, requiredRoles = [] }) {
	const { isAuthenticated, loading, isInitialized, getUserRole } = useAuth()

	if (loading || !isInitialized) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoading />
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to={`/${PATH_ROUTES.AUTH.SIGNIN}`} replace />
	}

	if (requiredRoles.length > 0) {
		const userRole = getUserRole()
		const hasRequiredRole = userRole && requiredRoles.includes(userRole)

		if (!hasRequiredRole) {
			return <Navigate to={`/${PATH_ROUTES.HOME}`} replace />
		}
	}

	return children
}

// Componentes específicos para roles comunes
export function AdminOnly({ children }) {
	return <ProtectedRoute requiredRoles={['admin']}>{children}</ProtectedRoute>
}

export function UserOnly({ children }) {
	return <ProtectedRoute requiredRoles={['user', 'student']}>{children}</ProtectedRoute>
}
