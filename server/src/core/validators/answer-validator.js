import { z } from 'zod'

// Schema para crear una respuesta
export const createAnswerSchema = z.object({
	content: z
		.string({
			required_error: 'El contenido es requerido',
			invalid_type_error: 'El contenido debe ser un texto',
		})
		.min(10, 'El contenido debe tener al menos 10 caracteres')
		.trim(),
	postId: z
		.string({
			required_error: 'El ID del post es requerido',
			invalid_type_error: 'El ID del post debe ser un UUID válido',
		})
		.uuid('El ID del post debe ser un UUID válido'),
})

// Schema para actualizar una respuesta
export const updateAnswerSchema = z.object({
	content: z
		.string({
			required_error: 'El contenido es requerido',
			invalid_type_error: 'El contenido debe ser un texto',
		})
		.min(10, 'El contenido debe tener al menos 10 caracteres')
		.max(10000, 'El contenido no puede exceder 10000 caracteres')
		.trim(),
})

// Schema para validar parámetros de consulta al listar respuestas
export const listAnswersQuerySchema = z.object({
	postId: z.string().uuid('El ID del post debe ser un UUID válido').optional(),
	authorId: z.string().uuid('El ID del autor debe ser un UUID válido').optional(),
	search: z.string().trim().optional(),
	page: z
		.string()
		.regex(/^\d+$/, 'La página debe ser un número')
		.transform(Number)
		.pipe(z.number().int().positive('La página debe ser un número positivo'))
		.default('1'),
	limit: z
		.string()
		.regex(/^\d+$/, 'El límite debe ser un número')
		.transform(Number)
		.pipe(
			z.number().int().positive('El límite debe ser un número positivo').max(100, 'El límite no puede ser mayor a 100')
		)
		.default('10'),
})

// Schema para validar ID de respuesta en parámetros de ruta
export const answerIdSchema = z.object({
	id: z
		.string({
			required_error: 'El ID de la respuesta es requerido',
			invalid_type_error: 'El ID debe ser un texto',
		})
		.uuid('El ID de la respuesta debe ser un UUID válido'),
})

// Schema para validar ID de post en parámetros de ruta (para getByPost)
export const postIdParamSchema = z.object({
	postId: z
		.string({
			required_error: 'El ID del post es requerido',
			invalid_type_error: 'El ID debe ser un texto',
		})
		.uuid('El ID del post debe ser un UUID válido'),
})
