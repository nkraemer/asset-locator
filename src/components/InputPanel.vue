<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { InputValues } from '../utils/compute'

const emit = defineEmits<{
  change: [value: InputValues]
}>()

const values = reactive<InputValues>({
  tfsa: 0,
  rrsp: 0,
  registered: 0,
  canadianStocks: 0,
  usStocks: 0,
  internationalStocks: 0,
  bonds: 0,
})

watch(values, () => emit('change', { ...values }), { deep: true })
</script>

<template>
  <section class="panel input-panel">
    <h2>Inputs</h2>
    <div class="field">
      <label for="tfsa-input">TFSA</label>
      <div class="dollar-field">
        <span>$</span>
        <input id="tfsa-input" type="number" min="0" v-model.number="values.tfsa" />
      </div>
    </div>
    <div class="field">
      <label for="rrsp-input">RRSP</label>
      <div class="dollar-field">
        <span>$</span>
        <input id="rrsp-input" type="number" min="0" v-model.number="values.rrsp" />
      </div>
    </div>
    <div class="field">
      <label for="registered-input">Registered</label>
      <div class="dollar-field">
        <span>$</span>
        <input id="registered-input" type="number" min="0" v-model.number="values.registered" />
      </div>
    </div>

    <h2 class="section-heading">Allocation</h2>
    <div class="field">
      <label for="canadian-stocks-input">Canadian Stocks</label>
      <div class="percent-field">
        <input id="canadian-stocks-input" type="number" min="0" max="100" v-model.number="values.canadianStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="us-stocks-input">US Stocks</label>
      <div class="percent-field">
        <input id="us-stocks-input" type="number" min="0" max="100" v-model.number="values.usStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="international-stocks-input">International Stocks</label>
      <div class="percent-field">
        <input id="international-stocks-input" type="number" min="0" max="100" v-model.number="values.internationalStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="bonds-input">Bonds</label>
      <div class="percent-field">
        <input id="bonds-input" type="number" min="0" max="100" v-model.number="values.bonds" />
        <span>%</span>
      </div>
    </div>
  </section>
</template>
