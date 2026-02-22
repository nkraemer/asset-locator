<script setup lang="ts">
import type { OutputValues } from '../utils/compute'

defineProps<{
  values: OutputValues
}>()
</script>

<template>
  <section class="panel output-panel">
    <h2>Outputs</h2>
    <div class="field">
      <label>TFSA</label>
      <output>{{ values.tfsa }}</output>
    </div>
    <div class="field">
      <label>RRSP</label>
      <output>{{ values.rrsp }}</output>
    </div>
    <div class="field">
      <label>Registered</label>
      <output>{{ values.registered }}</output>
    </div>
  </section>
</template>
