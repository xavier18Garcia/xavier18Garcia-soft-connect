export class UserListDTO {
	constructor(user) {
		this.id = user.id
		this.firstName = user.first_name
		this.lastName = user.last_name
		this.email = user.email
		this.status = user.status
		this.role = user.role
		//this.password = user.password
		this.createdAt = user.createdAt
		this.updatedAt = user.updatedAt
	}

	static fromArray(users) {
		return users.map(user => new UserListDTO(user))
	}
}

export class UserDetailDTO {
	constructor(user) {
		this.id = user.id
		this.firstName = user.first_name
		this.lastName = user.last_name
		this.email = user.email
		this.status = user.status
		this.role = user.role
		this.address = user.address
		this.createdAt = user.createdAt
		this.updatedAt = user.updatedAt
	}
}
