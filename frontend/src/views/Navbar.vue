<template>
    <div>
        <nav class="bg-gray-200 shadow-md p-4 flex items-center justify-between">
        <!-- Logo + Project Name -->
        <div class="flex items-center space-x-2 inset-y-0 left-0">
          <img src="../assets/Logo.jpg" alt="Logo" class="w-10 h-10" />
          <span class="text-xl font-bold text-gray-800">Moodboard</span> |
          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
                <router-link
                    to="/"
                    exact
                    class="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                    active-class="bg-gray-900 text-white font-bold"
                >
                  Startseite
                </router-link>

                <router-link
                    to="/shared"
                    class="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                    active-class="bg-gray-900 text-white font-bold"
                >
                  Geteilte Fotos
                </router-link>
                </div>
          </div>
        </div>
        <div v-if="username"  >
          <div class="flex items-center space-x-2 justify-self-end" @click="toggleDropdown">
            <div class="relative" >
              <img src="https://www.gravatar.com/avatar/?d=mp" alt="Avatar" class="w-10 h-10 rounded-full" />
              <span
                class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
              ></span>
            </div>
            <div>
              <span class="font-semibold">{{ username }}</span>
            </div>
          </div>
        </div>
        <div v-if="dropdownVisible" class="absolute top-19 right-4 bg-white text-black shadow-md rounded-md w-40">
          <ul>
            <li @click="logout" class="p-2 cursor-pointer hover:bg-gray-200">Abmelden</li>
          </ul>
        </div>
      </nav>
    </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue'
const socket = inject('socket')  // Injektion der Socket-Verbindung für WebSocket-Kommunikation

const username = ref('');
let parsedUser = null; // Variable für den Benutzer, die später geparst wird
const isOnline = ref(true); // Variable, um den Online-Status des Benutzers zu verfolgen
const dropdownVisible = ref(false);

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const logout = () => {
  socket.emit('manual-disconnect', parsedUser.id);  // Benachrichtigen des Server, dass der Benutzer manuell die Verbindung trennt
  socket.disconnect(); // Trennen der Socket-Verbindung
  localStorage.removeItem('user'); // Entfernen der Benutzerdaten aus dem LocalStorage
  window.location.href = '/'; // Weiterleitung zur Startseite
}
// Funktion, die beim Laden der Komponente aufgerufen wird
onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    parsedUser = JSON.parse(userData)
    username.value = parsedUser.username;
    socket.emit('user-connected', parsedUser.id); // Benachrichtigen des Server, dass der Benutzer verbunden is
    socket.emit('user-status-update', parsedUser.id, true); // Setzen des Online-Status des Benutzers auf true
  }
})
</script>
<style lang="">
    
</style>