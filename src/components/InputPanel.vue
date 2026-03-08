<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import { toNum, type InputValues } from '../utils/compute'
import type { ExchangeRateState } from '../composables/useExchangeRate'

const props = defineProps<{
  exchangeRate: ExchangeRateState
}>()

const emit = defineEmits<{
  change: [value: InputValues]
}>()

const values = reactive({
  tfsa: 10000,
  rrsp: 20000,
  registered: 5000,
  canadianStocks: 30,
  usStocks: 40,
  internationalStocks: 30,
  bonds: 0,
  marginalTaxRate: 40,
  grossUp: false,
})

function emitChange() {
  emit('change', {
    ...values,
    canadianStocks: toNum(values.canadianStocks),
    usStocks: toNum(values.usStocks),
    internationalStocks: toNum(values.internationalStocks),
    bonds: toNum(values.bonds),
    exchangeRate: props.exchangeRate.rate.value,
    marginalTaxRate: toNum(values.marginalTaxRate),
    grossUp: values.grossUp,
  })
}

watch(values, emitChange, { deep: true })
watch(() => props.exchangeRate.rate.value, emitChange)

const allocationTotal = computed(
  () =>
    toNum(values.canadianStocks) +
    toNum(values.usStocks) +
    toNum(values.internationalStocks) +
    toNum(values.bonds),
)
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
  ;(e.target as HTMLInputElement).value = formatDollar(values[field])
}

function onDollarKeydown(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '.']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
    e.preventDefault()
  }
}

const rateError = ref<string | null>(null)

function onRateChange(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (raw === '') {
    props.exchangeRate.resetRate()
    rateError.value = null
    return
  }
  const n = parseFloat(raw)
  const error = props.exchangeRate.setCustomRate(n)
  rateError.value = error
}

function onRateReset() {
  props.exchangeRate.resetRate()
  rateError.value = null
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
        <input
          id="canadian-stocks-input"
          v-model.number="values.canadianStocks"
          type="number"
          min="0"
          max="100"
          step="any"
        />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="us-stocks-input">US Stocks</label>
      <div class="percent-field">
        <input
          id="us-stocks-input"
          v-model.number="values.usStocks"
          type="number"
          min="0"
          max="100"
          step="any"
        />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="international-stocks-input">International Stocks</label>
      <div class="percent-field">
        <input
          id="international-stocks-input"
          v-model.number="values.internationalStocks"
          type="number"
          min="0"
          max="100"
          step="any"
        />
        <span>%</span>
      </div>
    </div>
    <div class="field">
      <label for="bonds-input">Bonds</label>
      <div class="percent-field">
        <input
          id="bonds-input"
          v-model.number="values.bonds"
          type="number"
          min="0"
          max="100"
          step="any"
        />
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

    <h2 class="section-heading">RRSP Gross-Up</h2>
    <div class="field field--checkbox">
      <label for="gross-up-input">Adjust RRSP to after-tax value</label>
      <input id="gross-up-input" v-model="values.grossUp" type="checkbox" />
    </div>
    <div class="field" :class="{ 'field--disabled': !values.grossUp }">
      <label for="marginal-tax-rate-input">Marginal Tax Rate</label>
      <div class="percent-field">
        <input
          id="marginal-tax-rate-input"
          v-model.number="values.marginalTaxRate"
          type="number"
          min="0"
          max="100"
          step="any"
          :disabled="!values.grossUp"
        />
        <span>%</span>
      </div>
    </div>

    <h2 class="section-heading">Exchange Rate</h2>
    <div class="field" :class="{ 'field--invalid': rateError }">
      <label for="exchange-rate-input">USD/CAD</label>
      <div class="rate-field">
        <input
          id="exchange-rate-input"
          type="number"
          step="any"
          min="0"
          :value="exchangeRate.rate.value"
          :placeholder="exchangeRate.status.value === 'loading' ? 'Loading...' : 'Enter rate'"
          @change="onRateChange"
        />
        <button
          v-if="exchangeRate.isCustom.value"
          type="button"
          class="rate-reset"
          @click="onRateReset"
        >
          Reset
        </button>
      </div>
      <span v-if="rateError" class="field-error">{{ rateError }}</span>
      <span v-else-if="exchangeRate.status.value === 'error'" class="field-error">
        {{ exchangeRate.errorMessage.value }} — enter a rate manually
      </span>
      <span v-else-if="exchangeRate.isCustom.value" class="field-hint">Custom rate</span>
      <span v-else-if="exchangeRate.status.value === 'ready'" class="field-hint">
        Source:
        <a
          href="https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bank of Canada
        </a>
      </span>
    </div>
  </section>
</template>
