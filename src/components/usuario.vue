<template>
  <div class="vista-usuario-contenedor">
    <div class="content-card booking-form-card">
      <h1>Bienvenido {{ nombreUsuario }}</h1>
      <div class="form-group">
        <label for="horario">Selecciona un horario:</label>
        <select id="horario" v-model="horarioSeleccionado">
          <option disabled value="">Selecciona un horario</option>
          <option v-for="hora_opt in horariosDisponibles" :key="hora_opt" :value="hora_opt">
            {{ formatHora(hora_opt) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="dia">Selecciona un día:</label>
        <select id="dia" v-model="diaSeleccionado">
          <option disabled value="">Selecciona un día</option>
          <option v-for="d_opt in diasDisponibles" :key="d_opt" :value="d_opt">{{ d_opt }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="pista">Selecciona una pista:</label>
        <select id="pista" v-model="pistaSeleccionada">
          <option disabled :value="null">Selecciona una pista</option>
          <option v-for="pista_num_opt in pistasDisponibles" :key="pista_num_opt" :value="pista_num_opt">
            {{ pista_num_opt }}
          </option>
        </select>
      </div>
      <button @click="guardarDisponibilidad" :disabled="!horarioSeleccionado || !diaSeleccionado || pistaSeleccionada === null">Guardar Horario</button>
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

    <!-- <div class="content-card reservations-table-card">
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
            <tr v-if="reservasOriginalesParaTablaSuperior.length === 0">
              <td colspan="4">No hay reservas para mostrar.</td>
            </tr>
            <tr v-for="reserva in reservasOriginalesParaTablaSuperior" :key="reserva.id">
              <td>{{ reserva.nombre_jugador }}</td>
              <td>{{ reserva.dia }}</td>
              <td>{{ formatHora(reserva.hora) }}</td>
              <td>Pista {{ reserva.numero_pista }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->

    <div class="placeholder-nuevo-horario content-card"> <h2 class="schedule-title">Estado de Pistas y Emparejamientos</h2> <div class="table-responsive-schedule">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th v-for="dia_loop in diasDisponibles" :key="dia_loop">{{ dia_loop }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hora_loop in horariosDisponibles" :key="hora_loop">
              <td>{{ formatHora(hora_loop) }}</td>
              <td v-for="dia_loop in diasDisponibles" :key="dia_loop + '-' + hora_loop" class="schedule-slot">
                <div v-html="getEstadoCeldaHTML(dia_loop, hora_loop)"></div>
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
import { ref, onMounted } from 'vue'; // No necesitamos 'computed' si no hay 'misReservasPendientes'
import { useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const router = useRouter();

// Refs del estado del componente (como en tu original)
const nombreUsuario = ref(''); // Se carga desde localStorage
const currentUserId = ref(null); // Se carga desde localStorage
const showPasswordForm = ref(false);

// Refs para el formulario de reserva (como en tu original)
const horariosDisponibles = ref(["08:15:00", "10:30:00", "15:15:00", "17:30:00", "19:30:00"]);
const diasDisponibles = ref(["Viernes", "Sábado", "Domingo"]);
const pistasDisponibles = ref([1, 2, 3]);

const diaSeleccionado = ref("");
const horarioSeleccionado = ref("");
const pistaSeleccionada = ref(null);

// Refs para el cambio de contraseña (como en tu original)
const contrasenaActual = ref("");
const nuevaContrasena = ref("");

// --- NUEVOS Refs para la lógica de emparejamientos y la tabla inferior ---
const todasReservasPendientes = ref([]);    // Para TODAS las reservas pendientes (de todos los usuarios)
const emparejamientosConfirmados = ref([]); // Para los emparejamientos ya hechos

// --- Ref para la tabla de Reservas SUPERIOR (para mantenerla como estaba) ---
// Esta variable se cargará desde el endpoint que usabas originalmente para esa tabla.
// Si el endpoint '/api/reservas' original ahora es '/api/reservas/pendientes',
// necesitarás decidir qué endpoint carga esta tabla superior.
// Por ahora, asumiré que quieres que esta tabla superior siga cargando desde '/api/reservas'
// y que ese endpoint devuelve los datos como antes. Si ha cambiado, ajusta la URL en 'mostrarReservasOriginales'.
const reservasOriginalesParaTablaSuperior = ref([]);


// --- Ciclo de vida ---
onMounted(async () => {
  const nombreGuardado = localStorage.getItem('nombreUsuario');
  const idGuardado = localStorage.getItem('userId');

  if (nombreGuardado && idGuardado) {
    nombreUsuario.value = nombreGuardado;
    currentUserId.value = parseInt(idGuardado, 10);
  } else {
    toast.error("Error de autenticación. Por favor, inicia sesión de nuevo.");
    router.push("/");
    return;
  }

  // Cargar datos para la tabla de reservas superior (como en tu original)
  await mostrarReservasOriginales();

  // Cargar datos para la NUEVA tabla de horarios inferior
  await cargarDatosParaTablaHorarios();
});

// --- Métodos para cargar datos ---

// Función para cargar los datos de la tabla de reservas SUPERIOR (como en tu código original)
// El endpoint aquí es el que usabas ANTES para esa tabla.
const mostrarReservasOriginales = async () => {
  try {
    // ESTE ES EL ENDPOINT QUE USABAS ORIGINALMENTE PARA LA TABLA DE ARRIBA
    const response = await axios.get("http://localhost:3000/api/reservas"); // O el endpoint que corresponda ahora
    reservasOriginalesParaTablaSuperior.value = response.data;
  } catch (error) {
    toast.error("Error al cargar reservas para la tabla superior: " + (error.response?.data?.message || error.message));
    console.error("Error al cargar reservas (tabla superior):", error.response || error);
  }
};

// NUEVA función para cargar datos específicamente para la tabla de horarios inferior
const cargarDatosParaTablaHorarios = async () => {
  await cargarTodasReservasPendientes();
  await cargarEmparejamientosConfirmados();
};

const cargarTodasReservasPendientes = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/reservas/pendientes");
    todasReservasPendientes.value = response.data;
  } catch (error) {
    toast.error("Error al cargar todas las solicitudes pendientes: " + (error.response?.data?.message || error.message));
    console.error("Error al cargar todas las pendientes:", error.response || error);
  }
};

const cargarEmparejamientosConfirmados = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/reservas/emparejamientos-confirmados");
    emparejamientosConfirmados.value = response.data;
  } catch (error) {
    toast.error("Error al cargar emparejamientos confirmados: " + (error.response?.data?.message || error.message));
    console.error("Error al cargar emparejamientos confirmados:", error.response || error);
  }
};

// --- Métodos de acciones del usuario ---

// guardarDisponibilidad AHORA AFECTARÁ A AMBAS TABLAS (la tabla superior se recargará, y la inferior también)
const guardarDisponibilidad = async () => {
  if (!diaSeleccionado.value || !horarioSeleccionado.value || pistaSeleccionada.value === null) {
    toast.error("Por favor, completa todos los campos (día, hora y pista).");
    return;
  }
  if (!currentUserId.value) {
    toast.error("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:3000/api/reservas", { // El backend maneja si es reserva o emparejamiento
      dia: diaSeleccionado.value,
      hora: horarioSeleccionado.value,
      usuario_id: currentUserId.value,
      numero_pista: pistaSeleccionada.value
    });

    toast.success(response.data.message || "Operación realizada con éxito.");

    diaSeleccionado.value = "";
    horarioSeleccionado.value = "";
    pistaSeleccionada.value = null;

    // Recargar datos para AMBAS tablas para que reflejen el nuevo estado
    await mostrarReservasOriginales(); // Recarga la tabla superior
    await cargarDatosParaTablaHorarios();   // Recarga la tabla inferior

  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error al procesar la solicitud: " + error.message);
    }
    console.error("Error al guardar disponibilidad/crear emparejamiento:", error.response || error);
  }
};

const cerrarSesion = () => { // Como en tu original
  localStorage.removeItem('userId');
  localStorage.removeItem('nombreUsuario');
  router.push("/");
  toast.success("Sesión cerrada correctamente");
};

const togglePasswordForm = () => { // Como en tu original
  showPasswordForm.value = !showPasswordForm.value;
};

const cambiarContrasena = async () => { // Como en tu original, asegúrate que currentUserId se usa
  if (!contrasenaActual.value || !nuevaContrasena.value) {
    toast.error("Por favor completa ambos campos.");
    return;
  }
  if (!currentUserId.value) {
    toast.error("Usuario no identificado para cambiar contraseña.");
    return;
  }
  try {
    await axios.put(`http://localhost:3000/api/usuarios/${currentUserId.value}/contrasena`, {
      actual: contrasenaActual.value,
      nueva: nuevaContrasena.value,
    });
    toast.success("Contraseña actualizada correctamente.");
    contrasenaActual.value = "";
    nuevaContrasena.value = "";
    showPasswordForm.value = false;
  } catch (error) {
    toast.error("Error al cambiar la contraseña: " + (error.response?.data?.message || error.message));
    console.error("Error cambiando contraseña:", error.response || error);
  }
};

// --- Métodos de ayuda / formato ---
const formatHora = (hora) => { // Como en tu original
  if (!hora) return '';
  return hora.substring(0, 5); // HH:MM
};

// NUEVA función para generar el contenido HTML de cada celda en la tabla de horarios inferior
const getEstadoCeldaHTML = (dia, hora) => {
  let contentLines = [];
  const pistasOrdenadas = Array.isArray(pistasDisponibles.value)
    ? [...pistasDisponibles.value].sort((a, b) => a - b)
    : [];

  for (const pistaNum of pistasOrdenadas) {
    let infoPista = `P${pistaNum}: `;
    let actividadEncontrada = false;

    const emparejamiento = emparejamientosConfirmados.value.find(
      e => e.dia === dia && e.horario === hora && e.pista === pistaNum
    );
    if (emparejamiento) {
      const nombre1 = emparejamiento.nombre_jugador1 ? emparejamiento.nombre_jugador1.split(' ')[0] : 'J1';
      const nombre2 = emparejamiento.nombre_jugador2 ? emparejamiento.nombre_jugador2.split(' ')[0] : 'J2';
      infoPista += `${nombre1} vs ${nombre2}`;
      actividadEncontrada = true;
    }

    if (!actividadEncontrada) {
      const reservaPendiente = todasReservasPendientes.value.find(
        r => r.dia === dia && r.hora === hora && r.numero_pista === pistaNum
      );
      if (reservaPendiente) {
        const nombreJugador = reservaPendiente.nombre_jugador ? reservaPendiente.nombre_jugador.split(' ')[0] : 'Jugador';
        infoPista += `${nombreJugador} (espera)`;
        actividadEncontrada = true;
      }
    }

    if (!actividadEncontrada) {
      infoPista += 'Libre';
    }
    contentLines.push(infoPista);
  }
  return contentLines.join('<br>');
};

</script>

<style scoped>
/* TUS ESTILOS ORIGINALES SE MANTIENEN AQUÍ.
   Asegúrate de que los estilos para:
   .placeholder-nuevo-horario, .table-responsive-schedule, .schedule-table, .schedule-slot, .schedule-title
   estén definidos como los tenías o como te los pasé en la versión anterior si te gustaron.
   He añadido la clase 'content-card' al div 'placeholder-nuevo-horario' y un 'h2' con clase 'schedule-title'
   para que se parezca más a las otras tarjetas, puedes quitarlo si no te gusta.
*/

h1 {
  color: blue;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 30px;
}

.vista-usuario-contenedor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  box-sizing: border-box;
  min-height: 100vh;
  width: 100%;
}
.content-card {
  background: rgba(255, 255, 255, 0.92);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  text-align: center;
  width: 100%;
}
.booking-form-card, .password-change-section, .reservations-table-card { /* Tabla superior de reservas */
  max-width: 700px;
}
.placeholder-nuevo-horario.content-card { /* Tabla inferior de horarios y emparejamientos */
   max-width: 1000px;
   padding: 2rem; /* Más padding para la tabla grande */
}
.password-toggle-container {
  width: 100%;
  max-width: 700px;
  text-align: center;
  margin-top: -1rem;
  margin-bottom: 1rem;
}
.password-toggle-link {
  /* color: white;  Esto probablemente no se vea bien si el fondo no es oscuro */
  color: white; /* Ejemplo de color de enlace */
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
.password-toggle-link:hover {
  /* color: #f0f8ff; */
  color: #003d80;
}
.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #333;
}
select, input[type="password"] {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}
button {
  margin: 10px 5px 0px 5px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
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
  background-color: #545b62;
}

