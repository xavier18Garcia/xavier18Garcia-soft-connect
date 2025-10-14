import { DataTypes } from 'sequelize'

export const LikeModel = sequelize => {
	const Like = sequelize.define(
		'Like',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			post_id: {
				type: DataTypes.UUID,
				allowNull: true, // Ahora es nullable porque puede ser like a post O answer
				references: {
					model: 'posts',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			answer_id: {
				type: DataTypes.UUID,
				allowNull: true, // Ahora es nullable porque puede ser like a post O answer
				references: {
					model: 'answers',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			user_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
		},
		{
			tableName: 'likes',
			timestamps: true,
			underscored: true,
			paranoid: false,
			indexes: [
				// Un usuario solo puede dar un like por post
				{
					unique: true,
					fields: ['post_id', 'user_id'],
					name: 'unique_like_per_user_post',
					where: {
						post_id: { [sequelize.Sequelize.Op.ne]: null },
					},
				},
				// Un usuario solo puede dar un like por respuesta
				{
					unique: true,
					fields: ['answer_id', 'user_id'],
					name: 'unique_like_per_user_answer',
					where: {
						answer_id: { [sequelize.Sequelize.Op.ne]: null },
					},
				},
				{
					fields: ['post_id'],
					name: 'idx_likes_post_id',
				},
				{
					fields: ['answer_id'],
					name: 'idx_likes_answer_id',
				},
				{
					fields: ['user_id'],
					name: 'idx_likes_user_id',
				},
			],
			validate: {
				// Validación personalizada: debe tener post_id O answer_id, pero no ambos ni ninguno
				eitherPostOrAnswer() {
					if (!this.post_id && !this.answer_id) {
						throw new Error('El like debe estar asociado a un post o a una respuesta')
					}
					if (this.post_id && this.answer_id) {
						throw new Error('El like no puede estar asociado a un post y una respuesta al mismo tiempo')
					}
				},
			},
		}
	)

	// Definir asociaciones
	Like.associate = models => {
		// Un like puede pertenecer a un post
		Like.belongsTo(models.Post, {
			foreignKey: 'post_id',
			as: 'post',
			onDelete: 'CASCADE',
		})

		// Un like puede pertenecer a una respuesta
		Like.belongsTo(models.Answer, {
			foreignKey: 'answer_id',
			as: 'answer',
			onDelete: 'CASCADE',
		})

		// Un like pertenece a un usuario
		Like.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
			onDelete: 'CASCADE',
		})
	}

	return Like
}
