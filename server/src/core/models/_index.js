import { UserModel } from './user-model.js'
import { PostModel } from './post-model.js'
import { TokenModel } from './token-model.js'
import { LikeModel } from './like-model.js'
import { getSafeSequelize } from '../../config/db/instances.js'

let modelsInitialized = false
let models = {}

export const initializeModels = async () => {
	if (!modelsInitialized) {
		const sequelize = await getSafeSequelize()

		// Inicializar modelos
		models.User = UserModel(sequelize)
		models.Token = TokenModel(sequelize)
		models.Post = PostModel(sequelize)
		models.Like = LikeModel(sequelize)

		// Establecer asociaciones
		Object.keys(models).forEach(modelName => {
			if (typeof models[modelName].associate === 'function') models[modelName].associate(models)
		})

		modelsInitialized = true
		console.log('✅ Modelos y asociaciones inicializados correctamente')
	}

	return models
}

export const getModels = () => {
	if (!modelsInitialized) {
		throw new Error('Los modelos no han sido inicializados. Llama a initializeModels() primero.')
	}
	return models
}
