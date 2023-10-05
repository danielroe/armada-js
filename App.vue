<script setup lang="ts">
import { ref } from 'vue'
import '@picocss/pico'
const conference = ref('ArmadaJS')
const count = ref(0)
</script>

<template>
  <div class="container">
    <h1>Hey {{ conference }} with HMR?!</h1>
    <code>{{ count }}</code>
    <button @click="count++">Hey there!</button>
  </div>
</template>
