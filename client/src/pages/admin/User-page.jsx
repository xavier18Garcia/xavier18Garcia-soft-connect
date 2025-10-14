import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../stores/authStore'
import { useUsers, useUser } from '../../common/hooks/useUsers'
import { Plus, Search, Edit, Trash2, X, User, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { userService } from '../../services/userService'
import { toast } from 'sonner'

const UserPage = () => {
	const { isAuthenticated, isAdmin } = useAuth()
	const navigate = useNavigate()

	// Usar el hook de usuarios para listar
	const { users, loading, error, pagination, listUsers } = useUsers()
	const [selectedUserId, setSelectedUserId] = useState(null)
	const [showUserForm, setShowUserForm] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [userToDelete, setUserToDelete] = useState(null)
	const [actionLoading, setActionLoading] = useState(false)
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		role: 'student',
		status: 'active',
	})
	const [formErrors, setFormErrors] = useState({})

	const filters = useState({
		page: 1,
		limit: 10,
		search: '',
		role: '',
		status: '',
	})[0]
	const setFilters = filtersState => filtersState[1]

	// Hook para usuario individual (si hay uno seleccionado)
	const { user: selectedUser, getUser, updateUser } = useUser(selectedUserId)

	useEffect(() => {
		listUsers(filters)
	}, [filters, isAuthenticated, navigate, isAdmin])

	// Cargar datos del usuario cuando se selecciona para editar
	useEffect(() => {
		if (selectedUserId && showUserForm) getUser(selectedUserId)
	}, [selectedUserId, showUserForm, getUser])

	// Actualizar formData cuando selectedUser cambia
	useEffect(() => {
		if (selectedUser && showUserForm) {
			setFormData({
				first_name: selectedUser.first_name || '',
				last_name: selectedUser.last_name || '',
				email: selectedUser.email || '',
				password: '',
				role: selectedUser.role || 'student',
				status: selectedUser.status || 'active',
			})
		}
	}, [selectedUser, showUserForm])

	const handleSearch = newFilters => setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))

	const handlePageChange = newPage => setFilters(prev => ({ ...prev, page: newPage }))

	const handleCreateUser = () => {
		setSelectedUserId(null)
		setFormData({
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			role: 'student',
			status: 'active',
		})
		setFormErrors({})
		setShowUserForm(true)
	}

	const handleEditUser = userId => {
		setSelectedUserId(userId)
		setFormErrors({})
		setShowUserForm(true)
	}

	const handleDeleteClick = user => {
		setUserToDelete(user)
		setShowDeleteDialog(true)
	}

	const handleDeleteUser = async () => {
		if (!userToDelete) return

		setActionLoading(true)
		try {
			const result = await userService.softDelete(userToDelete.id)
			if (result.success) {
				toast.success('Usuario eliminado correctamente')
				listUsers(filters)
			} else {
				toast.error(result.error || 'Error al eliminar usuario')
			}
		} catch (error) {
			toast.error('Error al eliminar usuario')
		} finally {
			setActionLoading(false)
			setShowDeleteDialog(false)
			setUserToDelete(null)
		}
	}

	const handleFormSubmit = async e => {
		e.preventDefault()
		setActionLoading(true)
		setFormErrors({})

		try {
			let result
			if (selectedUserId) {
				// Actualizar usuario
				const updateData = { ...formData }
				if (!updateData.password) delete updateData.password
				result = await updateUser(updateData, selectedUserId)
			} else {
				// Crear usuario
				result = await userService.create(formData)
			}

			if (result.success) {
				toast.success(selectedUserId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')
				handleUserFormSuccess()
			} else {
				if (result.error?.details) {
					setFormErrors(result.error.details)
				} else {
					toast.error(result.error || 'Error al guardar usuario')
				}
			}
		} catch (error) {
			toast.error('Error al guardar usuario')
		} finally {
			setActionLoading(false)
		}
	}

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		// Limpiar error del campo cuando el usuario empiece a escribir
		if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
	}

	const handleUserFormSuccess = () => {
		setShowUserForm(false)
		setSelectedUserId(null)
		setFormData({
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			role: 'student',
			status: 'active',
		})
		listUsers(filters)
	}

	const handleUserFormCancel = () => {
		setShowUserForm(false)
		setSelectedUserId(null)
		setFormData({
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			role: 'student',
			status: 'active',
		})
		setFormErrors({})
	}

	const getStatusBadge = status => {
		const statusConfig = {
			active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
			inactive: { color: 'bg-red-100 text-red-800', label: 'Inactivo' },
			pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
		}
		const config = statusConfig[status] || statusConfig.active
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>
		)
	}

	const getRoleBadge = role => {
		const roleConfig = {
			admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrador' },
			student: { color: 'bg-blue-100 text-blue-800', label: 'Estudiante' },
		}
		const config = roleConfig[role] || roleConfig.student
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>
		)
	}

	return (
		<>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900'>Gestión de Usuarios</h1>
				<p className='text-gray-600'>Administra los usuarios del sistema</p>
			</div>

			{/* Controles */}
			<div className=''>
				<div className='flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6'>
					<div className='flex flex-col sm:flex-row gap-4 flex-1 w-full'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
							<input
								type='text'
								placeholder='Buscar por nombre, email...'
								className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								value={filters.search}
								onChange={e => handleSearch({ search: e.target.value })}
							/>
						</div>

						<select
							className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							value={filters.role}
							onChange={e => handleSearch({ role: e.target.value })}>
							<option value=''>Todos los roles</option>
							<option value='admin'>Administrador</option>
							<option value='student'>Estudiante</option>
						</select>

						<select
							className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							value={filters.status}
							onChange={e => handleSearch({ status: e.target.value })}>
							<option value=''>Todos los estados</option>
							<option value='active'>Activo</option>
							<option value='inactive'>Inactivo</option>
							<option value='pending'>Pendiente</option>
						</select>
					</div>

					<button
						onClick={handleCreateUser}
						className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium'>
						<Plus className='h-4 w-4' />
						Nuevo Usuario
					</button>
				</div>

				{/* Estado de carga y error */}
				{loading && (
					<div className='text-center py-8'>
						<Loader2 className='animate-spin h-8 w-8 text-blue-600 mx-auto' />
						<p className='text-gray-600 mt-2'>Cargando usuarios...</p>
					</div>
				)}

				{error && (
					<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
						<div className='flex items-center gap-2 text-red-800'>
							<AlertCircle className='h-4 w-4' />
							<p>{error}</p>
						</div>
						<button
							onClick={() => listUsers(filters)}
							className='text-red-600 hover:text-red-800 mt-2 flex items-center gap-1'>
							<RefreshCw className='h-3 w-3' />
							Reintentar
						</button>
					</div>
				)}
			</div>

			{/* Lista de usuarios */}
			{!loading && !error && (
				<div className='overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Usuario
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Email
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Rol
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Estado
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Fecha Creación
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-200'>
								{users.length === 0 ? (
									<tr>
										<td colSpan='6' className='px-6 py-12 text-center text-gray-500'>
											<User className='h-12 w-12 text-gray-300 mx-auto mb-3' />
											<p className='text-lg font-medium'>No se encontraron usuarios</p>
											<p className='text-sm'>Intenta ajustar los filtros de búsqueda</p>
										</td>
									</tr>
								) : (
									users.map(user => (
										<tr key={user.id} className='hover:bg-gray-50 transition-colors'>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center'>
													<div className='flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center'>
														<span className='text-blue-600 font-medium text-sm'>
															{user.firstName?.[0]}
															{user.lastName?.[0]}
														</span>
													</div>
													<div className='ml-4'>
														<div className='text-sm font-medium text-gray-900'>
															{user.firstName} {user.lastName}
														</div>
														<div className='text-sm text-gray-500'>ID: {user.id.slice(0, 8)}...</div>
													</div>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='text-sm text-gray-900'>{user.email}</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>{getRoleBadge(user.role)}</td>
											<td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(user.status)}</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
												{new Date(user.createdAt).toLocaleDateString()}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
												<div className='flex gap-2'>
													<button
														onClick={() => handleEditUser(user.id)}
														className='text-blue-600 hover:text-blue-900 transition-colors p-1 rounded'
														title='Editar usuario'>
														<Edit className='h-4 w-4' />
													</button>
													<button
														onClick={() => handleDeleteClick(user)}
														className='text-red-600 hover:text-red-900 transition-colors p-1 rounded'
														title='Eliminar usuario'>
														<Trash2 className='h-4 w-4' />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Paginación */}
					{pagination && pagination.totalPages > 1 && (
						<div className='px-6 py-4 border-t bg-gray-50'>
							<div className='flex items-center justify-between'>
								<div className='text-sm text-gray-700'>
									Mostrando {(filters.page - 1) * filters.limit + 1} a{' '}
									{Math.min(filters.page * filters.limit, pagination.totalItems)} de {pagination.totalItems} usuarios
								</div>
								<div className='flex gap-2'>
									<button
										disabled={filters.page <= 1}
										onClick={() => handlePageChange(filters.page - 1)}
										className='px-3 py-1 border border-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'>
										Anterior
									</button>
									<span className='px-3 py-1 text-sm text-gray-700'>
										Página {filters.page} de {pagination.totalPages}
									</span>
									<button
										disabled={filters.page >= pagination.totalPages}
										onClick={() => handlePageChange(filters.page + 1)}
										className='px-3 py-1 border border-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'>
										Siguiente
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Modal de formulario de usuario */}
			{showUserForm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
						<div className='p-6'>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-xl font-bold text-gray-900'>
									{selectedUserId ? 'Editar Usuario' : 'Crear Usuario'}
								</h2>
								<button onClick={handleUserFormCancel} className='text-gray-400 hover:text-gray-600 transition-colors'>
									<X className='h-5 w-5' />
								</button>
							</div>

							<form onSubmit={handleFormSubmit} className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Nombre *</label>
										<input
											type='text'
											required
											className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
												formErrors.first_name ? 'border-red-300' : 'border-gray-300'
											}`}
											value={formData.first_name}
											onChange={e => handleInputChange('first_name', e.target.value)}
										/>
										{formErrors.first_name && <p className='text-red-500 text-xs mt-1'>{formErrors.first_name}</p>}
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Apellido *</label>
										<input
											type='text'
											required
											className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
												formErrors.last_name ? 'border-red-300' : 'border-gray-300'
											}`}
											value={formData.last_name}
											onChange={e => handleInputChange('last_name', e.target.value)}
										/>
										{formErrors.last_name && <p className='text-red-500 text-xs mt-1'>{formErrors.last_name}</p>}
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
									<input
										type='email'
										required
										className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
											formErrors.email ? 'border-red-300' : 'border-gray-300'
										}`}
										value={formData.email}
										onChange={e => handleInputChange('email', e.target.value)}
									/>
									{formErrors.email && <p className='text-red-500 text-xs mt-1'>{formErrors.email}</p>}
								</div>

								{!selectedUserId && (
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Contraseña *</label>
										<input
											type='password'
											required
											className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
												formErrors.password ? 'border-red-300' : 'border-gray-300'
											}`}
											value={formData.password}
											onChange={e => handleInputChange('password', e.target.value)}
										/>
										{formErrors.password && <p className='text-red-500 text-xs mt-1'>{formErrors.password}</p>}
									</div>
								)}

								<div className='grid grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Rol</label>
										<select
											className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
											value={formData.role}
											onChange={e => handleInputChange('role', e.target.value)}>
											<option value='student'>Estudiante</option>
											<option value='admin'>Administrador</option>
										</select>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Estado</label>
										<select
											className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
											value={formData.status}
											onChange={e => handleInputChange('status', e.target.value)}>
											<option value='active'>Activo</option>
											<option value='inactive'>Inactivo</option>
											<option value='pending'>Pendiente</option>
										</select>
									</div>
								</div>

								<div className='flex gap-3 justify-end pt-4'>
									<button
										type='button'
										onClick={handleUserFormCancel}
										className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium'>
										Cancelar
									</button>
									<button
										type='submit'
										disabled={actionLoading}
										className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2'>
										{actionLoading && <Loader2 className='h-4 w-4 animate-spin' />}
										{selectedUserId ? 'Actualizar' : 'Crear'} Usuario
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Modal de confirmación de eliminación */}
			{showDeleteDialog && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-lg shadow-xl max-w-sm w-full'>
						<div className='p-6'>
							<div className='flex items-center gap-3 mb-4'>
								<div className='p-2 bg-red-100 rounded-full'>
									<AlertCircle className='h-6 w-6 text-red-600' />
								</div>
								<div>
									<h3 className='text-lg font-semibold text-gray-900'>Eliminar Usuario</h3>
									<p className='text-sm text-gray-600'>Esta acción no se puede deshacer</p>
								</div>
							</div>

							<p className='text-gray-700 mb-6'>
								¿Estás seguro de que quieres eliminar al usuario{' '}
								<strong>
									{userToDelete?.first_name} {userToDelete?.last_name}
								</strong>
								?
							</p>

							<div className='flex gap-3 justify-end'>
								<button
									onClick={() => setShowDeleteDialog(false)}
									disabled={actionLoading}
									className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium'>
									Cancelar
								</button>
								<button
									onClick={handleDeleteUser}
									disabled={actionLoading}
									className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2'>
									{actionLoading && <Loader2 className='h-4 w-4 animate-spin' />}
									Eliminar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default UserPage
