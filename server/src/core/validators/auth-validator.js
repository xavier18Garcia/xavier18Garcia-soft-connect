import { z } from 'zod'

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'El email es requerido' })
		.email('Debe ser un email válido')
		.max(100, 'Máximo 100 caracteres'),

	password: z
		.string({ required_error: 'La contraseña es requerida' })
		.min(1, 'La contraseña es requerida')
		.max(255, 'Máximo 255 caracteres'),
})

export const registerSchema = z.object({
	email: z
		.string({ required_error: 'El email es requerido' })
		.email('Debe ser un email válido')
		.max(100, 'Máximo 100 caracteres')
		.refine(val => val.toLowerCase().endsWith('@ueb.edu.ec') || val.toLowerCase().endsWith('@mailes.ueb.edu.ec'), {
			message: 'Solo se permiten correos con @ueb.edu.ec y @mailes.ueb.edu.ec',
		}),

	password: z
		.string({ required_error: 'La contraseña es requerida' })
		.min(1, 'La contraseña es requerida')
		.max(255, 'Máximo 255 caracteres'),
})
