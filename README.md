# Backend Gestión Tenis 🎾

Este proyecto es el servidor backend de una aplicación de gestión de reservas, usuarios y emparejamientos para un club de tenis. Está desarrollado en **Node.js** usando el framework **Express.js**, y se conecta a una base de datos **MySQL**.

## 🚀 Tecnologías utilizadas

- [Node.js](https://nodejs.org/) – Entorno de ejecución de JavaScript en el servidor.
- [Express.js](https://expressjs.com/) – Framework minimalista para gestionar rutas y middlewares.
- [MySQL](https://www.mysql.com/) – Sistema de gestión de bases de datos relacional.
- [mysql2/promise](https://www.npmjs.com/package/mysql2) – Cliente MySQL compatible con promesas.
- [dotenv](https://www.npmjs.com/package/dotenv) – Gestión de variables de entorno.
- [CORS](https://www.npmjs.com/package/cors) – Middleware para habilitar el uso compartido de recursos entre orígenes distintos.

## 📁 Estructura del proyecto

```
/routes           → Rutas de la API (usuarios, emparejamientos, reservas, etc.)
/db.js            → Configuración de la conexión a la base de datos
/server.js        → Archivo principal del servidor
.env              → Variables de entorno (no subir a producción)
```

## 🔧 Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=gestion_tenis
DATABASE_URL=mysql://root:<tu_password>@<tu_host>:<puerto>/<nombre_base_datos>
```

> En Railway o Render, solo necesitas definir `DATABASE_URL` con la conexión completa.

## ▶️ Scripts

```bash
npm install        # Instala las dependencias
npm run dev        # Arranca el servidor con nodemon (modo desarrollo)
npm start          # Inicia el servidor en producción
```

## 📡 API disponible

Todas las rutas están bajo el prefijo `/api`. Ejemplos:

- `POST /api/usuarios/login`
- `PUT /api/usuarios/:id/contrasena`
- `GET /api/reservas`
- `POST /api/emparejamientos`
- etc.

## 🌐 Despliegue

Este backend puede desplegarse en plataformas como **Railway** o **Render**. Solo asegúrate de tener correctamente configurada la variable `DATABASE_URL`.
