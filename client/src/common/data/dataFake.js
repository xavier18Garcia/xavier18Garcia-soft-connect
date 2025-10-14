export const mockPosts = [
	{
		id: 1,
		title: '¿Cómo resolver ecuaciones cuadráticas?',
		content: 'Necesito ayuda para entender el método de factorización en ecuaciones cuadráticas...',
		author: { name: 'María García', avatar: null, role: 'student' },
		category: 'Matemáticas',
		tags: ['algebra', 'ecuaciones', 'bachillerato'],
		votes: 15,
		answers: 3,
		views: 127,
		createdAt: '2024-01-15T10:30:00Z',
		solved: true,
		featured: false,
	},
	{
		id: 2,
		title: 'Mejores técnicas de estudio para exámenes finales',
		content: 'Se acercan los finales y necesito consejos para organizar mi tiempo de estudio...',
		author: { name: 'Carlos López', avatar: null, role: 'student' },
		category: 'Técnicas de Estudio',
		tags: ['estudio', 'examenes', 'productividad'],
		votes: 28,
		answers: 7,
		views: 245,
		createdAt: '2024-01-14T16:45:00Z',
		solved: false,
		featured: true,
	},
]

export const mockCategories = [
	{ id: 1, name: 'Matematicas', count: 45, color: 'bg-blue-500' },
	{ id: 2, name: 'Comunicacion', count: 32, color: 'bg-green-500' },
	{ id: 4, name: 'Técnicas de Estudio', count: 19, color: 'bg-orange-500' },
	{ id: 5, name: 'Programación', count: 56, color: 'bg-red-500' },
]
