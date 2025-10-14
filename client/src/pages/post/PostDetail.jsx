import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
	usePost,
	useToggleLike,
	useMarkAsSolved,
	usePostLikeStatus,
	useUpdatePost,
	useSoftDeletePost,
} from '../../common/hooks/usePosts.js'
import { useCreateAnswer, useAnswersByPost } from '../../common/hooks/useAnswers.js'
import { useAuth } from '../../stores/authStore.js'
import { SpinnerLoading } from '../../components/SpinnerLoading.jsx'
import { StateBanner } from '../../components/StateBanner.jsx'
import { Badge } from '../../components/ui/StatusBadge.jsx'
import { CreatePostModal } from '../../components/post/CreatePostModal.jsx'
import {
	ArrowLeft,
	Eye,
	MessageSquare,
	ThumbsUp,
	CheckCircle,
	Share2,
	Bookmark,
	Flag,
	Edit,
	Trash2,
	User,
	Clock,
	MoreVertical,
	Heart,
	SearchCode,
	ChevronDown,
} from 'lucide-react'
import { AnswerCard } from '../../components/answer/AnswerCard.jsx'

// Componente: Header del Post
const PostHeader = ({ post }) => {
	return (
		<div className='flex items-start gap-3'>
			<div className='flex-1 min-w-0 space-y-4'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex items-center gap-2 flex-wrap'>
						<span className='font-medium text-gray-500 text-sm'>{post?.author?.email || '-'}</span>
						<span className='text-gray-500 text-xs'>•</span>
						<span className='text-gray-500 text-xs'>
							{new Date(post.createdAt).toLocaleDateString('es-ES', {
								day: 'numeric',
								month: 'short',
								year: 'numeric',
							})}
						</span>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!post?.isSolved && (
							<Badge
								label={post.status === 'active' ? 'Abierto' : post.status === 'closed' ? 'Cerrado' : post.status}
								variant={post.status === 'active' ? 'info' : post.status === 'closed' ? 'warning' : 'default'}
								className='text-xs px-2 py-1'
							/>
						)}
						{post.isSolved && <Badge label='Solucionado' variant='success' className='text-xs px-2 py-1' />}
					</div>
				</div>

				<h1 className='text-lg font-semibold text-gray-700 leading-snug'>{post.title}</h1>

				<div className='flex items-center justify-between text-xs text-gray-500'>
					<div className='flex items-center gap-6'>
						<span className='flex items-center gap-1'>
							<Heart className='h-3.5 w-3.5' />
							<span>{post.likesCount || 0} Me gusta</span>
						</span>
						<span className='flex items-center gap-1'>
							<MessageSquare className='h-3.5 w-3.5' />
							<span>{post.answersCount || 0} Respuestas</span>
						</span>
					</div>
					<span>{post.sharesCount || 0} compartidos</span>
				</div>
			</div>
		</div>
	)
}

// Componente: Acciones del Post
const PostActions = ({ hasLiked, currentLikesCount, onLike, isLoading }) => {
	return (
		<div className='flex items-center justify-between mt-4 pt-3 border-t border-gray-300'>
			<button
				className='flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-200 cursor-pointer rounded-lg transition-colors flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed'
				onClick={onLike}
				disabled={isLoading}>
				{isLoading ? (
					<SpinnerLoading showText={false} />
				) : (
					<div className='flex items-center gap-2'>
						<Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
						<span className='text-sm font-medium'>{currentLikesCount}</span>
					</div>
				)}
			</button>
			<button className='flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-200 cursor-pointer rounded-lg transition-colors flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed'>
				<Share2 className='h-4 w-4' />
				<span className='text-sm font-medium'>Compartir</span>
			</button>
		</div>
	)
}

// Componente: Menú de opciones del autor
const AuthorMenu = ({ isOpen, onEdit, onDelete, onMarkSolved, isSolved, isMarkingAsSolved }) => {
	if (!isOpen) return null

	return (
		<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
			{!isSolved && (
				<button
					onClick={onMarkSolved}
					disabled={isMarkingAsSolved}
					className='flex items-center space-x-2 w-full px-4 py-2 text-xs text-green-700 hover:bg-green-50 cursor-pointer disabled:opacity-50'>
					<CheckCircle className='h-4 w-4' />
					<span>{isMarkingAsSolved ? 'Marcando...' : 'Marcar como resuelto'}</span>
				</button>
			)}
			<button
				onClick={onEdit}
				className='flex items-center space-x-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer'>
				<Edit className='h-4 w-4' />
				<span>Editar post</span>
			</button>

			<button
				onClick={onDelete}
				className='flex items-center space-x-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer'>
				<Trash2 className='h-4 w-4' />
				<span>Eliminar post</span>
			</button>
		</div>
	)
}

