import { connectDatabase, syncDatabase, getSafeSequelize } from '../db/instances.js'
import { env } from '../env-config.js'
import { seedUser } from '../../seeders/user-seeder.js'
import { initializeModels } from '../../core/models/_index.js'

const getDBSyncOptions = () => {
	const baseOptions = {
		logging: false,
		hooks: true,
	}

	return env.NODE_ENV === 'development' ? { ...baseOptions, force: false, alter: true } : baseOptions
}

const initializeDatabase = async config => {
	const { name, connectFn, initializeModelsFn, syncFn } = config
	console.log(`\n> INICIALIZANDO ${name} DATABASE <\n`)
	await connectFn()
	await initializeModelsFn()
	await syncFn(getDBSyncOptions())
}

export const initializeAllDatabases = async () => {
	console.log('\n=== INICIO DE INICIALIZACIÓN ===')

	await initializeDatabase({
		name: env.DB_MAIN.NAME,
		connectFn: connectDatabase,
		initializeModelsFn: initializeModels,
		syncFn: syncDatabase,
	})

	// Correr seeders
	await seedUser()

	// Verificación final
	const Sequelize = await getSafeSequelize()

	console.log('\n=== ESTADO FINAL ===')
	console.log(`🔵 DB ${env.DB_MAIN.NAME}: ${Sequelize.authenticate ? 'CONECTADA' : 'DESCONECTADA'}`)
}
