import bcrypt from 'bcrypt'
import { env } from '../config/env-config.js'
import { UserModel } from '../core/models/user-model.js'
import { ROLES_ALLOW } from '../common/constants/roles-allow.js'
import { STATUS_ALLOW } from '../common/constants/status-allow.js'
import { getSafeSequelize } from '../config/db/instances.js'

const SALT_ROUNDS = 10

export const seedUser = async () => {
	try {
		// Obtener la instancia de Sequelize
		const sequelize = await getSafeSequelize()

		// Crear el modelo con la instancia de Sequelize
		const User = UserModel(sequelize)

		const count = await User.count()

		if (count > 0) {
			console.log('✅ Ya existen registros en la tabla users, se omite el seeder')
			return
		}

		const hashedPassword = await bcrypt.hash(env.ADMIN_CREDENTIALS.PASS, SALT_ROUNDS)

		const godUsers = [
			{
				first_name: 'SUPER',
				last_name: 'ADMIN',
				email: env.ADMIN_CREDENTIALS.EMAIL,
				password: hashedPassword,
				role: ROLES_ALLOW.ADMIN,
				status: STATUS_ALLOW.ACTIVE,
				active: true,
			},
		]

		await User.bulkCreate(godUsers)
		console.log('✅ Seeder para Admin ejecutado correctamente')
	} catch (error) {
		console.error('❌ Error ejecutando el seeder de Admin:', error)
		throw error
	}
}
