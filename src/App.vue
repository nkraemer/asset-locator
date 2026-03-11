<script setup lang="ts">
import { ref } from 'vue'
import InputPanel from './components/InputPanel.vue'
import OutputPanel from './components/OutputPanel.vue'
import AppFooter from './components/AppFooter.vue'
import FaqSection from './components/FaqSection.vue'
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
  overAllocated: false,
})
const exchangeRate = useExchangeRate()

function onInputChange(inputs: Parameters<typeof compute>[0]) {
  outputValues.value = compute(inputs)
}
</script>

<template>
  <main>
    <h1>Canadian Asset Locator 🍁</h1>
    <p class="description">
      Welcome to the Canadian Asset Locator! Use this tool to help allocate your registered assets
      across account types to optimise for tax efficiency.
      Before you use this tool, please understand that this is a personal project, not a polished product, and it comes with no guarantees or warranties of any kind. Always do your own research and consult a qualified financial advisor before making any investment decisions.
    </p>
    <FaqSection />
    <div class="panels">
      <InputPanel :exchange-rate="exchangeRate" @change="onInputChange" />
      <OutputPanel :values="outputValues" />
    </div>
    <AppFooter />
  </main>
</template>
