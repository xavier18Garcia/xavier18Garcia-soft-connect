import { Sequelize } from 'sequelize'

export class DatabaseFactory {
	constructor(config) {
		this.config = config
		this.sequelize = null
		this.connected = false
		this.connecting = false
	}

	async connect() {
		console.log(`🔄 Intentando conectar a ${this.config.database}...`)

		if (this.connected) {
			console.log(`ℹ️ ${this.config.database} ya está conectado`)
			return this.sequelize
		}

		if (this.connecting) {
			console.log(`⏳ ${this.config.database} ya se está conectando, esperando...`)
			while (this.connecting) {
				await new Promise(resolve => setTimeout(resolve, 100))
			}
			return this.sequelize
		}

		this.connecting = true
		console.log(`🔧 Creando nueva instancia Sequelize para ${this.config.database}`)
		this.sequelize = new Sequelize(this.config)

		try {
			console.log(`🔌 Autenticando con ${this.config.database}...`)
			await this.sequelize.authenticate()
			this.connected = true
			this.connecting = false
			console.log(`✅ Conexión establecida con ${this.config.database}`)
			return this.sequelize
		} catch (error) {
			this.connecting = false
			console.error(`❌ Error crítico al conectar a ${this.config.database}:`, error.message)
			console.error('Configuración usada:', {
				host: this.config.host,
				port: this.config.port,
				database: this.config.database,
				username: this.config.username,
				dialect: this.config.dialect,
			})
			throw error
		}
	}

	getInstance() {
		if (!this.sequelize) {
			throw new Error(
				`La conexión a la base de datos ${this.config.database} no ha sido establecida. Llama a connect() primero.`
			)
		}
		return this.sequelize
	}

	// Método seguro para obtener la instancia con auto-conexión
	async getSafeInstance() {
		if (!this.connected) await this.connect()
		return this.sequelize
	}

	async sync(options = {}) {
		if (!this.connected) await this.connect()
		console.log(`🔄 Sincronizando base de datos ${this.config.database}...`)

		try {
			const result = await this.sequelize.sync(options)
			console.log(`✅ Base de datos ${this.config.database} sincronizada`)
			return result
		} catch (error) {
			console.error(`❌ Error al sincronizar ${this.config.database}:`, error)
			throw error
		}
	}

	async close() {
		if (this.sequelize && this.connected) {
			await this.sequelize.close()
			console.log(`🔌 Conexión cerrada para ${this.config.database}`)
			this.connected = false
			this.sequelize = null
		}
	}
}
