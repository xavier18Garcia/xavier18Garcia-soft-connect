import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// 1. Log inicial - Directorios
const __dirname = path.dirname(fileURLToPath(import.meta.url))
console.log('\n=== INICIO DE CONFIGURACIÓN ===')

// 2. Determinar entorno
const envType = process.env.NODE_ENV || 'development'
console.log('\n🔍 Entorno detectado:', envType)
console.log('⚙️  NODE_ENV original:', process.env.NODE_ENV || 'undefined')

// 3. Cargar variables
const envPath = path.resolve(__dirname, `../../.env.${envType}`)

const envResult = dotenv.config({ path: envPath })
if (envResult.error) {
	console.error('\n❌ ERROR cargando .env:', envResult.error)
} else {
	console.log('\n✅ Archivo .env cargado correctamente')
}

// 4. Configuración por entorno
const config = {
	development: {
		requireAllVars: false,
		logEnv: true,
	},
	production: {
		requireAllVars: true,
		logEnv: false,
	},
	test: {
		requireAllVars: true,
		logEnv: true,
	},
}

const currentConfig = config[envType]
console.log('\n⚙️  Configuración aplicada:', currentConfig)

// 5. Definición de variables (tu estructura actual)
export const env = {
	NODE_ENV: envType,
	SERVER_URL: process.env.SERVER_URL,
	PREFIX: process.env.PREFIX,
	PORT: process.env.PORT || 3000,

	CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || [],

	DB_MAIN: {
		DIALECT: process.env.DB_DIALECT,
		HOST: process.env.DB_HOST,
		PORT: process.env.DB_PORT,
		NAME: process.env.DB_NAME,
		USER: process.env.DB_USER,
		PASS: process.env.DB_PASSWORD,
		SSL: process.env.DB_SSL === 'true',
		logging: envType === 'development',
	},

	JWT: {
		SECRET: process.env.JWT_SECRET,
		EXPIRED: process.env.JWT_EXPIRED,
		REFRESH: process.env.JWT_REFRESH,
	},

	ADMIN_CREDENTIALS: {
		EMAIL: process.env.CREDENTIALS_ADMIN_EMAIL,
		PASS: process.env.CREDENTIALS_ADMIN_PASS,
	},
}

// 6. Validación mejorada
const requiredVariables = [
	'PORT',
	'DB_DIALECT',
	'DB_HOST',
	'DB_NAME',
	'DB_CARNET_DIALECT',
	'DB_CARNET_HOST',
	'DB_CARNET_NAME',
	'JWT_SECRET',
	'JWT_EXPIRED',
]

if (currentConfig.requireAllVars) {
	console.log('\n🔍 Iniciando validación de variables...')

	const missingVars = requiredVariables.filter(varName => {
		const exists = varName.startsWith('DB_')
			? env[`DB_${varName.split('_')[1]}`]?.[varName.split('_')[2]]
			: varName.startsWith('JWT_')
			? env.JWT?.[varName.split('_')[1]]
			: env[varName]

		if (!exists) {
			console.log(`⚠️  Variable no encontrada: ${varName}`)
		}
		return !exists
	})

	if (missingVars.length > 0) {
		console.error('\n❌ Faltan variables requeridas:', missingVars)
		console.log('\n💡 Posibles causas:')
		console.log('- El archivo .env no se cargó correctamente')
		console.log('- Las variables tienen nombres incorrectos')
		console.log('- El archivo está en la ubicación equivocada')
		process.exit(1)
	} else {
		console.log('\n✅ Todas las variables requeridas están presentes')
	}
}

// 8. Log final
console.log('\n=== CONFIGURACIÓN COMPLETADA ===\n')
