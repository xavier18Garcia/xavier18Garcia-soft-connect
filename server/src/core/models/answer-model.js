import { DataTypes } from 'sequelize'

export const AnswerModel = sequelize => {
	const Answer = sequelize.define(
		'Answer',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: { msg: 'El contenido de la respuesta es requerido' },
				},
			},
			post_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'posts',
					key: 'id',
				},
				onDelete: 'CASCADE',
			},
			author_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
			},
		},
		{
			tableName: 'answers',
			timestamps: true,
			underscored: true,
			paranoid: true, // Soft delete
			indexes: [
				{
					fields: ['post_id'],
					name: 'idx_answers_post_id',
				},
				{
					fields: ['author_id'],
					name: 'idx_answers_author_id',
				},
				{
					fields: ['created_at'],
					name: 'idx_answers_status_created',
				},
			],
		}
	)

	// Definir asociaciones
	Answer.associate = models => {
		// Una respuesta pertenece a un post
		Answer.belongsTo(models.Post, {
			foreignKey: 'post_id',
			as: 'post',
		})

		// Una respuesta pertenece a un usuario (autor)
		Answer.belongsTo(models.User, {
			foreignKey: 'author_id',
			as: 'author',
		})

		// Una respuesta puede tener muchos likes
		Answer.hasMany(models.Like, {
			foreignKey: 'answer_id',
			as: 'likes',
			onDelete: 'CASCADE',
		})

		// Opcional: Una respuesta puede tener comentarios (si implementas esta feature)
		// Answer.hasMany(models.Comment, {
		// 	foreignKey: 'answer_id',
		// 	as: 'comments',
		// 	onDelete: 'CASCADE',
		// })
	}

	return Answer
}
