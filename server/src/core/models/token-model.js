import { DataTypes } from 'sequelize'

export const TokenModel = sequelize => {
	const Token = sequelize.define(
		'Token',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			token: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			used: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			user_fk: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users', // Nombre de la tabla
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			expires_at: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isDate: true,
					isAfter: new Date().toISOString(),
				},
			},
			token_type: {
				type: DataTypes.ENUM('access', 'refresh', 'reset', 'verification'),
				allowNull: false,
			},
		},
		{
			tableName: 'tokens',
			timestamps: true,
			paranoid: true, // Soft delete
			indexes: [
				{
					name: 'idx_token_unique',
					fields: ['token'],
				},
				{
					name: 'idx_active_tokens',
					fields: ['used'],
					where: {
						used: false,
					},
				},
				{
					name: 'idx_user_tokens',
					fields: ['user_fk'],
				},
				{
					name: 'idx_token_expiration',
					fields: ['expires_at'],
				},
			],
			hooks: {
				beforeValidate: token => {
					if (!token.expires_at && token.token_type) {
						const expires = new Date()
						const ttl = {
							access: 1 * 24 * 60 * 1000, // 1d
							refresh: 7 * 24 * 60 * 60 * 1000, // 7d
							reset: 24 * 60 * 60 * 1000, // 24 horas
							verification: 48 * 60 * 60 * 1000, // 48 horas
						}[token.token_type]

						expires.setTime(expires.getTime() + ttl)
						token.expires_at = expires
					}
				},
			},
		}
	)

	// Definir asociaciones (se ejecutará desde initializeModels)
	Token.associate = models => {
		Token.belongsTo(models.User, {
			foreignKey: 'user_fk',
			as: 'user',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		})
	}

	return Token
}
