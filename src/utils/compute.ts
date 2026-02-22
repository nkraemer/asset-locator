export interface InputValues {
  tfsa: number
  rrsp: number
  registered: number
  canadianStocks: number
  usStocks: number
  internationalStocks: number
  bonds: number
}

export interface OutputValues {
  tfsa: number
  rrsp: number
  registered: number
}

// TODO: replace with real algorithm
export function compute(inputs: InputValues): OutputValues {
  const totalAllocation =
    (inputs.canadianStocks + inputs.usStocks + inputs.internationalStocks + inputs.bonds) / 100
  console.log('Total allocation:', totalAllocation)
  return {
    tfsa: inputs.tfsa * totalAllocation,
    rrsp: inputs.rrsp * totalAllocation,
    registered: inputs.registered * totalAllocation,
  }
}
