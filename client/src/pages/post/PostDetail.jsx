import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePost, useToggleLike, useMarkAsSolved, usePostLikeStatus } from '../../common/hooks/usePosts.js'
import { useAuth } from '../../stores/authStore.js'
import { SpinnerLoading } from '../../components/SpinnerLoading.jsx'
import { StateBanner } from '../../components/StateBanner.jsx'
import { Badge } from '../../components/ui/StatusBadge.jsx'
import {
	ArrowLeft,
	Calendar,
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
} from 'lucide-react'

const PostDetail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { user, isAuthenticated } = useAuth()

	// Queries y mutations
	const { data: postData, isLoading, error, refetch } = usePost(id)
	const post = postData?.data

	// NUEVO: Hook para verificar estado de like
	const { data: likeStatus, isLoading: likeStatusLoading } = usePostLikeStatus(id)

	const toggleLikeMutation = useToggleLike()
	const markAsSolvedMutation = useMarkAsSolved()

	const [newAnswer, setNewAnswer] = useState('')
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	useEffect(() => {
		if (post && isAuthenticated) {
			// Aquí podrías llamar a un servicio para incrementar vistas
		}
	}, [post, isAuthenticated])

	const handleLike = async () => {
		if (!isAuthenticated) {
			navigate('/auth/signin')
			return
		}
		if (!post) return

		try {
			await toggleLikeMutation.mutateAsync(post.id)
			// El cache se actualiza automáticamente gracias al onSuccess en el hook
		} catch (error) {
			console.error('Error al dar like:', error)
		}
	}

	const handleMarkAsSolved = async () => {
		if (!isAuthenticated || !post || post?.author?.id !== user?.id) return

		try {
			await markAsSolvedMutation.mutateAsync(post.id)
		} catch (error) {
			console.error('Error al marcar como resuelto:', error)
		}
	}

	const handleSubmitAnswer = async e => {
		e.preventDefault()
		if (!isAuthenticated) {
			navigate('/auth/signin')
			return
		}

		if (!newAnswer.trim()) return

		setIsSubmittingAnswer(true)
		try {
			// await answerService.create(post.id, { content: newAnswer })
			setNewAnswer('')
			refetch()
		} catch (error) {
			console.error('Error al enviar respuesta:', error)
		} finally {
			setIsSubmittingAnswer(false)
		}
	}

	const handleDeletePost = async () => {
		setShowDeleteConfirm(false)
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<SpinnerLoading size='lg' />
			</div>
		)
	}

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

	const isAuthor = isAuthenticated && user?.id === post?.author?.id
	// CORREGIDO: Usamos likeStatus en lugar de buscar en el array de likes
	const hasLiked = likeStatus?.hasLiked || false
	const currentLikesCount = post.likesCount || 0

	return (
		<div className='space-y-8'>
			{/* Header minimalista */}
			<div className='flex items-center justify-between'>
				<Link to='/' className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors'>
					<ArrowLeft className='h-4 w-4' />
					<span className='text-xs'>Volver al foro</span>
				</Link>

				<div className='flex items-center space-x-2'>
					<button className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100'>
						<Share2 className='h-4 w-4' />
					</button>
					<button className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100'>
						<Bookmark className='h-4 w-4' />
					</button>

					{isAuthor && (
						<div className='relative'>
							<button className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100'>
								<MoreVertical className='h-4 w-4' />
							</button>

							<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
								<button className='flex items-center space-x-2 w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50'>
									<Edit className='h-4 w-4' />
									<span>Editar post</span>
								</button>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className='flex items-center space-x-2 w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50'>
									<Trash2 className='h-4 w-4' />
									<span>Eliminar post</span>
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Contenido principal en dos columnas */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
				{/* Columna izquierda - Pregunta principal */}
				<div className='lg:col-span-2'>
					<article>
						{/* Header del post */}
						<div className='flex items-start justify-between mb-4'>
							<div className='flex-1'>
								<h1 className='text-xl font-semibold text-gray-900 mb-3 leading-tight'>{post.title}</h1>
								<div className='flex items-center gap-3 mb-3 flex-wrap'>
									<Badge
										label={post.status === 'active' ? 'Abierto' : post.status === 'closed' ? 'Cerrado' : post.status}
										variant={post.status === 'active' ? 'info' : post.status === 'closed' ? 'warning' : 'default'}
										className='text-xs'
									/>
									{post.isSolved && <Badge label='Solucionado' variant='success' className='text-xs' />}
								</div>

								<div className='flex items-center gap-4 text-xs text-gray-500 justify-between'>
									<div className='flex gap-4'>
										<span className='flex items-center gap-1'>
											<Calendar className='h-3 w-3' />
											<span>{new Date(post.createdAt).toLocaleDateString()}</span>
										</span>
										<span className='flex items-center gap-1'>
											<Eye className='h-3 w-3' />
											<span>{post.views || 0}</span>
										</span>
										<span className='flex items-center gap-1'>
											<MessageSquare className='h-3 w-3' />
											<span>{post.answersCount || 0}</span>
										</span>
									</div>

									<span className='flex items-center gap-1'>
										Publicado por:
										<span>{post.author ? `${post.author.email}` : 'Anónimo'}</span>
									</span>
								</div>
							</div>
						</div>

						{/* Contenido del post */}
						<div
							className='prose prose-sm max-w-none mb-4 text-gray-700 leading-relaxed'
							dangerouslySetInnerHTML={{ __html: post.description }}
						/>

						{/* Acciones del post - CORREGIDO */}
						<div className='flex items-center justify-between pt-4 border-t border-gray-100'>
							<button
								onClick={handleLike}
								disabled={toggleLikeMutation.isPending || likeStatusLoading}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
									hasLiked
										? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
										: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
								} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
								<ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
								<span>
									{toggleLikeMutation.isPending || likeStatusLoading ? <SpinnerLoading size='sm' /> : currentLikesCount}
								</span>
							</button>

							{isAuthor && !post.isSolved && (
								<button
									onClick={handleMarkAsSolved}
									disabled={markAsSolvedMutation.isPending}
									className='flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs cursor-pointer'>
									<CheckCircle className='h-4 w-4' />
									<span>{markAsSolvedMutation.isPending ? <SpinnerLoading size='sm' /> : 'Marcar como resuelto'}</span>
								</button>
							)}
						</div>
					</article>
				</div>

				{/* Columna derecha - Respuestas */}
				<div className='lg:col-span-1'>
					<div className='sticky top-20'>
						<h2 className='text-lg font-semibold text-gray-900 mb-4'>Respuestas ({post.answers?.length || 0})</h2>

						{/* Formulario de respuesta */}
						{isAuthenticated && (
							<section className=''>
								<form onSubmit={handleSubmitAnswer}>
									<div className='flex items-center justify-end my-4'>
										<button
											type='submit'
											disabled={!newAnswer.trim() || isSubmittingAnswer}
											className='flex w-full items-center text-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs cursor-pointer'>
											{isSubmittingAnswer ? (
												<SpinnerLoading size='sm' />
											) : (
												<>
													<MessageSquare className='h-4 w-4' />
													<span>Escribir respuesta</span>
												</>
											)}
										</button>
									</div>
								</form>
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

						{post.answers && post.answers.length > 0 ? (
							<div className='space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2'>
								{post.answers.map(answer => (
									<div
										key={answer.id}
										className='bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow'>
										<div className='flex items-start justify-between mb-3'>
											<div className='flex items-center gap-3'>
												<div className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border'>
													{answer.author?.avatar ? (
														<img
															src={answer.author.avatar}
															alt={`${answer.author.firstName} ${answer.author.lastName}`}
															className='h-8 w-8 rounded-full object-cover'
														/>
													) : (
														<User className='h-4 w-4 text-gray-600' />
													)}
												</div>
												<div>
													<p className='text-xs font-medium text-gray-900'>
														{answer.author ? `${answer.author.firstName} ${answer.author.lastName}` : 'Anónimo'}
													</p>
													<p className='text-xs text-gray-500 flex items-center gap-1'>
														<Clock className='h-3 w-3' />
														<span>
															{new Date(answer.createdAt).toLocaleDateString('es-ES', {
																day: 'numeric',
																month: 'short',
																hour: '2-digit',
																minute: '2-digit',
															})}
														</span>
													</p>
												</div>
											</div>

											{answer.isAccepted && (
												<div className='flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs'>
													<CheckCircle className='h-3 w-3' />
													<span>Solución</span>
												</div>
											)}
										</div>

										<div
											className='prose prose-sm max-w-none text-gray-700 mb-3'
											dangerouslySetInnerHTML={{ __html: answer.content }}
										/>

										<div className='flex items-center justify-between pt-3 border-t border-gray-100'>
											<button className='flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-50'>
												<ThumbsUp className='h-3 w-3' />
												<span>{answer.likesCount || 0}</span>
											</button>

											{isAuthor && !post.isSolved && (
												<button className='text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50'>
													Aceptar solución
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						) : (
							<StateBanner title='Aún no hay respuestas' description='Sé el primero en responder' variant='default' />
						)}
					</div>
				</div>
			</div>

			{/* Modal de confirmación */}
			{showDeleteConfirm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg p-4 max-w-sm w-full'>
						<h3 className='text-base font-semibold text-gray-900 mb-2'>Eliminar pregunta</h3>
						<p className='text-gray-600 text-xs mb-4'>¿Estás seguro? Esta acción no se puede deshacer.</p>
						<div className='flex gap-2'>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className='flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs'>
								Cancelar
							</button>
							<button
								onClick={handleDeletePost}
								className='flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs'>
								Eliminar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default PostDetail
