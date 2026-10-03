<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'SecureLaravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-gray-50 text-gray-900 flex min-h-screen flex-col">
        <header class="w-full border-b bg-white">
            <nav class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <a href="/" class="text-lg font-semibold">{{ config('app.name', 'SecureLaravel') }}</a>
                <div class="flex items-center gap-4">
                    @auth
                        <a href="{{ url('/dashboard') }}" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
                    @else
                        <a href="{{ route('login') }}" class="text-sm text-gray-600 hover:text-gray-900">Iniciar sesión</a>
                        <a href="{{ route('register') }}" class="inline-block px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700">Registrarse</a>
                    @endauth
                </div>
            </nav>
        </header>

        <main class="flex-1 flex items-center justify-center px-6">
            <div class="max-w-2xl text-center">
                <h1 class="text-4xl font-bold mb-4">SecureLaravel</h1>
                <p class="text-gray-600 mb-8">
                    Aplicación web de demostración desarrollada con Laravel 12, autenticación segura,
                    protección CSRF, sesiones y almacenamiento seguro de contraseñas (hashing).
                    Proyecto académico para la asignatura Seguridad de Software.
                </p>
                <div class="flex justify-center gap-4">
                    <a href="{{ route('login') }}" class="px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-700">
                        Iniciar sesión
                    </a>
                    <a href="{{ route('register') }}" class="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-100">
                        Registrarse
                    </a>
                </div>
            </div>
        </main>

        <footer class="border-t bg-white py-4 text-center text-sm text-gray-500">
            SecureLaravel — APE Seguridad de Software
        </footer>
    </body>
</html>
