import { Loader } from 'lucide-react'

const SpinnerLoading = () => {
	return (
		<div className='flex items-center flex-col gap-2'>
			<Loader className='h-4 w-4 text-gray-600 animate-spin' />
			<span className='text-gray-600 font-medium text-xs'>Cargando...</span>
		</div>
	)
}

export { SpinnerLoading }
