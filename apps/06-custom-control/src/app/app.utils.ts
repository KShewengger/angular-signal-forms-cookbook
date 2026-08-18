// Toppings are positioned with percentage offsets so the board scales with its
// container. Slot coordinates are authored in board pixels, this converts them.
export function calculatePct(value: number, whole: number): number {
  return (value / whole) * 100;
}
