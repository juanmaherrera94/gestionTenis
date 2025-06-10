<template>
  <div class="form-container">
    
    <form class="form" @submit.prevent="editarJugador" v-if="cargado">
      <h1 class="title">Editar Jugador</h1>
      <p class="subtitle">Actualiza los datos del jugador</p>
      <div class="flex-column">
        <label>Nombre</label>
      </div>
      <div class="inputForm">
        <input v-model="nombre" placeholder="Introduce el nombre" class="input" type="text" required />
      </div>

      <div class="flex-column">
        <label>Usuario</label>
      </div>
      <div class="inputForm">
        <input v-model="usuario" placeholder="Introduce el usuario" class="input" type="text" required />
      </div>

      <div class="flex-column">
        <label>Contraseña</label>
      </div>
      <div class="inputForm">
        <input v-model="password" placeholder="Introduce la contraseña" class="input" type="password" required />
      </div>

      <div class="flex-column">
        <label>ID de División</label>
      </div>
      <div class="inputForm">
        <input v-model="division_id" placeholder="Introduce la división" class="input" type="number" required />
      </div>

      <button class="button-submit">Actualizar</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue3-toastify';

const router = useRouter()
const route = useRoute()
const id = route.params.id

const nombre = ref('')
const usuario = ref('')
const division_id = ref('')
const password = ref('')
const cargado = ref(false)

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/jugadores/${id}`)
    const jugador = response.data
    nombre.value = jugador.nombre
    usuario.value = jugador.usuario
    password.value = jugador.password || ''
    division_id.value = jugador.division_id
    cargado.value = true
  } catch (error) {
    toast.error("Error al cargar jugador: " + error.message)
    router.push('/admin')
  }
})

const editarJugador = async () => {
  try {
    await axios.put(`http://localhost:3000/api/jugadores/${id}`, {
      nombre: nombre.value,
      usuario: usuario.value,
      password: password.value,
      division_id: division_id.value
    })
    toast.success("Jugador editado con éxito.")
    router.push('/admin')
  } catch (error) {
    toast.error("Error al editar jugador: " + error.message)
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

/* Estilos importados y adaptados de Uiverse.io (KapeParaguay) */
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
p {
  color: white;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  
}
</style>
