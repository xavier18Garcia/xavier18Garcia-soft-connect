export const StateBanner = ({ title, description, icon, actionLabel, onAction, variant = 'default' }) => {
	const variants = {
		default: {
			container: 'bg-gray-50',
			icon: 'text-gray-600',
			title: 'text-gray-700',
			description: 'text-gray-500',
			action: 'text-gray-50 bg-gray-600 hover:text-gray-700 hover:bg-gray-50',
		},
		warning: {
			container: 'bg-amber-50',
			icon: 'text-amber-600',
			title: 'text-amber-700',
			description: 'text-amber-500',
			action: 'text-amber-50 bg-amber-600 hover:text-amber-700 hover:bg-amber-50',
		},
		error: {
			container: 'bg-red-50',
			icon: 'text-red-600',
			title: 'text-red-700',
			description: 'text-red-500',
			action: 'text-red-50 bg-red-600 hover:text-red-700 hover:bg-red-50',
		},
		info: {
			container: 'bg-sky-50',
			icon: 'text-sky-600',
			title: 'text-sky-700',
			description: 'text-sky-500',
			action: 'text-sky-50 bg-sky-600 hover:text-sky-700 hover:bg-sky-50',
		},
	}

	const currentVariant = variants[variant]

	return (
		<div
			className={`rounded-2xl text-center h-[50vh] flex flex-col items-center justify-center ${currentVariant.container}`}>
			{icon && <div className={`mx-auto pb-4 ${currentVariant.icon}`}>{icon}</div>}
			<h3 className={`text-lg font-medium ${currentVariant.title} mb-2 text-sm`}>{title}</h3>
			{description && <p className={`text-xs ${currentVariant.description} mb-5 max-w-md mx-auto`}>{description}</p>}
			{actionLabel && onAction && (
				<button
					onClick={onAction}
					className={`inline-flex items-center px-4 py-2 font-medium rounded-2xl text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${currentVariant.action}`}>
					{actionLabel}
				</button>
			)}
		</div>
	)
}
