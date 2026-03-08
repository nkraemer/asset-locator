<script setup lang="ts">
import type { OutputValues, AccountAllocation } from '../utils/compute'

defineProps<{
  values: OutputValues
}>()

const dollarFormatter = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 2 })

function formatDollar(n: number): string {
  return dollarFormatter.format(n)
}

function formatUsd(cad: number, rate: number): string {
  return dollarFormatter.format(cad / rate)
}

function accountTotal(a: AccountAllocation): number {
  return a.canadianStocks + a.usStocks + a.internationalStocks + a.bonds
}

const assetLabels: { key: keyof AccountAllocation; label: string }[] = [
  { key: 'canadianStocks', label: 'Canadian Stocks' },
  { key: 'usStocks', label: 'US Stocks' },
  { key: 'internationalStocks', label: 'International Stocks' },
  { key: 'bonds', label: 'Bonds' },
]
</script>

<template>
  <section class="panel output-panel">
    <h2>Recommended Placement</h2>

    <div class="account-block">
      <h3>TFSA — ${{ formatDollar(accountTotal(values.tfsa)) }}</h3>
      <template v-for="asset in assetLabels" :key="asset.key">
        <div v-if="values.tfsa[asset.key] > 0" class="field">
          <label>{{ asset.label }}</label>
          <div class="field-values">
            <output>$ {{ formatDollar(values.tfsa[asset.key]) }}</output>
            <div
              v-if="asset.key === 'usStocks' && values.exchangeRate"
              class="field-details"
            >
              US$ {{ formatUsd(values.tfsa[asset.key], values.exchangeRate) }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="account-block">
      <h3>RRSP — ${{ formatDollar(accountTotal(values.rrsp)) }}</h3>
      <p v-if="values.grossUp" class="account-note">
        ${{ formatDollar(values.rrspNominalTotal) }} nominal
        (before tax)
      </p>
      <template v-for="asset in assetLabels" :key="asset.key">
        <div v-if="values.rrsp[asset.key] > 0" class="field">
          <label>{{ asset.label }}</label>
          <div class="field-values">
            <output>$ {{ formatDollar(values.rrsp[asset.key]) }}</output>
            <div class="field-details">
              <span v-if="asset.key === 'usStocks' && values.exchangeRate">
                US$ {{ formatUsd(values.rrsp[asset.key], values.exchangeRate) }}
              </span>
              <span v-if="values.grossUp && asset.key === 'usStocks' && values.exchangeRate">
                ${{ formatDollar(values.rrspNominal[asset.key]) }} /
                US$ {{ formatUsd(values.rrspNominal[asset.key], values.exchangeRate) }} nominal
              </span>
              <span v-else-if="values.grossUp && asset.key === 'usStocks'">
                ${{ formatDollar(values.rrspNominal[asset.key]) }} nominal
              </span>
              <span v-else-if="values.grossUp">
                ${{ formatDollar(values.rrspNominal[asset.key]) }} nominal
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="account-block">
      <h3>Registered — ${{ formatDollar(accountTotal(values.registered)) }}</h3>
      <template v-for="asset in assetLabels" :key="asset.key">
        <div v-if="values.registered[asset.key] > 0" class="field">
          <label>{{ asset.label }}</label>
          <div class="field-values">
            <output>$ {{ formatDollar(values.registered[asset.key]) }}</output>
            <div
              v-if="asset.key === 'usStocks' && values.exchangeRate"
              class="field-details"
            >
              US$ {{ formatUsd(values.registered[asset.key], values.exchangeRate) }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