// Componente: Modal de confirmación de eliminación
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl p-4 max-w-sm w-full'>
				<h3 className='text-base font-semibold text-gray-900 mb-2'>Eliminar pregunta</h3>
				<p className='text-gray-600 text-xs mb-4'>¿Estás seguro? Esta acción no se puede deshacer.</p>
				<div className='flex gap-2'>
					<button
						onClick={onClose}
						disabled={isDeleting}
						className='flex-1 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs cursor-pointer disabled:opacity-50'>
						Cancelar
					</button>
					<button
						onClick={onConfirm}
						disabled={isDeleting}
						className='flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2'>
						{isDeleting ? <SpinnerLoading showText={false} /> : 'Eliminar'}
					</button>
				</div>
			</div>
		</div>
	)
}

// Componente Principal
const PostDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user, isAuthenticated } = useAuth()

	// Estados locales
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showAuthorMenu, setShowAuthorMenu] = useState(false)
	const [showAnswerModal, setShowAnswerModal] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const answersPerPage = 100

	// Queries y mutations
	const { data: postData, isLoading, error } = usePost(id)
	const post = postData?.data

	// Query para obtener las respuestas del post con paginación
	const { data: answersData, isLoading: answersLoading } = useAnswersByPost(id, {
		page: currentPage,
		limit: answersPerPage,
	})
	const answers = answersData?.data || []
	const totalPages = answersData?.meta?.totalPages || 1
	const totalRecords = answersData?.meta?.totalRecords || 0
	const currentPageFromAPI = answersData?.meta?.currentPage || 1
	const hasMoreAnswers = currentPageFromAPI < totalPages

	const { data: likeStatus, isLoading: likeStatusLoading } = usePostLikeStatus(id)
	const toggleLikeMutation = useToggleLike()
	const markAsSolvedMutation = useMarkAsSolved()
	const updatePostMutation = useUpdatePost()
	const deletePostMutation = useSoftDeletePost()
	const createAnswerMutation = useCreateAnswer()

	// Handlers
	const handleLike = async () => {
		if (!isAuthenticated) {
			navigate('/auth/signin')
			return
		}
		try {
			await toggleLikeMutation.mutateAsync(post.id)
		} catch (error) {
			console.error('Error al dar like:', error)
		}
	}

	const handleMarkAsSolved = async () => {
		if (!isAuthenticated || !post || post?.author?.id !== user?.id) return
		try {
			await markAsSolvedMutation.mutateAsync(post.id)
			setShowAuthorMenu(false)
		} catch (error) {
			console.error('Error al marcar como resuelto:', error)
		}
	}

	const handleEditPost = async postData => {
		try {
			await updatePostMutation.mutateAsync({
				id: post.id,
				data: postData,
			})
			setShowEditModal(false)
		} catch (error) {
			console.error('Error al actualizar el post:', error)
			throw error
		}
	}

	const handleDeletePost = async () => {
		try {
			await deletePostMutation.mutateAsync(post.id)
			navigate('/')
		} catch (error) {
			console.error('Error al eliminar el post:', error)
		}
	}

	const handleCreateAnswer = async answerData => {
		try {
			await createAnswerMutation.mutateAsync({
				postId: post.id,
				content: answerData.description,
			})
			setShowAnswerModal(false)
			// Resetear a la primera página para ver la nueva respuesta
			setCurrentPage(1)
		} catch (error) {
			console.error('Error al crear respuesta:', error)
			throw error
		}
	}

	const handleLoadMore = () => {
		if (hasMoreAnswers) {
			setCurrentPage(prev => prev + 1)
		}
	}

	// Verificaciones
	const isAuthor = isAuthenticated && user?.id === post?.author?.id
	const hasLiked = likeStatus?.hasLiked || false
	const currentLikesCount = post?.likesCount || 0

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<SpinnerLoading size='lg' />
			</div>
		)
	}

	// Error state
	if (error || !post) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<StateBanner
					title='Post no encontrado'
					description='El post que buscas no existe o fue eliminado.'
					icon={<Flag className='h-8 w-8' />}
					actionLabel='Volver al inicio'
					onAction={() => navigate('/')}
					variant='error'
				/>
			</div>
		)
	}

	return (
		<div className='space-y-8'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<Link to='/' className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors'>
					<div className='bg-gray-50 p-2 rounded-full'>
						<ArrowLeft className='h-4 w-4' />
					</div>
					<span className='text-sm'>Volver</span>
				</Link>

				{!postData?.data?.deletedAt && (
					<div className='flex items-center space-x-2'>
						<button className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer'>
							<Share2 className='h-4 w-4' />
						</button>
						<button className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 cursor-pointer'>
							<Bookmark className='h-4 w-4' />
						</button>

						{isAuthor && (
							<div className='relative'>
								<button
									onClick={() => setShowAuthorMenu(!showAuthorMenu)}
									disabled={!!postData?.data?.deletedAt}
									className={`p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 
		${postData?.data?.deletedAt ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
									<MoreVertical className='h-4 w-4' />
								</button>

								<AuthorMenu
									isOpen={showAuthorMenu}
									onToggle={() => setShowAuthorMenu(!showAuthorMenu)}
									onEdit={() => {
										setShowEditModal(true)
										setShowAuthorMenu(false)
									}}
									onDelete={() => {
										setShowDeleteConfirm(true)
										setShowAuthorMenu(false)
									}}
									onMarkSolved={handleMarkAsSolved}
									isSolved={post.isSolved}
									isMarkingAsSolved={markAsSolvedMutation.isPending}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{postData?.data?.deletedAt ? (
				<StateBanner
					title='Este post ya no está disponible'
					description='El autor ha eliminado este post o fue removido del sistema.'
					icon={<SearchCode className='h-8 w-8' />}
					variant='default'
				/>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
					{/* Columna izquierda - Pregunta principal */}
					<div className='lg:col-span-2'>
						<article className='space-y-6'>
							<div className='bg-gray-50 p-4 rounded-2xl text-gray-600'>
								<PostHeader post={post} />
								<PostActions
									hasLiked={hasLiked}
									currentLikesCount={currentLikesCount}
									onLike={handleLike}
									isLoading={toggleLikeMutation?.isPending || likeStatusLoading}
								/>
							</div>
							<div
								className='prose prose-sm max-w-none mb-4 text-gray-700 leading-relaxed'
								dangerouslySetInnerHTML={{ __html: post.description }}
							/>
						</article>
					</div>

					{/* Columna derecha - Respuestas */}
					<div className='lg:col-span-1'>
						<div className='sticky top-20'>
							<h2 className='text-lg font-semibold text-gray-900 mb-4'>
								Respuestas ({answersLoading ? '...' : totalRecords})
							</h2>

							{isAuthenticated && (
								<section>
									<div className='flex items-center justify-end my-4'>
										<button
											onClick={() => setShowAnswerModal(true)}
											disabled={createAnswerMutation.isPending}
											className='flex w-full items-center text-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-xs cursor-pointer disabled:opacity-50'>
											{createAnswerMutation.isPending ? (
												<SpinnerLoading showText={false} />
											) : (
												<>
													<MessageSquare className='h-4 w-4' />
													<span>Responder</span>
												</>
											)}
										</button>
									</div>
								</section>
							)}

							{!isAuthenticated && (
								<div className='bg-white rounded-lg border border-gray-200 p-4 text-center'>
									<MessageSquare className='h-8 w-8 text-gray-300 mx-auto mb-2' />
									<h3 className='text-base font-medium text-gray-900 mb-1'>¿Quieres responder?</h3>
									<p className='text-gray-500 text-xs mb-3'>Inicia sesión para participar</p>
									<Link
										to='/auth/signin'
										className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs'>
										<User className='h-4 w-4' />
										<span>Iniciar sesión</span>
									</Link>
								</div>
							)}

							{answersLoading && currentPage === 1 ? (
								<div className='flex items-center justify-center py-8'>
									<SpinnerLoading />
								</div>
							) : answers.length > 0 ? (
								<div className='space-y-4'>
									<div className='space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2'>
										{answers.map(answer => (
											<AnswerCard
												key={answer.id}
												answer={answer}
												isAuthor={isAuthor}
												isSolved={post.isSolved}
												onAccept={answerId => console.log('Aceptar respuesta:', answerId)}
											/>
										))}
									</div>

									{/* Botón de cargar más */}
									{hasMoreAnswers && (
										<div className='pt-4'>
											<button
												onClick={handleLoadMore}
												disabled={answersLoading}
												className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
												{answersLoading ? (
													<SpinnerLoading showText={false} />
												) : (
													<>
														<ChevronDown className='h-4 w-4' />
														<span>Cargar más respuestas ({totalRecords - answers.length} restantes)</span>
													</>
												)}
											</button>
										</div>
									)}

									{/* Indicador de página */}
									<div className='text-center text-xs text-gray-500 pt-2'>
										Página {currentPage} de {totalPages}
									</div>
								</div>
							) : (
								<StateBanner title='Aún no hay respuestas' description='Sé el primero en responder' variant='default' />
							)}
						</div>
					</div>
				</div>
			)}

			{/* Modales */}
			<DeleteConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeletePost}
				isDeleting={deletePostMutation.isPending}
			/>

			<CreatePostModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				onSubmit={handleEditPost}
				initialData={{ title: post?.title, description: post?.description }}
				isEditMode={true}
			/>

			<CreatePostModal
				isOpen={showAnswerModal}
				onClose={() => setShowAnswerModal(false)}
				onSubmit={handleCreateAnswer}
				isAnswerMode={true}
			/>
		</div>
	)
}

export default PostDetail
