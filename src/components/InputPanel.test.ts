import { mount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import InputPanel from './InputPanel.vue'
import type { ExchangeRateState } from '../composables/useExchangeRate'

function makeExchangeRateProps(overrides: Partial<ExchangeRateState> = {}): ExchangeRateState {
  return {
    rate: computed(() => 1.35),
    fetchedRate: ref(1.35),
    customRate: ref(null),
    isCustom: computed(() => false),
    status: ref('ready' as const),
    errorMessage: ref(null),
    setCustomRate: () => null,
    resetRate: () => {},
    ...overrides,
  }
}

describe('InputPanel', () => {
  it('cash input displays 0 when allocations sum to 100', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const cashInput = wrapper.find('#cash-input')
    expect((cashInput.element as HTMLInputElement).value).toBe('0')
  })

  it('emits change with correct canadianStocks value when percent input changes', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const canadianInput = wrapper.find('#canadian-stocks-input')
    await canadianInput.setValue(50)
    const emitted = wrapper.emitted('change')
    expect(emitted).toBeTruthy()
    const lastPayload = (emitted as unknown[][])[emitted!.length - 1][0] as {
      canadianStocks: number
    }
    expect(lastPayload.canadianStocks).toBe(50)
  })

  it('shows exchange rate input with fetched value', () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const rateInput = wrapper.find('#exchange-rate-input')
    expect((rateInput.element as HTMLInputElement).value).toBe('1.35')
  })

  it('shows "Source: Bank of Canada" as a link when using fetched rate', () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const link = wrapper.find('.field-hint a')
    expect(link.text()).toBe('Bank of Canada')
    expect(link.attributes('href')).toBe(
      'https://www.bankofcanada.ca/rates/exchange/daily-exchange-rates/',
    )
    expect(link.attributes('target')).toBe('_blank')
  })

  it('shows loading placeholder while fetching', () => {
    const wrapper = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({
          rate: computed(() => null),
          fetchedRate: ref(null),
          status: ref('loading' as const),
        }),
      },
    })
    const rateInput = wrapper.find('#exchange-rate-input')
    expect((rateInput.element as HTMLInputElement).placeholder).toBe('Loading...')
  })

  it('shows error message when fetch fails', () => {
    const wrapper = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({
          rate: computed(() => null),
          fetchedRate: ref(null),
          status: ref('error' as const),
          errorMessage: ref('Network error'),
        }),
      },
    })
    expect(wrapper.text()).toContain('Network error')
    expect(wrapper.text()).toContain('enter a rate manually')
  })

  it('shows "Custom rate" hint when user overrides', () => {
    const wrapper = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({
          rate: computed(() => 1.5),
          customRate: ref(1.5),
          isCustom: computed(() => true),
        }),
      },
    })
    expect(wrapper.text()).toContain('Custom rate')
  })

  it('shows reset button only when custom rate is set', () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    expect(wrapper.find('.rate-reset').exists()).toBe(false)

    const wrapper2 = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({
          isCustom: computed(() => true),
          customRate: ref(1.5),
          rate: computed(() => 1.5),
        }),
      },
    })
    expect(wrapper2.find('.rate-reset').exists()).toBe(true)
  })

  it('calls setCustomRate when user enters a value', async () => {
    const setCustomRate = vi.fn(() => null)
    const wrapper = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({ setCustomRate }),
      },
    })
    const rateInput = wrapper.find('#exchange-rate-input')
    await rateInput.setValue('1.50')
    await rateInput.trigger('change')
    expect(setCustomRate).toHaveBeenCalledWith(1.5)
  })

  it('calls resetRate when reset button is clicked', async () => {
    const resetRate = vi.fn()
    const wrapper = mount(InputPanel, {
      props: {
        exchangeRate: makeExchangeRateProps({
          isCustom: computed(() => true),
          customRate: ref(1.5),
          rate: computed(() => 1.5),
          resetRate,
        }),
      },
    })
    await wrapper.find('.rate-reset').trigger('click')
    expect(resetRate).toHaveBeenCalled()
  })

  it('emits change with exchangeRate included', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const canadianInput = wrapper.find('#canadian-stocks-input')
    await canadianInput.setValue(50)
    const emitted = wrapper.emitted('change')
    expect(emitted).toBeTruthy()
    const lastPayload = (emitted as unknown[][])[emitted!.length - 1][0] as {
      exchangeRate: number | null
    }
    expect(lastPayload.exchangeRate).toBe(1.35)
  })

  it('renders gross-up checkbox unchecked by default', () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const checkbox = wrapper.find('#gross-up-input')
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
  })

  it('marginal tax rate input is disabled when gross-up is off', () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    const taxInput = wrapper.find('#marginal-tax-rate-input')
    expect((taxInput.element as HTMLInputElement).disabled).toBe(true)
  })

  it('marginal tax rate input is enabled when gross-up is checked', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    await wrapper.find('#gross-up-input').setValue(true)
    const taxInput = wrapper.find('#marginal-tax-rate-input')
    expect((taxInput.element as HTMLInputElement).disabled).toBe(false)
  })

  it('emits grossUp and marginalTaxRate in change payload', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    await wrapper.find('#gross-up-input').setValue(true)
    await wrapper.find('#marginal-tax-rate-input').setValue(43.5)

    const emitted = wrapper.emitted('change')!
    const payload = emitted[emitted.length - 1][0] as { grossUp: boolean; marginalTaxRate: number }
    expect(payload.grossUp).toBe(true)
    expect(payload.marginalTaxRate).toBe(43.5)
  })

  it('emits grossUp false when checkbox is unchecked', async () => {
    const wrapper = mount(InputPanel, {
      props: { exchangeRate: makeExchangeRateProps() },
    })
    await wrapper.find('#gross-up-input').setValue(true)
    await wrapper.find('#gross-up-input').setValue(false)

    const emitted = wrapper.emitted('change')!
    const payload = emitted[emitted.length - 1][0] as { grossUp: boolean }
    expect(payload.grossUp).toBe(false)
  })
})
