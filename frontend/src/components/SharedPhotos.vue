<template>
  <div class=" bg-gray-100 p-4">

    <!-- Navbar -->
    <Navbar />
    
    <div class="flex">
      <!-- Left column: Users list -->
      <div class=" h-screen w-1/4  p-4 border-r overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Benutzer</h2>
        <div v-for="user in users" :key="user.id" class="flex items-center gap-3 mb-4">
          <div class="relative">
            <img src="https://www.gravatar.com/avatar/?d=mp" alt="Avatar" class="w-10 h-10 rounded-full" />
            <span
              class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              :class="user.online ? 'bg-green-500' : 'bg-gray-400'"
            ></span>
          </div>
          <span class="text-sm font-medium">{{ user.username }}</span>
        </div>
      </div>

      <!-- Right column: Photos grid -->
      <div class="w-3/4 p-6 overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Geteilte Fotos</h2>
        <div class="grid grid-cols-3 gap-4">
              <div
                v-for="photo in uniquePhotos"
                :key="photo.id"
                class="relative overflow-hidden rounded-xl shadow-lg"
              >
              <img :src="photo.url" alt="Photo" class="w-full h-48 object-cover" />

              <div class="bg-white p-4 rounded-xl shadow-md mt-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">
                    ❤️ Likes: {{ photo.Users.length }}
                  </span>
                </div>
                <ul class="space-y-1">
                  <li
                    v-for="likeUser in photo.Users"
                    :key="likeUser.id"
                    class="text-sm text-gray-600 pl-2 border-l-4 border-pink-300"
                  >
                    👤 {{ likeUser.username }}
                  </li>
                </ul>
              </div>
          </div>
        </div>
      </div>
    </div>  
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'
import Navbar from '@/views/Navbar.vue'
const socket = inject('socket')

// Benutzerdaten und eindeutige Fotos
const users = ref([])
const uniquePhotos = ref([])

// Funktion zum Aktualisieren des Benutzerstatus
const updateUserStatuses = (statuses) => {
  users.value.forEach(user => {
    console.log('user status:', statuses[user.id] );
    user.online = statuses[user.id] || false  // Wenn kein Status vorhanden, setze auf offline
  })
}
// Funktion, die beim Laden der Komponente ausgeführt wird
onMounted(async () => {
  try {
    // Abrufen der Benutzerdaten mit den geteilten Fotos
    const response = await axios.get('http://localhost:3000/shared-photos');
    console.log('users-photos:', response.data);

    // Initialisiere die Benutzer mit einem offline-Status
    users.value = response.data.map(user => ({
      ...user,
      online: false // Benutzer ist standardmäßig offline
    }));

    // Alle Benutzerfotos extrahieren und das Lieblingsfoto nicht duplizieren
    const allPhotos = users.value.map(user => user.Photos).flat() 
    const seen = new Set() 
    uniquePhotos.value = allPhotos.filter(photo => {
      if (seen.has(photo.id)) {
        return false     // Foto wurde bereits gesehen
      } else {
        seen.add(photo.id)
        return true      // Foto ist einzigartig
      }
    });
  } catch (error) {
    console.error('Error fetching shared photos:', error)
  }

  // Anfordern des aktuellen Status der Benutzer
  socket.emit('request-statuses');
  // Wenn der Status der Benutzer aktualisiert wird, rufe die Funktion auf
  socket.on('current-statuses', updateUserStatuses);

  // Aktualisieren des Status eines Benutzers, wenn sich der Online-Status ändert
  socket.on('update-user-status', (userId, isOnline) => {
    const user = users.value.find(user => user.id === userId);
    if (user) {
      user.online = isOnline;
    }
  });
  
  // Benutzer-Id aus dem localStorage abrufen und mit Socket verbinden
  const userId = localStorage.getItem('userId');
  if (userId) {
    socket.emit('user-connected', userId);
  }
})
</script>