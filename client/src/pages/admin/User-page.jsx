import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../stores/authStore'
import { useUsers, useUser } from '../../common/hooks/useUsers'
import { Plus, Search, Edit, Trash2, X, User, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { userService } from '../../services/userService'
import { toast } from 'sonner'
import { SpinnerLoading } from '../../components/SpinnerLoading'
import { StateBanner } from '../../components/StateBanner'

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

	// Usar camelCase que coincide con el backend
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		role: 'student',
		status: 'active',
	})
	const [formErrors, setFormErrors] = useState({})

	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		search: '',
		role: '',
		status: '',
		sortBy: 'createdAt',
		sortDirection: 'desc',
	})

	// Hook para usuario individual (si hay uno seleccionado)
	const { user: selectedUser, getUser } = useUser(selectedUserId)

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/auth/signin')
			return
		}
		if (!isAdmin) {
			navigate('/')
			return
		}
		listUsers(filters)
	}, [filters, isAuthenticated, navigate, isAdmin])

	// Cargar datos del usuario cuando se selecciona para editar
	useEffect(() => {
		if (selectedUserId && showUserForm) {
			getUser(selectedUserId)
		}
	}, [selectedUserId, showUserForm])

	// Actualizar formData cuando selectedUser cambia
	useEffect(() => {
		if (selectedUser && showUserForm && selectedUserId) {
			// Agregar selectedUserId a la condición
			setFormData({
				firstName: selectedUser.firstName || '',
				lastName: selectedUser.lastName || '',
				email: selectedUser.email || '',
				password: '',
				role: selectedUser.role?.toLowerCase() || 'student',
				status: selectedUser.status?.toLowerCase() || 'active',
			})
		}
	}, [selectedUser, showUserForm, selectedUserId]) // Agregar selectedUserId como dependencia

	const handleSearch = newFilters => {
		setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
	}

	const handlePageChange = newPage => {
		setFilters(prev => ({ ...prev, page: newPage }))
	}

	const resetForm = () => {
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			role: 'student',
			status: 'active',
		})
		setFormErrors({})
	}

	const handleCreateUser = () => {
		setSelectedUserId(null)
		resetForm()
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
			const result = await userService.hardDelete(userToDelete.id)
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
				result = await userService.update(selectedUserId, updateData)
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
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const handleUserFormSuccess = () => {
		setShowUserForm(false)
		setSelectedUserId(null)
		resetForm()
		listUsers(filters)
	}

	const handleUserFormCancel = () => {
		setShowUserForm(false)
		setSelectedUserId(null)
		resetForm()
	}

	const getStatusBadge = status => {
		const statusConfig = {
			active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
			inactive: { color: 'bg-red-100 text-red-800', label: 'Inactivo' },
			pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
		}
		const config = statusConfig[status?.toLowerCase()] || statusConfig.active
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>
		)
	}

	const getRoleBadge = role => {
		const roleConfig = {
			admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrador' },
			student: { color: 'bg-gray-100 text-gray-800', label: 'Estudiante' },
		}
		const config = roleConfig[role?.toLowerCase()] || roleConfig.student
		return (
			<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>
		)
	}

	if (loading && users.length === 0) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<SpinnerLoading />
			</div>
		)
	}

	if (error && users.length === 0) {
		return (
			<div className='text-sm'>
				<StateBanner
					icon={<AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-3' />}
					title='Error al cargar usuarios'
					description={error}
					action={
						<button
							onClick={() => listUsers(filters)}
							className='mt-4 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto'>
							<RefreshCw className='h-4 w-4' />
							Reintentar
						</button>
					}
				/>
			</div>
		)
	}

	return (
		<div className='text-sm'>
			{/* Header */}
			<div className='mb-8 flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900'>Gestión de Usuarios</h1>
					<p className='text-gray-600'>Administra los usuarios del sistema</p>
				</div>
				<button
					onClick={handleCreateUser}
					className='px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2'>
					<Plus className='h-5 w-5' />
					Nuevo Usuario
				</button>
			</div>

			{/* Controles */}
			{/* 
			<div className='flex flex-col sm:flex-row gap-4 flex-1 w-full mb-6'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
					<input
						type='text'
						placeholder='Buscar por nombre, email...'
						className='pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
						value={filters.search}
						onChange={e => handleSearch({ search: e.target.value })}
					/>
				</div>

				<select
					className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
					value={filters.role}
					onChange={e => handleSearch({ role: e.target.value })}>
					<option value=''>Todos los roles</option>
					<option value='admin'>Administrador</option>
					<option value='student'>Estudiante</option>
				</select>

				<select
					className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
					value={filters.status}
					onChange={e => handleSearch({ status: e.target.value })}>
					<option value=''>Todos los estados</option>
					<option value='active'>Activo</option>
					<option value='inactive'>Inactivo</option>
					<option value='pending'>Pendiente</option>
				</select>

				<select
					className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
					value={filters.sortBy || ''}
					onChange={e => handleSearch({ sortBy: e.target.value })}>
					<option value=''>Ordenar por</option>
					<option value='firstName'>Nombre</option>
					<option value='email'>Email</option>
					<option value='createdAt'>Fecha creación</option>
				</select>
		</div>
		*/}

			{/* Lista de usuarios */}
			<div className='bg-white overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Usuario
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
									Email
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Rol</th>
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
						<tbody className='bg-white divide-y divide-gray-200'>
							{users?.length === 0 ? (
								<tr>
									<td colSpan='6' className='text-center py-8'>
										<StateBanner
											icon={<User className='h-12 w-12 text-gray-300 mx-auto mb-3' />}
											title='No se encontraron usuarios'
											description='Intenta ajustar los filtros de búsqueda'
										/>
									</td>
								</tr>
							) : (
								users?.map(user => (
									<tr key={user.id} className='hover:bg-gray-50 transition-colors'>
										<td className='px-6 py-2 whitespace-nowrap'>
											<div className='flex items-center'>
												<div className='flex-shrink-0 h-14 w-14 bg-gray-100 border-gray-400 border-2 flex items-center justify-center rounded-full overflow-hidden'>
													<img
														src='https://img.freepik.com/vector-premium/personaje-avatar-esta-aislado_729149-194801.jpg'
														alt='Foto perfil'
														className='w-full h-full object-cover'
													/>
												</div>
												<div className='ml-4'>
													<div className='text-sm font-medium text-gray-900'>
														{user.firstName || 'Sin nombre'} {user.lastName || ''}
													</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='text-sm text-gray-900'>{user.email}</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>{getRoleBadge(user.role)}</td>
										<td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(user.status)}</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{new Date(user.createdAt).toLocaleDateString('es-ES')}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
											<div className='flex gap-2'>
												<button
													onClick={() => handleEditUser(user.id)}
													className='text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50'
													title='Editar usuario'>
													<Edit className='h-4 w-4' />
												</button>
												<button
													onClick={() => handleDeleteClick(user)}
													className='text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50'
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
									className='px-3 py-1 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'>
									Anterior
								</button>
								<span className='px-3 py-1 text-sm text-gray-700'>
									Página {filters.page} de {pagination.totalPages}
								</span>
								<button
									disabled={filters.page >= pagination.totalPages}
									onClick={() => handlePageChange(filters.page + 1)}
									className='px-3 py-1 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'>
									Siguiente
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Modal de formulario de usuario */}
			{showUserForm && (
				<div className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-xs text-sm'>
					<div className='bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
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
											className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 ${
												formErrors.firstName ? 'border-red-300' : 'border-gray-300'
											}`}
											value={formData.firstName}
											onChange={e => handleInputChange('firstName', e.target.value)}
										/>
										{formErrors.firstName && <p className='text-red-500 text-xs mt-1'>{formErrors.firstName}</p>}
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Apellido *</label>
										<input
											type='text'
											required
											className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 ${
												formErrors.lastName ? 'border-red-300' : 'border-gray-300'
											}`}
											value={formData.lastName}
											onChange={e => handleInputChange('lastName', e.target.value)}
										/>
										{formErrors.lastName && <p className='text-red-500 text-xs mt-1'>{formErrors.lastName}</p>}
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>Email *</label>
									<input
										type='email'
										required
										className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 ${
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
											className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 ${
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
											className='w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500'
											value={formData.role}
											onChange={e => handleInputChange('role', e.target.value)}>
											<option value='student'>Estudiante</option>
											<option value='admin'>Administrador</option>
										</select>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-1'>Estado</label>
										<select
											className='w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500'
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
										className='px-4 py-2 hover:bg-gray-200 cursor-pointer border border-gray-300 rounded-xl transition-colors font-medium'>
										Cancelar
									</button>
									<button
										type='submit'
										disabled={actionLoading}
										className='px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 cursor-pointer'>
										{actionLoading && <Loader2 className='h-4 w-4 animate-spin' />}
										{selectedUserId ? 'Actualizar' : 'Crear'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Modal de confirmación de eliminación */}
			{showDeleteDialog && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<div className='bg-white rounded-xl shadow-xl max-w-sm w-full'>
						<div className='p-6'>
							<div className='flex items-center gap-3 mb-4'>
								<div className='p-2 bg-red-100 rounded-full'>
									<AlertCircle className='h-6 w-6 text-red-600' />
								</div>
								<div>
									<h3 className='text-lg font-semibold text-gray-900'>Eliminar usuario</h3>
									<p className='text-sm text-gray-600'>Esta acción no se puede deshacer</p>
								</div>
							</div>

							<p className='text-gray-700 mb-6'>
								¿Estás seguro de que quieres eliminar al usuario{' '}
								<strong>
									{userToDelete?.firstName || 'Sin nombre'} {userToDelete?.lastName || ''}
								</strong>{' '}
								de forma permanente?
							</p>

							<div className='flex gap-3 justify-end'>
								<button
									onClick={() => setShowDeleteDialog(false)}
									disabled={actionLoading}
									className='px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium'>
									Cancelar
								</button>
								<button
									onClick={handleDeleteUser}
									disabled={actionLoading}
									className='px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2'>
									{actionLoading && <Loader2 className='h-4 w-4 animate-spin' />}
									Eliminar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default UserPage
