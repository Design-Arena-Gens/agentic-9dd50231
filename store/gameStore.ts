import { create } from "zustand";

type GameStatus = "free-roam" | "race" | "paused";

export interface GameTelemetry {
  speed: number;
  gear: number;
  distance: number;
  drift: number;
  boostEnergy: number;
  checkpointIndex: number;
  totalCheckpoints: number;
  lapTime: number;
  bestLap?: number;
  status: GameStatus;
}

interface GameStore extends GameTelemetry {
  setTelemetry: (telemetry: Partial<GameTelemetry>) => void;
  reset: () => void;
}

const initialState: GameTelemetry = {
  speed: 0,
  gear: 1,
  distance: 0,
  drift: 0,
  boostEnergy: 100,
  checkpointIndex: 0,
  totalCheckpoints: 6,
  lapTime: 0,
  bestLap: undefined,
  status: "free-roam"
};

export const useGameStore = create<GameStore>(set => ({
  ...initialState,
  setTelemetry: telemetry => set(state => ({ ...state, ...telemetry })),
  reset: () => set(initialState)
}));
