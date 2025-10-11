import { DataTypes } from 'sequelize'

export const UserModel = sequelize => {
	const User = sequelize.define(
		'User',
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			first_name: {
				type: DataTypes.STRING(42),
				allowNull: true,
			},
			last_name: {
				type: DataTypes.STRING(42),
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING(100),
				allowNull: false,
				validate: { isEmail: true },
				unique: true,
			},
			password: {
				type: DataTypes.STRING(60),
				allowNull: false,
			},
			role: {
				type: DataTypes.ENUM('admin', 'student'),
				allowNull: false,
				defaultValue: 'student',
			},
			status: {
				type: DataTypes.ENUM('active', 'inactive', 'pending'),
				allowNull: false,
				defaultValue: 'pending',
			},
			active: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
		},
		{
			tableName: 'users',
			timestamps: true, // createdAt y updatedAt
			paranoid: true, // Soft delete (agrega deletedAt)
			indexes: [
				{ unique: true, fields: ['email'] },
				{ fields: ['role'] },
				{ fields: ['status'] },
				{ fields: ['active'] },
			],
		}
	)

	// Definir asociaciones (se ejecutará desde initializeModels)
	User.associate = models => {
		User.hasMany(models.Token, {
			foreignKey: 'user_fk',
			as: 'tokens',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		})
		User.hasMany(models.Post, {
			foreignKey: 'author_id',
			as: 'posts',
		})
	}

	return User
}
