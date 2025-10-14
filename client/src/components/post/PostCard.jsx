import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { Badge } from '../ui/StatusBadge.jsx'
import { PATH_ROUTES } from '../../common/const/pauthRoute-const.js'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export const PostCard = ({ post }) => {
	const [imageError, setImageError] = useState(false)

	const formatTimeAgo = dateString => {
		const date = new Date(dateString)
		const now = new Date()
		const diffInMinutes = Math.floor((now - date) / (1000 * 60))

		if (diffInMinutes < 60) return `${diffInMinutes}m`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
		return `${Math.floor(diffInMinutes / 1440)}d`
	}

	// Función para extraer imágenes base64 del HTML
	const extractBase64Images = htmlContent => {
		const imgRegex = /<img[^>]+src="data:image\/([a-zA-Z]*);base64,([^">]*)"/g
		const images = []
		let match

		while ((match = imgRegex.exec(htmlContent)) !== null) {
			images.push(`data:image/${match[1]};base64,${match[2]}`)
		}

		return images
	}

	// Función para eliminar imágenes del contenido HTML
	const removeImagesFromHTML = htmlContent => {
		return htmlContent.replace(/<img[^>]*>/g, '')
	}

	// Función para limpiar HTML y obtener texto plano limitado
	const getPlainTextExcerpt = (htmlContent, maxLines = 3) => {
		const tempDiv = document.createElement('div')
		tempDiv.innerHTML = htmlContent
		const text = tempDiv.textContent || tempDiv.innerText || ''

		// Dividir en líneas y limitar a maxLines
		const lines = text.split('\n').filter(line => line.trim() !== '')
		const limitedLines = lines.slice(0, maxLines)

		return limitedLines.join(' ')
	}

	const {
		id,
		title,
		description,
		views = 0,
		likesCount = 0,
		answersCount = 0,
		isSolved = false,
		status,
		createdAt,
		author,
	} = post

	// Extraer imágenes y limpiar descripción
	const images = extractBase64Images(description)
	const cleanDescription = removeImagesFromHTML(description)
	const descriptionExcerpt = getPlainTextExcerpt(cleanDescription, 3)
	const hasImages = images.length > 0
	const firstImage = images[0]
	const remainingImages = Math.max(0, images.length - 1)

	return (
		<div className='bg-gray-50 p-4 rounded-2xl hover:border-gray-300 transition-colors'>
			<div className='flex gap-4'>
				{/* Contenido principal */}
				<div className='flex-1 min-w-0'>
					<div className='flex gap-4'>
						{/* Texto y descripción */}
						<div className='flex-1 min-w-0'>
							{/* Título */}
							<Link to={`/${PATH_ROUTES.POST}/${id}`} className='block group'>
								<h3 className='text-base font-semibold text-gray-600 group-hover:underline transition-all duration-500 line-clamp-2 mb-2'>
									{title}
								</h3>
							</Link>

							{/* Descripción limpia - limitada a 3 líneas */}
							{descriptionExcerpt && (
								<div className='mb-4'>
									<p className='text-gray-500 text-xs line-clamp-3 leading-relaxed'>{descriptionExcerpt}</p>
								</div>
							)}
						</div>

						{/* Imagen única - misma fila que la descripción */}
						{hasImages && (
							<div className='flex-shrink-0'>
								<div className='relative'>
									<img
										src={firstImage}
										alt='Imagen del post'
										className='w-20 h-14 object-cover rounded-lg border border-gray-200 bg-gray-100'
										onError={() => setImageError(true)}
									/>
									{remainingImages > 0 && (
										<div className='absolute -top-1 -right-1 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold'>
											+{remainingImages}
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Badges */}
					<div className='flex items-center gap-2 mb-4'>
						{isSolved && <Badge label='Solucionado' variant='success' />}
						{status === 'closed' && <Badge label='Cerrado' variant='warning' />}
						{status === 'active' && <Badge label='Abierto' variant='info' />}
					</div>

					{/* Meta información - NO interrumpida por la imagen */}
					<div className='flex justify-between items-center pt-4 border-t border-gray-200'>
						{/* Stats: Votos, Respuestas, Vistas */}
						<div className='flex items-center gap-4 text-xs text-gray-500'>
							<div className='flex items-center gap-1'>
								<ThumbsUp className='h-4 w-4' />
								<span>{likesCount} votos</span>
							</div>

							<div className='flex items-center gap-1'>
								<MessageSquare className='h-4 w-4' />
								<span className={answersCount > 0 ? 'text-gray-800 font-medium' : ''}>{answersCount} respuestas</span>
							</div>

							<div className='flex items-center gap-1'>
								<Eye className='h-4 w-4' />
								<span>{views} vistas</span>
							</div>
						</div>

						{/* Autor y fecha */}
						<div className='flex items-center gap-2 text-xs text-gray-500'>
							<div className='flex items-center gap-1'>
								Hace
								<span>{formatTimeAgo(createdAt)}</span>
							</div>
							<span>•</span>
							<span className='text-gray-700 font-medium'>Por {author.email}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
