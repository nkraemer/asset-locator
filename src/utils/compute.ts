export interface InputValues {
  tfsa: number
  rrsp: number
  registered: number
  canadianStocks: number
  usStocks: number
  internationalStocks: number
  bonds: number
  exchangeRate: number | null
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
  const total = toNum(inputs.tfsa) + toNum(inputs.rrsp) + toNum(inputs.registered)

  const amounts: Record<AssetKey, number> = {
    canadianStocks: (total * toNum(inputs.canadianStocks)) / 100,
    usStocks: (total * toNum(inputs.usStocks)) / 100,
    internationalStocks: (total * toNum(inputs.internationalStocks)) / 100,
    bonds: (total * toNum(inputs.bonds)) / 100,
  }

  const capacity: Record<AccountKey, number> = {
    tfsa: toNum(inputs.tfsa),
    rrsp: toNum(inputs.rrsp),
    registered: toNum(inputs.registered),
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

  return result
}