.table-responsive, .table-responsive-schedule {
  overflow-x: auto;
  margin-top: 1rem;
  width: 100%;
}
table { /* Estilo general para todas las tablas */
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}
th, td { /* Estilo general para celdas de todas las tablas */
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
  vertical-align: middle;
}
th { /* Estilo general para cabeceras de todas las tablas */
  background-color: #e9ecef;
  font-weight: 600;
  color: #495057;
}

/* Estilos específicos para la tabla de horarios inferior */
.schedule-title {
  color: #004085;
  text-align: center;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 500;
}
.schedule-table th { /* Cabeceras especiales */
    background-color: #0069d9;
    color: white;
}
.schedule-table td {
    text-align: center;
    vertical-align: top;
    min-height: 65px;
    font-size: 0.85rem;
}
.schedule-table td div { /* Para el contenido dentro de la celda de horario */
  line-height: 1.5;
  padding: 2px 0;
}
.schedule-table td:first-child { /* Celda de la hora en la tabla de horarios */
    background-color: #f8f9fa;
    font-weight: 500;
    width: 80px;
}
.site-footer {
  background-color: #343a40;
  color: white;
  text-align: center;
  padding: 1rem 0;
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
}
.site-footer p {
  margin: 0;
  font-size: 0.9em;
}
@media (max-width: 768px) {
  .content-card,
  .placeholder-nuevo-horario.content-card {
    padding: 1rem;
  }
  h1 { font-size: 1.6rem; }
  .schedule-title { font-size: 1.3rem; }
}
</style>