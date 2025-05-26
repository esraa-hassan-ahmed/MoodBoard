<template>
    <div v-if="show" class="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl space-y-4">
        <h2 class="text-xl font-bold text-center">{{ isLogin ? 'Anmeldung' : 'Registrierung' }}</h2>
  
        <input v-model="username" type="text" placeholder="Benutzername"
               class="w-full border p-2 rounded" />
        <input v-model="password" type="password" placeholder="Passwort"
               class="w-full border p-2 rounded" />
  
        <button @click="submit" class="bg-gray-800 text-white w-full py-2 rounded hover:bg-gray-700">
          {{ isLogin ? 'Einloggen' : 'Registrieren' }}
        </button>
  
        <p class="text-sm text-center">
          <span v-if="isLogin">Noch kein Account?</span>
          <span v-else>Schon registriert?</span>
          <button class="text-blue-500 ml-2" @click="toggle">
            {{ isLogin ? 'Registrieren' : 'Einloggen' }}
          </button>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, inject } from 'vue'
  import axios from 'axios'
  const socket = inject('socket')
  
  const props = defineProps({
    show: Boolean  //Zeigt das Login-/Signup-Formular an oder nicht
  })
  const emit = defineEmits(['authenticated'])
  
  const username = ref('')
  const password = ref('')
  const isLogin = ref(true)
  
  const toggle = () => {
    isLogin.value = !isLogin.value
  }
  // Funktion zum Absenden des Formulars (Login oder Signup)
  const submit = async () => {
    // URL für Login oder Signup je nach Zustand
    const url = isLogin.value ? 'http://localhost:3000/login' : 'http://localhost:3000/signup'
    try {
      const response = await axios.post(url, { username: username.value, password: password.value });
      if (response.data.id) {
        console.log('User saved in DB and localStorage');

        // Verbinde den Benutzer mit dem Socket-Server
        socket.emit('user-connected', response.data.id);
        socket.emit('user-status-update', response.data.id, true);

        // Sende die Benutzerdaten an das übergeordnete Komponent
        emit('authenticated', response.data)
      } else {
        throw new Error('No ID received');
      }
    } catch (err) {
      // Fehlerbehandlung bei fehlerhafter Anmeldung
      alert('Fehler: ' + err.response.data.error)
    }
  }
  </script>
  