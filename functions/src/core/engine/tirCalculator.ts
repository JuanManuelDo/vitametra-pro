export function calculateTIR(glucoseValues: number[]) {
  if (!glucoseValues.length) return 0

  const inRange = glucoseValues.filter(g => g >= 70 && g <= 180)
  return (inRange.length / glucoseValues.length) * 100
}
