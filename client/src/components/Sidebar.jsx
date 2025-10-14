import { Trophy, Star } from 'lucide-react'
import { mockCategories } from '../common/data/dataFake.js'

export const Sidebar = () => {
	return (
		<aside className='w-64 border-r border-gray-200 h-full overflow-y-auto mr-10 pr-10'>
			<h3 className='text-lg font-semibold text-gray-900 mb-4'>Categorías</h3>

			<div className='space-y-4'>
				{mockCategories.map(category => (
					<div
						key={category.id}
						className='flex items-center justify-between rounded-lg text-gray-600 transition-all duration-500 hover:text-gray-800 cursor-pointer'>
						<div className='flex items-center'>
							<span className='text-sm font-medium'>{category.name}</span>
						</div>
						<span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>{category.count}</span>
					</div>
				))}
			</div>

			<div className='mt-8'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>Estadísticas</h3>
				<div className='space-y-4'>
					<div className='bg-blue-50 p-4 rounded-lg'>
						<div className='flex items-center'>
							<Trophy className='h-5 w-5 text-blue-600 mr-2' />
							<span className='text-sm font-medium text-blue-800'>Top Contribuyente</span>
						</div>
						<p className='text-xs text-blue-600 mt-1'>+15 puntos esta semana</p>
					</div>
					<div className='bg-green-50 p-4 rounded-lg'>
						<div className='flex items-center'>
							<Star className='h-5 w-5 text-green-600 mr-2' />
							<span className='text-sm font-medium text-green-800'>Preguntas Resueltas</span>
						</div>
						<p className='text-xs text-green-600 mt-1'>3 de 5 esta semana</p>
					</div>
				</div>
			</div>
		</aside>
	)
}
