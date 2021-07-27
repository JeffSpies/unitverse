export function Identity (value?: any) {
  return function identity (i) {
    return value || i
  }
}