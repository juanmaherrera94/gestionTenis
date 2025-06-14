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
  import { ref, onMounted } from 'vue'; // 'computed' no se importa porque no hay referencias reactivas que lo requieran
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { toast } from 'vue3-toastify';

  const router = useRouter();

  // Estado básico del componente: nombre e ID de usuario, y control para mostrar formulario de cambio de contraseña
  const nombreUsuario = ref(''); // Se carga desde localStorage al montar el componente
  const currentUserId = ref(null); // Se carga desde localStorage
  const showPasswordForm = ref(false); // Controla la visibilidad del formulario para cambiar contraseña

  // Datos disponibles para el formulario de reserva
  const horariosDisponibles = ref(["09:15:00", "11:30:00", "16:15:00", "18:30:00", "20:30:00"]);
  const diasDisponibles = ref(["Viernes", "Sábado", "Domingo"]);
  const pistasDisponibles = ref([1, 2, 3]);

  // Valores seleccionados por el usuario en el formulario
  const diaSeleccionado = ref("");
  const horarioSeleccionado = ref("");
  const pistaSeleccionada = ref(null);

  // Datos para el formulario de cambio de contraseña
  const contrasenaActual = ref("");
  const nuevaContrasena = ref("");

  // Nuevas referencias para gestionar reservas y emparejamientos en la tabla inferior
  const todasReservasPendientes = ref([]);    // Todas las reservas pendientes de todos los usuarios
  const emparejamientosConfirmados = ref([]); // Emparejamientos ya confirmados entre usuarios

  // Referencia para la tabla superior de reservas, que mantiene su lógica y endpoint original
  // Si antes se usaba '/api/reservas', esta variable mantiene la información que viene de ese endpoint.
  // Si el endpoint cambia, aquí debes ajustar la URL en la función que carga estos datos.
  const reservasOriginalesParaTablaSuperior = ref([]);

  // Función que se ejecuta al montar el componente
  onMounted(async () => {
    // Recupera nombre e ID del usuario guardados localmente
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    const idGuardado = localStorage.getItem('userId');

    // Si no hay datos, redirige al login
    if (nombreGuardado && idGuardado) {
      nombreUsuario.value = nombreGuardado;
      currentUserId.value = parseInt(idGuardado, 10);
    } else {
      toast.error("Error de autenticación. Por favor, inicia sesión de nuevo.");
      router.push("/");
      return;
    }

    // Carga las reservas y los datos para mostrar la tabla
    await mostrarReservasOriginales();
    await cargarDatosParaTablaHorarios();
  });

  // Carga las reservas originales para la tabla superior
  const mostrarReservasOriginales = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/reservas");
      reservasOriginalesParaTablaSuperior.value = response.data;
    } catch (error) {
      toast.error("Error al cargar reservas para la tabla superior: " + (error.response?.data?.message || error.message));
      console.error("Error al cargar reservas (tabla superior):", error.response || error);
    }
  };

  // Carga los datos necesarios para mostrar la tabla de horarios
  const cargarDatosParaTablaHorarios = async () => {
    await cargarTodasReservasPendientes();
    await cargarEmparejamientosConfirmados();
  };

  // Obtiene todas las reservas pendientes desde la API
  const cargarTodasReservasPendientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/reservas/pendientes");
      todasReservasPendientes.value = response.data;
    } catch (error) {
      toast.error("Error al cargar todas las solicitudes pendientes: " + (error.response?.data?.message || error.message));
      console.error("Error al cargar todas las pendientes:", error.response || error);
    }
  };

  // Obtiene emparejamientos confirmados desde la API
  const cargarEmparejamientosConfirmados = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/reservas/emparejamientos-confirmados");
      emparejamientosConfirmados.value = response.data;
    } catch (error) {
      toast.error("Error al cargar emparejamientos confirmados: " + (error.response?.data?.message || error.message));
      console.error("Error al cargar emparejamientos confirmados:", error.response || error);
    }
  };

  // Guarda la disponibilidad (o reserva) del usuario
  const guardarDisponibilidad = async () => {
    // Valida que todos los campos estén completos
    if (!diaSeleccionado.value || !horarioSeleccionado.value || pistaSeleccionada.value === null) {
      toast.error("Por favor, completa todos los campos (día, hora y pista).");
      return;
    }
    if (!currentUserId.value) {
      toast.error("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
      return;
    }

    try {
      // Envia la reserva al backend
      const response = await axios.post("http://localhost:3000/api/reservas", {
        dia: diaSeleccionado.value,
        hora: horarioSeleccionado.value,
        usuario_id: currentUserId.value,
        numero_pista: pistaSeleccionada.value
      });

      toast.success(response.data.message || "Operación realizada con éxito.");

      // Limpia los campos luego de guardar
      diaSeleccionado.value = "";
      horarioSeleccionado.value = "";
      pistaSeleccionada.value = null;

      // Refresca la información de reservas en pantalla
      await mostrarReservasOriginales();
      await cargarDatosParaTablaHorarios();

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al procesar la solicitud: " + error.message);
      }
      console.error("Error al guardar disponibilidad/crear emparejamiento:", error.response || error);
    }
  };

  // Cierra la sesión del usuario y limpia el localStorage
  const cerrarSesion = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nombreUsuario');
    router.push("/");
    toast.success("Sesión cerrada correctamente");
  };

  // Alterna la visibilidad del formulario para cambiar la contraseña
  const togglePasswordForm = () => {
    showPasswordForm.value = !showPasswordForm.value;
  };

  // Cambia la contraseña del usuario actual
  const cambiarContrasena = async () => {
    // Valida que ambos campos estén llenos
    if (!contrasenaActual.value || !nuevaContrasena.value) {
      toast.error("Por favor completa ambos campos.");
      return;
    }
    if (!currentUserId.value) {
      toast.error("Usuario no identificado para cambiar contraseña.");
      return;
    }
    try {
      // Llama a la API para actualizar la contraseña
      await axios.put(`http://localhost:3000/api/usuarios/${currentUserId.value}/contrasena`, {
        actual: contrasenaActual.value,
        nueva: nuevaContrasena.value,
      });
      toast.success("Contraseña actualizada correctamente.");
      // Limpia los inputs y oculta el formulario
      contrasenaActual.value = "";
      nuevaContrasena.value = "";
      showPasswordForm.value = false;
    } catch (error) {
      toast.error("Error al cambiar la contraseña: " + (error.response?.data?.message || error.message));
      console.error("Error cambiando contraseña:", error.response || error);
    }
  };

  // Formatea la hora para mostrar solo HH:MM
  const formatHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5);
  };

  // Devuelve el HTML para la celda en la tabla de horarios según estado de pista
  const getEstadoCeldaHTML = (dia, hora) => {
    let contentLines = [];
    const pistasOrdenadas = Array.isArray(pistasDisponibles.value)
      ? [...pistasDisponibles.value].sort((a, b) => a - b)
      : [];

    for (const pistaNum of pistasOrdenadas) {
      let infoPista = `P${pistaNum}: `;
      let actividadEncontrada = false;

      // Busca si hay un emparejamiento confirmado en esta pista, día y hora
      const emparejamiento = emparejamientosConfirmados.value.find(
        e => e.dia === dia && e.horario === hora && e.pista === pistaNum
      );
      if (emparejamiento) {
        const nombre1 = emparejamiento.nombre_jugador1 ? emparejamiento.nombre_jugador1.split(' ')[0] : 'J1';
        const nombre2 = emparejamiento.nombre_jugador2 ? emparejamiento.nombre_jugador2.split(' ')[0] : 'J2';
        infoPista += `${nombre1} vs ${nombre2}`;
        actividadEncontrada = true;
      }

      // Si no hay emparejamiento, revisa si hay una reserva pendiente
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

      // Si está libre, muestra "Libre"
      if (!actividadEncontrada) {
        infoPista += 'Libre';
      }
      contentLines.push(infoPista);
    }
    return contentLines.join('<br>');
  };
</script>

<style scoped>

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
  .booking-form-card, .password-change-section, .reservations-table-card { 
    max-width: 700px;
  }
  .placeholder-nuevo-horario.content-card { 
    max-width: 1000px;
    padding: 2rem; 
  }
  .password-toggle-container {
    width: 100%;
    max-width: 700px;
    text-align: center;
    margin-top: -1rem;
    margin-bottom: 1rem;
  }
  .password-toggle-link {
    color: white;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
  .password-toggle-link:hover {
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
  table { 
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
  }
  th, td { 
    border: 1px solid #dee2e6;
    padding: 0.75rem;
    text-align: left;
    vertical-align: middle;
  }
  th { 
    background-color: #e9ecef;
    font-weight: 600;
    color: #495057;
  }

  .schedule-title {
    color: #004085;
    text-align: center;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.6rem;
    font-weight: 500;
  }
  .schedule-table th { 
      background-color: #0069d9;
      color: white;
  }
  .schedule-table td {
      text-align: center;
      vertical-align: top;
      min-height: 65px;
      font-size: 0.85rem;
  }
  .schedule-table td div { 
    line-height: 1.5;
    padding: 2px 0;
  }
  .schedule-table td:first-child { 
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