<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 text-gray-900">
                        <h3 class="text-lg font-bold mb-4">Usuario autenticado</h3>
                        <dl class="space-y-2">
                            <div>
                                <dt class="text-sm text-gray-500">Nombre</dt>
                                <dd class="font-medium">{{ $user->name }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm text-gray-500">Correo electrónico</dt>
                                <dd class="font-medium">{{ $user->email }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm text-gray-500">Fecha de registro</dt>
                                <dd class="font-medium">{{ $user->created_at->format('d/m/Y H:i') }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm text-gray-500">Estado de autenticación</dt>
                                <dd class="font-medium text-green-600">Sesión activa</dd>
                            </div>
                        </dl>
                        <div class="mt-6">
                            <a href="{{ route('profile.edit') }}" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                Mi perfil
                            </a>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6 text-gray-900">
                        <h3 class="text-lg font-bold mb-4">Actividad reciente</h3>
                        @if ($activity->isEmpty())
                            <p class="text-gray-500">No hay actividad registrada todavía.</p>
                        @else
                            <ul class="divide-y divide-gray-200">
                                @foreach ($activity as $log)
                                    <li class="py-2">
                                        <p class="font-medium">{{ $log->action }}</p>
                                        <p class="text-sm text-gray-500">{{ $log->created_at->format('d/m/Y H:i:s') }} — {{ $log->ip_address }}</p>
                                    </li>
                                @endforeach
                            </ul>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
