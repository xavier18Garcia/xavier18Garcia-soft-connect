import { DataTypes } from 'sequelize'

export const PostModel = sequelize => {
	const Post = sequelize.define(
		'Post',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			title: {
				type: DataTypes.STRING(255),
				allowNull: false,
				validate: {
					notEmpty: { msg: 'El título es requerido' },
					len: {
						args: [10, 255],
						msg: 'El título debe tener entre 10 y 255 caracteres',
					},
				},
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: { msg: 'La descripción es requerida' },
				},
			},
			author_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id',
				},
			},
			views: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			likes_count: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			status: {
				type: DataTypes.ENUM('active', 'closed', 'deleted'),
				defaultValue: 'active',
			},
			is_solved: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			answers_count: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
		},
		{
			tableName: 'posts',
			timestamps: true,
			underscored: true,
			paranoid: true,
			indexes: [
				{
					fields: ['author_id'],
				},
				{
					fields: ['status', 'created_at'],
				},
			],
		}
	)

	// Definir asociaciones (se llamará después desde initializeModels)
	Post.associate = models => {
		Post.belongsTo(models.User, {
			foreignKey: 'author_id',
			as: 'author',
		})
		Post.hasMany(models.Like, {
			foreignKey: 'post_id',
			as: 'likes',
			onDelete: 'CASCADE',
		})
		Post.hasMany(models.Answer, {
			foreignKey: 'post_id',
			as: 'answers',
			onDelete: 'CASCADE',
		})
	}

	return Post
}
