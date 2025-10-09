import { env } from '../env-config.js'
import { DatabaseFactory } from './database-factory.js'

// Configuración común para ambas bases de datos
const commonDbConfig = {
	logging: false,
	pool: {
		max: env.NODE_ENV === 'production' ? 10 : 5,
		min: env.NODE_ENV === 'production' ? 2 : 1,
		acquire: 30000,
		idle: 10000,
		evict: 10000,
	},
	define: {
		timestamps: false,
		freezeTableName: true,
	},
	retry: {
		max: 3,
		match: [/ECONNREFUSED/, /EHOSTUNREACH/, /ENOTFOUND/, /EAI_AGAIN/, /ETIMEDOUT/],
	},
	dialectOptions:
		env.NODE_ENV === 'production' && env.DB_SSL === 'true'
			? {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
			  }
			: {},
}

const getDbConfig = () => ({
	dialect: env.DB_MAIN.DIALECT,
	port: parseInt(env.DB_MAIN.PORT),
	host: env.DB_MAIN.HOST,
	database: env.DB_MAIN.NAME,
	username: env.DB_MAIN.USER,
	password: env.DB_MAIN.PASS,
	...commonDbConfig,
})

// Crear instancias
const Database = new DatabaseFactory(getDbConfig())

// Exportar funciones
export const connectDatabase = () => Database.connect()

// Función segura para obtener instancia
export const getSequelize = () => Database.getInstance()

//Funciones seguras con auto-conexión
export const getSafeSequelize = () => Database.getSafeInstance()

export const syncDatabase = (options = {}) => Database.sync(options)
export const closeDatabase = () => Database.close()

// Manejo de cierre de la aplicación
const cleanup = async () => {
	try {
		await closeDatabase()
		console.log('🔌 Todas las conexiones de base de datos cerradas')
	} catch (error) {
		console.error('Error al cerrar conexiones:', error)
	}
}

process.on('SIGINT', async () => {
	await cleanup()
	process.exit(0)
})

process.on('SIGTERM', async () => {
	await cleanup()
	process.exit(0)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', error => {
	console.error('Uncaught Exception:', error)
	cleanup().finally(() => process.exit(1))
})
