# SecureLaravel

Aplicación web segura desarrollada como parte de la práctica APE 1 de la asignatura **Seguridad de Software**.

## Objetivo

Demostrar la implementación de una aplicación web segura mediante el framework Laravel 12:

- Registro e inicio de sesión de usuarios (Laravel Breeze + Blade).
- Cierre de sesión.
- Protección de rutas con middleware `auth`.
- Sesiones seguras.
- Protección CSRF en todos los formularios.
- Contraseñas almacenadas con hashing (bcrypt).
- Validación de formularios en el servidor.
- Prevención de mass assignment mediante `$fillable`.
- Registro de eventos de seguridad (`security_logs`).
- Base de datos MySQL/MariaDB (XAMPP) y migraciones.

## Tecnologías

- PHP 8.2 (XAMPP) / Laravel 12
- MySQL/MariaDB (XAMPP)
- Laravel Breeze (Blade)
- Tailwind CSS + Vite
- Composer, npm, Git

## Requisitos

- PHP >= 8.2 con las extensiones `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`.
- Composer
- Node.js y npm
- XAMPP (Apache + MySQL/MariaDB)
- Git

> **Nota importante (este equipo):** usamos el PHP de XAMPP (`/opt/lampp/bin/php`) para
> `composer` y `php artisan`, porque el PHP del sistema no tiene habilitado el driver
> `pdo_mysql`. Si trabajas en otra máquina, basta con que tu PHP activo tenga `pdo_mysql`.

## Instalación

```bash
git clone <url-del-repositorio> mi-proyecto
cd mi-proyecto
composer install
npm install
```

## Configuración de .env

Copia el archivo de ejemplo y genera la clave de la aplicación:

```bash
cp .env.example .env
php artisan key:generate
```

Configura la conexión a MySQL (valores de XAMPP por defecto, sin credenciales reales):

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

## Creación de la base de datos

En phpMyAdmin (http://localhost/phpmyadmin) o por consola:

```sql
CREATE DATABASE laravel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Migraciones y datos de prueba

```bash
php artisan migrate
php artisan db:seed
```

El seeder crea un usuario de prueba **solo para desarrollo**:

- Nombre: Alex Garcia
- Correo: alex@example.com
- Contraseña: `password`

> No uses esta cuenta ni esta contraseña en producción.

## Ejecutar el proyecto

En dos terminales:

```bash
php artisan serve     # http://127.0.0.1:8000
npm run dev           # servidor de desarrollo Vite (assets)
```

Para producción académica también puedes compilar los assets una vez:

```bash
npm run build
php artisan serve
```

## Estructura principal

| Elemento | Ubicación |
|---|---|
| Rutas públicas/privadas | `routes/web.php`, `routes/auth.php` |
| Controladores | `app/Http/Controllers` |
| Dashboard | `app/Http/Controllers/DashboardController.php` |
| Perfil | `app/Http/Controllers/ProfileController.php` |
| Logs de seguridad | `app/Models/SecurityLog.php` |
| Vistas Blade | `resources/views` |
| Migraciones | `database/migrations` |
| Seeders | `database/seeders` |

## Rutas

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/` | Pública |
| GET | `/login`, `/register` | Pública (invitado) |
| POST | `/login`, `/register`, `/logout` | CSRF + sesión |
| GET | `/dashboard` | `auth`, `verified` |
| GET | `/profile` | `auth` |
| PATCH | `/profile` | `auth` |
| DELETE | `/profile` | `auth` |

## Medidas de seguridad implementadas

1. **CSRF**: todos los formularios incluyen `@csrf` y las rutas de mutación lo validan.
2. **Autenticación**: middleware `auth` en rutas privadas.
3. **Autorización**: el perfil usa siempre `$request->user()`; no se aceptan IDs de usuario desde el navegador.
4. **Validación de servidor**: Form Requests (`LoginRequest`, `ProfileUpdateRequest`, `PasswordUpdateRequest`).
5. **Hashing de contraseñas**: `Hash::make` / cast `hashed` del modelo `User`.
6. **Mass assignment**: `$fillable` y `$hidden` correctamente definidos en `User` y `SecurityLog`.
7. **Sesiones**: regeneración de sesión al iniciar sesión e invalidación al cerrar sesión.
8. **Auditoría**: la tabla `security_logs` registra login, logout y actualización de perfil con IP y user agent (sin contraseñas ni tokens).
9. **Variables de entorno**: `.env` está en `.gitignore` y no contiene credenciales reales.

## Pruebas obligatorias (resumen)

1. Registro de un nuevo usuario en `/register`.
2. Inicio de sesión en `/login`.
3. Credenciales incorrectas → error de validación, no inicia sesión.
4. Usuario autenticado accede a `/dashboard` (muestra nombre, correo, fecha de registro y actividad reciente).
5. Usuario invitado que abre `/dashboard` es redirigido a `/login`.
6. Cierre de sesión desde el menú del usuario.
7. Actualización de perfil en `/profile` muestra "Perfil actualizado correctamente."
8. Formularios con mensajes de validación en español.
9. Contraseñas almacenadas con hash (verificable en phpMyAdmin: empiezan por `$2y$`).
10. `.env` no aparece en Git (`git ls-files | grep .env` solo muestra `.env.example`).
11. Rutas protegidas definidas con `middleware('auth')` en `routes/web.php`.
12. `php artisan migrate:status` muestra todas las migraciones ejecutadas.

## Comandos útiles

```bash
php artisan migrate:status   # estado de migraciones
php artisan route:list       # listado de rutas
npm run build                # compilar assets
```
