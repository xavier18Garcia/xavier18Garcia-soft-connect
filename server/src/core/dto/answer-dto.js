export class AnswerListDTO {
	constructor(answer) {
		this.id = answer.id
		this.content = answer.content
		this.postId = answer.post_id
		this.authorId = answer.author_id
		this.likesCount = answer.likesCount || 0
		this.currentUserHasLiked = answer.currentUserHasLiked || false
		this.createdAt = answer.createdAt
		this.updatedAt = answer.updatedAt
		this.deletedAt = answer.deletedAt

		// Autor de la respuesta
		if (answer.author) {
			this.author = {
				id: answer.author.id,
				firstName: answer.author.first_name,
				lastName: answer.author.last_name,
				email: answer.author.email,
			}
		}

		// Información del post (si está incluida)
		if (answer.post) {
			this.post = {
				id: answer.post.id,
				title: answer.post.title,
				status: answer.post.status,
			}
		}
	}

	static fromArray(answers) {
		return answers.map(answer => new AnswerListDTO(answer))
	}
}

export class AnswerDetailDTO {
	constructor(answer) {
		this.id = answer.id
		this.content = answer.content
		this.postId = answer.post_id
		this.authorId = answer.author_id
		this.likesCount = answer.likesCount || 0
		this.currentUserHasLiked = answer.currentUserHasLiked || false
		this.createdAt = answer.createdAt
		this.updatedAt = answer.updatedAt
		this.deletedAt = answer.deletedAt

		// Autor de la respuesta
		if (answer.author) {
			this.author = {
				id: answer.author.id,
				firstName: answer.author.first_name,
				lastName: answer.author.last_name,
				email: answer.author.email,
			}
		}

		// Información completa del post
		if (answer.post) {
			this.post = {
				id: answer.post.id,
				title: answer.post.title,
				status: answer.post.status,
				authorId: answer.post.author_id,
			}
		}
	}
}
