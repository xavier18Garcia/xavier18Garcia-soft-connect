import { z } from 'zod'

export const createPostSchema = z.object({
	title: z
		.string()
		.min(10, 'El título debe tener al menos 10 caracteres')
		.max(255, 'El título no puede exceder 255 caracteres')
		.trim(),
	description: z.string().min(1, 'La descripción es requerida'),
})

export const updatePostSchema = z.object({
	title: z
		.string()
		.min(10, 'El título debe tener al menos 10 caracteres')
		.max(255, 'El título no puede exceder 255 caracteres')
		.trim()
		.optional(),
	description: z.string().min(1, 'La descripción es requerida').optional(),
})
export const listPostsQuerySchema = z.object({
	search: z.string().optional(),
	status: z.enum(['active', 'closed', 'deleted']).optional(),
	is_solved: z
		.union([
			z.boolean(),
			z.string().transform(val => val === 'true'),
			z
				.string()
				.transform(val => val === 'false')
				.transform(val => !val),
		])
		.optional(),
	page: z.coerce.number().int().positive().optional().default(1),
	limit: z.coerce.number().int().positive().max(100).optional().default(10),
	authorId: z.string().uuid().optional(),
})

export const postIdSchema = z.object({
	id: z.string().uuid('ID de post inválido'),
})
