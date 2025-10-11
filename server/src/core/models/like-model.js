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
				allowNull: false,
				references: {
					model: 'posts',
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
				{
					unique: true,
					fields: ['post_id', 'user_id'],
					name: 'unique_like_per_user_post',
				},
				{
					fields: ['post_id'],
				},
				{
					fields: ['user_id'],
				},
			],
		}
	)

	// Definir asociaciones
	Like.associate = models => {
		Like.belongsTo(models.Post, {
			foreignKey: 'post_id',
			as: 'post',
			onDelete: 'CASCADE',
		})

		Like.belongsTo(models.User, {
			foreignKey: 'user_id',
			as: 'user',
			onDelete: 'CASCADE',
		})
	}

	return Like
}
