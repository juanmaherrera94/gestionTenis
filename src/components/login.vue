<template>
  <div class="contenedor">
    <!-- Sección de login -->
    <section id="login" class="seccion">
      <form @submit.prevent="login" class="formulario">
        <h1>Iniciar Sesión</h1>
        <input type="text" placeholder="Usuario" v-model="username" />
        <input type="password" placeholder="Contraseña" v-model="password" />
        <button type="submit">Login</button>

        <p class="registro-link">
          ¿No tienes cuenta?
          <a href="#registro" class="flecha">⬇</a>
        </p>
      </form>
    </section>

    <!-- Sección de registro -->
    <section id="registro" class="seccion">
      <form @submit.prevent="registrar" class="formulario">
        <h1>¡Regístrate aquí!</h1>

        <label>
          <input type="text" v-model="usuario" placeholder="Usuario" />
        </label>

        <label>
          <input type="password" v-model="passwordFormulario" placeholder="Contraseña" />
        </label>

        <label>
          <input type="text" v-model="nombre" placeholder="Nombre" />
        </label>

        <label>
          <input type="number" v-model="division" placeholder="División" />
        </label>

        <button type="submit">Registrar</button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
const router = useRouter();

// Variables login
const username = ref("");
const password = ref("");

// Variables registro
const usuario = ref("");
const passwordFormulario = ref("");
const nombre = ref("");
const division = ref(null);
const rol = ref("jugador"); // Fijo para registro

const login = async () => {
  try {
    const response = await axios.post("http://localhost:3000/api/usuarios/login", {
      usuario: username.value,
      password: password.value,
    });

    const user = response.data.user;

    localStorage.setItem("nombreUsuario", user.nombre);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("rol", user.rol);

    if (user.rol === "admin") {
      router.push("/admin");
    } else {
      router.push("/usuario");
    }
  } catch (error) {
    toast.error(error.response?.data?.error || "Error en el login");
  }
};

const registrar = async () => {
  if (!usuario.value || !passwordFormulario.value || !nombre.value || !division.value) {
    toast.error("Completa todos los campos");
    return;
  }

  try {
    await axios.post("http://localhost:3000/api/jugadores/registro", {
      usuario: usuario.value,
      password: passwordFormulario.value,
      nombre: nombre.value,
      division: division.value,
      rol: rol.value,
    });
    toast.success("Usuario registrado");

    // Limpiar campos
    usuario.value = "";
    passwordFormulario.value = "";
    nombre.value = "";
    division.value = null;
    rol.value = "jugador";
  } catch (error) {
    toast.error(error.response?.data?.error || "Error al registrar");
  }
};

</script>

<style scoped>

.contenedor {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden; /* Evita barras horizontales si hay margen fuera */
}


.seccion {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.formulario {
  text-align: center;
  background: rgba(255, 255, 255, 0.85);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
}

h1 {
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 2.2em;
  color: blue;
  text-align: center;
}

h1:hover {
  color: red;
  cursor: pointer;
}

input {
  display: block;
  width: 100%;
  padding: 14px;
  font-size: 1.1em;
  margin-bottom: 20px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 5px;
}

label {
  display: block;
  width: 100%;
}

button[type="submit"] {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 14px 20px;
  font-size: 1.1em;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

input:focus {
  outline: none;
  border: 2px solid #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.registro-link {
  margin-top: 1rem;
  font-size: 1em;
  color: #333;
}

.registro-link .flecha {
  display: inline-block;
  margin-left: 8px;
  font-size: 1.5em;
  text-decoration: none;
  color: #007BFF;
  cursor: pointer;
}

.registro-link .flecha:hover {
  color: #0056b3;
}

@media (max-width: 480px) {
  .formulario {
    min-width: 100%;
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.8em;
  }

  input,
  button[type="submit"] {
    font-size: 1em;
    padding: 12px;
  }
}
</style>
