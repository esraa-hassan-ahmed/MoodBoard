<template>
    <div class="p-4">

      <!-- Navbar -->
      <Navbar />

      <div class=" p-4 flex flex-col md:flex-row gap-4">
        <!-- Input Field -->
        <input
          v-model="searchQuery"
          @keyup.enter="fetchImages"
          type="text"
          placeholder="Suchbegriff eingeben..."
          class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <!-- Button -->
        <button
          @click="fetchImages"
          class="w-full md:w-auto bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
        >
          Suchen
        </button>
      </div>

      <div v-if="images.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="(image, index) in images" :key="index" class="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 relative">
            <img :src="image.urls.small" alt="Mood Image" class="w-full h-60 object-cover" />
            <button 
              @click="toggleFavorite(image)"
              class="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full"
              aria-label="Toggle favorite"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-6 w-6 fill-current" 
                :class="{'text-red-500': favoritePhotoIds.has(image.id), 'text-gray-300': !favoritePhotoIds.has(image.id)}" 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
        </div>
      </div>
    </div>
</template>
<script setup>
import { ref, onMounted , inject  } from 'vue'
import axios from 'axios'  // Importieren von Axios, um API-Anfragen zu stellen
import Navbar from "@/views/Navbar.vue";

const socket = inject('socket')

const searchQuery = ref('')
const images = ref([])
const favoritePhotoIds = ref(new Set())

const toggleFavorite = async (image) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const userId = user?.id;
  const imageId = image.id;
  const isAlreadyFavorite = favoritePhotoIds.value.has(image.id); // Überprüfen, ob das Bild bereits als Favorit markiert ist

  try {
    if (!isAlreadyFavorite) {  // Wenn das Bild noch nicht als Favorit markiert ist
      const response = await axios.post('http://localhost:3000/like', {
        userId: userId,
        photoId: imageId,
        url: image.urls.small,
        alt: image.alt_description
      });
      console.log("Liked---photos", response.data);
      favoritePhotoIds.value.add(imageId); // Bild als Favorit zum Set hinzufügen
    }else { // Wenn das Bild bereits als Favorit markiert ist
      await axios.delete('http://localhost:3000/unlike', {
        data: {
          userId: userId,
          photoId: imageId
        }
      });
      favoritePhotoIds.value.delete(imageId); // Bild aus dem Set der Favoriten entfernen
    }
    
  } catch (err) {
    console.error('Fehler beim Speichern des Likes:', err)
  }
}
// Funktion zum Abrufen von Bildern von der API
const fetchImages = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/images?query=${searchQuery.value}`);
    console.log(res);
    images.value = res.data.results;
  } catch (err) {
    console.error('Error fetching images:', err)
  }
}
onMounted(() => {
  fetchImages()
})
</script>
<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}
.card img {
  width: 100%;
  border-radius: 10px;
}
</style>