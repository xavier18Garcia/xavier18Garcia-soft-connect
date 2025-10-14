import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'

export const useUsers = () => {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [pagination, setPagination] = useState({})

	// Listar usuarios
	const listUsers = async (params = {}) => {
		setLoading(true)
		setError(null)

		try {
			const result = await userService.list(params)

			if (result.success) {
				setUsers(result.data.data || [])
				setPagination(result.data.pagination || {})
				return result
			} else {
				setError(result.error)
				return result
			}
		} catch (err) {
			const errorMsg = err.message || 'Error al cargar usuarios'
			setError(errorMsg)
			return { success: false, error: errorMsg }
		} finally {
			setLoading(false)
		}
	}

	return {
		users,
		loading,
		error,
		pagination,
		listUsers,
		setUsers,
		setError,
	}
}

export const useUser = userId => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	// Obtener usuario específico
	const getUser = async (id = userId) => {
		if (!id) return { success: false, error: 'ID de usuario requerido' }

		setLoading(true)
		setError(null)

		try {
			const result = await userService.getById(id)

			if (result.success) {
				setUser(result.data)
				return result
			} else {
				setError(result.error)
				return result
			}
		} catch (err) {
			const errorMsg = err.message || 'Error al cargar usuario'
			setError(errorMsg)
			return { success: false, error: errorMsg }
		} finally {
			setLoading(false)
		}
	}

	// Actualizar usuario
	const updateUser = async (userData, id = userId) => {
		if (!id) return { success: false, error: 'ID de usuario requerido' }

		setLoading(true)
		setError(null)

		try {
			const result = await userService.update(id, userData)

			if (result.success) {
				setUser(result.data)
				return result
			} else {
				setError(result.error)
				return result
			}
		} catch (err) {
			const errorMsg = err.message || 'Error al actualizar usuario'
			setError(errorMsg)
			return { success: false, error: errorMsg }
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (userId) {
			getUser()
		}
	}, [userId])

	return {
		user,
		loading,
		error,
		getUser,
		updateUser,
		setUser,
	}
}
