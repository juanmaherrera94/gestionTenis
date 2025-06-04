<template>
  <h1>Listado de jugadores</h1>
  <div class="btn-container">
    <button @click="agregarJugador" class="btn-agregar">Añadir Jugador</button>
    <button @click="cerrarSesion" class="btn-cerrar">Cerrar Sesión</button>
  </div>

  <div class="grid">
    <div class="card" v-for="jugador in jugadoresPaginados" :key="jugador.id">
      <div class="content">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M20 9V5H4V9H20ZM20 11H4V19H20V11ZM3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM5 12H8V17H5V12ZM5 6H7V8H5V6ZM9 6H11V8H9V6Z">
          </path>
        </svg>
        <p class="para"><strong>{{ jugador.nombre }}</strong></p>
        <p class="para">Usuario: {{ jugador.usuario }}</p>
        <p class="para">Contraseña: {{ jugador.password }}</p>
        <p class="para">División ID: {{ jugador.division_id }}</p>
        <div class="btn-actions">
          <button class="Btn blue" @click="editarJugador(jugador.id)">
            <svg class="svg" viewBox="0 0 512 512">
              <path
                d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0z" />
            </svg>
          </button>
          <button class="Btn red" @click="eliminarJugador(jugador.id)">
            <svg class="svg" viewBox="0 0 512 512">
              <path
                d="M96 464c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V128H96v336zm320-384h-80l-34-56H210l-34 56H96c-17.7 0-32 14.3-32 32v16h384v-16c0-17.7-14.3-32-32-32z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="paginacion">
    <div class="btn-paginacion-uiverse-wrapper">
      <button
        class="btn-paginacion-uiverse"
        :disabled="paginaActual === 1"
        @click="paginaActual--"
      >
        <div class="btn-box">
          <span class="btn-elem">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="black"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              ></path>
            </svg>
          </span>
          <span class="btn-elem">
            <svg fill="black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              ></path>
            </svg>
          </span>
        </div>
      </button>
    </div>
    <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
    <div class="btn-paginacion-uiverse-wrapper">
      <button
        class="btn-paginacion-uiverse"
        :disabled="paginaActual === totalPaginas"
        @click="paginaActual++"
      >
        <div class="btn-box">
          <span class="btn-elem">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
              <path
                fill="black"
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              ></path>
            </svg>
          </span>
          <span class="btn-elem">
            <svg fill="black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              ></path>
            </svg>
          </span>
        </div>
      </button>
    </div>
  </div>

  <footer class="site-footer">
    <p>&copy; 2025 Gestión de reservas tenis. Todos los derechos reservados.</p>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const router = useRouter();
const jugadores = ref([]);
const paginaActual = ref(1);
const jugadoresPorPagina = 10;

const jugadoresPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * jugadoresPorPagina;
  return jugadores.value.slice(inicio, inicio + jugadoresPorPagina);
});

const totalPaginas = computed(() =>
  Math.ceil(jugadores.value.length / jugadoresPorPagina)
);

const cerrarSesion = () => {
  localStorage.removeItem('nombreUsuario');
  localStorage.removeItem('userId');
  localStorage.removeItem('rol');
  router.push('/');
};

if (localStorage.getItem('rol') !== 'admin') {
  toast.error('Acceso denegado. Solo los administradores pueden acceder a esta página.');
  router.push('/');
}

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/jugadores');
    jugadores.value = response.data;
  } catch (error) {
    toast.error('Error al cargar jugadores: ' + error.message);
  }
});

const editarJugador = (id) => {
  router.push({ name: 'editarJugador', params: { id } });
};

const eliminarJugador = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
    try {
      await axios.delete(`http://localhost:3000/api/jugadores/${id}`);
      jugadores.value = jugadores.value.filter(j => j.id !== id);
      toast.success('Jugador eliminado con éxito.');
    } catch (error) {
      toast.error('Error al eliminar jugador: ' + error.message);
    }
  }
};

const agregarJugador = () => {
  router.push('/admin/agregar-jugador');
};
</script>

<style>
/* ... (todos tus estilos anteriores: h1, body, btn-container, etc. se mantienen) ... */

/* === INICIO: Estilos MODIFICADOS para .grid y .card === */
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px; /* Aumentada la separación entre tarjetas a 30px */
  justify-items: center;
  padding: 20px;
  width: 100%;
  /* Nuevo max-width calculado para 5 tarjetas de 280px con gap de 30px:
     (280px * 5) + (30px * 4) + (20px * 2) = 1400px + 120px + 40px = 1560px
  */
  max-width: 1560px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  flex-grow: 1;
}

.card {
  width: 280px;  /* Ancho de tarjeta aumentado */
  height: 390px; /* Altura de tarjeta aumentada */
  border-radius: 15px;
  padding: 0;
  transition: transform 0.4s ease;
}

