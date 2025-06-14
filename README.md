# Gestión Tenis - Proyecto Integrado DAW

Este es el repositorio del proyecto integrado del Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW). El proyecto consiste en una aplicación web completa para la gestión de reservas de pistas de tenis.

**Autores:**
* Alejandro Rodríguez Jiménez
* Juan Manuel Herrera Expósito

**Curso Académico:** 2024/2025
**Tutora del Proyecto:** Miriam Fimia Muñoz

---

## 🚀 Aplicación Desplegada

Puedes probar la aplicación en vivo en el siguiente enlace:

**[https://gestiontenis.onrender.com/](https://gestiontenis.onrender.com/)**

*El backend también está desplegado en Render y la base de datos en Railway.*

---

## 📖 Índice

* [Descripción del Proyecto](#-descripción-del-proyecto)
* [Funcionalidades Principales](#-funcionalidades-principales)
* [Tecnologías Utilizadas](#-tecnologías-utilizadas)
* [Estructura y Endpoints de la API](#-estructura-y-endpoints-de-la-api)
    * [Endpoints de Jugadores](#endpoints-de-jugadores)
    * [Endpoints de Reservas](#endpoints-de-reservas)
    * [Endpoints de Usuarios](#endpoints-de-usuarios)
* [Guía de Instalación Local](#-guía-de-instalación-local)
    * [Requisitos Previos](#requisitos-previos)
    * [Instalación del Backend](#instalación-del-backend)
    * [Instalación del Frontend](#instalación-del-frontend)
* [Trabajo a Futuro](#-trabajo-a-futuro)
* [Agradecimientos y Recursos](#-agradecimientos-y-recursos)

---

## 📝 Descripción del Proyecto

**Gestión Tenis** es una solución informática diseñada para facilitar la organización y reserva de partidos de tenis. La aplicación busca optimizar la gestión de pistas, mejorar la experiencia de los jugadores y ofrecer una herramienta funcional y estructurada que responda a las necesidades de un club de tenis.

El sistema cuenta con dos roles principales:

* **Usuario/Jugador:** Puede registrarse, iniciar sesión, ver la disponibilidad de las pistas y realizar reservas para jugar. El sistema gestiona automáticamente la formación de parejas.
* **Administrador:** Tiene acceso a un panel de control para gestionar la base de datos de jugadores, pudiendo visualizar, añadir, editar y eliminar perfiles de usuario.

## ✨ Funcionalidades Principales

* ✅ **Sistema de Autenticación:** Formulario de registro y login para usuarios.
* 🎾 **Gestión de Reservas:** Los usuarios pueden reservar una pista eligiendo día, hora y pista disponible.
* 🤝 **Creación de Emparejamientos:** El sistema permite que hasta dos jugadores reserven en el mismo horario para formar un partido. Si el hueco está completo, no se permiten más reservas.
* 🔒 **Panel de Administración:** Zona privada para administradores con funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de jugadores.
* 🚪 **Cierre de Sesión:** Funcionalidad para que los usuarios puedan cerrar su sesión de forma segura.
* 📱 **Diseño Responsivo:** Interfaz adaptable a diferentes tamaños de pantalla (móvil, tablet, escritorio).

## 🛠️ Tecnologías Utilizadas

### Backend
* **[Node.js](https://nodejs.org/)**: Entorno de ejecución para JavaScript en el servidor.
* **[Express.js](https://expressjs.com/)**: Framework para la creación de la API REST y la gestión de rutas.
* **[MySQL](https://www.mysql.com/)**: Sistema de gestión de bases de datos relacional para almacenar toda la información.
* **[CORS](https://expressjs.com/en/resources/middleware/cors.html)**: Middleware para permitir peticiones desde el frontend.

### Frontend
* **[Vue.js](https://vuejs.org/)**: Framework progresivo de JavaScript para construir la interfaz de usuario.
* **[HTML5](https://developer.mozilla.org/es/docs/Web/Guide/HTML/HTML5)**: Lenguaje de marcado para la estructura de la web.
* **[CSS3](https://developer.mozilla.org/es/docs/Web/CSS)**: Hojas de estilo para el diseño visual de la aplicación.

### Base de Datos
* La base de datos se gestionó durante el desarrollo con **phpMyAdmin**.

---

## 🏗️ Estructura y Endpoints de la API

El backend está estructurado siguiendo un patrón RESTful para la gestión de los diferentes recursos de la aplicación.

### Endpoints de Jugadores
*Gestión de los perfiles de jugadores, principalmente por parte del administrador.*

| Método | Endpoint                | Descripción                                        |
| :----- | :---------------------- | :------------------------------------------------- |
| `GET`  | `/api/jugadores`        | Obtiene la lista completa de todos los jugadores.  |
| `GET`  | `/api/jugadores/:id`    | Obtiene los detalles de un jugador específico.     |
| `POST` | `/api/jugadores`        | Crea un nuevo jugador (admin).                     |
| `POST` | `/api/jugadores/registro` | Permite que un nuevo jugador se registre.        |
| `PUT`  | `/api/jugadores/:id`    | Actualiza la información de un jugador existente.  |
| `DELETE`| `/api/jugadores/:id`    | Elimina un jugador del sistema.                    |

### Endpoints de Reservas
*Gestión de la lógica para crear reservas y formar partidos.*

| Método | Endpoint                                  | Descripción                                                                 |
| :----- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| `POST` | `/api/reservas`                           | Crea una reserva y busca un oponente para generar un emparejamiento.        |
| `GET`  | `/api/reservas/pendientes`                | Obtiene la lista de jugadores que esperan oponente.                         |
| `GET`  | `/api/reservas/emparejamientos-confirmados` | Obtiene la lista de todos los partidos ya formados.                         |
| `GET`  | `/api/reservas`                           | Obtiene todas las reservas pendientes de emparejamiento.                    |

### Endpoints de Usuarios
*Manejo de la autenticación y gestión de la cuenta del usuario.*

| Método | Endpoint                        | Descripción                                                       |
| :----- | :------------------------------ | :---------------------------------------------------------------- |
| `POST` | `/api/usuarios/login`           | Inicia sesión y valida las credenciales del usuario.              |
| `PUT`  | `/api/usuarios/:id/contraseña`  | Permite a un usuario cambiar su propia contraseña.                |

---

## ⚙️ Guía de Instalación Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### Requisitos Previos

* **Node.js** (versión 18.x o superior).
* **MySQL** (o un servidor de base de datos compatible como MariaDB).
* Un cliente de base de datos como **phpMyAdmin** o **DBeaver**.
* **Git** (opcional, para clonar el repositorio).

### Instalación del Backend

1.  **Clonar el repositorio** (o descargar el código fuente).
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd nombre-del-proyecto/backend
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar la base de datos**
    * Crea una nueva base de datos en tu servidor MySQL.
    * Importa el archivo `.sql` proporcionado en el proyecto en la base de datos recién creada.
    * Configura las credenciales de conexión a la base de datos en el archivo de configuración correspondiente del backend (ej. `config.js`, `db.js` o `.env`).

4.  **Iniciar el servidor**
    ```bash
    node server.js
    ```
    El servidor backend se ejecutará en `http://localhost:3000` (o el puerto configurado).

### Instalación del Frontend

1.  **Navegar a la carpeta del frontend** en una nueva terminal.
    ```bash
    cd ../frontend
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno** (si es necesario).
    * Asegúrate de que la URL del backend en la configuración del frontend apunte al servidor local (`http://localhost:3000`).

4.  **Iniciar el servidor de desarrollo**
    ```bash
    npm run dev
    ```
    La aplicación frontend estará disponible en `http://localhost:5173` (o el puerto que indique Vite/Vue).

---

## 🔮 Trabajo a Futuro

Aunque el proyecto cumple con los objetivos iniciales, se han identificado varias líneas de mejora para futuras versiones:

* **Seguridad Avanzada:** Implementar un sistema de autenticación más robusto utilizando tokens (JWT) para proteger las rutas y mejorar la seguridad de las sesiones.
* **Mejora de la UI/UX:** Optimizar el diseño de la interfaz para que sea aún más intuitivo, estético y atractivo para el usuario final.
* **Sistema de Emparejamientos Automatizado:** Desarrollar un algoritmo que pueda asignar pistas o crear partidos de forma automática y aleatoria en caso de alta demanda o solapamientos, respetando las preferencias de los jugadores.

---

## 🙏 Agradecimientos y Recursos

Este proyecto ha sido posible gracias a la aplicación de los conocimientos adquiridos en el ciclo DAW y a la consulta de diversas fuentes:

* Tutoriales y foros en **YouTube**.
* Ayuda y guía de herramientas de **Inteligencia Artificial**.
* Documentación oficial y ejemplos de **W3Schools**.
* Componentes y diseños de **uiverse.io**.