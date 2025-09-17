export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value)
}
