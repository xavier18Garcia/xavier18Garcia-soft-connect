<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuario de prueba SOLO para desarrollo. Nunca usar en producción.
        User::factory()->create([
            'name' => 'Alex Garcia',
            'email' => 'alex@example.com',
            // Contraseña de desarrollo: password
            'password' => Hash::make('password'),
        ]);
    }
}
