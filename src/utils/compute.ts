export interface InputValues {
  tfsa: number
  rrsp: number
  registered: number
  canadianStocks: number
  usStocks: number
  internationalStocks: number
  bonds: number
  exchangeRate: number | null
  marginalTaxRate: number
  grossUp: boolean
}

export interface AccountAllocation {
  canadianStocks: number
  usStocks: number
  internationalStocks: number
  bonds: number
}

export interface OutputValues {
  tfsa: AccountAllocation
  rrsp: AccountAllocation
  registered: AccountAllocation
  rrspNominal: AccountAllocation
  rrspNominalTotal: number
  grossUp: boolean
}

export function toNum(n: number): number {
  return Number.isFinite(n) ? n : 0
}

type AssetKey = keyof AccountAllocation
type AccountKey = keyof OutputValues

/**
 * Tax-optimal asset location preferences (most preferred account first):
 *   US Stocks → RRSP (withholding tax treaty), then TFSA, then Registered
 *   Canadian Stocks → Registered (dividend tax credit), then RRSP, then TFSA
 *   International Stocks → TFSA (by elimination), then RRSP, then Registered
 *   Bonds → RRSP (interest taxed at full rate), then TFSA, then Registered
 */
const PREFERENCES: [AssetKey, AccountKey[]][] = [
  ['usStocks', ['rrsp', 'tfsa', 'registered']],
  ['canadianStocks', ['registered', 'rrsp', 'tfsa']],
  ['internationalStocks', ['tfsa', 'rrsp', 'registered']],
  ['bonds', ['rrsp', 'tfsa', 'registered']],
]

function emptyAllocation(): AccountAllocation {
  return { canadianStocks: 0, usStocks: 0, internationalStocks: 0, bonds: 0 }
}

export function compute(inputs: InputValues): OutputValues {
  const tfsa = toNum(inputs.tfsa)
  const rrsp = toNum(inputs.rrsp)
  const registered = toNum(inputs.registered)

  // Gross-up: the RRSP's after-tax value is lower than its nominal value.
  // Asset targets are percentages of the after-tax total, so the RRSP's
  // capacity in the allocation loop must also be in after-tax terms to keep
  // the units consistent. This ensures TFSA and Registered still get fully
  // allocated — the RRSP only "consumes" its after-tax share of the targets.
  const taxRate = inputs.grossUp ? Math.min(Math.max(toNum(inputs.marginalTaxRate), 0), 100) / 100 : 0
  const rrspAfterTax = rrsp * (1 - taxRate)
  const afterTaxTotal = tfsa + rrspAfterTax + registered

  const amounts: Record<AssetKey, number> = {
    canadianStocks: (afterTaxTotal * toNum(inputs.canadianStocks)) / 100,
    usStocks: (afterTaxTotal * toNum(inputs.usStocks)) / 100,
    internationalStocks: (afterTaxTotal * toNum(inputs.internationalStocks)) / 100,
    bonds: (afterTaxTotal * toNum(inputs.bonds)) / 100,
  }

  const capacity: Record<AccountKey, number> = {
    tfsa: tfsa,
    rrsp: rrspAfterTax,
    registered: registered,
  }

  const result: OutputValues = {
    tfsa: emptyAllocation(),
    rrsp: emptyAllocation(),
    registered: emptyAllocation(),
  }

  for (const [asset, prefs] of PREFERENCES) {
    for (const account of prefs) {
      const allocated = Math.min(amounts[asset], capacity[account])
      if (allocated > 0) {
        result[account][asset] += allocated
        amounts[asset] -= allocated
        capacity[account] -= allocated
      }
    }
  }

  const rrspNominal = emptyAllocation()
  if (taxRate > 0) {
    for (const key of Object.keys(rrspNominal) as AssetKey[]) {
      rrspNominal[key] = result.rrsp[key] / (1 - taxRate)
    }
  } else {
    for (const key of Object.keys(rrspNominal) as AssetKey[]) {
      rrspNominal[key] = result.rrsp[key]
    }
  }

  return {
    ...result,
    rrspNominal,
    rrspNominalTotal: rrsp,
    grossUp: inputs.grossUp && taxRate > 0,
  }
}
