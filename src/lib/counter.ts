// Visitor counter. A shared backend is plugged in here later; until then the
// odometer honestly shows this browser's own visit count and says so.
import { useDream } from '../store/dreamStore';

export interface CounterResult {
  value: number;
  shared: boolean; // true = real count across all visitors
}

let cached: Promise<CounterResult> | null = null;

export function getVisitorCount(): Promise<CounterResult> {
  if (cached) return cached;
  cached = Promise.resolve({ value: useDream.getState().visitor.visits, shared: false });
  return cached;
}
