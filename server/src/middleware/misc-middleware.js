import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from '../config/env-config.js'

export const miscMiddlewares = app => {
	app.use(
		cors({
			origin: env.CORS_ORIGINS,
			credentials: true,
		})
	)

	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'", "'unsafe-eval'"],
					styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
					imgSrc: ["'self'", 'data:', 'https:'],
					connectSrc: ["'self'", 'https://registry.scalar.com', 'https://proxy.scalar.com'],
					frameSrc: ["'self'"],
					objectSrc: ["'none'"],
				},
			},
		})
	)
	app.use(morgan('dev'))
	app.use(cookieParser())
	app.use(express.json({ limit: '10mb' }))
	app.use(express.urlencoded({ extended: true, limit: '10mb' }))
}
