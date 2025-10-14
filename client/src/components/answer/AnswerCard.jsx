import { CheckCircle, Clock, Heart, User } from 'lucide-react'

export const AnswerCard = ({ answer, isAuthor, isSolved, onAccept }) => {
	return (
		<div className='bg-gray-50 p-4 rounded-2xl w-full'>
			<div className='flex items-start justify-between mb-3'>
				<div className='flex items-center justify-between gap-4'>
					<p className='text-xs font-medium text-gray-500'>{answer?.author?.email || '-'}</p>
					<span className='text-xs text-gray-500'>
						{new Date(answer.createdAt).toLocaleDateString('es-ES', {
							day: 'numeric',
							month: 'short',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</span>
				</div>

				{answer.isAccepted && (
					<div className='flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs'>
						<CheckCircle className='h-3 w-3' />
						<span>Solución</span>
					</div>
				)}
			</div>
			<div className='text-xs max-w-none text-gray-600' dangerouslySetInnerHTML={{ __html: answer.content }} />
			<div className='flex items-center justify-between'>
				{/* 
				<button className='flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-50 cursor-pointer'>
					<Heart className='h-3 w-3' />
					<span>{answer.likesCount || 0}</span>
				</button>
				*/}
				{isAuthor && !isSolved && (
					<button
						onClick={() => onAccept(answer.id)}
						className='text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 cursor-pointer'>
						Aceptar solución
					</button>
				)}
			</div>
		</div>
	)
}
