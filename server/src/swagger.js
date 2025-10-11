import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env-config.js'
import { apiReference } from '@scalar/express-api-reference'

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Soft Connect API',
		version: '1.0.0',
		description: 'Documentación de endpoints de Soft Connect',
		contact: {
			name: 'API Support',
			email: 'support@softconnect.com',
		},
	},
	servers: [
		{
			url: `${env.SERVER_URL}:${env.PORT}/api/v1`,
			description: 'Servidor de desarrollo',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			Error: {
				type: 'object',
				properties: {
					statusCode: { type: 'integer', example: 400 },
					message: { type: 'string', example: 'Error message' },
					data: { type: 'object', nullable: true },
				},
			},
			SuccessResponse: {
				type: 'object',
				properties: {
					statusCode: { type: 'integer', example: 200 },
					message: { type: 'string', example: 'Success' },
					data: { type: 'object' },
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
}

const options = {
	swaggerDefinition,
	apis: ['./src/core/routes/*.js', './src/core/controllers/*.js'],
}

export const swaggerSpec = swaggerJSDoc(options)

// 1. VERIFICAR QUE EL ESPECIFICACIÓN SWAGGER SEA VÁLIDA
const validateSwaggerSpec = spec => {
	if (!spec.openapi || !spec.info || !spec.info.title) {
		console.error('❌ Esquema Swagger inválido: falta información básica')
		return false
	}

	// Verificar que hay paths definidos
	if (!spec.paths || Object.keys(spec.paths).length === 0) {
		console.warn('⚠️  No hay endpoints documentados en la especificación Swagger')
	}

	return true
}

export const swaggerDocs = app => {
	// 2. VALIDAR LA ESPECIFICACIÓN ANTES DE CONFIGURAR
	if (!validateSwaggerSpec(swaggerSpec)) {
		console.error('No se puede inicializar la documentación debido a errores en el esquema')
		return
	}

	// 3. SERVIR EL ARCHIVO JSON PRIMERO (IMPORTANTE)
	app.get('/api-docs.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.send(swaggerSpec)
	})

	// 4. CONFIGURAR SWAGGER UI (FUNCIONALIDAD BÁSICA)
	app.use(
		'/api-docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			explorer: true,
			customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
      `,
			customSiteTitle: 'Soft Connect API Docs',
		})
	)

	// 5. CONFIGURACIÓN CORREGIDA PARA SCALAR - SEGÚN DOCUMENTACIÓN OFICIAL :cite[2]:cite[10]
	try {
		// Configuración según documentación oficial de Scalar
		app.use(
			'/scalar-docs',
			apiReference({
				// Usar URL relativa para evitar problemas de CORS :cite[2]
				url: '/api-docs.json',
				// Tema personalizado (opcional)
				theme: 'default',
				// Configuración adicional para mejor rendimiento
				layout: 'modern',
				// Habilitar modo oscuro
				darkMode: true,
				// Mostrar botones de prueba
				hideTestRequestButton: false,
			})
		)

		console.log(`✅ Scalar configurado correctamente: ${env.SERVER_URL}:${env.PORT}/scalar-docs`)
	} catch (error) {
		console.error('❌ Error al configurar Scalar:', error.message)
		console.log('⚠️  Usando solo Swagger UI como alternativa')
	}

	console.log(`📄 Swagger UI disponible en: ${env.SERVER_URL}:${env.PORT}/api-docs`)
	console.log(`📄 Scalar docs disponible en: ${env.SERVER_URL}:${env.PORT}/scalar-docs`)
	console.log(`📄 Especificación JSON disponible en: ${env.SERVER_URL}:${env.PORT}/api-docs.json`)
}
