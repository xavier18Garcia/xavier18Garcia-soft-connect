import { Loader } from 'lucide-react'

const SpinnerLoading = ({ inline = false, showText = true, text = 'Cargando...' }) => {
	return (
		<div className={`flex items-center ${inline ? 'flex-row gap-2' : 'flex-col gap-2'}`}>
			<Loader className='h-4 w-4 text-gray-600 animate-spin' />
			{showText && <span className='text-gray-600 font-medium text-xs'>{text}</span>}
		</div>
	)
}

export { SpinnerLoading }
