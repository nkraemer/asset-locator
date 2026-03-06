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
  const base = { tfsa: 10000, rrsp: 20000, registered: 5000, exchangeRate: null as number | null }

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
})
