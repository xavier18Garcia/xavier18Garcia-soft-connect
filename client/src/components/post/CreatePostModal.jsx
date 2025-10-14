import 'quill/dist/quill.snow.css'
import { useQuill } from 'react-quilljs'
import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'

const QuillEditor = ({ value, onChange }) => {
	const modules = useMemo(
		() => ({
			toolbar: [
				[{ header: [1, 2, 3, false] }],
				['bold', 'italic', 'underline', 'strike'],
				[{ list: 'ordered' }, { list: 'bullet' }],
				[{ color: [] }, { background: [] }],
				['blockquote', 'code-block'],
				['link', 'image'],
				['clean'],
			],
		}),
		[]
	)

	const { quill, quillRef } = useQuill({
		theme: 'snow',
		modules,
		placeholder: 'Describe tu pregunta en detalle... Puedes usar formato de texto, listas, código, imágenes, etc.',
	})

	// Sincronizar cambios del editor con el estado padre
	useEffect(() => {
		if (quill) {
			quill.on('text-change', () => {
				const html = quill.root.innerHTML
				onChange(html)
			})
		}
	}, [quill, onChange])

	// Sincronizar el valor inicial o cambios externos
	useEffect(() => {
		if (quill && value !== undefined) {
			const currentContent = quill.root.innerHTML
			// Solo actualizar si el contenido es diferente para evitar loops
			if (value !== currentContent && value !== '') quill.root.innerHTML = value
		}
	}, [quill, value])

	return (
		<div className='relative'>
			<div ref={quillRef} style={{ minHeight: '250px' }} />
		</div>
	)
}

const PreviewPanel = ({ title, description }) => {
	// Limpiar el HTML vacío de Quill
	const cleanDescription = description && description !== '' ? description : ''

	return (
		<div className='h-full flex flex-col'>
			<div className='flex-1 overflow-y-auto p-4'>
				{/* Vista previa del título */}
				<h1 className='text-xl font-bold text-gray-900 mb-4 break-words'>
					{title || <span className='text-gray-400'>Título de tu pregunta</span>}
				</h1>

				{/* Vista previa del contenido */}
				{cleanDescription ? (
					<div className='preview-content' dangerouslySetInnerHTML={{ __html: cleanDescription }} />
				) : (
					<p className='text-gray-400 text-sm italic'>La vista previa del contenido aparecerá aquí...</p>
				)}
			</div>
		</div>
	)
}

