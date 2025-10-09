# Documentación para Instalar e Inicializar un Proyecto React Vite + API Express + PostgreSQL usando `.env`

## Requisitos Previos

- Node.js y npm instalados
- PostgreSQL instalado y corriendo

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

## 2. Instalación del Client (React + Vite)

```bash
cd client
npm i
```

- Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `server` con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 3. Instalación del Server (Express)

```bash
cd ../server
npm i
```

## 4. Configuración de Variables de Entorno

Crea un archivo `.env` en la carpeta `server` con el siguiente contenido:

```env
NODE_ENV=development

SERVER_URL=http://localhost
PREFIX=/api/v1
PORT=3000

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

DB_DIALECT=postgres # mysql
DB_HOST=172.17.0.1
DB_PORT=5436
DB_NAME=soft_conncet_db
DB_USER=soft_conncet_user
DB_PASSWORD=soft_conncet_pass
DB_SSL=false

JWT_EXPIRED=7d
JWT_REFRESH=30d
JWT_SECRET=9ef0f6760e28d0f6443c4f72a4eea140

# CREDENTIALS USER ADMIN
CREDENTIALS_ADMIN_EMAIL=alex.garcia@ueb.edu.ec
CREDENTIALS_ADMIN_PASS=@2y$2025$pass_@*
```

## 5. Inicializar la Base de Datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE soft_conncet_db;
```

Alternativa con Docker:

```bash
docker run -d \
  --name spc-db \
  -e POSTGRES_USER=soft_conncet_user \
  -e POSTGRES_PASSWORD=soft_conncet_pass \
  -e POSTGRES_DB=soft_conncet_db \
  -p 5436:5432 \
  postgres
```

## 6. Ejecutar el Server

```bash
npm run dev
```

## 7. Ejecutar el Client

En otra terminal:

```bash
cd client
npm run dev
```

## 8. Acceder a la Aplicación

Abre tu navegador en [http://localhost:5173](http://localhost:5173)

---

**Notas:**

- Asegúrate de que los datos del `.env` coincidan con tu configuración local de PostgreSQL.
- Puedes agregar más variables de entorno según tus necesidades.
