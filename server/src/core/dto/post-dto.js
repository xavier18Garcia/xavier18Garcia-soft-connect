export class PostListDTO {
	constructor(post) {
		this.id = post.id
		this.title = post.title
		this.description = post.description
		this.views = post.views
		this.likesCount = post.likes_count
		this.answersCount = post.answers_count
		this.isSolved = post.is_solved
		this.status = post.status
		this.currentUserHasLiked = post.currentUserHasLiked || false
		this.createdAt = post.createdAt
		this.updatedAt = post.updatedAt
		this.deletedAt = post.deletedAt
		if (post.author) {
			this.author = {
				id: post.author.id,
				firstName: post.author.first_name,
				lastName: post.author.last_name,
				email: post.author.email,
			}
		}
	}

	static fromArray(posts) {
		return posts.map(post => new PostListDTO(post))
	}
}

export class PostDetailDTO {
	constructor(post) {
		this.id = post.id
		this.title = post.title
		this.description = post.description
		this.views = post.views
		this.likesCount = post.likes_count
		this.answersCount = post.answers_count
		this.isSolved = post.is_solved
		this.status = post.status
		this.currentUserHasLiked = post.currentUserHasLiked || false
		this.createdAt = post.createdAt
		this.updatedAt = post.updatedAt
		this.deletedAt = post.deletedAt
		if (post.author) {
			this.author = {
				id: post.author.id,
				firstName: post.author.first_name,
				lastName: post.author.last_name,
				email: post.author.email,
			}
		}
	}
}
