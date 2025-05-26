<script setup>
import { ref, onMounted } from 'vue'
import AuthModal from '@/components/LoginModal.vue'

const user = ref(null)

const handleAuth = (userData) => {
  localStorage.setItem('user', JSON.stringify({
    id: userData.id,
    username: userData.username
  }));  
  user.value = userData;
}
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
})
</script>

<template>
  <div>
    <AuthModal v-if="!user" :show="true" @authenticated="handleAuth" />
    <router-view v-else/>
  </div>
</template>

<style scoped>

</style>
