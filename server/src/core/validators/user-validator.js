import { z } from 'zod'
import { STATUS_ALLOW } from '../../common/constants/status-allow.js'

export const userIdSchema = z.object({
	id: z.string().uuid('ID debe ser un UUID válido'),
})

export const listUsersQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.default('1')
		.transform(val => parseInt(val, 10))
		.refine(val => !isNaN(val) && val > 0, 'Página debe ser un número positivo'),
	limit: z
		.string()
		.optional()
		.default('10')
		.transform(val => parseInt(val, 10))
		.refine(val => !isNaN(val) && val > 0 && val <= 100, 'Límite debe ser entre 1 y 100'),
	search: z.string().optional(),
	role: z.enum(['admin', 'student']).optional(),
	status: z.enum(['active', 'inactive', 'pending']).optional(),
})

export const createUserSchema = z.object({
	first_name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(50, 'El nombre no puede exceder 50 caracteres')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios')
		.optional(),

	last_name: z
		.string()
		.min(2, 'El apellido debe tener al menos 2 caracteres')
		.max(50, 'El apellido no puede exceder 50 caracteres')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El apellido solo puede contener letras y espacios')
		.optional(),

	email: z.string().email('Email inválido').max(100, 'El email no puede exceder 100 caracteres'),

	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.max(100, 'La contraseña no puede exceder 100 caracteres')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
		),
})

export const updateUserSchema = z.object({
	first_name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(50, 'El nombre no puede exceder 50 caracteres')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios')
		.optional(),

	last_name: z
		.string()
		.min(2, 'El apellido debe tener al menos 2 caracteres')
		.max(50, 'El apellido no puede exceder 50 caracteres')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'El apellido solo puede contener letras y espacios')
		.optional(),

	email: z.string().email('Email inválido').max(100, 'El email no puede exceder 100 caracteres').optional(),

	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.max(100, 'La contraseña no puede exceder 100 caracteres')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
		)
		.optional(),

	status: z.enum([STATUS_ALLOW.ACTIVE, STATUS_ALLOW.INACTIVE, STATUS_ALLOW.PENDING]).optional(),
})
