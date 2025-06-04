<template>
  <div class="vista-usuario-contenedor">
    <div class="content-card booking-form-card">
      <h1>Bienvenido {{ nombreUsuario }}</h1>
      <div class="form-group">
        <label for="horario">Selecciona un horario:</label>
        <select id="horario" v-model="horarioSeleccionado">
          <option disabled value="">Selecciona un horario</option>
          <option v-for="hora in horariosDisponibles" :key="hora" :value="hora">
            {{ formatHora(hora) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="dia">Selecciona un día:</label>
        <select id="dia" v-model="diaSeleccionado">
          <option disabled value="">Selecciona un día</option>
          <option v-for="d in diasDisponibles" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="pista">Selecciona una pista:</label>
        <select id="pista" v-model="pistaSeleccionada">
          <option disabled :value="null">Selecciona una pista</option>
          <option v-for="pista_num in pistasDisponibles" :key="pista_num" :value="pista_num">
            {{ pista_num }}
          </option>
        </select>
      </div>
      <button @click="guardarDisponibilidad" :disabled="!horarioSeleccionado || !diaSeleccionado || !pistaSeleccionada">Guardar Horario</button>
      <button @click="cerrarSesion" class="button-secondary">Cerrar Sesión</button>
    </div>

    <div class="password-toggle-container">
      <a href="#" @click.prevent="togglePasswordForm" class="password-toggle-link">
        {{ showPasswordForm ? 'Ocultar cambio de contraseña' : '¿Deseas cambiar tu contraseña?' }}
      </a>
    </div>

    <div v-if="showPasswordForm" class="content-card password-change-section">
      <h1>Cambiar contraseña</h1>
      <div class="form-group">
        <label for="contrasenaActual">Contraseña actual:</label>
        <input type="password" id="contrasenaActual" v-model="contrasenaActual" />
      </div>
      <div class="form-group">
        <label for="nuevaContrasena">Nueva contraseña:</label>
        <input type="password" id="nuevaContrasena" v-model="nuevaContrasena" />
      </div>
      <button @click="cambiarContrasena">Actualizar contraseña</button>
    </div>

    <div class="content-card reservations-table-card">
      <h1>Reservas</h1>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Nombre jugador</th>
              <th>Día</th>
              <th>Hora</th>
              <th>Pista</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reservas.length === 0">
              <td colspan="4">No hay reservas para mostrar.</td>
            </tr>
            <tr v-for="reserva in reservas" :key="reserva.id">
              <td>{{ reserva.nombre_jugador }}</td>
              <td>{{ reserva.dia }}</td>
              <td>{{ formatHora(reserva.hora) }}</td>
              <td>Pista {{ reserva.numero_pista }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="placeholder-nuevo-horario"> <div class="table-responsive-schedule">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th v-for="dia in diasDisponibles" :key="dia">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hora in horariosDisponibles" :key="hora">
              <td>{{ formatHora(hora) }}</td>
              <td v-for="dia in diasDisponibles" :key="dia + '-' + hora" class="schedule-slot">
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <footer class="site-footer">
    <p>&copy; 2025 Gestión de reservas tenis. Todos los derechos reservados.</p>
  </footer>
</template>

<script setup>
// ... (Tu script setup se mantiene igual que en la última versión)
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue3-toastify';

const router = useRouter();
const reservas = ref([]);
const nombreUsuario = ref();
const showPasswordForm = ref(false);

const horariosDisponibles = ref([
  "08:15:00", "10:30:00", "15:15:00", "17:30:00", "19:30:00",
]);
const diasDisponibles = ref(["Viernes", "Sábado", "Domingo"]);
const diaSeleccionado = ref("");
const horarioSeleccionado = ref("");
const pistasDisponibles = ref([1, 2, 3]);
const pistaSeleccionada = ref(null);

const contrasenaActual = ref("");
const nuevaContrasena = ref("");

const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value;
};

onMounted(async () => {
  const nombreGuardado = localStorage.getItem('nombreUsuario');
  if (nombreGuardado) {
    nombreUsuario.value = nombreGuardado;
  }
  await mostrarReservas();
});

const mostrarReservas = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/reservas");
    reservas.value = response.data;
  } catch (error) {
    toast.error("Error al cargar reservas: " + error.message);
    console.error("Error al cargar reservas:", error.response || error);
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('nombreUsuario');
  router.push("/");
  toast.success("Sesión cerrada correctamente");
};

const guardarDisponibilidad = async () => {
  if (!diaSeleccionado.value || !horarioSeleccionado.value || !pistaSeleccionada.value) {
    toast.error("Por favor, completa todos los campos (día, hora y pista).");
    return;
  }
  const userId = localStorage.getItem('userId');
  if (!userId) {
    toast.error("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
    return;
  }
  try {
    await axios.post("http://localhost:3000/api/reservas", {
      dia: diaSeleccionado.value,
      hora: horarioSeleccionado.value,
      usuario_id: parseInt(userId, 10),
      numero_pista: pistaSeleccionada.value
    });
    toast.success("Reserva guardada con éxito.");
    diaSeleccionado.value = "";
    horarioSeleccionado.value = "";
    pistaSeleccionada.value = null;
    await mostrarReservas();
  } catch (error) {
    if (error.response && error.response.status === 409) {
      toast.error(error.response.data.message || "Este horario y pista ya están reservados.");
    } else {
      toast.error("Error al guardar reserva: " + (error.response?.data?.message || error.message));
      console.error("Error al guardar reserva:", error.response || error);
    }
  }
};

const formatHora = (hora) => {
  if (!hora) return '';
  try {
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formateando hora:", hora, e);
    return hora;
  }
};

const cambiarContrasena = async () => {
  const userId = localStorage.getItem('userId');
  if (!contrasenaActual.value || !nuevaContrasena.value) {
    toast.error("Por favor completa ambos campos.");
    return;
  }
  try {
    await axios.put(`http://localhost:3000/api/usuarios/${userId}/contrasena`, {
      actual: contrasenaActual.value,
      nueva: nuevaContrasena.value,
    });
    toast.success("Contraseña actualizada correctamente.");
    contrasenaActual.value = "";
    nuevaContrasena.value = "";
    showPasswordForm.value = false; 
  } catch (error) {
    toast.error("Error al cambiar la contraseña: " + (error.response?.data?.message || error.message));
    console.error("Error cambiando contraseña:", error);
  }
};
</script>

<style scoped>
h1 {
  color: blue;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
}

h1:hover {
  color: red;
  cursor: pointer;
}

.vista-usuario-contenedor {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem; 
  padding: 2rem;
  box-sizing: border-box;
}

.content-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.35);
  text-align: center;
  width: 100%;
  max-width: 700px; 
}

