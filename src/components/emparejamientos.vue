<template>
    <div class="emparejamientos">
      <h2>Emparejamientos Generados</h2>
      <table v-if="emparejamientos.length">
        <thead>
          <tr>
            <th>Jugador 1</th>
            <th>Jugador 2</th>
            <th>Horario</th>
            <th>División</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in emparejamientos" :key="emp.id">
            <td>{{ emp.jugador1 }}</td>
            <td>{{ emp.jugador2 }}</td>
            <td>{{ formatFecha(emp.horario) }}</td>
            <td>{{ emp.division }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No hay emparejamientos aún.</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const emparejamientos = ref([])
  
  const obtenerEmparejamientos = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/emparejamientos")
      const data = await res.json()
      emparejamientos.value = data
    } catch (err) {
      console.error("Error obteniendo emparejamientos:", err)
    }
  }
  
  const formatFecha = (datetime) => {
    const fecha = new Date(datetime)
    return fecha.toLocaleString()
  }
  
  onMounted(() => {
    obtenerEmparejamientos()
  })
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
  }
  </style>
  