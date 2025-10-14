import { lazy } from 'react'
import { PATH_ROUTES } from '../common/const/pauthRoute-const'

const lazyImport = path => lazy(() => import(path))

const routes_auth = [
	{
		path: `/${PATH_ROUTES.AUTH.SIGNIN}`,
		element: lazyImport('../pages/auth/Login-page.jsx'),
	},
	{
		path: `/${PATH_ROUTES.AUTH.SIGNUP}`,
		element: lazyImport('../pages/auth/Register-page.jsx'),
	},
]

const routes_public = [
	{
		path: `/${PATH_ROUTES.HOME}`,
		element: lazyImport('../pages/home/Home-page.jsx'),
	},
	{
		path: `/${PATH_ROUTES.POST}/:id`,
		element: lazyImport('../pages/post/PostDetail.jsx'),
	},
]

const routes_private = [
	{
		path: `/${PATH_ROUTES.ADMIN.USER}`,
		element: lazyImport('../pages/admin/User-page.jsx'),
		requiredRoles: ['admin'],
	},
]

export { routes_auth, routes_private, routes_public }
