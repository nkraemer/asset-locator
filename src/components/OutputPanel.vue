<script setup lang="ts">
import type { OutputValues } from '../utils/compute'

defineProps<{
  values: OutputValues
}>()

const dollarFormatter = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 })

function formatDollar(n: number): string {
  return dollarFormatter.format(n)
}
</script>

<template>
  <section class="panel output-panel">
    <h2>Outputs</h2>
    <div class="field">
      <label>TFSA</label>
      <output>$ {{ formatDollar(values.tfsa) }}</output>
    </div>
    <div class="field">
      <label>RRSP</label>
      <output>$ {{ formatDollar(values.rrsp) }}</output>
    </div>
    <div class="field">
      <label>Registered</label>
      <output>$ {{ formatDollar(values.registered) }}</output>
    </div>
  </section>
</template>
