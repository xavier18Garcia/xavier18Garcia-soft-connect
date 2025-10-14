import { useState, useEffect } from 'react'
import { Sidebar } from '../../components/Sidebar.jsx'
import { PostCard } from '../../components/post/PostCard.jsx'
import { SpinnerLoading } from '../../components/SpinnerLoading.jsx'
import { CreatePostModal } from '../../components/post/CreatePostModal.jsx'
import {
	LucideChevronLeft,
	LucideChevronRight,
	LucideSearch,
	LucideTrash,
	LucideX,
	SearchCode,
	ServerCrash,
} from 'lucide-react'
import { StateBanner } from '../../components/StateBanner.jsx'
import { usePosts, useCreatePost } from '../../common/hooks/usePosts.js'

const HomePage = () => {
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalRecords: 0,
	})

	const [filters, setFilters] = useState({
		search: '',
		status: '',
		is_solved: undefined,
	})

	const [searchInput, setSearchInput] = useState('')
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	// Usar TanStack Query para obtener posts
	const {
		data: postsData,
		error,
		isLoading,
		isError,
		refetch,
	} = usePosts({
		page: pagination.currentPage,
		limit: 10,
		search: filters.search,
		status: filters.status,
		is_solved: filters.is_solved,
	})

	// Mutation para crear posts
	const createPostMutation = useCreatePost()

	// Sincronizar paginación cuando lleguen los datos
	useEffect(() => {
		if (postsData?.data?.meta) {
			setPagination({
				currentPage: postsData.data.meta.currentPage || 1,
				totalPages: postsData.data.meta.totalPages || 1,
				totalRecords: postsData.data.meta.totalRecords || 0,
			})
		}
	}, [postsData])

	// Debounce para búsqueda automática
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setFilters(prev => ({
				...prev,
				search: searchInput,
			}))
			setPagination(prev => ({ ...prev, currentPage: 1 }))
		}, 500) // 500ms de debounce

		return () => clearTimeout(timeoutId)
	}, [searchInput])

	// Cambiar página
	const handlePageChange = newPage => {
		setPagination(prev => ({
			...prev,
			currentPage: newPage,
		}))
	}

	// Limpiar búsqueda
	const handleClearSearch = () => setSearchInput('')

	// Filtrar por status
	const handleStatusFilter = status => {
		setFilters(prev => ({
			...prev,
			status: status,
		}))
		setPagination(prev => ({ ...prev, currentPage: 1 }))
	}

	// Filtrar por resuelto
	const handleSolvedFilter = isSolved => {
		setFilters(prev => ({
			...prev,
			is_solved: isSolved === '' ? undefined : isSolved === 'true',
		}))
		setPagination(prev => ({ ...prev, currentPage: 1 }))
	}

	// Limpiar todos los filtros
	const handleClearFilters = () => {
		setFilters({
			search: '',
			status: '',
			is_solved: undefined,
		})
		setSearchInput('')
		setPagination(prev => ({ ...prev, currentPage: 1 }))
	}

	// Manejar envío del formulario de creación
	const handleCreatePost = async postData => {
		await createPostMutation.mutateAsync(postData)
		setIsCreateModalOpen(false)
	}

	// Renderizar botones de paginación
	const renderPaginationButtons = () => {
		const buttons = []
		const { currentPage, totalPages } = pagination

		// Botón Anterior
		buttons.push(
			<button
				key='prev'
				onClick={() => handlePageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className={`p-2 text-xs font-medium rounded-md hover:bg-gray-200 transition-all duration-500 ${
					currentPage === 1
						? 'text-gray-400 bg-gray-100 cursor-not-allowed'
						: 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer'
				}`}>
				<LucideChevronLeft className='h-4 w-4' />
			</button>
		)

		// Botones de páginas
		for (let page = 1; page <= totalPages; page++) {
			if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
				buttons.push(
					<button
						key={page}
						onClick={() => handlePageChange(page)}
						className={`text-xs font-medium px-2 ${
							currentPage === page ? 'text-gray-900 underline' : 'text-gray-500'
						}`}>
						{page}
					</button>
				)
			} else if (
				(page === currentPage - 2 && currentPage > 3) ||
				(page === currentPage + 2 && currentPage < totalPages - 2)
			) {
				buttons.push(
					<span key={`ellipsis-${page}`} className='p-2 text-xs text-gray-500'>
						...
					</span>
				)
			}
		}

		// Botón Siguiente
		buttons.push(
			<button
				key='next'
				onClick={() => handlePageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className={`p-2 text-xs font-medium rounded-md hover:bg-gray-200 transition-all duration-500 ${
					currentPage === totalPages
						? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
						: 'text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 cursor-pointer'
				}`}>
				<LucideChevronRight className='h-4 w-4' />
			</button>
		)

		return buttons
	}

	// Verificar si hay filtros activos
	const hasActiveFilters = filters.search || filters.status || filters.is_solved !== undefined

	// Acceder correctamente a los posts
	const posts = postsData?.data?.data || []

	return (
		<div className='flex-1 flex'>
			<Sidebar onReload={refetch} onCreatePost={() => setIsCreateModalOpen(true)} />

			<main className='flex-1'>
				{/* Header con título y estadísticas */}
				<div className='mb-6 flex items-center justify-between gap-4'>
					<h1 className='text-2xl font-bold text-gray-700'>Preguntas de la comunidad</h1>
					<p className='text-gray-600 text-xs'>
						{pagination.totalRecords} {pagination.totalRecords === 1 ? 'pregunta total' : 'preguntas totales'}
					</p>
				</div>

				{/* Barra de búsqueda y filtros */}
				<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
					{/* Búsqueda - Izquierda */}
					<div className='flex-1 max-w-md'>
						<div className='relative'>
							{/* Ícono de búsqueda - izquierda */}
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<LucideSearch className='h-4 w-4 text-gray-500' />
							</div>

							{/* Input */}
							<input
								type='text'
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								placeholder='Buscar preguntas...'
								className='block w-full pl-10 pr-8 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-xs'
							/>

							{/* Ícono de limpiar - dentro del input */}
							{searchInput && (
								<button
									onClick={handleClearSearch}
									className='absolute inset-y-0 cursor-pointer right-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
									type='button'>
									<LucideX className='h-4 w-4' />
								</button>
							)}
						</div>
					</div>

					{/* Filtros y botón limpiar - Derecha */}
					<div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
						{/* Filtros */}
						<div className='flex flex-wrap items-center gap-2'>
							{/* Filtro por Estado */}
							<div className='flex items-center'>
								<div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
									<button
										onClick={() => handleStatusFilter('')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.status === '' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
										}`}>
										Todos
									</button>
									<button
										onClick={() => handleStatusFilter('active')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.status === 'active'
												? 'bg-white text-gray-900 shadow-sm'
												: 'text-gray-600 hover:text-gray-900'
										}`}>
										Activas
									</button>
									<button
										onClick={() => handleStatusFilter('closed')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.status === 'closed'
												? 'bg-white text-gray-900 shadow-sm'
												: 'text-gray-600 hover:text-gray-900'
										}`}>
										Cerradas
									</button>
								</div>
							</div>

							{/* Filtro por Resuelto */}
							<div className='flex items-center'>
								<div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
									<button
										onClick={() => handleSolvedFilter('')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.is_solved === undefined
												? 'bg-white text-gray-900 shadow-sm'
												: 'text-gray-600 hover:text-gray-900'
										}`}>
										Todos
									</button>
									<button
										onClick={() => handleSolvedFilter('true')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.is_solved === true
												? 'bg-white text-gray-900 shadow-sm'
												: 'text-gray-600 hover:text-gray-900'
										}`}>
										Resueltas
									</button>
									<button
										onClick={() => handleSolvedFilter('false')}
										className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
											filters.is_solved === false
												? 'bg-white text-gray-900 shadow-sm'
												: 'text-gray-600 hover:text-gray-900'
										}`}>
										Sin resolver
									</button>
								</div>
							</div>

							{/* Botón Limpiar Filtros */}
							{hasActiveFilters && (
								<button
									onClick={handleClearFilters}
									className='p-2 cursor-pointer flex items-center justify-center text-xs font-medium bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all duration-500'>
									<LucideTrash className='h-3 w-3' />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Lista de posts */}
				<div className='space-y-4'>
					{isLoading ? (
						<div className='flex justify-center items-center py-12'>
							<SpinnerLoading />
						</div>
					) : isError ? (
						<StateBanner
							title='Error al cargar las preguntas'
							description={error.message || 'Ha ocurrido un problema al intentar cargar el contenido.'}
							icon={<ServerCrash className='h-8 w-8' />}
							actionLabel='Reintentar'
							onAction={refetch}
							variant='default'
						/>
					) : posts.length === 0 ? (
						<StateBanner
							title='Sin resultados'
							description={hasActiveFilters ? 'No se encontraron preguntas con estos filtros' : 'Aún no hay preguntas'}
							icon={<SearchCode className='h-8 w-8' />}
							actionLabel='Ver todas las preguntas'
							onAction={hasActiveFilters ? handleClearFilters : null}
							variant='default'
						/>
					) : (
						posts.map(post => <PostCard key={post.id} post={post} />)
					)}
				</div>

				{/* Paginación */}
				{pagination.totalPages > 1 && (
					<div className='flex justify-end mt-8'>
						<nav className='flex space-x-2'>{renderPaginationButtons()}</nav>
					</div>
				)}

				{/* Modal para crear posts */}
				<CreatePostModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
					onSubmit={handleCreatePost}
					isSubmitting={createPostMutation.isPending}
				/>
			</main>
		</div>
	)
}

export default HomePage