export function CreatePostModal({ isOpen, onClose, onSubmit }) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState({})
	const [isExpanded, setIsExpanded] = useState(false)

	// Resetear formulario cuando se cierra el modal
	useEffect(() => {
		if (!isOpen) {
			resetForm()
		}
	}, [isOpen])

	// Validar formulario
	const validateForm = () => {
		const newErrors = {}

		if (!title.trim()) {
			newErrors.title = 'El título es requerido'
		} else if (title.trim().length < 10) {
			newErrors.title = 'El título debe tener al menos 10 caracteres'
		} else if (title.trim().length > 200) {
			newErrors.title = 'El título no puede exceder 200 caracteres'
		}

		// Validar que la descripción no esté vacía (considerando el HTML de Quill)
		const tempDiv = document.createElement('div')
		tempDiv.innerHTML = description
		const textContent = tempDiv.textContent || tempDiv.innerText || ''

		if (!textContent.trim()) newErrors.description = 'La descripción es requerida'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// Enviar formulario
	const handleSubmit = async e => {
		e.preventDefault()

		if (!validateForm()) return

		setIsSubmitting(true)

		try {
			await onSubmit({
				title: title.trim(),
				description,
			})

			// Limpiar formulario después del éxito
			resetForm()
			onClose()
		} catch (error) {
			console.error('Error al crear la pregunta:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Resetear formulario
	const resetForm = () => {
		setTitle('')
		setDescription('')
		setErrors({})
		setIsExpanded(false)
	}

	// Cerrar modal
	const handleClose = () => {
		if (!isSubmitting) {
			resetForm()
			onClose()
		}
	}

	if (!isOpen) return null

	const previewStyles = `
		.preview-content {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			line-height: 1.6;
			color: #374151;
		}
		.preview-content h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
		.preview-content h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
		.preview-content h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
		.preview-content p { margin: 1em 0; }
		.preview-content strong { font-weight: 700; }
		.preview-content em { font-style: italic; }
		.preview-content u { text-decoration: underline; }
		.preview-content s { text-decoration: line-through; }
		.preview-content ol { list-style: decimal; margin-left: 1.5em; padding-left: 0.5em; }
		.preview-content ul { list-style: disc; margin-left: 1.5em; padding-left: 0.5em; }
		.preview-content li { margin: 0.5em 0; }
		.preview-content blockquote {
			border-left: 4px solid #e5e7eb;
			padding-left: 1em;
			margin: 1em 0;
			color: #6b7280;
			font-style: italic;
		}
		.preview-content pre {
			background-color: #1f2937;
			color: #f9fafb;
			padding: 1em;
			border-radius: 0.375rem;
			overflow-x: auto;
			margin: 1em 0;
		}
		.preview-content code {
			background-color: #f3f4f6;
			padding: 0.2em 0.4em;
			border-radius: 0.25rem;
			font-family: 'Courier New', monospace;
			font-size: 0.9em;
		}
		.preview-content pre code {
			background-color: transparent;
			padding: 0;
			color: inherit;
		}
		.preview-content a {
			color: #2563eb;
			text-decoration: underline;
		}
		.preview-content img {
			max-width: 100%;
			height: auto;
			margin: 1em 0;
			border-radius: 0.375rem;
		}
		.preview-content .ql-indent-1 { margin-left: 3em; }
		.preview-content .ql-indent-2 { margin-left: 6em; }
		.preview-content .ql-indent-3 { margin-left: 9em; }
	`

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: previewStyles }} />

			<div className='fixed inset-0 z-50 overflow-y-auto'>
				{/* Overlay */}
				<div className='fixed inset-0 bg-black/50 transition-opacity' onClick={handleClose} />

				{/* Modal Container */}
				<div
					className={`flex ${
						isExpanded ? 'items-center justify-center min-h-screen' : 'items-end justify-center min-h-screen'
					} p-4`}>
					<div
						className={`relative bg-white flex flex-col transition-all duration-300 ${
							isExpanded ? 'w-full max-w-full h-[95vh] rounded-2xl' : 'w-full max-w-6xl rounded-2xl max-h-[70vh]'
						}`}>
						{/* Header */}
						<div className='flex items-center justify-between px-6 py-3 border-b border-gray-200 flex-shrink-0'>
							<div className='flex-1'>
								<h2 className='font-bold text-gray-900'>Nueva Pregunta</h2>
								<p className='text-xs text-gray-500'>Comparte tu pregunta con la comunidad</p>
							</div>
							<div className='flex items-center space-x-2'>
								{/* Botón Expandir/Contraer */}
								<button
									onClick={() => setIsExpanded(!isExpanded)}
									disabled={isSubmitting}
									className='text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2 hover:bg-gray-100 rounded-lg cursor-pointer'
									aria-label={isExpanded ? 'Contraer' : 'Expandir'}>
									{isExpanded ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
								</button>
								{/* Botón Cerrar */}
								<button
									onClick={handleClose}
									disabled={isSubmitting}
									className='text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-2 hover:bg-gray-100 rounded-lg cursor-pointer'
									aria-label='Cerrar modal'>
									<X className='h-4 w-4' />
								</button>
							</div>
						</div>

						{/* Body - Scrollable */}
						<div className='flex-1 overflow-y-auto'>
							<div className='flex h-full'>
								{/* Panel de Edición */}
								<div className='flex-1 border-r border-gray-200'>
									<div className='p-6 space-y-6'>
										{/* Título */}
										<div>
											<label className='block text-sm font-semibold text-gray-700 mb-2'>
												Título<span className='text-red-500'>*</span>
											</label>
											<input
												type='text'
												value={title}
												onChange={e => {
													setTitle(e.target.value)
													if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
												}}
												placeholder='Ej: ¿Cómo puedo optimizar mi código React?'
												maxLength={200}
												className={`w-full p-2 px-0 text-sm border-b text-gray-900 border-gray-300 placeholder-gray-400 transition-colors duration-200 focus:outline-none ${
													errors.title ? 'border-red-400 focus:border-red-600' : 'focus:border-gray-600'
												} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
												disabled={isSubmitting}
											/>
											<div className='flex justify-between items-start mt-2'>
												{errors.title && (
													<div className='flex items-center space-x-1 text-red-600 text-xs'>
														<AlertCircle className='h-4 w-4' />
														<span>{errors.title}</span>
													</div>
												)}
												<span className='text-xs text-gray-400 ml-auto'>{title.length}/200</span>
											</div>
										</div>

										{/* Descripción con Editor Quill */}
										<div>
											<label className='block text-sm font-semibold text-gray-700 mb-2'>
												Descripción<span className='text-red-500'>*</span>
											</label>
											<div className={`overflow-hidden ${errors.description ? 'border-red-300 border' : ''}`}>
												<QuillEditor
													value={description}
													onChange={value => {
														setDescription(value)
														if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
													}}
												/>
											</div>
											{errors.description ? (
												<div className='flex items-center space-x-1 mt-2 text-red-600 text-xs'>
													<AlertCircle className='h-4 w-4' />
													<span>{errors.description}</span>
												</div>
											) : (
												<p className='text-xs text-gray-500 mt-2'>
													Explica tu problema con el mayor detalle posible. Usa la barra de herramientas para formatear
													texto, añadir imágenes, código, etc.
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Panel de Vista Previa */}
								<div className='flex-1 flex flex-col bg-gray-50'>
									<div className='px-4 py-3 border-b border-gray-200 bg-white'>
										<h3 className='text-sm font-semibold text-gray-700'>Vista Previa</h3>
									</div>
									<PreviewPanel title={title} description={description} />
								</div>
							</div>
						</div>

						{/* Footer con botones */}
						<div className='px-6 py-3 border-t border-gray-200 flex-shrink-0'>
							<div className='flex items-center justify-between'>
								<p className='text-xs text-gray-500'>
									<span className='text-red-500'>*</span> Campos obligatorios
								</p>
								<div className='flex space-x-3'>
									<button
										type='button'
										onClick={handleClose}
										disabled={isSubmitting}
										className='px-6 py-2.5 cursor-pointer text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs'>
										Cancelar
									</button>
									<button
										type='button'
										onClick={handleSubmit}
										disabled={isSubmitting}
										className='px-6 py-2.5 bg-gray-600 cursor-pointer text-white rounded-xl font-medium hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md text-xs'>
										{isSubmitting ? (
											<>
												<Loader2 className='h-4 w-4 animate-spin' />
												<span>Publicando...</span>
											</>
										) : (
											<span>Publicar Pregunta</span>
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
