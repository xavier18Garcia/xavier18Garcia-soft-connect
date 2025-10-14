import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../stores/authStore'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
	const [credentials, setCredentials] = useState({
		email: '',
		password: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const { login, error, clearError, isAuthenticated } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (isAuthenticated) navigate('/', { replace: true })
	}, [isAuthenticated, navigate])

	const handleSubmit = async e => {
		e.preventDefault()
		setIsLoading(true)
		clearError()

		try {
			await login(credentials)
		} catch (error) {
			console.error('Error en login:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = e => {
		setCredentials({
			...credentials,
			[e.target.name]: e.target.value,
		})
	}

	return (
		<div className='min-h-screen flex'>
			{/* Sección del formulario */}
			<div className='w-full flex items-center justify-center'>
				<div className='max-w-xs w-full space-y-6'>
					{/* Header compacto */}
					<div className='text-center'>
						<h2 className='text-xl font-medium text-gray-900'>Iniciar sesión</h2>
						<p className='mt-1 text-xs text-gray-500'>Accede a tu cuenta</p>
					</div>

					<form className='space-y-4' onSubmit={handleSubmit}>
						{/* Campo Email */}
						<div>
							<label htmlFor='email' className='block text-xs font-medium text-gray-700 mb-1'>
								Email
							</label>
							<div className='relative'>
								<Mail className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
								<input
									id='email'
									name='email'
									type='email'
									required
									disabled={isLoading}
									className='w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50'
									placeholder='email@ejemplo.com'
									value={credentials.email}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Campo Contraseña */}
						<div>
							<label htmlFor='password' className='block text-xs font-medium text-gray-700 mb-1'>
								Contraseña
							</label>
							<div className='relative'>
								<Lock className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
								<input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									required
									disabled={isLoading}
									className='w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50'
									placeholder='••••••••'
									value={credentials.password}
									onChange={handleChange}
								/>
								<button
									type='button'
									className='absolute right-2 top-2.5'
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? (
										<EyeOff className='h-4 w-4 text-gray-400' />
									) : (
										<Eye className='h-4 w-4 text-gray-400' />
									)}
								</button>
							</div>
						</div>

						{/* Botón */}
						<button
							type='submit'
							disabled={isLoading}
							className='w-full py-2 px-4 text-sm font-medium text-white bg-gray-900 rounded hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 flex items-center justify-center'>
							{isLoading ? <>Accediendo...</> : <>Acceder</>}
						</button>

						{/* Enlace compacto */}
						<div className='text-center'>
							<a href='#' className='text-xs text-gray-600 hover:text-gray-900'>
								¿Olvidaste tu contraseña?
							</a>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default LoginPage
