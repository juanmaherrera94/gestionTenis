<template>
  <div class="form-container">
    <form class="form" @submit.prevent="agregarJugador">
      <h2 style="text-align: center; color: white;">Añadir Jugador</h2>

      <div class="flex-column">
        <label>Nombre</label>
      </div>
      <div class="inputForm">
        <input v-model="nombre" placeholder="Nombre" class="input" type="text" required />
      </div>

      <div class="flex-column">
        <label>Usuario</label>
      </div>
      <div class="inputForm">
        <input v-model="usuario" placeholder="Usuario" class="input" type="text" required />
      </div>

      <div class="flex-column">
        <label>Contraseña</label>
      </div>
      <div class="inputForm">
        <input v-model="password" placeholder="Contraseña" class="input" type="password" required />
      </div>

      <div class="flex-column">
        <label>ID de División</label>
      </div>
      <div class="inputForm">
        <input v-model="division_id" placeholder="División" class="input" type="number" required />
      </div>

      <button type="submit" class="button-submit">Añadir</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import toast from 'vue3-toastify'

const nombre = ref('')
const usuario = ref('')
const password = ref('')
const division_id = ref('')
const router = useRouter()

const agregarJugador = async () => {
  if (!nombre.value || !usuario.value || !password.value || !division_id.value) {
    toast.error("Por favor completa todos los campos.");
    return;
  }

  try {
    await axios.post("http://localhost:3000/api/jugadores", {
      nombre: nombre.value,
      usuario: usuario.value,
      password: password.value,
      division_id: Number(division_id.value),
      rol: "jugador"
    });
    toast.success("Jugador añadido con éxito.");
    router.push('/admin');
  } catch (error) {
    console.error(error);
    toast.error("Error al añadir jugador: " + (error.response?.data?.error || error.message));
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: linear-gradient(45deg, skyblue, darkblue);
  padding: 30px;
  width: 450px;
  border-radius: 20px;
  font-family: 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s ease;
}

.form:hover {
  background: linear-gradient(45deg, darkblue, skyblue);
}

.flex-column > label {
  color: white;
  font-weight: 600;
}

.inputForm {
  border: 1.5px solid #ecedec;
  border-radius: 10em;
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  background-color: white;
  transition: 0.2s ease-in-out;
}

.input {
  margin-left: 10px;
  border-radius: 10rem;
  border: none;
  width: 100%;
  height: 100%;
}

.input:focus {
  outline: none;
}

.inputForm:focus-within {
  border: 1.5px solid orange;
}

.button-submit {
  padding: 15px 30px;
  text-align: center;
  background: transparent;
  border: 2px solid;
  border-radius: 10em;
  box-shadow: inset 0 0 0 0 blue;
  color: white;
  font-size: 15px;
  font-weight: 500;
  height: 50px;
  cursor: pointer;
  transition: 0.5s ease-out;
  margin-top: 10px;
}

.button-submit:hover {
  box-shadow: inset 0 -100px 0 0 rgb(65, 225, 118);
  color: white;
}

.button-submit:active {
  transform: scale(0.95);
}
</style>
