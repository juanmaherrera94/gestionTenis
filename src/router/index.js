import { createRouter, createWebHistory } from 'vue-router'
import loginVista from '@/views/loginVista.vue'
import usuarioVista from '@/views/usuarioVista.vue'
import adminVista from '@/views/adminVista.vue'
import agregarJugador from '@/views/agregarJugadorVista.vue'
import editarJugador from '@/views/editarJugadorVista.vue'
import emparejamientosVista from '@/views/emparejamientosVista.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: loginVista },
    { path: '/usuario', name: 'usuario', component: usuarioVista },
    { path: '/admin', name: 'admin', component: adminVista },
    { path: '/admin/agregar-jugador', name: 'agregarJugador', component: agregarJugador },
    { path: '/admin/editar-jugador/:id', name: 'editarJugador', component: editarJugador },
    { path: "/emparejamientos", name: "emparejamientos", component: emparejamientosVista }
  ]
})
    

export default router