/* El estilo de .content se mantiene como en la última versión (con gap: 14px),
   ya que al agrandar la tarjeta, el contenido tendrá más espacio naturalmente.
   Si ves que necesita más padding o gap interno, puedes ajustarlo aquí.
*/
.content {
  padding: 20px;
  border-radius: 15px;
  background: #FFFFFF;
  color: #333745;
  display: flex;
  flex-direction: column;
  gap: 14px; /* Mantenemos el gap interno, revisa si quieres más con tarjetas grandes */
  position: relative;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}


/* Media Queries para responsividad del grid (breakpoint y minmax ajustados) */
@media (max-width: 1559px) { /* Justo debajo del nuevo max-width calculado (1560px) */
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Actualizado el minmax al nuevo ancho de tarjeta */
    max-width: none;
  }
}

@media (max-width: 630px) { /* Ajustado ligeramente el breakpoint para una sola columna
                              (280px * 2) + 30px_gap + 40px_padding = 560 + 30 + 40 = 630px
                              Por debajo de esto, es mejor una sola columna. */
  .grid {
    grid-template-columns: 1fr;
    gap: 20px; /* Puedes mantener el gap anterior o reducirlo un poco más */
    padding: 15px;
  }
  .content {
    gap: 12px;
    padding: 15px;
  }
}
/* === FIN: Estilos MODIFICADOS para .grid y .card === */


/* === INICIO: Estilos existentes que no cambian (colócalos en el orden que los tenías) === */
h1, .titulo-panel {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 50px;
  color: white;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px #00000030;
  text-align: center;
}

body {
  background: linear-gradient(to bottom right, #1e3c72, #2a5298);
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.btn-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-agregar{
  padding: 10px 15px;
  font-weight: bold;
  border: none;
  background: #5D9CEC;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
.btn-cerrar {
  padding: 10px 15px;
  font-weight: bold;
  border: none;
  background: #EF5350;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.btn-agregar:hover,
.btn-cerrar:hover {
  background-color: #fea000;
  color: white;
}

/* .content ya está definido arriba con sus estilos actuales */

.content::before,
.content::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: inherit;
  z-index: 0;
  transition: all 0.48s ease;
}

.content::before {
  top: -4%;
  width: 90%;
  height: 90%;
  background: #E3F2FD;
}

.content::after {
  top: -8%;
  width: 80%;
  height: 80%;
  background: #F4F8FB;
}

.card:hover {
  transform: translateY(-8px);
}

.card:hover .content::before {
  rotate: -8deg;
  top: 0;
  width: 100%;
  height: 100%;
}

.content > svg, .content > .para, .content > .btn-actions {
  position: relative;
  z-index: 1;
}

.content svg {
  width: 30px;
  height: 30px;
  color: #5D9CEC;
  margin-bottom: 5px;
}

.para {
  font-size: 0.9rem;
  line-height: 1.5;
}

.para strong {
  font-size: 1.1rem;
  color: #2c3e50;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 30px 0;
  padding: 10px 0;
  color: white;
}

.Btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: auto;
  min-width: 90px;
  height: 38px;
  border: none;
  padding: 0px 15px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  color: white;
}

.Btn .svg {
  width: 13px;
  position: absolute;
  right: 0;
  margin-right: 15px;
  fill: white;
  transition-duration: 0.3s;
}

.Btn:hover {
  color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.Btn:hover .svg {
  right: calc(50% - 6.5px);
  margin: 0;
}

.Btn:active {
  transform: translate(1px, 1px);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.Btn.blue {
  background-color: #5D9CEC;
}

.Btn.red {
  background-color: #EF5350;
}

.btn-actions {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
}

/* ... (resto de estilos de paginación y footer sin cambios) ... */
.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse {
  display: block;
  position: relative;
  width: 76px;
  height: 76px;
  margin: 0;
  overflow: hidden;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  border: 0;
}

.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:before {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 3px solid black;
  transition: opacity 0.4s ease 80ms, transform 0.5s ease 80ms;
}

.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:after {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 4px solid #ffffff;
  transform: scale(1.3);
  transition: opacity 0.4s ease, transform 0.5s ease;
  opacity: 0;
}

.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:hover:before,
.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:focus:before {
  opacity: 0;
  transform: scale(0.7);
}

.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:hover:after,
.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:focus:after {
  opacity: 1;
  transform: scale(1);
}

.btn-paginacion-uiverse-wrapper .btn-box {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
}

.btn-paginacion-uiverse-wrapper .btn-elem {
  display: block;
  width: 30px;
  height: 30px;
  margin: 24px 18px 0 22px;
  fill: #f0eeef;
}

.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:hover .btn-box,
.btn-paginacion-uiverse-wrapper .btn-paginacion-uiverse:focus .btn-box {
  transition: 0.4s;
  transform: translateX(-69px);
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
</style>