.booking-form-card {
  /* Estilos específicos si son necesarios, hereda de .content-card */
}

.password-toggle-container {
  width: 100%;
  max-width: 700px; 
  text-align: center; 
  margin-top: -1rem; 
  margin-bottom: 0.5rem; 
}

.password-toggle-link {
  color: white; 
  text-decoration: underline;
  cursor: pointer;
  font-size: 1.1em; 
}
.password-toggle-link:hover {
  color: #f0f8ff; 
}

.password-change-section {
  padding: 1.5rem;
}

.password-change-section h1 {
  font-size: 1.6rem;
  margin-bottom: 20px;
}

.reservations-table-card {
 /* Estilos específicos si son necesarios, hereda de .content-card */
}

/* ESTILOS MODIFICADOS PARA EL CONTENEDOR DEL HORARIO Y LA TABLA */
.placeholder-nuevo-horario { /* Contenedor de la sección de horarios */
  width: 100%;
  max-width: 1100px; /* Vuelve a ser más ancho */
  background: rgba(255, 255, 255, 0.95); 
  padding: 2rem; /* Padding consistente con otras tarjetas principales */
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.35); 
  box-sizing: border-box;
  /* El título H2 se ha eliminado del HTML, así que no se necesitan estilos para .schedule-title aquí */
}

