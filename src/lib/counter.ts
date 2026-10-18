// Visitor counter. In local mode the odometer honestly shows this browser's
// own visit count and says "YOUR VISITS"; when a backend is configured it
// shows the real shared total and says "VISITORS". It never claims a local
// number is a shared one.
import { useDream } from '../store/dreamStore';
import { countVisit } from './storage';

export interface CounterResult {
  value: number;
  shared: boolean; // true = a real count across all visitors
}

let cached: Promise<CounterResult> | null = null;

export function getVisitorCount(): Promise<CounterResult> {
  if (cached) return cached;
  cached = countVisit(useDream.getState().visitor.visits).catch(() => ({
    value: useDream.getState().visitor.visits,
    shared: false,
  }));
  return cached;
}
