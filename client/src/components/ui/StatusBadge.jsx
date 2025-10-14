'use client'

import { CheckCircle2, XCircle, Clock, Info, Circle } from 'lucide-react'

export const Badge = ({ variant, label, showIcon = true }) => {
	const baseStyle = 'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full'

	const variants = {
		info: 'bg-blue-100 text-blue-700',
		warning: 'bg-orange-100 text-orange-700',
		success: 'bg-emerald-100 text-emerald-700',
		error: 'bg-red-100 text-red-700',
		default: 'bg-neutral-100 text-neutral-600',
	}

	// Íconos según el estado
	const icons = {
		active: <Info className='h-3 w-3' />,
		closed: <XCircle className='h-3 w-3' />,
		success: <CheckCircle2 className='h-3 w-3' />,
		error: <XCircle className='h-3 w-3' />,
		warning: <Clock className='h-3 w-3' />,
		default: <Circle className='h-3 w-3' />,
	}

	return (
		<span className={`${baseStyle} ${variants[variant] || variants.default}`}>
			{showIcon ? icons[variant] || icons.default : null}
			{label}
		</span>
	)
}
