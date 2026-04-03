export interface MetaSnapshot {
  hunger: number;
  safety: number;
  morale: number;
  reputation: number;
  badReputation: number;
}

export type MetaKey = keyof MetaSnapshot;
