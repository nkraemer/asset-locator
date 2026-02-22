<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
</script>

<template>
  <div class="counter">
    <button @click="count--">-</button>
    <span>Count: {{ count }}</span>
    <button @click="count++">+</button>
  </div>
</template>

<style scoped>
.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
}

button {
  width: 2rem;
  height: 2rem;
  font-size: 1.25rem;
  cursor: pointer;
}
</style>
