import { ref, computed } from 'vue'

export type FetchStatus = 'loading' | 'ready' | 'error'

const BANK_OF_CANADA_URL = 'https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1'

export interface ExchangeRateState {
  rate: ReturnType<typeof computed<number | null>>
  fetchedRate: Readonly<ReturnType<typeof ref<number | null>>>
  customRate: Readonly<ReturnType<typeof ref<number | null>>>
  isCustom: ReturnType<typeof computed<boolean>>
  status: Readonly<ReturnType<typeof ref<FetchStatus>>>
  errorMessage: Readonly<ReturnType<typeof ref<string | null>>>
  setCustomRate: (n: number) => string | null
  resetRate: () => void
}

interface ValetResponse {
  observations?: { FXUSDCAD?: { v?: string } }[]
}

export function parseValetResponse(data: unknown): number {
  const obs = (data as ValetResponse)?.observations
  if (!Array.isArray(obs) || obs.length === 0) {
    throw new Error('Unexpected API response: no observations')
  }
  const raw = obs[0]?.FXUSDCAD?.v
  if (raw == null) {
    throw new Error('Unexpected API response: missing FXUSDCAD value')
  }
  const rate = parseFloat(raw)
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid exchange rate: ${raw}`)
  }
  return rate
}

export function validateCustomRate(n: number): string | null {
  if (!Number.isFinite(n)) return 'Exchange rate must be a number'
  if (n <= 0) return 'Exchange rate must be positive'
  return null
}

export function useExchangeRate(
  fetchFn: (url: string) => Promise<unknown> = defaultFetch,
): ExchangeRateState {
  const fetchedRate = ref<number | null>(null)
  const customRate = ref<number | null>(null)
  const status = ref<FetchStatus>('loading')
  const errorMessage = ref<string | null>(null)

  const isCustom = computed(() => customRate.value !== null)
  const rate = computed(() => (isCustom.value ? customRate.value : fetchedRate.value))

  function setCustomRate(n: number): string | null {
    const error = validateCustomRate(n)
    if (error) return error
    customRate.value = n
    return null
  }

  function resetRate() {
    customRate.value = null
  }

  fetchFn(BANK_OF_CANADA_URL)
    .then((data) => {
      fetchedRate.value = parseValetResponse(data)
      status.value = 'ready'
      errorMessage.value = null
    })
    .catch((err: unknown) => {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : 'Failed to fetch exchange rate'
    })

  return { rate, fetchedRate, customRate, isCustom, status, errorMessage, setCustomRate, resetRate }
}

async function defaultFetch(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
}
