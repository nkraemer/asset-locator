<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { InputValues } from '../utils/compute'

const emit = defineEmits<{
  change: [value: InputValues]
}>()

const values = reactive<InputValues>({
  tfsa: 10000,
  rrsp: 20000,
  registered: 5000,
  canadianStocks: 30,
  usStocks: 40,
  internationalStocks: 30,
  bonds: 0,
})

const toNum = (n: number) => (Number.isFinite(n) ? n : 0)

watch(values, () => emit('change', {
  ...values,
  canadianStocks: toNum(values.canadianStocks),
  usStocks: toNum(values.usStocks),
  internationalStocks: toNum(values.internationalStocks),
  bonds: toNum(values.bonds),
}), { deep: true })

const allocationTotal = computed(() => toNum(values.canadianStocks) + toNum(values.usStocks) + toNum(values.internationalStocks) + toNum(values.bonds))
const cashAllocation = computed(() => 100 - allocationTotal.value)

type DollarField = 'tfsa' | 'rrsp' | 'registered'

const dollarFormatter = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 })

function formatDollar(n: number): string {
  return dollarFormatter.format(n)
}

function onDollarFocus(field: DollarField, e: Event) {
  const input = e.target as HTMLInputElement
  input.value = values[field] === 0 ? '' : String(values[field])
}

function onDollarChange(field: DollarField, e: Event) {
  const n = parseFloat((e.target as HTMLInputElement).value.replace(/,/g, ''))
  values[field] = isNaN(n) ? 0 : n
}

function onDollarBlur(field: DollarField, e: Event) {
  (e.target as HTMLInputElement).value = formatDollar(values[field])
}

function onDollarKeydown(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '.']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
    e.preventDefault()
  }
}
</script>

<template>
  <section class="panel input-panel">
    <h2>Inputs</h2>
    <div class="field">
      <label for="tfsa-input">TFSA</label>
      <div class="dollar-field">
        <span>$</span>
        <input
          id="tfsa-input"
          type="text"
          inputmode="decimal"
          :value="formatDollar(values.tfsa)"
          @focus="onDollarFocus('tfsa', $event)"
          @change="onDollarChange('tfsa', $event)"
          @blur="onDollarBlur('tfsa', $event)"
          @keydown="onDollarKeydown"
        />
      </div>
    </div>
    <div class="field">
      <label for="rrsp-input">RRSP</label>
      <div class="dollar-field">
        <span>$</span>
        <input
          id="rrsp-input"
          type="text"
          inputmode="decimal"
          :value="formatDollar(values.rrsp)"
          @focus="onDollarFocus('rrsp', $event)"
          @change="onDollarChange('rrsp', $event)"
          @blur="onDollarBlur('rrsp', $event)"
          @keydown="onDollarKeydown"
        />
      </div>
    </div>
    <div class="field">
      <label for="registered-input">Registered</label>
      <div class="dollar-field">
        <span>$</span>
        <input
          id="registered-input"
          type="text"
          inputmode="decimal"
          :value="formatDollar(values.registered)"
          @focus="onDollarFocus('registered', $event)"
          @change="onDollarChange('registered', $event)"
          @blur="onDollarBlur('registered', $event)"
          @keydown="onDollarKeydown"
        />
      </div>
    </div>

    <h2 class="section-heading">Allocation</h2>
    <div class="field">
      <label for="canadian-stocks-input">Canadian Stocks</label>
      <div class="percent-field">
        <input id="canadian-stocks-input" type="number" min="0" max="100" step="any" v-model.number="values.canadianStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="us-stocks-input">US Stocks</label>
      <div class="percent-field">
        <input id="us-stocks-input" type="number" min="0" max="100" step="any" v-model.number="values.usStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="international-stocks-input">International Stocks</label>
      <div class="percent-field">
        <input id="international-stocks-input" type="number" min="0" max="100" step="any" v-model.number="values.internationalStocks" />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="bonds-input">Bonds</label>
      <div class="percent-field">
        <input id="bonds-input" type="number" min="0" max="100" step="any" v-model.number="values.bonds" />
        <span>%</span>
      </div>
    </div>
    <div class="field field--readonly" :class="{ 'field--invalid': cashAllocation < 0 }">
      <label for="cash-input">Cash</label>
      <div class="percent-field">
        <input id="cash-input" type="number" :value="cashAllocation" readonly tabindex="-1" />
        <span>%</span>
      </div>
    </div>
  </section>
</template>
