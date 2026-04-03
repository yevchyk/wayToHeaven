export const RELATIONSHIP_AXES = [
  'affinity',
  'trust',
  'respect',
  'fear',
  'intimacy',
  'dependency',
] as const;

export type RelationshipAxis = (typeof RELATIONSHIP_AXES)[number];

export type RelationshipId = string;

export type RelationshipState = Record<RelationshipAxis, number>;

export type RelationshipSnapshot = Record<RelationshipId, RelationshipState>;

export const DEFAULT_RELATIONSHIP_STATE: RelationshipState = {
  affinity: 0,
  trust: 0,
  respect: 0,
  fear: 0,
  intimacy: 0,
  dependency: 0,
};
