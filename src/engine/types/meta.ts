export interface MetaSnapshot {
  hunger: number;
  morale: number;
  reputation: number;
}

export type MetaKey = keyof MetaSnapshot;