/* Eliminado .schedule-content-wrapper y .schedule-title ya que el título se quitó */

.table-responsive-schedule {
  overflow-x: auto; 
  width: 100%;
}

.schedule-table {
  width: 100%; 
  border-collapse: collapse;
  table-layout: fixed; 
  background-color: #fff; 
  border-radius: 8px; 
  overflow: hidden; 
  margin: 0 auto; 
}

.schedule-table th,
.schedule-table td {
  border: 1px solid #dee2e6; 
  padding: 10px 6px;    /* Mantenemos el padding "más chico" para las celdas */
  text-align: center;
  vertical-align: middle;
  height: 60px;         /* Mantenemos la altura "más chica" */
  font-size: 0.9rem;    /* Mantenemos la fuente "más chica" */
}

.schedule-table thead th {
  background-color: #007BFF;
  color: white;
  font-weight: 600;    
  font-size: 0.95rem;  /* Mantenemos cabeceras "más chicas" */
}

.schedule-table thead th:first-child { 
  background-color: #495057; 
  border-top-left-radius: 8px;
}
.schedule-table thead th:last-child {
  border-top-right-radius: 8px;
}

.schedule-table tbody td:first-child { 
  background-color: #f1f3f5; 
  font-weight: 600;    
  font-size: 0.9rem;    
  width: 100px; /* Ligero aumento para la columna de hora en una tabla más ancha */
  color: #212529;      
}

.schedule-slot {
  font-size: 0.85rem; 
  transition: background-color 0.2s ease;
}

.schedule-slot:hover {
  background-color: #e9f5ff; 
}

.schedule-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}
.schedule-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}
/* FIN DE ESTILOS PARA EL HORARIO */


.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: bold;
  font-size: 16px;
}

select, input[type="password"] {
  display: block;
  margin: 0 auto 15px auto;
  padding: 10px;
  font-size: 16px;
  width: 80%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

select:focus, input[type="password"]:focus {
  outline: none;
  border: 2px solid #007BFF;
}

button {
  display: inline-block;
  margin: 10px 5px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button.button-secondary {
  background-color: #6c757d;
}

button.button-secondary:hover {
  background-color: #5a6268;
}

.table-responsive { 
  overflow-x: auto;
}

table { 
  margin-top: 20px;
  border-collapse: collapse;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

th, td { 
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th { 
  background-color: #007BFF;
  color: white;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.site-footer {
  background-color: #182A4C;
  color: white;
  text-align: center;
  padding: 15px 0;
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
}

.site-footer p {
  margin: 0;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .vista-usuario-contenedor {
    padding: 1rem;
    gap: 1rem;
  }
  .content-card, .placeholder-nuevo-horario { 
    padding: 1.5rem;
    max-width: 100%; 
  }
  .password-change-section {
    padding: 1rem;
  }
  h1 {
    font-size: 1.8rem;
  }
  .password-change-section h1 {
    font-size: 1.5rem;
  }
  /* El .schedule-title ya no existe */
  
  .schedule-table th,
  .schedule-table td {
    padding: 8px 4px; 
    height: 50px;    
    font-size: 0.8rem; 
  }
  .schedule-table thead th {
    font-size: 0.85rem;  
  }
  .schedule-table tbody td:first-child { 
    width: 65px;     
    font-size: 0.75rem;
  }
   .schedule-slot {
    font-size: 0.75rem;
  }

  select, input[type="password"], button {
    font-size: 15px;
    padding: 8px 15px;
  }
  select, input[type="password"] {
    width: 90%;
    max-width: none;
  }
}
</style>