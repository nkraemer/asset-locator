<script setup lang="ts">
import { ref } from 'vue'
import InputPanel from './components/InputPanel.vue'
import OutputPanel from './components/OutputPanel.vue'
import AppFooter from './components/AppFooter.vue'
import { compute } from './utils/compute'
import { useExchangeRate } from './composables/useExchangeRate'
import type { OutputValues } from './utils/compute'

const empty = { canadianStocks: 0, usStocks: 0, internationalStocks: 0, bonds: 0 }
const outputValues = ref<OutputValues>({
  tfsa: { ...empty },
  rrsp: { ...empty },
  registered: { ...empty },
  rrspNominal: { ...empty },
  rrspNominalTotal: 0,
  grossUp: false,
  exchangeRate: null,
})
const exchangeRate = useExchangeRate()

function onInputChange(inputs: Parameters<typeof compute>[0]) {
  outputValues.value = compute(inputs)
}
</script>

<template>
  <main>
    <h1>Asset Locator 5000</h1>
    <p class="description">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Allocate your registered assets
      across account types to optimise for tax efficiency and long-term growth.
    </p>
    <div class="panels">
      <InputPanel :exchange-rate="exchangeRate" @change="onInputChange" />
      <OutputPanel :values="outputValues" />
    </div>
    <AppFooter />
  </main>
</template>
