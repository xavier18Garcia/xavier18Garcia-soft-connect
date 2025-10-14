import { Link } from 'react-router-dom'
import { MessageCircleCode } from 'lucide-react'
import { SITE_CONFIG } from '../common/const/site-const'

export function SiteLogo() {
	return (
		<Link to='/' className='flex items-center'>
			<div className='rounded-full bg-gray-900 p-2'>
				<MessageCircleCode className='h-6 w-6 text-white' />
			</div>
			<h1 className='ml-2 text-xl font-bold text-gray-900 sm:flex hidden'>{SITE_CONFIG.NAME}</h1>
		</Link>
	)
}
