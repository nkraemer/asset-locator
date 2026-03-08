import { toNum, compute } from './compute'
import type { OutputValues } from './compute'

/** Sum all asset classes in one account */
function accountTotal(a: OutputValues[keyof OutputValues]): number {
  return a.canadianStocks + a.usStocks + a.internationalStocks + a.bonds
}

describe('toNum', () => {
  it('returns finite numbers unchanged', () => {
    expect(toNum(42)).toBe(42)
    expect(toNum(0)).toBe(0)
    expect(toNum(-5.5)).toBe(-5.5)
  })

  it('returns 0 for NaN', () => {
    expect(toNum(NaN)).toBe(0)
  })

  it('returns 0 for Infinity', () => {
    expect(toNum(Infinity)).toBe(0)
  })

  it('returns 0 for -Infinity', () => {
    expect(toNum(-Infinity)).toBe(0)
  })
})

describe('compute', () => {
  const base = {
    tfsa: 10000, rrsp: 20000, registered: 5000,
    exchangeRate: null as number | null,
    marginalTaxRate: 0, grossUp: false,
  }

  describe('primary tax-optimal placements', () => {
    it('US stocks go to RRSP first', () => {
      const result = compute({
        ...base,
        usStocks: 50,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // 50% of 35000 = 17500, fits entirely in RRSP (20000)
      expect(result.rrsp.usStocks).toBeCloseTo(17500)
      expect(result.tfsa.usStocks).toBe(0)
      expect(result.registered.usStocks).toBe(0)
    })

    it('Canadian stocks go to registered (taxable) first', () => {
      const result = compute({
        ...base,
        canadianStocks: 10,
        usStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // 10% of 35000 = 3500, fits entirely in registered (5000)
      expect(result.registered.canadianStocks).toBeCloseTo(3500)
      expect(result.rrsp.canadianStocks).toBe(0)
      expect(result.tfsa.canadianStocks).toBe(0)
    })

    it('international stocks go to TFSA first', () => {
      const result = compute({
        ...base,
        internationalStocks: 20,
        canadianStocks: 0,
        usStocks: 0,
        bonds: 0,
      })
      // 20% of 35000 = 7000, fits entirely in TFSA (10000)
      expect(result.tfsa.internationalStocks).toBeCloseTo(7000)
      expect(result.rrsp.internationalStocks).toBe(0)
      expect(result.registered.internationalStocks).toBe(0)
    })

    it('bonds go to RRSP first', () => {
      const result = compute({
        ...base,
        bonds: 30,
        canadianStocks: 0,
        usStocks: 0,
        internationalStocks: 0,
      })
      // 30% of 35000 = 10500, fits entirely in RRSP (20000)
      expect(result.rrsp.bonds).toBeCloseTo(10500)
      expect(result.tfsa.bonds).toBe(0)
      expect(result.registered.bonds).toBe(0)
    })
  })

  describe('overflow behaviour', () => {
    it('US stocks overflow from RRSP into TFSA', () => {
      const result = compute({
        ...base,
        usStocks: 80,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // 80% of 35000 = 28000; RRSP holds 20000, overflow 8000 → TFSA
      expect(result.rrsp.usStocks).toBeCloseTo(20000)
      expect(result.tfsa.usStocks).toBeCloseTo(8000)
      expect(result.registered.usStocks).toBe(0)
    })

    it('US stocks overflow through TFSA into registered', () => {
      const result = compute({
        tfsa: 5000,
        rrsp: 10000,
        registered: 5000,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
        exchangeRate: null,
        marginalTaxRate: 0, grossUp: false,
      })
      // 100% of 20000 = 20000; RRSP 10000, TFSA 5000, Registered 5000
      expect(result.rrsp.usStocks).toBeCloseTo(10000)
      expect(result.tfsa.usStocks).toBeCloseTo(5000)
      expect(result.registered.usStocks).toBeCloseTo(5000)
    })

    it('Canadian stocks overflow from registered into RRSP', () => {
      const result = compute({
        ...base,
        canadianStocks: 50,
        usStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // 50% of 35000 = 17500; registered holds 5000, overflow 12500 → RRSP
      expect(result.registered.canadianStocks).toBeCloseTo(5000)
      expect(result.rrsp.canadianStocks).toBeCloseTo(12500)
      expect(result.tfsa.canadianStocks).toBe(0)
    })

    it('international stocks overflow from TFSA into RRSP', () => {
      const result = compute({
        ...base,
        internationalStocks: 50,
        canadianStocks: 0,
        usStocks: 0,
        bonds: 0,
      })
      // 50% of 35000 = 17500; TFSA holds 10000, overflow 7500 → RRSP
      expect(result.tfsa.internationalStocks).toBeCloseTo(10000)
      expect(result.rrsp.internationalStocks).toBeCloseTo(7500)
      expect(result.registered.internationalStocks).toBe(0)
    })

    it('bonds overflow from RRSP into TFSA', () => {
      const result = compute({
        tfsa: 10000,
        rrsp: 5000,
        registered: 5000,
        bonds: 100,
        canadianStocks: 0,
        usStocks: 0,
        internationalStocks: 0,
        exchangeRate: null,
        marginalTaxRate: 0, grossUp: false,
      })
      // 100% of 20000 = 20000; RRSP 5000, TFSA 10000, Registered 5000
      expect(result.rrsp.bonds).toBeCloseTo(5000)
      expect(result.tfsa.bonds).toBeCloseTo(10000)
      expect(result.registered.bonds).toBeCloseTo(5000)
    })
  })

  describe('multi-asset competition for same account', () => {
    it('US stocks get RRSP priority over bonds', () => {
      const result = compute({
        tfsa: 5000,
        rrsp: 10000,
        registered: 5000,
        usStocks: 50,
        bonds: 50,
        canadianStocks: 0,
        internationalStocks: 0,
        exchangeRate: null,
        marginalTaxRate: 0, grossUp: false,
      })
      // US stocks: 50% of 20000 = 10000 → fills RRSP completely
      // Bonds: 50% of 20000 = 10000 → RRSP full, goes to TFSA (5000) + Registered (5000)
      expect(result.rrsp.usStocks).toBeCloseTo(10000)
      expect(result.rrsp.bonds).toBe(0)
      expect(result.tfsa.bonds).toBeCloseTo(5000)
      expect(result.registered.bonds).toBeCloseTo(5000)
    })

    it('balanced portfolio places each asset in its preferred account', () => {
      // TFSA 10k, RRSP 20k, Registered 5k, total 35k
      // Canadian 14.3% (5k), US 57.1% (20k), Intl 28.6% (10k), Bonds 0%
      const result = compute({
        ...base,
        canadianStocks: 14.285714285714286,
        usStocks: 57.142857142857146,
        internationalStocks: 28.571428571428573,
        bonds: 0,
      })
      // Perfect fit: US 20k → RRSP, Canadian 5k → Registered, Intl 10k → TFSA
      expect(result.rrsp.usStocks).toBeCloseTo(20000)
      expect(result.registered.canadianStocks).toBeCloseTo(5000)
      expect(result.tfsa.internationalStocks).toBeCloseTo(10000)
    })
  })

  describe('edge cases', () => {
    it('all allocations 0: all outputs are 0', () => {
      const result = compute({
        ...base,
        canadianStocks: 0,
        usStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      expect(accountTotal(result.tfsa)).toBe(0)
      expect(accountTotal(result.rrsp)).toBe(0)
      expect(accountTotal(result.registered)).toBe(0)
    })

    it('all account balances 0: all outputs are 0', () => {
      const result = compute({
        tfsa: 0,
        rrsp: 0,
        registered: 0,
        canadianStocks: 50,
        usStocks: 50,
        internationalStocks: 0,
        bonds: 0,
        exchangeRate: null,
        marginalTaxRate: 0, grossUp: false,
      })
      expect(accountTotal(result.tfsa)).toBe(0)
      expect(accountTotal(result.rrsp)).toBe(0)
      expect(accountTotal(result.registered)).toBe(0)
    })

    it('NaN allocation field is treated as 0', () => {
      const result = compute({
        ...base,
        canadianStocks: NaN,
        usStocks: 100,
        internationalStocks: 0,
        bonds: 0,
      })
      // NaN Canadian → 0, so only US stocks allocated
      expect(result.rrsp.usStocks).toBeCloseTo(20000)
      expect(result.tfsa.usStocks).toBeCloseTo(10000)
      expect(result.registered.usStocks).toBeCloseTo(5000)
      expect(result.rrsp.canadianStocks).toBe(0)
    })

    it('100% single asset fills all accounts', () => {
      const result = compute({
        ...base,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // 100% of 35000 distributed: RRSP 20k, TFSA 10k, Registered 5k
      expect(result.rrsp.usStocks).toBeCloseTo(20000)
      expect(result.tfsa.usStocks).toBeCloseTo(10000)
      expect(result.registered.usStocks).toBeCloseTo(5000)
      expect(accountTotal(result.rrsp)).toBeCloseTo(20000)
      expect(accountTotal(result.tfsa)).toBeCloseTo(10000)
      expect(accountTotal(result.registered)).toBeCloseTo(5000)
    })

    it('account totals never exceed account balances when allocation ≤ 100%', () => {
      const result = compute({
        ...base,
        canadianStocks: 25,
        usStocks: 25,
        internationalStocks: 25,
        bonds: 25,
      })
      expect(accountTotal(result.tfsa)).toBeLessThanOrEqual(base.tfsa + 0.01)
      expect(accountTotal(result.rrsp)).toBeLessThanOrEqual(base.rrsp + 0.01)
      expect(accountTotal(result.registered)).toBeLessThanOrEqual(base.registered + 0.01)
    })

    it('exchange rate is not used in allocation (informational only)', () => {
      const withRate = compute({
        ...base,
        exchangeRate: 1.35,
        canadianStocks: 25,
        usStocks: 25,
        internationalStocks: 25,
        bonds: 25,
      })
      const withoutRate = compute({
        ...base,
        exchangeRate: null,
        canadianStocks: 25,
        usStocks: 25,
        internationalStocks: 25,
        bonds: 25,
      })
      expect(withRate).toEqual(withoutRate)
    })
  })

  describe('RRSP gross-up', () => {
    const grossUpBase = {
      ...base,
      grossUp: true,
      marginalTaxRate: 40,
    }

    it('TFSA and Registered are fully allocated despite gross-up', () => {
      // RRSP 20000 at 40% → after-tax value 12000
      // After-tax total: 10000 + 12000 + 5000 = 27000
      // 100% US = 27000; RRSP after-tax capacity 12000, TFSA 10000, Registered 5000
      const result = compute({
        ...grossUpBase,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      expect(result.rrsp.usStocks).toBeCloseTo(12000)
      expect(result.tfsa.usStocks).toBeCloseTo(10000)
      expect(result.registered.usStocks).toBeCloseTo(5000)
      // Total allocated = 27000 (after-tax)
      const totalAllocated = accountTotal(result.rrsp) + accountTotal(result.tfsa) + accountTotal(result.registered)
      expect(totalAllocated).toBeCloseTo(27000)
    })

    it('asset amounts are based on after-tax total', () => {
      // After-tax total: 27000
      // 50% US = 13500; RRSP after-tax capacity 12000, overflow 1500 → TFSA
      const result = compute({
        ...grossUpBase,
        usStocks: 50,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      expect(result.rrsp.usStocks).toBeCloseTo(12000)
      expect(result.tfsa.usStocks).toBeCloseTo(1500)
    })

    it('shifts allocations away from RRSP at high tax rates', () => {
      // Without gross-up: 30/40/30 on 35000 → US gets 14000 (all in RRSP)
      // With 40% gross-up: 30/40/30 on 27000 → US gets 10800 (all in RRSP)
      // The freed-up RRSP space doesn't get used because target amounts are smaller
      const withGrossUp = compute({
        ...grossUpBase,
        canadianStocks: 30,
        usStocks: 40,
        internationalStocks: 30,
        bonds: 0,
      })
      const without = compute({
        ...base,
        canadianStocks: 30,
        usStocks: 40,
        internationalStocks: 30,
        bonds: 0,
      })
      // US stocks in RRSP should be less with gross-up
      expect(withGrossUp.rrsp.usStocks).toBeLessThan(without.rrsp.usStocks)
    })

    it('grossUp false ignores marginalTaxRate', () => {
      const result = compute({
        ...base,
        grossUp: false,
        marginalTaxRate: 40,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // No gross-up: total 35000, RRSP fills to capacity 20000
      expect(result.rrsp.usStocks).toBeCloseTo(20000)
      expect(accountTotal(result.rrsp)).toBeCloseTo(20000)
    })

    it('0% tax rate with gross-up has no effect', () => {
      const withGrossUp = compute({
        ...base,
        grossUp: true,
        marginalTaxRate: 0,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      const without = compute({
        ...base,
        grossUp: false,
        marginalTaxRate: 0,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      expect(withGrossUp).toEqual(without)
    })

    it('clamps tax rate above 100 to 100', () => {
      const result = compute({
        ...base,
        grossUp: true,
        marginalTaxRate: 150,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // Clamped to 100%: after-tax RRSP = 0, after-tax total = 15000
      // RRSP has 0 after-tax capacity, so all goes to TFSA (10k) + Registered (5k)
      expect(result.rrsp.usStocks).toBe(0)
      expect(result.tfsa.usStocks).toBeCloseTo(10000)
      expect(result.registered.usStocks).toBeCloseTo(5000)
    })

    it('clamps tax rate below 0 to 0', () => {
      const resultNeg = compute({
        ...base,
        grossUp: true,
        marginalTaxRate: -10,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // Clamped to 0%: same as no gross-up, total 35000
      expect(accountTotal(resultNeg.rrsp)).toBeCloseTo(20000)
    })

    it('rrspNominal values are rrsp / (1 - taxRate) with gross-up', () => {
      // 40% tax rate → nominal = afterTax / 0.6
      const result = compute({
        ...grossUpBase,
        usStocks: 100,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 0,
      })
      // RRSP after-tax capacity = 12000, so result.rrsp.usStocks = 12000
      // Nominal = 12000 / 0.6 = 20000
      expect(result.rrsp.usStocks).toBeCloseTo(12000)
      expect(result.rrspNominal.usStocks).toBeCloseTo(20000)
    })

    it('rrspNominal equals rrsp when gross-up is off', () => {
      const result = compute({
        ...base,
        usStocks: 50,
        canadianStocks: 0,
        internationalStocks: 0,
        bonds: 50,
      })
      expect(result.rrspNominal.usStocks).toBeCloseTo(result.rrsp.usStocks)
      expect(result.rrspNominal.bonds).toBeCloseTo(result.rrsp.bonds)
      expect(result.rrspNominal.canadianStocks).toBe(result.rrsp.canadianStocks)
      expect(result.rrspNominal.internationalStocks).toBe(result.rrsp.internationalStocks)
    })

    it('total allocated equals after-tax portfolio value at 100% allocation', () => {
      const result = compute({
        ...grossUpBase,
        canadianStocks: 25,
        usStocks: 25,
        internationalStocks: 25,
        bonds: 25,
      })
      // After-tax total = 27000
      const totalAllocated = accountTotal(result.tfsa) + accountTotal(result.rrsp) + accountTotal(result.registered)
      expect(totalAllocated).toBeCloseTo(27000)
    })
  })
})
