import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'

export const useUsers = () => {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	})

	// Listar usuarios con filtros
	const listUsers = async (params = {}) => {
		setLoading(true)
		setError(null)

		try {
			// Si hay búsqueda, usar endpoint de búsqueda
			let result
			if (params.search) {
				result = await userService.search(params.search, params)
			} else {
				result = await userService.list(params)
			}

			if (result.success) {
				// Ajustar para diferentes formatos de respuesta
				let usersData = []
				let paginationData = {}

				if (result.data && result.data.content) {
					// Formato Spring Page
					usersData = result.data.content || []
					paginationData = {
						currentPage: (result.data.number || 0) + 1, // Convertir de 0-based a 1-based
						totalPages: result.data.totalPages || 1,
						totalItems: result.data.totalElements || 0,
						itemsPerPage: result.data.size || 10,
					}
				} else if (result.data && result.data.data) {
					// Formato personalizado
					usersData = result.data.data || []
					paginationData = result.data.pagination || {
						currentPage: 1,
						totalPages: 1,
						totalItems: 0,
						itemsPerPage: 10,
					}
				} else if (Array.isArray(result.data)) {
					// Si es un array directo
					usersData = result.data
					paginationData = {
						currentPage: 1,
						totalPages: 1,
						totalItems: usersData.length,
						itemsPerPage: usersData.length,
					}
				}

				setUsers(usersData)
				setPagination(paginationData)
				return { success: true, data: usersData, pagination: paginationData }
			} else {
				setError(result.error || 'Error al cargar usuarios')
				setUsers([])
				return result
			}
		} catch (err) {
			const errorMsg = err.message || 'Error al cargar usuarios'
			setError(errorMsg)
			setUsers([])
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
				// Extraer datos del usuario
				const userData = result.data?.data || result.data
				setUser(userData)
				return { success: true, data: userData }
			} else {
				setError(result.error || 'Error al cargar usuario')
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
		setUser,
	}
}
