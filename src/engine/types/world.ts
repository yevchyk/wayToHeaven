import type { GameEffect } from '@engine/types/effects';

export type LocationNodeType = 'start' | 'path' | 'landmark' | 'safe' | 'encounter';

export interface DialogueNodeInteraction {
  type: 'dialogue';
  dialogueId: string;
  once?: boolean;
}

export interface SceneFlowNodeInteraction {
  type: 'sceneFlow';
  sceneFlowId: string;
  once?: boolean;
}

export interface BattleNodeInteraction {
  type: 'battle';
  battleTemplateId: string;
  once?: boolean;
}

export interface EmptyNodeInteraction {
  type: 'none';
}

export type NodeInteraction =
  | DialogueNodeInteraction
  | SceneFlowNodeInteraction
  | BattleNodeInteraction
  | EmptyNodeInteraction;

export interface LocationNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: LocationNodeType;
  connectedNodeIds: string[];
  description?: string;
  onEnterEffects?: GameEffect[];
  interaction?: NodeInteraction;
}

export interface LocationData {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, LocationNode>;
  description?: string;
  backgroundId?: string;
  onEnterEffects?: GameEffect[];
}

export interface WorldVisit {
  locationId: string;
  nodeId: string;
}
