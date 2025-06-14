<template>
  <div class="contenedor">
    <section id="login" class="seccion">
      <form @submit.prevent="login" class="formulario">
        <h1>Iniciar Sesión</h1>
        <input type="text" placeholder="Usuario" v-model="username" />
        <input type="password" placeholder="Contraseña" v-model="password" />
        <button type="submit">Entrar</button>
      </form>
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

  const username = ref("");          
  const password = ref("");           

  const usuario = ref("");            
  const passwordFormulario = ref(""); 
  const nombre = ref("");             
  const division = ref(null);        
  const rol = ref("jugador");         

  const login = async () => {
    try {
      // Petición al backend para validar usuario y contraseña
      const response = await axios.post("http://gestiontenis-1.onrender.com/api/usuarios/login", {
        usuario: username.value,
        password: password.value,
      });

      const user = response.data.user;

      // Guardar datos del usuario en localStorage para sesiones
      localStorage.setItem("nombreUsuario", user.nombre);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("rol", user.rol);

      // Redirigir según rol del usuario
      if (user.rol === "admin") {
        router.push("/admin");
      } else {
        router.push("/usuario");
      }
    } catch (error) {
      // Mostrar error si falla el login
      toast.error(error.response?.data?.error || "Error en el login");
    }
  };

  // Función para manejar registro de nuevos usuarios
  const registrar = async () => {
    // Validar que no haya campos vacíos
    if (!usuario.value || !passwordFormulario.value || !nombre.value || !division.value) {
      toast.error("Completa todos los campos");
      return;
    }

    try {
      // Petición al backend para registrar nuevo usuario
      await axios.post("http://gestiontenis-1.onrender.com/api/jugadores/registro", {
        usuario: usuario.value,
        password: passwordFormulario.value,
        nombre: nombre.value,
        division: division.value,
        rol: rol.value,
      });
      toast.success("Usuario registrado");

      // Limpiar campos del formulario de registro
      usuario.value = "";
      passwordFormulario.value = "";
      nombre.value = "";
      division.value = null;
      rol.value = "jugador";
    } catch (error) {
      // Mostrar error si falla el registro
      toast.error(error.response?.data?.error || "Error al registrar");
    }
  };
</script>

<style scoped>

  .contenedor {
    background-image: url("@/assets/fondoTenis.jpeg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    min-height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden; 
  }

  .seccion {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    box-sizing: border-box;
    gap: 2rem; 
    flex-wrap: wrap; 
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

  @media (max-width: 920px) { 
    .seccion {
      flex-direction: column; 
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    
    .formulario {
      min-width: 100%;
      max-width: 450px; 
      padding: 1.5rem;
    }
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