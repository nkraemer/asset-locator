import { nextTick } from 'vue'
import { useExchangeRate, parseValetResponse, validateCustomRate } from './useExchangeRate'

describe('parseValetResponse', () => {
  it('parses a valid response', () => {
    const data = { observations: [{ FXUSDCAD: { v: '1.3677' } }] }
    expect(parseValetResponse(data)).toBe(1.3677)
  })

  it('throws on missing observations', () => {
    expect(() => parseValetResponse({})).toThrow('no observations')
  })

  it('throws on empty observations array', () => {
    expect(() => parseValetResponse({ observations: [] })).toThrow('no observations')
  })

  it('throws on missing FXUSDCAD value', () => {
    expect(() => parseValetResponse({ observations: [{}] })).toThrow('missing FXUSDCAD')
  })

  it('throws on non-numeric value', () => {
    expect(() => parseValetResponse({ observations: [{ FXUSDCAD: { v: 'abc' } }] })).toThrow(
      'Invalid exchange rate',
    )
  })

  it('throws on zero rate', () => {
    expect(() => parseValetResponse({ observations: [{ FXUSDCAD: { v: '0' } }] })).toThrow(
      'Invalid exchange rate',
    )
  })

  it('throws on negative rate', () => {
    expect(() => parseValetResponse({ observations: [{ FXUSDCAD: { v: '-1.5' } }] })).toThrow(
      'Invalid exchange rate',
    )
  })
})

describe('validateCustomRate', () => {
  it('returns null for valid positive number', () => {
    expect(validateCustomRate(1.36)).toBeNull()
  })

  it('rejects NaN', () => {
    expect(validateCustomRate(NaN)).toBe('Exchange rate must be a number')
  })

  it('rejects Infinity', () => {
    expect(validateCustomRate(Infinity)).toBe('Exchange rate must be a number')
  })

  it('rejects zero', () => {
    expect(validateCustomRate(0)).toBe('Exchange rate must be positive')
  })

  it('rejects negative', () => {
    expect(validateCustomRate(-1)).toBe('Exchange rate must be positive')
  })
})

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('useExchangeRate', () => {
  const validResponse = { observations: [{ FXUSDCAD: { v: '1.3500' } }] }

  it('starts in loading state with null rate', () => {
    const fakeFetch = () => new Promise<unknown>(() => {}) // never resolves
    const { status, rate } = useExchangeRate(fakeFetch)
    expect(status.value).toBe('loading')
    expect(rate.value).toBeNull()
  })

  it('sets rate and ready status on successful fetch', async () => {
    const fakeFetch = () => Promise.resolve(validResponse)
    const { status, rate, fetchedRate, isCustom } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    expect(status.value).toBe('ready')
    expect(rate.value).toBe(1.35)
    expect(fetchedRate.value).toBe(1.35)
    expect(isCustom.value).toBe(false)
  })

  it('sets error status on network failure', async () => {
    const fakeFetch = () => Promise.reject(new Error('Network error'))
    const { status, rate, errorMessage } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    expect(status.value).toBe('error')
    expect(rate.value).toBeNull()
    expect(errorMessage.value).toBe('Network error')
  })

  it('sets error status on invalid API response', async () => {
    const fakeFetch = () => Promise.resolve({ unexpected: true })
    const { status, errorMessage } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    expect(status.value).toBe('error')
    expect(errorMessage.value).toContain('no observations')
  })

  it('setCustomRate overrides fetched rate', async () => {
    const fakeFetch = () => Promise.resolve(validResponse)
    const { rate, isCustom, setCustomRate } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    const error = setCustomRate(1.4)
    expect(error).toBeNull()
    expect(rate.value).toBe(1.4)
    expect(isCustom.value).toBe(true)
  })

  it('setCustomRate rejects invalid values', async () => {
    const fakeFetch = () => Promise.resolve(validResponse)
    const { rate, setCustomRate } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    expect(setCustomRate(0)).toBe('Exchange rate must be positive')
    expect(setCustomRate(-1)).toBe('Exchange rate must be positive')
    expect(setCustomRate(NaN)).toBe('Exchange rate must be a number')
    // rate should remain the fetched value
    expect(rate.value).toBe(1.35)
  })

  it('resetRate reverts to fetched rate', async () => {
    const fakeFetch = () => Promise.resolve(validResponse)
    const { rate, isCustom, setCustomRate, resetRate } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    setCustomRate(1.5)
    expect(rate.value).toBe(1.5)

    resetRate()
    expect(rate.value).toBe(1.35)
    expect(isCustom.value).toBe(false)
  })

  it('custom rate still works when fetch failed', async () => {
    const fakeFetch = () => Promise.reject(new Error('fail'))
    const { rate, status, setCustomRate } = useExchangeRate(fakeFetch)

    await flushPromises()
    await nextTick()

    expect(status.value).toBe('error')
    expect(rate.value).toBeNull()

    setCustomRate(1.4)
    expect(rate.value).toBe(1.4)
  })
})
